// import React from "react";
// import Link from "next/link";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "../ui/card";
// import { Button } from "../ui/button";
// import { useQuality } from "../../lib/hooks/useQuality";

// interface BatchCardProps {
//   batch: {
//     batch_id?: string | number;
//     id?: string | number; // Some responses might use id instead of batch_id
//     berry_type?: string;
//     berryType?: string;
//     batch_status?: string;
//     quality_score?: number;
//     start_time?: string;
//     timestamp?: string;
//   };
// }

// const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
//   const { getQualityCategory } = useQuality();

//   // Get batch ID - try different possible fields and formats
//   const batchId = batch.batch_id || batch.id || "Unknown";

//   // Parse batch ID if it's in a nested format (sometimes APIs return objects)
//   const parsedBatchId = typeof batchId === "object" ? "Unknown" : batchId;

//   // Check if batch_id is valid (not undefined, null, or "Unknown")
//   const hasValidId =
//     parsedBatchId !== undefined &&
//     parsedBatchId !== null &&
//     parsedBatchId !== "Unknown" &&
//     parsedBatchId !== "unknown";

//   // Use berryType as fallback for berry_type
//   const berryType = batch.berry_type || batch.berryType || "Unknown type";

//   const qualityInfo = getQualityCategory(batch.quality_score);

//   const formattedDate = batch.start_time || batch.timestamp || "Unknown date";

//   // Try to determine status - assume InTransit for unknown batches to allow temperature recording
//   // This is a fallback for development/testing
//   const status = batch.batch_status || "InTransit"; // Default to InTransit for testing
//   const isActive = status === "InTransit";

//   // Helper function to get quality text color class
//   const getQualityTextColorClass = (colorName: string | undefined) => {
//     if (!colorName) return "text-gray-600";

//     switch (colorName) {
//       case "green":
//         return "text-green-600";
//       case "teal":
//         return "text-teal-600";
//       case "yellow":
//         return "text-yellow-600";
//       case "orange":
//         return "text-orange-600";
//       case "red":
//         return "text-red-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           <CardTitle>Batch #{hasValidId ? parsedBatchId : "Unknown"}</CardTitle>
//           <div
//             className={`px-2 py-1 rounded-full text-xs text-white ${
//               status === "InTransit"
//                 ? "bg-blue-500"
//                 : status === "Delivered"
//                 ? "bg-green-500"
//                 : status === "Rejected"
//                 ? "bg-red-500"
//                 : "bg-gray-500"
//             }`}
//           >
//             {status || "Unknown"}
//           </div>
//         </div>
//         <CardDescription>{berryType}</CardDescription>
//       </CardHeader>
//       <CardContent className="flex-grow">
//         <div className="space-y-2">
//           <div className="flex justify-between">
//             <span className="text-sm font-medium">Quality Score:</span>
//             <span
//               className={`text-sm font-semibold ${getQualityTextColorClass(
//                 qualityInfo?.color
//               )}`}
//             >
//               {batch.quality_score !== undefined
//                 ? `${batch.quality_score}%`
//                 : "N/A"}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-sm font-medium">Created:</span>
//             <span className="text-sm">
//               {typeof formattedDate === "string"
//                 ? formattedDate.slice(0, 10)
//                 : "Unknown"}
//             </span>
//           </div>

//           {/* Add indicator if batch can have temperature recorded */}
//           {isActive && (
//             <div className="mt-3 text-xs text-blue-600 flex items-center">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="14"
//                 height="14"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="mr-1"
//               >
//                 <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
//               </svg>
//               Temperature monitoring active
//             </div>
//           )}
//         </div>
//       </CardContent>
//       <CardFooter className="border-t pt-4">
//         <div className="w-full flex flex-col space-y-2">
//           {/* Always show View Details button */}
//           <Link href={`/batches/${parsedBatchId}`} passHref className="w-full">
//             <Button variant="outline" size="sm" className="w-full">
//               View Details
//             </Button>
//           </Link>

