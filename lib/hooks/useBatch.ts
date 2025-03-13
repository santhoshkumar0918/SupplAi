import { useState, useCallback } from "react";
import BerrySupplyChainClient from "../api/berrySupplyChainClient";

interface BatchDetails {
  batch_id?: string | number;
  berry_type?: string;
  batch_status?: string;
  quality_score?: number;
  predicted_shelf_life_hours?: number;
  start_time?: string;
  end_time?: string | null;
  is_active?: boolean;
}

interface BatchReport {
  batch_details?: BatchDetails;
  temperature_stats?: {
    reading_count?: number;
    breach_count?: number;
    breach_percentage?: string;
    max_temperature?: number;
    min_temperature?: number;
    readings?: any[];
  };
  predictions?: any[];
}

export function useBatch() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchDetails | null>(null);
  const [batchReport, setBatchReport] = useState<BatchReport | null>(null);

  const client = new BerrySupplyChainClient();

  // Helper function to transform camelCase to snake_case
  const transformBatchResponse = (response: any): BatchDetails => {
    // Check if response has camelCase properties
    if (response?.batchId !== undefined) {
      return {
        batch_id: response.batchId,
        berry_type: response.berryType,
        start_time: response.startTime
          ? new Date(response.startTime * 1000).toLocaleString()
          : undefined,
        end_time: response.endTime
          ? new Date(response.endTime * 1000).toLocaleString()
          : undefined,
        is_active: response.isActive,
        batch_status: response.isActive ? "InTransit" : "Delivered",
        quality_score: response.qualityScore || 0,
        predicted_shelf_life_hours: response.predictedShelfLife || 0,
      };
    }
    // If response already has snake_case properties, return as is
    return response;
  };

  const createBatch = useCallback(async (berryType: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Creating batch with berry type: ${berryType}`);
      const response = await client.createBatch(berryType);
      console.log("Create batch API response:", response);

      // If there's a direct success flag
      if (response.success === true) {
        return response;
      }

      // If there's a result object with status
      if (
        response.result?.status === "completed" ||
        response.result?.status === "success"
      ) {
        return response.result;
      }

      // If there's a direct batch_id in the response
      if (response.batch_id !== undefined || response.batchId !== undefined) {
        return transformBatchResponse(response);
      }

      // If there's a result with a batch_id
      if (
        response.result?.batch_id !== undefined ||
        response.result?.batchId !== undefined
      ) {
        return transformBatchResponse(response.result);
      }

      // If response itself is the result
      if (response.status === "success" || response.status === "completed") {
        return response;
      }

      // Check for errors
      if (response.error || response.result?.error) {
        throw new Error(response.error || response.result?.error);
      }

      console.warn("Unexpected response format:", response);
      return response;
    } catch (err: any) {
      console.error("Error creating batch:", err);
      setError(err.message || "An error occurred while creating the batch");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, this is a workaround since there's no direct endpoint for listing all batches
      // We'll fetch the last 50 batches - increase this number if needed
      const batchData = [];
      const maxBatchesToTry = 50;

      for (let i = 1; i <= maxBatchesToTry; i++) {
        try {
          console.log(`Attempting to fetch batch ${i}`);
          const response = await client.getBatchStatus(i.toString());
          console.log(`Batch ${i} response:`, response);

          // Check for valid response in different formats
          if (response) {
            if (response.result) {
              batchData.push(transformBatchResponse(response.result));
            } else if (
              response.batchId !== undefined ||
              response.batch_id !== undefined
            ) {
              batchData.push(transformBatchResponse(response));
            } else if (response.status === "success") {
              batchData.push(response);
            }
          }
        } catch (err) {
          // Ignore errors for individual batches
          console.log(`Skipping batch ${i} - not found or error`);
        }
      }

      console.log(`Found ${batchData.length} batches`);
      setBatches(batchData);
      return batchData;
    } catch (err: any) {
      console.error("Error fetching batches:", err);
      setError(err.message || "An error occurred while fetching batches");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBatchById = useCallback(async (batchId: string) => {
    if (!batchId) {
      console.error("Invalid batch ID:", batchId);
      setError("Invalid batch ID provided");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching batch with ID: ${batchId}`);
      const response = await client.getBatchStatus(batchId);
      console.log(`Raw response for batch ${batchId}:`, response);

      // Handle camelCase response format
      if (response?.batchId !== undefined) {
        const transformedResponse = transformBatchResponse(response);
        console.log(
          `Setting selected batch from transformed response:`,
          transformedResponse
        );
        setSelectedBatch(transformedResponse);
        return transformedResponse;
      }
      // Handle other response formats
      else if (
        response?.result?.status === "completed" ||
        response?.result?.batch_id
      ) {
        console.log(`Setting selected batch from result:`, response.result);
        setSelectedBatch(response.result);
        return response.result;
      } else if (response?.batch_id || response?.berry_type) {
        console.log(`Setting selected batch from direct response:`, response);
        setSelectedBatch(response);
        return response;
      } else if (response?.status === "success") {
        console.log(`Setting selected batch from success response:`, response);
        setSelectedBatch(response);
        return response;
      } else {
        console.error(
          `Unexpected response format for batch ${batchId}:`,
          response
        );
        throw new Error(
          `Failed to fetch batch ${batchId} - invalid response format`
        );
      }
    } catch (err: any) {
      console.error(`Error fetching batch ${batchId}:`, err);
      setError(err.message || `Failed to fetch batch ${batchId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBatchReport = useCallback(
    async (batchId: string) => {
      if (!batchId) {
        console.error("Invalid batch ID for report:", batchId);
        return { batch_details: selectedBatch || undefined };
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching report for batch ${batchId}`);
        const response = await client.getBatchReport(batchId);
        console.log(`Batch report response:`, response);

        // Handle camelCase response formats
        if (response?.batchDetails || response?.temperatureStats) {
          const transformedReport: BatchReport = {
            batch_details: response.batchDetails
              ? transformBatchResponse(response.batchDetails)
              : undefined,
            temperature_stats: response.temperatureStats
              ? {
                  reading_count: response.temperatureStats.readingCount,
                  breach_count: response.temperatureStats.breachCount,
                  breach_percentage: response.temperatureStats.breachPercentage,
                  max_temperature: response.temperatureStats.maxTemperature,
                  min_temperature: response.temperatureStats.minTemperature,
                  readings: response.temperatureStats.readings,
                }
              : undefined,
            predictions: response.predictions,
          };

          console.log(`Setting transformed batch report:`, transformedReport);
          setBatchReport(transformedReport);
          return transformedReport;
        }
        // Handle existing response formats
        else if (
          response?.result?.status === "completed" ||
          response?.result?.batch_details
        ) {
          console.log(`Setting batch report from result:`, response.result);
          setBatchReport(response.result);
          return response.result;
        } else if (response?.batch_details || response?.temperature_stats) {
          console.log(`Setting batch report from direct response:`, response);
          setBatchReport(response);
          return response;
        } else if (response?.status === "success") {
          console.log(`Setting batch report from success response:`, response);
          setBatchReport(response);
          return response;
        } else {
          console.warn(
            `Could not find valid batch report data in response:`,
            response
          );
          // Instead of throwing, return an empty report object
          const emptyReport: BatchReport = {
            batch_details: selectedBatch || undefined,
          };
          return emptyReport;
        }
      } catch (err: any) {
        console.error(`Error fetching batch report for ${batchId}:`, err);
        setError(err.message || `Failed to fetch batch report for ${batchId}`);
        // Return empty report rather than null to prevent cascading failures
        const emptyReport: BatchReport = {
          batch_details: selectedBatch || undefined,
        };
        return emptyReport;
      } finally {
        setLoading(false);
      }
    },
    [selectedBatch]
  );

  const completeBatch = useCallback(async (batchId: string) => {
    if (!batchId) {
      console.error("Invalid batch ID for completion:", batchId);
      setError("Invalid batch ID provided");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Completing batch ${batchId}`);
      const response = await client.completeBatch(batchId);
      console.log(`Complete batch response:`, response);

      // Handle different response formats
      if (
        response?.result?.status === "completed" ||
        response?.result?.status === "redirected"
      ) {
        return response.result;
      } else if (response?.status === "success" || response?.success === true) {
        return response;
      } else {
        console.error(
          `Unexpected response format for completing batch ${batchId}:`,
          response
        );
        throw new Error(`Failed to complete batch ${batchId}`);
      }
    } catch (err: any) {
      console.error(`Error completing batch ${batchId}:`, err);
      setError(err.message || `Failed to complete batch ${batchId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    batches,
    selectedBatch,
    batchReport,
    createBatch,
    fetchBatches,
    fetchBatchById,
    fetchBatchReport,
    completeBatch,
  };
}
