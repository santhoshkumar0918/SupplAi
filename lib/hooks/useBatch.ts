import { useState, useCallback, useEffect } from "react";
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

// Utility to limit console logs in production
const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

// Cache implementation
const batchCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useBatch() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchDetails | null>(null);
  const [batchReport, setBatchReport] = useState<BatchReport | null>(null);
  const [isCacheValid, setIsCacheValid] = useState<boolean>(false);

  const client = new BerrySupplyChainClient();

  // Cache initialization
  useEffect(() => {
    // Check if we have cached batches and they're not expired
    const cachedBatchesData = localStorage.getItem("cachedBatches");
    if (cachedBatchesData) {
      try {
        const { data, timestamp } = JSON.parse(cachedBatchesData);
        if (Date.now() - timestamp < CACHE_TTL) {
          setBatches(data);
          setIsCacheValid(true);
          logger.info("Loaded batches from cache");
        } else {
          logger.info("Cache expired, will fetch fresh data");
          localStorage.removeItem("cachedBatches");
        }
      } catch (err) {
        logger.warn("Failed to parse cached batches, will fetch fresh data");
        localStorage.removeItem("cachedBatches");
      }
    }
  }, []);

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
      logger.info(`Creating batch with berry type: ${berryType}`);
      const response = await client.createBatch(berryType);

      // If there's a direct success flag
      if (response.success === true) {
        // Invalidate cache when creating a new batch
        setIsCacheValid(false);
        localStorage.removeItem("cachedBatches");
        return response;
      }

      // If there's a result object with status
      if (
        response.result?.status === "completed" ||
        response.result?.status === "success"
      ) {
        setIsCacheValid(false);
        localStorage.removeItem("cachedBatches");
        return response.result;
      }

      // If there's a direct batch_id in the response
      if (response.batch_id !== undefined || response.batchId !== undefined) {
        setIsCacheValid(false);
        localStorage.removeItem("cachedBatches");
        return transformBatchResponse(response);
      }

      // If there's a result with a batch_id
      if (
        response.result?.batch_id !== undefined ||
        response.result?.batchId !== undefined
      ) {
        setIsCacheValid(false);
        localStorage.removeItem("cachedBatches");
        return transformBatchResponse(response.result);
      }

      // If response itself is the result
      if (response.status === "success" || response.status === "completed") {
        setIsCacheValid(false);
        localStorage.removeItem("cachedBatches");
        return response;
      }

      // Check for errors
      if (response.error || response.result?.error) {
        throw new Error(response.error || response.result?.error);
      }

      logger.warn("Unexpected response format:", response);
      return response;
    } catch (err: any) {
      logger.error("Error creating batch:", err);
      setError(err.message || "An error occurred while creating the batch");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    // Return cached data if valid
    if (isCacheValid && batches.length > 0) {
      logger.info("Using cached batches data");
      return batches;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch batches in chunks to improve performance
      const batchIds = Array.from({ length: 50 }, (_, i) => i + 1);
      const batchPromises = [];
      const chunkSize = 5; // Process 5 batches at a time

      // Create chunks of promises
      for (let i = 0; i < batchIds.length; i += chunkSize) {
        const chunk = batchIds.slice(i, i + chunkSize);

        // Create a promise for each chunk
        const chunkPromise = Promise.all(
          chunk.map(async (id) => {
            try {
              // Check if batch is in cache first
              const cacheKey = `batch_${id}`;
              if (batchCache.has(cacheKey)) {
                logger.debug(`Using cached data for batch ${id}`);
                return batchCache.get(cacheKey);
              }

              // Otherwise fetch it
              logger.debug(`Fetching batch ${id}`);
              const response = await client.getBatchStatus(id.toString());

              let batchData = null;
              if (response) {
                if (response.result) {
                  batchData = transformBatchResponse(response.result);
                } else if (
                  response.batchId !== undefined ||
                  response.batch_id !== undefined
                ) {
                  batchData = transformBatchResponse(response);
                } else if (response.status === "success") {
                  batchData = response;
                }

                // Store in cache if valid
                if (batchData) {
                  batchCache.set(cacheKey, batchData);
                }
              }
              return batchData;
            } catch (err) {
              // Skip this batch if there's an error
              return null;
            }
          })
        );

        batchPromises.push(chunkPromise);
      }

      // Process chunks sequentially to avoid overwhelming the server
      const batchData = [];
      for (const promise of batchPromises) {
        const results = await promise;
        batchData.push(...results.filter(Boolean)); // Add only non-null results
      }

      logger.info(`Found ${batchData.length} batches`);

      // Sort batches by ID to ensure consistent order
      batchData.sort((a, b) => {
        const idA = Number(a.batch_id || a.batchId);
        const idB = Number(b.batch_id || b.batchId);
        return idA - idB;
      });

      setBatches(batchData);

      // Update cache
      localStorage.setItem(
        "cachedBatches",
        JSON.stringify({
          data: batchData,
          timestamp: Date.now(),
        })
      );
      setIsCacheValid(true);

      return batchData;
    } catch (err: any) {
      logger.error("Error fetching batches:", err);
      setError(err.message || "An error occurred while fetching batches");
      return [];
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, batches]);

  const fetchBatchById = useCallback(async (batchId: string) => {
    if (!batchId) {
      logger.error("Invalid batch ID:", batchId);
      setError("Invalid batch ID provided");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cacheKey = `batch_${batchId}`;
      if (batchCache.has(cacheKey)) {
        const cachedBatch = batchCache.get(cacheKey);
        logger.info(`Using cached data for batch ${batchId}`);
        setSelectedBatch(cachedBatch);
        return cachedBatch;
      }

      logger.info(`Fetching batch with ID: ${batchId}`);
      const response = await client.getBatchStatus(batchId);

      let result = null;

      // Handle camelCase response format
      if (response?.batchId !== undefined) {
        result = transformBatchResponse(response);
      }
      // Handle other response formats
      else if (
        response?.result?.status === "completed" ||
        response?.result?.batch_id
      ) {
        result = response.result;
      } else if (response?.batch_id || response?.berry_type) {
        result = response;
      } else if (response?.status === "success") {
        result = response;
      } else {
        logger.error(
          `Unexpected response format for batch ${batchId}:`,
          response
        );
        throw new Error(
          `Failed to fetch batch ${batchId} - invalid response format`
        );
      }

      // Update cache
      if (result) {
        batchCache.set(cacheKey, result);
        setSelectedBatch(result);
      }

      return result;
    } catch (err: any) {
      logger.error(`Error fetching batch ${batchId}:`, err);
      setError(err.message || `Failed to fetch batch ${batchId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBatchReport = useCallback(
    async (batchId: string) => {
      if (!batchId) {
        logger.error("Invalid batch ID for report:", batchId);
        return { batch_details: selectedBatch || undefined };
      }

      setLoading(true);
      setError(null);

      try {
        // Check cache first
        const cacheKey = `batch_report_${batchId}`;
        if (batchCache.has(cacheKey)) {
          const cachedReport = batchCache.get(cacheKey);
          logger.info(`Using cached report for batch ${batchId}`);
          setBatchReport(cachedReport);
          return cachedReport;
        }

        logger.info(`Fetching report for batch ${batchId}`);
        const response = await client.getBatchReport(batchId);
        logger.debug(`Batch report response:`, response);

        let reportData: BatchReport | null = null;

        // Handle the specific response format with success, batch_id, and report
        if (response?.success === true && response?.report) {
          reportData = {
            batch_details: response.report.batch_details
              ? transformBatchResponse(response.report.batch_details)
              : transformBatchResponse({ batch_id: response.batch_id }),
            temperature_stats: {
              reading_count: response.report.reading_count || 0,
              readings: response.report.temperature_history || [],
            },
          };
          logger.info(
            `Processed batch report with nested 'report' structure:`,
            reportData
          );
        }
        // Handle camelCase response formats
        else if (response?.batchDetails || response?.temperatureStats) {
          reportData = {
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
        }
        // Handle existing response formats
        else if (
          response?.result?.status === "completed" ||
          response?.result?.batch_details
        ) {
          reportData = response.result;
        } else if (response?.batch_details || response?.temperature_stats) {
          reportData = response;
        } else if (response?.status === "success") {
          reportData = response;
        } else {
          logger.warn(
            `Could not find valid batch report data in response:`,
            response
          );
          // Instead of throwing, return an empty report object
          reportData = {
            batch_details: selectedBatch || undefined,
          };
        }

        // Update cache and state
        if (reportData) {
          batchCache.set(cacheKey, reportData);
          setBatchReport(reportData);
        }

        return reportData;
      } catch (err: any) {
        logger.error(`Error fetching batch report for ${batchId}:`, err);
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
      logger.error("Invalid batch ID for completion:", batchId);
      setError("Invalid batch ID provided");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info(`Completing batch ${batchId}`);
      const response = await client.completeBatch(batchId);

      // Invalidate caches on batch completion
      localStorage.removeItem("cachedBatches");
      batchCache.delete(`batch_${batchId}`);
      batchCache.delete(`batch_report_${batchId}`);
      setIsCacheValid(false);

      // Handle different response formats
      if (
        response?.result?.status === "completed" ||
        response?.result?.status === "redirected"
      ) {
        return response.result;
      } else if (response?.status === "success" || response?.success === true) {
        return response;
      } else {
        logger.error(
          `Unexpected response format for completing batch ${batchId}:`,
          response
        );
        throw new Error(`Failed to complete batch ${batchId}`);
      }
    } catch (err: any) {
      logger.error(`Error completing batch ${batchId}:`, err);
      setError(err.message || `Failed to complete batch ${batchId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear the cache
  const clearCache = useCallback(() => {
    batchCache.clear();
    localStorage.removeItem("cachedBatches");
    setIsCacheValid(false);
    logger.info("Cache cleared");
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
    clearCache,
  };
}
