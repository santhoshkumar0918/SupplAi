"use client";

import React from "react";
import TemperatureForm from "@/components/temperature";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function RecordTemperaturePage() {
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batchId");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Record Temperature</h1>
        {batchId ? (
          <Link href={`/batches/${batchId}`}>
            <Button variant="outline">Back to Batch</Button>
          </Link>
        ) : (
          <Link href="/batches">
            <Button variant="outline">Back to Batches</Button>
          </Link>
        )}
      </div>

      {batchId ? (
         
        <TemperatureForm />
      ) : (
         
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto mb-4 h-12 w-12 text-yellow-500"
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
              <h2 className="text-2xl font-bold mb-2">Select a Batch</h2>
              <p className="text-gray-600 mb-6">
                You need to select a batch to record temperature for. Use the
                button below to view all active batches.
              </p>
              <Link href="/batches?action=recordTemp">
                <Button size="lg" className="mb-4">
                  Select a Batch
                </Button>
              </Link>
            </div>

            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    Only in-transit batches can have temperature recordings.
                    Make sure you have active batches available.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
