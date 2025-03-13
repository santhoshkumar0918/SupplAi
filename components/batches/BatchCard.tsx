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
    berry_type?: string;
    batch_status?: string;
    quality_score?: number;
    start_time?: string;
    timestamp?: string;
  };
}

const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
  const { getQualityCategory } = useQuality();

  // Check if batch_id is valid (not undefined, null, or "Unknown")
  const hasValidId =
    batch.batch_id !== undefined &&
    batch.batch_id !== null &&
    batch.batch_id !== "Unknown" &&
    batch.batch_id !== "unknown";

  const qualityInfo = getQualityCategory(batch.quality_score);

  const formattedDate = batch.start_time || batch.timestamp || "Unknown date";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Batch #{hasValidId ? batch.batch_id : "Unknown"}
          </CardTitle>
          <div
            className={`px-2 py-1 rounded-full text-xs text-white ${
              batch.batch_status === "InTransit"
                ? "bg-blue-500"
                : batch.batch_status === "Delivered"
                ? "bg-green-500"
                : batch.batch_status === "Rejected"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          >
            {batch.batch_status || "Unknown"}
          </div>
        </div>
        <CardDescription>{batch.berry_type || "Unknown type"}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Quality Score:</span>
            <span
              className={`text-sm font-semibold ${
                qualityInfo ? `text-${qualityInfo.color}-600` : "text-gray-600"
              }`}
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
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between">
          {hasValidId ? (
            <Link href={`/batches/${batch.batch_id}`} passHref>
              <Button variant="outline" size="sm" className="mr-2">
                View Details
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mr-2 opacity-50 cursor-not-allowed"
              disabled={true}
              title="Batch ID is unknown"
            >
              View Details
            </Button>
          )}

          {hasValidId && batch.batch_status === "InTransit" && (
            <Link
              href={`/temperature/record?batchId=${batch.batch_id}`}
              passHref
            >
              <Button size="sm">Record Temperature</Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BatchCard;
