"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTemperature } from "../../lib/hooks/useTemperature";
import { useBatch } from "../../lib/hooks/useBatch";

const TemperatureForm: React.FC = () => {
  // Add isMounted state
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batchId, setBatchId] = useState<string | null>(null);
  const { recordTemperature, loading, error } = useTemperature();
  const { fetchBatchById, selectedBatch } = useBatch();

  const [temperature, setTemperature] = useState<number>(2.0);
  const [location, setLocation] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isBreached, setIsBreached] = useState<boolean>(false);
  const [isValidBatchId, setIsValidBatchId] = useState<boolean>(true);

  const locations = [
    "Cold Storage",
    "Loading Dock",
    "Transport",
    "Distribution Center",
    "Retail",
  ];

  // Set isMounted and extract batchId from URL query parameters
  useEffect(() => {
    setIsMounted(true);

    // Get batchId from query parameters
    const id = searchParams.get("batchId");
    if (id) {
      console.log("Found batch ID in query params:", id);

      // Check if the ID is valid (numeric)
      const isValid = /^\d+$/.test(id) && id.toLowerCase() !== "unknown";
      setIsValidBatchId(isValid);

      if (isValid) {
        setBatchId(id);
      } else {
        setFormError("Invalid Batch ID format. Please select a valid batch.");
        console.error("Invalid batch ID format:", id);
      }
    } else {
      console.log("No batch ID found in query params");
      setFormError("Batch ID is required");
      setIsValidBatchId(false);
    }
  }, [searchParams]);

  // Fetch batch details when batchId is available
  useEffect(() => {
    if (batchId && isMounted && isValidBatchId) {
      console.log("Fetching batch details for ID:", batchId);
      fetchBatchById(batchId);
    }
  }, [batchId, fetchBatchById, isMounted, isValidBatchId]);

  // Check temperature ranges
  useEffect(() => {
    // Check if temperature is outside the optimal range
    if (temperature < 0 || temperature > 4) {
      setIsBreached(true);
    } else {
      setIsBreached(false);
    }
  }, [temperature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!batchId) {
      setFormError("Batch ID is required");
      return;
    }

    if (!isValidBatchId) {
      setFormError("Invalid Batch ID format. Please select a valid batch.");
      return;
    }

    if (!location) {
      setFormError("Please select a location");
      return;
    }

    try {
      console.log(
        `Recording temperature ${temperature}°C at ${location} for batch ${batchId}`
      );
      const result = await recordTemperature(batchId, temperature, location);

      if (result && (result.success || result.status === "completed")) {
        console.log("Temperature recorded successfully:", result);
        // Only navigate if component is mounted
        router.push(`/batches/${batchId}`);
      } else {
        setFormError(result?.error || "Failed to record temperature");
      }
    } catch (err: any) {
      console.error("Error recording temperature:", err);
      setFormError(err.message || "Failed to record temperature");
    }
  };

  const handleCancel = () => {
    if (batchId && isMounted && isValidBatchId) {
      router.push(`/batches/${batchId}`);
    } else {
      router.push("/batches");
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Record Temperature</CardTitle>
        <CardDescription>
          {selectedBatch && isValidBatchId ? (
            <>
              Recording temperature for Batch #{batchId} -{" "}
              {selectedBatch.berry_type || "Unknown"}
            </>
          ) : (
            <>
              Recording temperature for{" "}
              {isValidBatchId ? `Batch #${batchId || "?"}` : "Batch"}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isValidBatchId ? (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-700 mb-4">
            <p className="font-medium">Invalid Batch ID format</p>
            <p className="text-sm mt-1">
              Please go back to the batches page and select a valid batch.
            </p>
            <Button
              onClick={() => router.push("/batches?action=recordTemp")}
              className="mt-3 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Select a Valid Batch
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="temperature"
                className="block text-sm font-medium"
              >
                Temperature (°C)
              </label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                min="-10"
                max="40"
                className={`w-full ${isBreached ? "border-red-500" : ""}`}
                disabled={loading}
              />
              {isBreached && (
                <p className="text-sm text-red-500">
                  Warning: Temperature is outside the optimal range (0°C - 4°C)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium">
                Location
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={loading}
              >
                <option value="" disabled>
                  Select a location
                </option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {!batchId && isValidBatchId && (
              <div className="text-red-500 text-sm">Batch ID is required</div>
            )}

            {(error || formError) && (
              <div className="text-red-500 text-sm">{error || formError}</div>
            )}
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        {isValidBatchId && (
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !batchId || !location}
            className={isBreached ? "bg-yellow-500 hover:bg-yellow-600" : ""}
          >
            {loading
              ? "Recording..."
              : isBreached
              ? "Record with Warning"
              : "Record Temperature"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TemperatureForm;
