import React, { useEffect, useState } from "react";
import { useBatch } from "../../lib/hooks/useBatch";
import BatchCard from "./BatchCard";
import { Button } from "../ui/button";
import Link from "next/link";

const BatchList: React.FC = () => {
  const { loading, error, batches, fetchBatches } = useBatch();
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Berry Batches</h2>
        <Link href="/batches/create">
          <Button>Create New Batch</Button>
        </Link>
      </div>

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
          In Transit
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
    </div>
  );
};

export default BatchList;
