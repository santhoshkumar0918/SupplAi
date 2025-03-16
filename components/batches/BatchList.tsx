import React, { useEffect, useState, useMemo } from "react";
import { useBatch } from "../../lib/hooks/useBatch";
import BatchCard from "./BatchCard";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

// Batch card skeleton for loading state
const BatchCardSkeleton = () => (
  <div className="p-4 border border-gray-200 rounded-lg animate-pulse bg-gray-50">
    <div className="flex justify-between mb-4">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="h-6 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
    <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
    <div className="flex justify-between">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="h-8 w-28 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const BatchList: React.FC = () => {
  const { loading, error, batches, fetchBatches, clearCache } = useBatch();
  const [isFetching, setIsFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const searchParams = useSearchParams();
  const actionParam = searchParams.get("action");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Show a hint message when directed here to record temperature
  const [showRecordHint, setShowRecordHint] = useState(
    actionParam === "recordTemp"
  );

  // Load batches with improved handling
  useEffect(() => {
    const loadBatches = async () => {
      setIsFetching(true);
      try {
        console.log("Fetching batches...");
        await fetchBatches();
        console.log("Batches fetched successfully");
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setIsFetching(false);
        setInitialLoadComplete(true);
      }
    };

    loadBatches();
  }, [fetchBatches]);

  // Memoize filtered batches to prevent unnecessary re-renders
  const filteredBatches = useMemo(() => {
    if (!batches || batches.length === 0) return [];

    console.log(
      `Filtering ${batches.length} batches with filter: ${statusFilter}`
    );

    if (statusFilter === "all") {
      return batches;
    } else {
      return batches.filter((batch) => batch.batch_status === statusFilter);
    }
  }, [batches, statusFilter]);

  // Set filter based on action parameter
  useEffect(() => {
    if (actionParam === "recordTemp") {
      setStatusFilter("InTransit");
    }
  }, [actionParam]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    // Hide the hint when user changes the filter
    setShowRecordHint(false);
  };

  const handleRefresh = async () => {
    setIsFetching(true);
    // Clear cache to force a fresh fetch
    if (clearCache) clearCache();
    await fetchBatches();
    setIsFetching(false);
  };

  // Get the count of active (in transit) batches
  const activeBatchCount = useMemo(() => {
    return batches.filter((batch) => batch.batch_status === "InTransit").length;
  }, [batches]);

  // Display correct loading state
  const isLoading = loading || isFetching;

  // Show loading skeletons for initial load
  if (isLoading && !initialLoadComplete) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-2xl font-bold">Berry Batches</h2>
          <div className="flex gap-2 items-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
            <span>Loading batches...</span>
          </div>
        </div>

        <div className="flex space-x-2 pb-4 overflow-x-auto">
          <Button variant="default" size="sm" disabled>
            All
          </Button>
          <Button variant="outline" size="sm" disabled>
            In Transit
          </Button>
          <Button variant="outline" size="sm" disabled>
            Delivered
          </Button>
          <Button variant="outline" size="sm" disabled>
            Rejected
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <BatchCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Berry Batches</h2>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>

        <div className="text-center py-10 border rounded-lg bg-red-50">
          <p className="text-red-600 font-medium">Error loading batches</p>
          <p className="text-red-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Berry Batches</h2>
        <div className="flex gap-2">
          {isFetching && initialLoadComplete ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
          ) : (
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Link href="/temperature/record" className="hidden md:block">
            <Button variant="outline">Record Temperature</Button>
          </Link>
          <Link href="/batches/create">
            <Button>Create New Batch</Button>
          </Link>
        </div>
      </div>

      {showRecordHint && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700">
          <p className="font-medium mb-1">
            Select a batch to record temperature
          </p>
          <p className="text-sm">
            Click the "Record Temperature" button on any in-transit batch below.
            Only in-transit batches can have temperature recordings.
          </p>
          {activeBatchCount === 0 && (
            <p className="text-sm mt-2 font-medium">
              No active batches found. Create a new batch first to record
              temperature.
            </p>
          )}
        </div>
      )}

      <div className="flex space-x-2 pb-4 overflow-x-auto">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("all")}
        >
          All {batches.length > 0 && `(${batches.length})`}
        </Button>
        <Button
          variant={statusFilter === "InTransit" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("InTransit")}
        >
          In Transit {activeBatchCount > 0 && `(${activeBatchCount})`}
        </Button>
        <Button
          variant={statusFilter === "Delivered" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("Delivered")}
        >
          Delivered
        </Button>
        <Button
          variant={statusFilter === "Rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("Rejected")}
        >
          Rejected
        </Button>
      </div>

      {filteredBatches.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-gray-500">No batches found</p>
          {statusFilter !== "all" && (
            <p className="text-sm text-gray-400 mt-2">
              Try changing your filter or creating a new batch
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch, index) => {
            // Ensure each batch has a unique key by using a fallback strategy
            const batchKey = batch.batch_id
              ? `batch-${batch.batch_id}`
              : `batch-index-${index}`;

            return <BatchCard key={batchKey} batch={batch} />;
          })}
        </div>
      )}

      {/* Mobile-only record temperature button */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Link href="/temperature/record">
          <Button className="rounded-full w-14 h-14 shadow-lg">
            <span className="sr-only">Record Temperature</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
              <path d="M12 15a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1Z"></path>
            </svg>
          </Button>
        </Link>
      </div>

      {/* Debug information (Remove in production) */}
      {process.env.NODE_ENV !== "production" && (
        <div className="text-xs text-gray-400 border-t pt-2 mt-6">
          <p>
            Debug: Found {batches.length} total batches,{" "}
            {filteredBatches.length} after filtering
          </p>
          <p>Status filter: {statusFilter}</p>
          <p>Loading state: {isLoading ? "Loading" : "Complete"}</p>
        </div>
      )}
    </div>
  );
};

export default BatchList;
