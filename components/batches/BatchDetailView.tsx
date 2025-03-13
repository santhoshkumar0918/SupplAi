"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBatch } from "../../lib/hooks/useBatch";
import { useTemperature } from "../../lib/hooks/useTemperature";
import { useQuality } from "../../lib/hooks/useQuality";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TemperatureChart from "../temperature/TemperatureChart";
import QualityIndicator from "../quality/QualityIndicator";
import Link from "next/link";

interface BatchDetailViewProps {
  batchId: string;
}

const BatchDetailView: React.FC<BatchDetailViewProps> = ({ batchId }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const MAX_RETRIES = 3;

  const {
    loading: batchLoading,
    error: batchError,
    fetchBatchById,
    fetchBatchReport,
    selectedBatch,
    batchReport,
    completeBatch,
  } = useBatch();

  const { fetchTemperatureHistory, temperatureHistory, getBreachStatistics } =
    useTemperature();

  const {
    assessQuality,
    qualityAssessment,
    getQualityCategory,
    getActionColor,
  } = useQuality();

  const [completing, setCompleting] = useState(false);

  // Initial mount effect
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Load data function (defined outside useEffect to prevent recreation)
  const loadBatchData = useCallback(async () => {
    if (!isMounted || dataLoaded) return;

    console.log(
      `Loading data for batch ID: ${batchId} (Attempt ${
        retryAttempt + 1
      }/${MAX_RETRIES})`
    );
    setIsLoading(true);
    setLoadError(null);

    try {
      // Try to fetch the batch data
      console.log(`Fetching batch with ID: ${batchId}`);
      const batchResult = await fetchBatchById(batchId);

      // If batch fetch failed and we haven't exceeded max retries
      if (!batchResult) {
        if (retryAttempt < MAX_RETRIES - 1) {
          console.log(
            `Batch fetch failed, will retry in ${
              2000 * (retryAttempt + 1)
            }ms...`
          );
          setRetryAttempt((prev) => prev + 1);
          setIsLoading(false);
          return;
        } else {
          throw new Error(
            `Failed to fetch batch with ID ${batchId} after ${MAX_RETRIES} attempts`
          );
        }
      }

      // Fetch additional data
      console.log(
        `Successfully fetched batch ${batchId}, fetching additional data...`
      );

      // Use Promise.all to fetch all related data in parallel
      await Promise.all([
        fetchBatchReport(batchId),
        fetchTemperatureHistory(batchId),
        assessQuality(batchId),
      ]);

      // Mark data as loaded to prevent further fetches
      setDataLoaded(true);
      setIsLoading(false);
      setLoadError(null);
    } catch (error) {
      console.error("Error loading batch data:", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unknown error loading batch data"
      );
      setIsLoading(false);
    }
  }, [
    batchId,
    fetchBatchById,
    fetchBatchReport,
    fetchTemperatureHistory,
    assessQuality,
    isMounted,
    retryAttempt,
    dataLoaded,
    MAX_RETRIES,
  ]);

  // Effect to load data once on mount or when batchId changes
  useEffect(() => {
    if (isMounted && !dataLoaded) {
      loadBatchData();
    }
  }, [isMounted, loadBatchData, dataLoaded]);

  // Effect for retry with delay (only runs when retryAttempt changes)
  useEffect(() => {
    if (retryAttempt > 0 && !dataLoaded) {
      const retryDelay = 2000 * retryAttempt; // Increasing delay for each retry

      const timeoutId = setTimeout(() => {
        if (isMounted && !dataLoaded) {
          loadBatchData();
        }
      }, retryDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [retryAttempt, loadBatchData, isMounted, dataLoaded]);

  const handleCompleteBatch = async () => {
    if (!isMounted) return;

    if (window.confirm("Are you sure you want to complete this shipment?")) {
      setCompleting(true);
      try {
        const result = await completeBatch(batchId);
        if (result) {
          alert("Shipment completed successfully!");
          router.push("/batches");
        }
      } catch (error) {
        console.error("Error completing batch:", error);
        alert("Error completing batch. See console for details.");
      } finally {
        setCompleting(false);
      }
    }
  };

  const handleManualRetry = () => {
    setDataLoaded(false);
    setRetryAttempt(0);
    setIsLoading(true);
    setLoadError(null);
    loadBatchData();
  };

  const handleBackToBatches = () => {
    router.push("/batches");
  };

  // Show loading state
  if (!isMounted || isLoading || batchLoading) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Loading batch details...</p>
        {retryAttempt > 0 && (
          <p className="text-sm text-gray-500">
            Retry attempt {retryAttempt} of {MAX_RETRIES}...
          </p>
        )}
      </div>
    );
  }

  // Show error state
  if (loadError || batchError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Error: {loadError || batchError}</p>
        <div className="flex flex-col items-center gap-4">
          <Button onClick={handleManualRetry} className="w-40">
            Retry
          </Button>
          <Button
            onClick={handleBackToBatches}
            variant="outline"
            className="w-40"
          >
            Back to Batches
          </Button>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!selectedBatch) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Batch #{batchId} not found</p>
        <div className="flex flex-col items-center gap-4">
          <Button onClick={handleManualRetry} className="w-40">
            Retry
          </Button>
          <Button
            onClick={handleBackToBatches}
            variant="outline"
            className="w-40"
          >
            Back to Batches
          </Button>
        </div>
      </div>
    );
  }

  // Get batch details from either batch report or selected batch
  const batchDetails = batchReport?.batch_details || selectedBatch;

  // Initialize stats with safe defaults
  const stats = temperatureHistory?.length
    ? getBreachStatistics(temperatureHistory)
    : {
        breachCount: 0,
        breachPercentage: 0,
        minTemperature: 0,
        maxTemperature: 0,
        averageTemperature: 0,
      };

  // Get quality information
  const qualityInfo = getQualityCategory(
    qualityAssessment?.quality_score || batchDetails.quality_score || 0
  );

  // Determine if batch is active
  const isActive = batchDetails.batch_status === "InTransit";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Batch #{batchId} - {batchDetails.berry_type || "Unknown"}
        </h1>
        <div className="flex space-x-2">
          {isActive && (
            <>
              <Link href={`/temperature/record?batchId=${batchId}`}>
                <Button variant="outline">Record Temperature</Button>
              </Link>
              <Button
                onClick={handleCompleteBatch}
                disabled={completing}
                className="bg-green-600 hover:bg-green-700"
              >
                {completing ? "Completing..." : "Complete Shipment"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Batch Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Current Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs text-white ${
                    batchDetails.batch_status === "InTransit"
                      ? "bg-blue-500"
                      : batchDetails.batch_status === "Delivered"
                      ? "bg-green-500"
                      : batchDetails.batch_status === "Rejected"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                >
                  {batchDetails.batch_status || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Start Time:</span>
                <span>{batchDetails.start_time || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">End Time:</span>
                <span>{batchDetails.end_time || "In Progress"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Active:</span>
                <span>{batchDetails.is_active ? "Yes" : "No"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <QualityIndicator
                score={
                  qualityAssessment?.quality_score ||
                  batchDetails.quality_score ||
                  0
                }
                category={qualityInfo.category}
                color={qualityInfo.color}
              />
              <div className="flex justify-between">
                <span className="font-medium">Shelf Life:</span>
                <span>
                  {qualityAssessment?.shelf_life_hours ||
                    batchDetails.predicted_shelf_life_hours ||
                    "N/A"}{" "}
                  hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Recommended Action:</span>
                <span
                  className={`text-${getActionColor(
                    qualityAssessment?.recommended_action
                  )}-600 font-medium`}
                >
                  {qualityAssessment?.recommended_action || "No Action"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Readings:</span>
                <span>
                  {stats.breachCount} / {temperatureHistory?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Breach %:</span>
                <span
                  className={`font-medium ${
                    stats.breachPercentage > 20
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {stats.breachPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Min Temp:</span>
                <span>{stats.minTemperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Max Temp:</span>
                <span>{stats.maxTemperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Avg Temp:</span>
                <span>{stats.averageTemperature.toFixed(1)}°C</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Temperature History</CardTitle>
        </CardHeader>
        <CardContent>
          {temperatureHistory && temperatureHistory.length > 0 ? (
            <div className="h-80">
              <TemperatureChart data={temperatureHistory} />
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No temperature data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actions & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {qualityAssessment?.action_description ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                {qualityAssessment.action_description}
              </p>
              {isActive && (
                <div className="flex flex-wrap gap-2">
                  <Link href={`/temperature/record?batchId=${batchId}`}>
                    <Button variant="outline" size="sm">
                      Record Temperature
                    </Button>
                  </Link>
                  <Button onClick={handleCompleteBatch} size="sm">
                    Complete Shipment
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No recommendations available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchDetailView;
