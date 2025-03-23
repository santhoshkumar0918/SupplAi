// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "../ui/card";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import {
//   ThermometerSnowflake,
//   MapPin,
//   CheckCircle,
//   AlertTriangle,
//   Loader2,
// } from "lucide-react";

// const TemperatureForm = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [temperature, setTemperature] = useState(2.0);
//   const [location, setLocation] = useState("");
//   const [isBreached, setIsBreached] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [batchId, setBatchId] = useState("");
//   const [berryType, setBerryType] = useState("Unknown");

//   const locations = [
//     "Cold Storage",
//     "Loading Dock",
//     "Transport",
//     "Distribution Center",
//     "Retail",
//   ];

//   // Initialize from URL params
//   useEffect(() => {
//     const id = searchParams.get("batchId");
//     if (id) {
//       setBatchId(id);

//       // Mock berry type based on batch ID
//       if (parseInt(id) % 4 === 0) setBerryType("Strawberry");
//       else if (parseInt(id) % 4 === 1) setBerryType("Blueberry");
//       else if (parseInt(id) % 4 === 2) setBerryType("Raspberry");
//       else setBerryType("Blackberry");
//     }
//   }, [searchParams]);

//   // Check temperature ranges
//   useEffect(() => {
//     if (temperature < 0 || temperature > 4) {
//       setIsBreached(true);
//     } else {
//       setIsBreached(false);
//     }
//   }, [temperature]);

//   // Mock submission handler
//   const handleSubmit = (e: any) => {
//     e.preventDefault();

//     if (!location) return;

//     setIsProcessing(true);

//     // Simulate API call with timeout
//     setTimeout(() => {
//       setIsSuccess(true);

//       // Simulate redirect after success
//       setTimeout(() => {
//         router.push(`/batches/${batchId}`);
//       }, 1500);
//     }, 1000);
//   };