//           {/* Show temperature recording button for active batches */}
//           {isActive && (
//             <Link
//               href={`/temperature/record?batchId=${parsedBatchId}`}
//               passHref
//               className="w-full"
//             >
//               <Button
//                 size="sm"
//                 className="w-full bg-blue-600 hover:bg-blue-700"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   className="mr-1"
//                 >
//                   <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
//                 </svg>
//                 Record Temperature
//               </Button>
//             </Link>
//           )}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// export default BatchCard;


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
    if (!colorName) return "text-gray-400";

    switch (colorName) {
      case "green":
        return "text-green-400";
      case "teal":
        return "text-teal-400";
      case "yellow":
        return "text-yellow-400";
      case "orange":
        return "text-orange-400";
      case "red":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // Get status colors for dark theme
  const getStatusColor = () => {
    switch (status) {
      case "InTransit":
        return {
          badge: "bg-blue-900/50 text-blue-200 border-blue-700",
          indicator: "bg-blue-500"
        };
      case "Delivered":
        return {
          badge: "bg-green-900/50 text-green-200 border-green-700",
          indicator: "bg-green-500"
        };
      case "Rejected":
        return {
          badge: "bg-red-900/50 text-red-200 border-red-700",
          indicator: "bg-red-500"
        };
      default:
        return {
          badge: "bg-gray-800/50 text-gray-300 border-gray-700",
          indicator: "bg-gray-500"
        };
    }
  };

  const statusColors = getStatusColor();

  return (
    <Card className="h-full flex flex-col bg-gray-900 border border-gray-800 shadow-lg shadow-gray-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/40">
      <CardHeader className="pb-2 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-2 p-1 bg-gray-800 rounded-full">
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
                className="text-blue-500"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <CardTitle className="text-lg font-bold text-gray-100">
              Batch #{hasValidId ? parsedBatchId : "Unknown"}
            </CardTitle>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors.badge}`}
          >
            <div className="flex items-center">
              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${statusColors.indicator}`}></div>
              {status || "Unknown"}
            </div>
          </div>
        </div>
        <CardDescription className="flex items-center mt-1 text-gray-400">
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
            className="mr-1 text-blue-500"
          >
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
            <path d="M13 5v4"></path>
            <path d="M13 15v4"></path>
            <path d="M2 12h20"></path>
          </svg>
          <span className="font-medium text-gray-300">{berryType}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div className="space-y-3 mt-1">
          <div className="flex justify-between items-center p-2 bg-gray-800/60 rounded-lg border border-gray-700">
            <div className="flex items-center">
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
                className="mr-2 text-blue-500"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span className="text-sm font-medium text-gray-300">Quality Score:</span>
            </div>
            <span
              className={`text-sm font-bold px-2 py-1 rounded-md ${
                qualityInfo?.color === "green" ? "bg-green-900/60 text-green-200 border border-green-700" : 
                qualityInfo?.color === "teal" ? "bg-teal-900/60 text-teal-200 border border-teal-700" : 
                qualityInfo?.color === "yellow" ? "bg-yellow-900/60 text-yellow-200 border border-yellow-700" : 
                qualityInfo?.color === "orange" ? "bg-orange-900/60 text-orange-200 border border-orange-700" : 
                qualityInfo?.color === "red" ? "bg-red-900/60 text-red-200 border border-red-700" : 
                "bg-gray-800/60 text-gray-300 border border-gray-700"
              }`}
            >
              {batch.quality_score !== undefined
                ? `${batch.quality_score}%`
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-800/60 rounded-lg border border-gray-700">
            <div className="flex items-center">
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
                className="mr-2 text-blue-500"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="text-sm font-medium text-gray-300">Created:</span>
            </div>
            <span className="text-sm font-medium bg-gray-800/60 text-gray-300 px-2 py-1 rounded-md border border-gray-700">
              {typeof formattedDate === "string"
                ? formattedDate.slice(0, 10)
                : "Unknown"}
            </span>
          </div>

          {/* Add indicator if batch can have temperature recorded */}
          {isActive && (
            <div className="mt-3 flex items-center p-2 bg-gray-800/60 rounded-lg border border-gray-700">
              <div className="p-1 bg-gray-700 rounded-full mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-200">AI Monitoring Active</span>
                <span className="text-xs text-gray-400">Temperature recording available</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-800 pt-3">
        <div className="w-full flex flex-col space-y-2">
          {/* Always show View Details button */}
          <Link href={`/batches/${parsedBatchId}`} passHref className="w-full">
            <Button variant="outline" size="sm" className="w-full border-gray-700 text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:text-gray-100 transition-colors">
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
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
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
                className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-md shadow-gray-900/50 hover:shadow-lg hover:shadow-gray-900/60"
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