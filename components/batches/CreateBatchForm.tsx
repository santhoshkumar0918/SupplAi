"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { useBatch } from "../../lib/hooks/useBatch";

const CreateBatchForm: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { createBatch, loading, error } = useBatch();
  const [berryType, setBerryType] = useState<string>("Strawberry");
  const [formError, setFormError] = useState<string | null>(null);
  const berryTypes = ["Strawberry", "Blueberry", "Raspberry", "Blackberry"];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!berryType) {
      setFormError("Please select a berry type");
      return;
    }

    try {
      console.log("Submitting with berry type:", berryType);
      const result = await createBatch(berryType);
      console.log("Create batch result:", result);

      if (result && isMounted) {
        // Extract batch ID from different possible response structures
        const batchId =
          result.batch_id ||
          (result.result && result.result.batch_id) ||
          (typeof result === "object" && "batch_id" in result
            ? result.batch_id
            : null);

        console.log("Extracted batch ID:", batchId);

        if (batchId) {
          // Clear any cached data before navigation
          sessionStorage.removeItem("lastBatchData");

          // Force a full page navigation instead of client-side routing
          window.location.href = `/batches/${batchId}`;
        } else {
          setFormError("Created batch but couldn't determine batch ID");
          console.error("Unexpected response format:", result);
        }
      }
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      setFormError(err.message || "Failed to create batch");
    }
  };

  const handleCancel = () => {
    if (isMounted) {
      router.push("/batches");
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create New Batch</CardTitle>
        <CardDescription>
          Start a new berry shipment by creating a batch. You'll be able to
          track temperature, quality, and other metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="berryType" className="block text-sm font-medium">
              Berry Type
            </label>
            <select
              id="berryType"
              value={berryType}
              onChange={(e) => setBerryType(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={loading}
            >
              {berryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="tempRange" className="block text-sm font-medium">
              Optimal Temperature Range
            </label>
            <div className="text-sm text-gray-500">
              0°C - 4°C (Non-configurable for safety reasons)
            </div>
          </div>
          {(error || formError) && (
            <div className="text-red-500 text-sm">{error || formError}</div>
          )}
          <div className="flex justify-between mt-6 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Batch"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateBatchForm;
