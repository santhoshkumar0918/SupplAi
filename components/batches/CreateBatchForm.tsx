// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "../ui/card";
// import { Button } from "../ui/button";
// import {
//   Bot,
//   Cpu,
//   Loader2,
//   CheckCircle,
//   ThermometerSnowflake,
// } from "lucide-react";

// const CreateBatchForm = () => {
//   const [isMounted, setIsMounted] = useState(false);
//   const router = useRouter();
//   const [berryType, setBerryType] = useState("Strawberry");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const berryTypes = ["Strawberry", "Blueberry", "Raspberry", "Blackberry"];

//   useEffect(() => {
//     setIsMounted(true);
//     return () => setIsMounted(false);
//   }, []);

//   // Mock batch creation with success flow only
//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     setIsProcessing(true);

//     // Simulate API call with timeout
//     setTimeout(() => {
//       setIsSuccess(true);

//       // Simulate redirect delay
//       setTimeout(() => {
//         // Fake batch ID for demo
//         const fakeBatchId = Math.floor(Math.random() * 1000) + 1;
//         router.push(`/batches/${fakeBatchId}`);
//       }, 2000);
//     }, 1500);
//   };

//   const handleCancel = () => {
//     if (isMounted) {
//       router.push("/batches");
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto bg-gray-800/60 backdrop-blur-sm border border-gray-700 shadow-lg">
//       <div className="bg-blue-500 h-1 w-full rounded-t-lg"></div>
//       <CardHeader className="pb-2">
//         <div className="flex items-center gap-2 mb-1">
//           <Cpu className="h-4 w-4 text-blue-400" />
//           <span className="text-xs font-medium text-blue-400">AI-POWERED</span>
//         </div>
//         <CardTitle className="text-xl font-bold text-white">
//           Create New Batch
//         </CardTitle>
//         <CardDescription className="text-gray-400 text-sm">
//           Initialize a new berry shipment monitoring process
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {isSuccess ? (
//           <div className="text-center py-6">
//             <div className="w-16 h-16 mx-auto bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-500/50 mb-4">
//               <CheckCircle className="h-8 w-8 text-blue-400" />
//             </div>
//             <h3 className="text-lg font-medium text-white mb-1">
//               Batch Created!
//             </h3>
//             <p className="text-gray-400 text-sm mb-4">
//               Redirecting to batch details...
//             </p>
//             <div className="flex justify-center">
//               <div className="h-1 w-32 bg-gray-700 rounded-full overflow-hidden">
//                 <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out]"></div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-4 mt-2">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-300">
//                 Berry Type
//               </label>
//               <select
//                 value={berryType}
//                 onChange={(e) => setBerryType(e.target.value)}
//                 className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
//                 disabled={isProcessing}
//               >
//                 {berryTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-3">
//               <div className="flex items-start gap-2">
//                 <ThermometerSnowflake className="h-4 w-4 text-blue-400 mt-0.5" />
//                 <div>
//                   <h4 className="text-sm font-medium text-white">
//                     Temperature Range
//                   </h4>
//                   <p className="text-xs text-gray-400 mt-0.5">
//                     0°C - 4°C (Default)
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-700/30 p-3 rounded-md border border-gray-700">
//               <div className="flex items-center gap-2 mb-1">
//                 <Bot className="h-3.5 w-3.5 text-blue-400" />
//                 <span className="text-xs font-medium text-blue-400">
//                   AI AGENT
//                 </span>
//               </div>
//               <p className="text-xs text-gray-400">
//                 AI agent will monitor temperature conditions and assess quality
//                 in real-time
//               </p>
//             </div>

//             <div className="flex gap-2 pt-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleCancel}
//                 disabled={isProcessing}
//                 className="flex-1 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 disabled={isProcessing}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 {isProcessing ? (
//                   <span className="flex items-center gap-1">
//                     <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                     Creating...
//                   </span>
//                 ) : (
//                   "Create Batch"
//                 )}
//               </Button>
//             </div>
//           </form>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default CreateBatchForm;
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
import {
  Bot,
  Cpu,
  Loader2,
  CheckCircle,
  AlertCircle,
  ThermometerSnowflake,
} from "lucide-react";

const CreateBatchForm = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { createBatch, loading: apiLoading, error } = useBatch();
  const [berryType, setBerryType] = useState("Strawberry");
  const [formError, setFormError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Use local loading state to avoid API issues
  const berryTypes = ["Strawberry", "Blueberry", "Raspberry", "Blackberry"];

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Simulate successful batch creation and redirect
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    // Simulate API call with timeout (Mock implementation)
    setTimeout(() => {
      // Create a fake batch ID
      const fakeBatchId = Math.floor(Math.random() * 1000) + 1;
      setCreatedBatchId(fakeBatchId.toString());
      setShowSuccess(true);

      // Simulate redirect delay
      setTimeout(() => {
        router.push(`/batches/${fakeBatchId}`);
      }, 2000);
    }, 1500);

    // NOTE: In real implementation, you would use:
    /*
    try {
      const result = await createBatch(berryType);
      console.log("Create batch result:", result);

      if (result) {
        // Extract batch ID from different possible response structures
        const batchId =
          result.batch_id ||
          (result.result && result.result.batch_id) ||
          (typeof result === "object" && "batch_id" in result
            ? result.batch_id
            : null);

        if (batchId) {
          // Show success message with batch ID
          setCreatedBatchId(batchId);
          setShowSuccess(true);
          
          // Clear any cached data before navigation
          sessionStorage.removeItem("lastBatchData");
          
          // Redirect after a short delay to show the success message
          setTimeout(() => {
            if (isMounted) {
              window.location.href = `/batches/${batchId}`;
            }
          }, 2000);
        } else {
          setFormError("Created batch but couldn't determine batch ID");
        }
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setFormError(err.message || "Failed to create batch");
    }
    */
  };

  const handleCancel = () => {
    if (isMounted) {
      router.push("/batches");
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-blue-200 shadow-lg">
      <div className="bg-blue-500 h-2 w-full rounded-t-lg"></div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-5 w-5 text-blue-500" />
          <span className="text-xs font-medium text-blue-500">
            AI-POWERED SYSTEM
          </span>
        </div>
        <CardTitle className="text-2xl font-bold">Create New Batch</CardTitle>
        <CardDescription className="text-gray-600">
          Let our AI agent initialize a new berry shipment monitoring process.
          The system will automatically track conditions and alert you of any
          anomalies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccess ? (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-blue-500 mb-2" />
            <h3 className="text-lg font-medium text-blue-800">
              Batch Created Successfully
            </h3>
            <p className="text-blue-600 mt-1">
              Batch ID:{" "}
              <span className="font-mono font-bold">{createdBatchId}</span>
            </p>
            <p className="text-sm text-blue-500 mt-2">
              Redirecting to batch details...
            </p>
            <div className="mt-4">
              <Loader2 className="h-5 w-5 mx-auto animate-spin text-blue-500" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <div className="space-y-2">
              <label
                htmlFor="berryType"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <span>Berry Type</span>
              </label>
              <div className="relative">
                <select
                  id="berryType"
                  value={berryType}
                  onChange={(e) => setBerryType(e.target.value)}
                  className="w-full p-3 border border-blue-200 rounded-md pl-4 pr-10 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  disabled={loading}
                >
                  {berryTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ThermometerSnowflake className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-800">
                    Optimal Temperature Range
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    0°C - 4°C (Non-configurable for safety reasons)
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    AI agent will monitor temperature conditions in real-time
                  </p>
                </div>
              </div>
            </div>

            {(error || formError) && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>{error || formError}</span>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">
                  AI AGENT INFO
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Upon submission, our AI agent will initialize a new monitoring
                system for your berry shipment, establish baseline metrics, and
                begin continuous quality assessment.
              </p>
            </div>

            <div className="flex justify-between mt-6 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Create Batch
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateBatchForm;
