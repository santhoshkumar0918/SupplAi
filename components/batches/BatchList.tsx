import React, { useEffect, useState, useMemo } from "react";
import { useBatch } from "../../lib/hooks/useBatch";
import BatchCard from "./BatchCard";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, Package, Plus } from "lucide-react";

const BatchList: React.FC = () => {
  const { loading, error, batches, fetchBatches, clearCache } = useBatch();
  const [isFetching, setIsFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const searchParams = useSearchParams();
  const actionParam = searchParams.get("action");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load batches with improved handling
  useEffect(() => {
    const loadBatches = async () => {
      setIsFetching(true);
      try {
        await fetchBatches();
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setIsFetching(false);
        setInitialLoadComplete(true);
      }
    };

    loadBatches();
  }, [fetchBatches]);

  // Efficiently filter batches with useMemo
  const filteredBatches = useMemo(() => {
    if (!batches || batches.length === 0) return [];

    return statusFilter === "all"
      ? batches
      : batches.filter((batch) => batch.batch_status === statusFilter);
  }, [batches, statusFilter]);

  // Set filter based on action parameter
  useEffect(() => {
    if (actionParam === "recordTemp") {
      setStatusFilter("InTransit");
    }
  }, [actionParam]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleRefresh = async () => {
    setIsFetching(true);
    if (clearCache) clearCache();
    await fetchBatches();
    setIsFetching(false);
  };

  // Count batches by status
  const countsByStatus = useMemo(() => {
    if (!batches) return { inTransit: 0, delivered: 0 };

    return {
      inTransit: batches.filter((b) => b.batch_status === "InTransit").length,
      delivered: batches.filter((b) => b.batch_status === "Delivered").length,
    };
  }, [batches]);

  // Display correct loading state
  const isLoading = loading || isFetching;

  // Show loading state
  if (isLoading && !initialLoadComplete) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Batches</h2>
          <div className="flex gap-2 items-center text-white">
            <Loader2 className="w-4 h-4 animate-spin text-white mr-1" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-56 bg-gray-800/30 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 bg-gray-700/30 rounded-md animate-pulse"
              ></div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Batches</h2>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className="bg-gray-700/50 border-gray-600"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </div>

        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded text-red-300 text-sm">
          Could not load batches. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            Berry Batches
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({batches.length} total)
            </span>
          </h2>

          <div className="flex gap-4 mt-1 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-400">
                {countsByStatus.inTransit} In Transit
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-400">
                {countsByStatus.delivered} Delivered
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className="bg-gray-700/50 border-gray-600 h-8 px-2"
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </Button>

          <div className="flex gap-1 border-r border-gray-600 pr-2">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" x2="21" y1="6" y2="6" />
                <line x1="8" x2="21" y1="12" y2="12" />
                <line x1="8" x2="21" y1="18" y2="18" />
                <line x1="3" x2="3.01" y1="6" y2="6" />
                <line x1="3" x2="3.01" y1="12" y2="12" />
                <line x1="3" x2="3.01" y1="18" y2="18" />
              </svg>
            </Button>
          </div>

          <Link href="/batches/create">
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-3 w-3 mr-1" /> New
            </Button>
          </Link>
        </div>
      </div>

      {/* Simple filter tabs */}
      <div className="flex gap-2 border-b border-gray-700/50 pb-2">
        <Button
          variant={statusFilter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFilterChange("all")}
          className="h-7 px-3 text-xs"
        >
          All
        </Button>
        <Button
          variant={statusFilter === "InTransit" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFilterChange("InTransit")}
          className="h-7 px-3 text-xs"
        >
          In Transit
        </Button>
        <Button
          variant={statusFilter === "Delivered" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFilterChange("Delivered")}
          className="h-7 px-3 text-xs"
        >
          Delivered
        </Button>
      </div>

      {/* Batch cards - with view mode toggle */}
      {filteredBatches.length === 0 ? (
        <div className="text-center py-6 bg-gray-800/30 border border-gray-700/50 rounded text-gray-400 text-sm">
          No batches found. Create a new batch to get started.
        </div>
      ) : viewMode === "grid" ? (
        // Grid view with square cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((batch, index) => {
            const batchKey = batch.batch_id
              ? `batch-${batch.batch_id}`
              : `batch-index-${index}`;
            return <BatchCard key={batchKey} batch={batch} compact={false} />;
          })}
        </div>
      ) : (
        // List view with compact cards
        <div className="space-y-2">
          {filteredBatches.map((batch, index) => {
            const batchKey = batch.batch_id
              ? `batch-${batch.batch_id}`
              : `batch-index-${index}`;
            return <BatchCard key={batchKey} batch={batch} compact={true} />;
          })}
        </div>
      )}
    </div>
  );
};

export default BatchList;