//   const handleCancel = () => {
//     if (batchId) {
//       router.push(`/batches/${batchId}`);
//     } else {
//       router.push("/batches");
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto bg-gray-800/60 backdrop-blur-sm border border-gray-700 shadow-lg">
//       <div className="bg-blue-500 h-1 w-full rounded-t-lg"></div>
//       <CardHeader className="pb-3">
//         <div className="flex items-center gap-2 mb-1">
//           <ThermometerSnowflake className="h-4 w-4 text-blue-400" />
//           <span className="text-xs font-medium text-blue-400">
//             TEMPERATURE MONITOR
//           </span>
//         </div>
//         <CardTitle className="text-xl font-bold text-white">
//           Record Temperature
//         </CardTitle>
//         <CardDescription className="text-gray-400 text-sm">
//           {batchId ? (
//             <>
//               Recording for Batch #{batchId} - {berryType}
//             </>
//           ) : (
//             <>Select a batch to record temperature</>
//           )}
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         {isSuccess ? (
//           <div className="text-center py-6">
//             <div className="w-16 h-16 mx-auto bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-500/50 mb-4">
//               <CheckCircle className="h-8 w-8 text-blue-400" />
//             </div>
//             <h3 className="text-lg font-medium text-white mb-1">
//               Temperature Recorded!
//             </h3>
//             <p className="text-gray-400 text-sm mb-4">
//               Redirecting to batch details...
//             </p>
//             <div className="flex justify-center">
//               <div className="h-1 w-32 bg-gray-700 rounded-full overflow-hidden">
//                 <div className="h-full bg-blue-500 animate-[progress_1.5s_ease-in-out]"></div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-300">
//                 Temperature (°C)
//               </label>
//               <div className="relative">
//                 <Input
//                   type="number"
//                   step="0.1"
//                   value={temperature}
//                   onChange={(e) => setTemperature(parseFloat(e.target.value))}
//                   min="-10"
//                   max="40"
//                   className={`w-full bg-gray-700/50 border ${
//                     isBreached ? "border-red-500" : "border-gray-600"
//                   } rounded-md text-white focus:ring-blue-500 focus:border-blue-500`}
//                   disabled={isProcessing}
//                 />
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                   <ThermometerSnowflake
//                     className={`h-4 w-4 ${
//                       isBreached ? "text-red-400" : "text-blue-400"
//                     }`}
//                   />
//                 </div>
//               </div>

//               {isBreached && (
//                 <div className="flex items-center gap-1.5 text-xs text-yellow-400 mt-1">
//                   <AlertTriangle className="h-3.5 w-3.5" />
//                   <span>Temperature is outside optimal range (0°C - 4°C)</span>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-300">
//                 Location
//               </label>
//               <div className="relative">
//                 <select
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
//                   disabled={isProcessing}
//                 >
//                   <option value="" disabled>
//                     Select a location
//                   </option>
//                   {locations.map((loc) => (
//                     <option key={loc} value={loc}>
//                       {loc}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
//                   <MapPin className="h-4 w-4 text-blue-400" />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-3 mt-4">
//               <div className="flex items-start gap-2">
//                 <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5" />
//                 <div>
//                   <h4 className="text-sm font-medium text-white">Note</h4>
//                   <p className="text-xs text-gray-400 mt-0.5">
//                     Temperature readings are verified on the blockchain for
//                     audit purposes
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </form>
//         )}
//       </CardContent>

//       {!isSuccess && (
//         <CardFooter className="flex justify-between pt-2">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={handleCancel}
//             disabled={isProcessing}
//             className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSubmit}
//             disabled={isProcessing || !location}
//             className={`${
//               isBreached
//                 ? "bg-yellow-600 hover:bg-yellow-700"
//                 : "bg-blue-600 hover:bg-blue-700"
//             } text-white`}
//           >
//             {isProcessing ? (
//               <span className="flex items-center gap-1">
//                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                 Recording...
//               </span>
//             ) : isBreached ? (
//               "Record with Warning"
//             ) : (
//               "Record Temperature"
//             )}
//           </Button>
//         </CardFooter>
//       )}
//     </Card>
//   );
// };

// export default TemperatureForm;
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
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";

const TemperatureForm = () => {
  // Add isMounted state
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batchId, setBatchId] = useState("");
  const {
    recordTemperature,
    loading: apiLoading,
    error: apiError,
  } = useTemperature();
  const { fetchBatchById, selectedBatch, loading: batchLoading } = useBatch();

  // Local mock states to avoid API issues
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [temperature, setTemperature] = useState(2.0);
  const [location, setLocation] = useState("");
  const [formError, setFormError] = useState("");
  const [isBreached, setIsBreached] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [berryType, setBerryType] = useState("Unknown");

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
      setBatchId(id);

      // Mock berry type based on batch ID
      if (parseInt(id) % 4 === 0) setBerryType("Strawberry");
      else if (parseInt(id) % 4 === 1) setBerryType("Blueberry");
      else if (parseInt(id) % 4 === 2) setBerryType("Raspberry");
      else setBerryType("Blackberry");
    } else {
      console.log("No batch ID found in query params");
      setFormError("Batch ID is required");
    }

    return () => setIsMounted(false);
  }, [searchParams]);

  // Check temperature ranges
  useEffect(() => {
    // Check if temperature is outside the optimal range
    if (temperature < 0 || temperature > 4) {
      setIsBreached(true);
    } else {
      setIsBreached(false);
    }
  }, [temperature]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setFormError("");

    if (!batchId) {
      setFormError("Batch ID is required");
      return;
    }

    if (!location) {
      setFormError("Please select a location");
      return;
    }

    // Mock implementation
    setLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);

      // Simulate redirect delay
      setTimeout(() => {
        if (isMounted) {
          router.push(`/batches/${batchId}`);
        }
      }, 2000);
    }, 1500);

    // NOTE: In real implementation, you would use:
    /*
    try {
      console.log(`Recording temperature ${temperature}°C at ${location} for batch ${batchId}`);
      const result = await recordTemperature(batchId, temperature, location);

      if (result && (result.success || result.status === "completed")) {
        console.log("Temperature recorded successfully:", result);
        // Only navigate if component is mounted
        router.push(`/batches/${batchId}`);
      } else {
        setFormError(result?.error || "Failed to record temperature");
      }
    } catch (err) {
      console.error("Error recording temperature:", err);
      setFormError(err.message || "Failed to record temperature");
    }
    */
  };

  const handleCancel = () => {
    if (batchId && isMounted) {
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
          {selectedBatch || berryType ? (
            <>
              Recording temperature for Batch #{batchId} -{" "}
              {selectedBatch?.berry_type || berryType}
            </>
          ) : (
            <>Recording temperature for Batch #{batchId || "?"}</>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {showSuccess ? (
          <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <h3 className="text-lg font-medium text-green-800">
              Temperature Recorded
            </h3>
            <p className="text-green-600 mt-1">
              {temperature}°C at {location} for Batch #{batchId}
            </p>
            <p className="text-sm text-green-500 mt-2">
              Redirecting to batch details...
            </p>
            <div className="mt-4">
              <Loader2 className="h-5 w-5 mx-auto animate-spin text-green-500" />
            </div>
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

            {!batchId && (
              <div className="text-red-500 text-sm">Batch ID is required</div>
            )}

            {(error || formError) && (
              <div className="text-red-500 text-sm">{error || formError}</div>
            )}
          </form>
        )}
      </CardContent>

      {!showSuccess && (
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !batchId || !location}
            className={isBreached ? "bg-yellow-500 hover:bg-yellow-600" : ""}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Recording...
              </span>
            ) : isBreached ? (
              "Record with Warning"
            ) : (
              "Record Temperature"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TemperatureForm;
