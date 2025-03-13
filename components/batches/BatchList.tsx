import React, { useEffect, useState } from "react";
import { useBatch } from "../../lib/hooks/useBatch";
import BatchCard from "./BatchCard";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const BatchList: React.FC = () => {
  const { loading, error, batches, fetchBatches } = useBatch();
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const searchParams = useSearchParams();
  const actionParam = searchParams.get("action");

  // Show a hint message when directed here to record temperature
  const [showRecordHint, setShowRecordHint] = useState(
    actionParam === "recordTemp"
  );

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBatches(batches);
    } else {
      setFilteredBatches(
        batches.filter((batch) => batch.batch_status === statusFilter)
      );
    }
  }, [batches, statusFilter]);

  useEffect(() => {
    // If we're here to record temperature, automatically filter to show only in-transit batches
    if (actionParam === "recordTemp") {
      setStatusFilter("InTransit");
    }
  }, [actionParam]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    // Hide the hint when user changes the filter
    setShowRecordHint(false);
  };

  if (loading) {
    return <div className="text-center py-10">Loading batches...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error: {error}</p>
        <Button onClick={() => fetchBatches()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Get the count of active (in transit) batches
  const activeBatchCount = batches.filter(
    (batch) => batch.batch_status === "InTransit"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Berry Batches</h2>
        <div className="flex gap-2">
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
          All
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
    </div>
  );
};

export default BatchList;
