import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { useQuality } from "../../lib/hooks/useQuality";

interface BatchCardProps {
  batch: {
    batch_id?: string | number;
    id?: string | number; // Some responses might use id instead of batch_id
    berry_type?: string;
    berryType?: string;
    batch_status?: string;
    quality_score?: number;
    start_time?: string;
    timestamp?: string;
  };
}

const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
  const { getQualityCategory } = useQuality();

  // Get batch ID - try different possible fields and formats
  const batchId = batch.batch_id || batch.id || "Unknown";

  // Parse batch ID if it's in a nested format (sometimes APIs return objects)
  const parsedBatchId = typeof batchId === "object" ? "Unknown" : batchId;

  // Check if batch_id is valid (not undefined, null, or "Unknown")
  const hasValidId =
    parsedBatchId !== undefined &&
    parsedBatchId !== null &&
    parsedBatchId !== "Unknown" &&
    parsedBatchId !== "unknown";

  // Use berryType as fallback for berry_type
  const berryType = batch.berry_type || batch.berryType || "Unknown type";

  const qualityInfo = getQualityCategory(batch.quality_score);

  const formattedDate = batch.start_time || batch.timestamp || "Unknown date";

  // Try to determine status - assume InTransit for unknown batches to allow temperature recording
  // This is a fallback for development/testing
  const status = batch.batch_status || "InTransit"; // Default to InTransit for testing
  const isActive = status === "InTransit";

  // Helper function to get quality text color class
  const getQualityTextColorClass = (colorName: string | undefined) => {
    if (!colorName) return "text-gray-600";

    switch (colorName) {
      case "green":
        return "text-green-600";
      case "teal":
        return "text-teal-600";
      case "yellow":
        return "text-yellow-600";
      case "orange":
        return "text-orange-600";
      case "red":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Batch #{hasValidId ? parsedBatchId : "Unknown"}</CardTitle>
          <div
            className={`px-2 py-1 rounded-full text-xs text-white ${
              status === "InTransit"
                ? "bg-blue-500"
                : status === "Delivered"
                ? "bg-green-500"
                : status === "Rejected"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          >
            {status || "Unknown"}
          </div>
        </div>
        <CardDescription>{berryType}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Quality Score:</span>
            <span
              className={`text-sm font-semibold ${getQualityTextColorClass(
                qualityInfo?.color
              )}`}
            >
              {batch.quality_score !== undefined
                ? `${batch.quality_score}%`
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Created:</span>
            <span className="text-sm">
              {typeof formattedDate === "string"
                ? formattedDate.slice(0, 10)
                : "Unknown"}
            </span>
          </div>

          {/* Add indicator if batch can have temperature recorded */}
          {isActive && (
            <div className="mt-3 text-xs text-blue-600 flex items-center">
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
                className="mr-1"
              >
                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
              </svg>
              Temperature monitoring active
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex flex-col space-y-2">
          {/* Always show View Details button */}
          <Link href={`/batches/${parsedBatchId}`} passHref className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>

          {/* Show temperature recording button for active batches */}
          {isActive && (
            <Link
              href={`/temperature/record?batchId=${parsedBatchId}`}
              passHref
              className="w-full"
            >
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
                </svg>
                Record Temperature
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BatchCard;
