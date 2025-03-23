import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useQuality } from "../../lib/hooks/useQuality";
import { Thermometer, Eye, CheckCircle, Clock } from "lucide-react";

interface Batch {
  batch_id?: string | number;
  id?: string | number;
  berry_type?: string;
  berryType?: string;
  quality_score?: number;
  batch_status?: string;
}

interface BatchCardProps {
  batch: Batch;
  compact?: boolean;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, compact = false }) => {
  const { getQualityCategory } = useQuality();

  // Get batch ID from various possible sources
  const batchId = batch.batch_id || batch.id || "Unknown";
  const parsedBatchId = typeof batchId === "object" ? "Unknown" : batchId;

  // Get berry type
  const berryType = batch.berry_type || batch.berryType || "Unknown";

  // Get quality info
  const qualityInfo = getQualityCategory(batch.quality_score);

  // Determine status and active state
  const status = batch.batch_status || "InTransit";
  const isActive = status === "InTransit";

  // For compact list view (keeping original functionality)
  if (compact) {
    return (
      <div className="flex items-center justify-between bg-gray-700/30 border border-gray-700/50 p-3 rounded-md hover:bg-gray-700/40 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-full min-h-[2rem] rounded-sm ${
              status === "InTransit"
                ? "bg-blue-500"
                : status === "Delivered"
                ? "bg-green-500"
                : status === "Rejected"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          ></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">#{parsedBatchId}</span>
              <span className="text-xs text-white/70">{berryType}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              )}
            </div>
            <div className="flex gap-2 text-xs text-white/60 mt-0.5">
              <span>
                Quality:{" "}
                {batch.quality_score !== undefined
                  ? `${batch.quality_score}%`
                  : "N/A"}
              </span>
              <span>•</span>
              <span>Status: {status}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          <Link href={`/batches/${parsedBatchId}`}>
            <Button size="sm" variant="ghost" className="h-7 px-2">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>

          {isActive && (
            <Link href={`/temperature/record?batchId=${parsedBatchId}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 bg-blue-800/30 border-blue-700/50"
              >
                <Thermometer className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // New square card design for grid view
  const quality =
    batch.quality_score !== undefined
      ? batch.quality_score
      : Math.floor(Math.random() * 30) + 70;

  // Determine quality color
  const qualityColor =
    quality >= 90
      ? "bg-green-500"
      : quality >= 75
      ? "bg-green-400"
      : quality >= 60
      ? "bg-yellow-400"
      : quality >= 40
      ? "bg-orange-400"
      : "bg-red-500";

  return (
    <div className="bg-gray-800/60 border border-gray-700/70 rounded-lg overflow-hidden flex flex-col h-56 transition-all hover:border-blue-500/50">
      {/* Status bar at top */}
      <div
        className={`h-1.5 w-full ${
          status === "InTransit"
            ? "bg-blue-500"
            : status === "Delivered"
            ? "bg-green-500"
            : status === "Rejected"
            ? "bg-red-500"
            : "bg-gray-500"
        }`}
      ></div>

      {/* Content */}
      <div className="flex flex-col p-4 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-white font-medium text-lg">#{parsedBatchId}</h3>
            <p className="text-gray-400 text-sm">{berryType}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
              status === "InTransit"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30"
                : status === "Delivered"
                ? "bg-green-900/40 text-green-400 border border-green-500/30"
                : "bg-red-900/40 text-red-400 border border-red-500/30"
            }`}
          >
            {status === "InTransit" ? (
              <Clock className="w-3 h-3" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            <span>{status}</span>
          </div>
        </div>

        {/* Temperature icon and active status indicator */}
        {isActive && (
          <div className="flex items-center mb-3 bg-blue-900/20 border border-blue-700/30 rounded px-2 py-1.5">
            <Thermometer className="h-3.5 w-3.5 text-blue-400 mr-2" />
            <span className="text-xs text-blue-300">
              Temperature monitoring active
            </span>
          </div>
        )}

        {/* Quality bar */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Quality Score</span>
            <span className="font-medium text-white">{quality}%</span>
          </div>
          <div className="w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden">
            <div
              className={`${qualityColor} h-full`}
              style={{ width: `${quality}%` }}
            ></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/batches/${parsedBatchId}`} className="w-full">
            <Button
              variant="outline"
              className="w-full h-9 bg-gray-700/50 border-gray-600 hover:bg-gray-600 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
          </Link>

          {isActive && (
            <Link
              href={`/temperature/record?batchId=${parsedBatchId}`}
              className="w-full"
            >
              <Button className="w-full h-9 bg-blue-600 hover:bg-blue-700">
                <Thermometer className="h-4 w-4 mr-2" />
                Record
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchCard;
