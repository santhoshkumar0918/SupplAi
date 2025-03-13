"use client";

import React from "react";
import TemperatureForm from "@/components/temperature";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RecordTemperaturePage() {
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batchId");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Record Temperature</h1>
        {batchId && (
          <Link href={`/batches/${batchId}`}>
            <Button variant="outline">Back to Batch</Button>
          </Link>
        )}
      </div>

      <TemperatureForm />

      {!batchId && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-center">
          <p className="text-amber-700 mb-2">No batch ID was provided</p>
          <p className="text-sm text-gray-600 mb-4">
            You need to select a batch to record temperature for. Use the button
            below to go to the batches page.
          </p>
          <Link href="/batches">
            <Button>Go to Batches</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
