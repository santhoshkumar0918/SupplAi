// "use client";
// import React, { useEffect, useState } from "react";
// import { useSystem } from "../../../lib/hooks/useSystem";
// import HealthMetrics from "../../../components/system/HealthMetrics";
// import TransactionHistory from "../../../components/system/TransactionHistory";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "../../../components/ui/button";
// import BerrySupplyChainClient from "../../../lib/api/berrySupplyChainClient";

// export default function SystemHealthPage() {
//   const {
//     healthMetrics,
//     agentStatus,
//     fetchHealthMetrics,
//     fetchAgentStatus,
//     startAgent,
//     stopAgent,
//     loading,
//     error,
//   } = useSystem();

//   const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
//   const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(error);

//   // Create an instance of the client for the TransactionHistory component
//   const client = new BerrySupplyChainClient();

//   useEffect(() => {
//     // Initialize with a single data load
//     const loadData = async () => {
//       if (isRefreshing) return; // Prevent concurrent fetches

//       setIsRefreshing(true);
//       try {
//         // First check agent status
//         await fetchAgentStatus();

//         // Then fetch health metrics if agent is running
//         if (agentStatus.running) {
//           await fetchHealthMetrics();
//         }

//         setLastRefreshTime(new Date());
//       } catch (error) {
//         console.error("Error loading initial data:", error);
//       } finally {
//         setIsRefreshing(false);
//       }
//     };

//     loadData();

//     // Set up a refresh interval - with safety check for isRefreshing
//     const intervalId = setInterval(() => {
//       if (!isRefreshing) {
//         loadData();
//       }
//     }, 60000); // Refresh every 60 seconds instead of 30 for less load

//     return () => clearInterval(intervalId);
//   }, []); // Only run once on mount, don't include dependencies that change

//   // Update error message when error prop changes
//   useEffect(() => {
//     setErrorMessage(error);
//   }, [error]);

//   const handleRefresh = async () => {
//     if (isRefreshing) return; // Prevent concurrent refreshes

//     setIsRefreshing(true);
//     try {
//       await fetchAgentStatus();
//       await fetchHealthMetrics();
//       setLastRefreshTime(new Date());
//     } catch (error) {
//       console.error("Error refreshing data:", error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const handleResetCounters = async () => {
//     if (isRefreshing) return; // Prevent concurrent actions

//     setIsRefreshing(true);
//     try {
//       await fetchHealthMetrics(true);
//       setLastRefreshTime(new Date());
//     } catch (error) {
//       console.error("Error resetting counters:", error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const handleAgentControl = async () => {
//     if (isRefreshing) return; // Prevent concurrent actions

//     setIsRefreshing(true);
//     try {
//       if (agentStatus.running) {
//         await stopAgent();
//       } else {
//         await startAgent();
//       }
//       await fetchAgentStatus();
//     } catch (error) {
//       console.error("Error controlling agent:", error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const handleError = (error: string) => {
//     setErrorMessage(error);
//   };

//   // Show initial loading indicator
//   if (loading && !healthMetrics && !error && !isRefreshing) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
//         <p>Loading system health data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">System Health</h1>
//         <div className="flex items-center text-sm text-gray-500">
//           <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
//           <Button
//             onClick={handleRefresh}
//             variant="outline"
//             size="sm"
//             className="ml-2"
//             disabled={isRefreshing}
//           >
//             {isRefreshing ? (
//               <>
//                 <span className="animate-spin mr-1">⟳</span> Refreshing...
//               </>
//             ) : (
//               "Refresh"
//             )}
//           </Button>
//         </div>
//       </div>

//       {errorMessage && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
//           <div className="flex items-center">
//             <svg
//               className="h-5 w-5 mr-2 text-red-500"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <div>
//               <p className="font-medium">Error: {errorMessage}</p>
//               <p className="text-sm mt-1">
//                 Some metrics may be unavailable or incomplete
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Agent Status */}
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Agent Status</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div
//                 className={`w-4 h-4 rounded-full ${
//                   agentStatus.running ? "bg-green-500" : "bg-red-500"
//                 } mr-2`}
//               ></div>
//               <div>
//                 <p className="font-medium">
//                   Status: {agentStatus.running ? "Running" : "Stopped"}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   Agent: {agentStatus.name || "None"}
//                 </p>
//               </div>
//             </div>
//             <Button
//               onClick={handleAgentControl}
//               className={
//                 agentStatus.running
//                   ? "bg-red-500 hover:bg-red-600"
//                   : "bg-green-500 hover:bg-green-600"
//               }
//               disabled={isRefreshing}
//             >
//               {isRefreshing ? (
//                 <span className="animate-spin">⟳</span>
//               ) : agentStatus.running ? (
//                 "Stop Agent"
//               ) : (
//                 "Start Agent"
//               )}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Health Metrics */}
//       <HealthMetrics
//         metrics={healthMetrics || {}}
//         onRefresh={handleRefresh}
//         onReset={handleResetCounters}
//       />

//       {/* Transaction History */}
//       <TransactionHistory client={client} onError={handleError} />
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState } from "react";
import { useSystem } from "../../../lib/hooks/useSystem";
import HealthMetrics from "../../../components/system/HealthMetrics";
import TransactionHistory from "../../../components/system/TransactionHistory";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "../../../components/ui/button";
import BerrySupplyChainClient from "../../../lib/api/berrySupplyChainClient";

export default function SystemHealthPage() {
  const {
    healthMetrics,
    agentStatus,
    fetchHealthMetrics,
    fetchAgentStatus,
    startAgent,
    stopAgent,
    loading,
    error,
  } = useSystem();

  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(error);

  
  const client = new BerrySupplyChainClient();

  useEffect(() => {
    
    const loadData = async () => {
      if (isRefreshing) return; 

      setIsRefreshing(true);
      try {
        
        await fetchAgentStatus();

       
        if (agentStatus.running) {
          await fetchHealthMetrics();
        }

        setLastRefreshTime(new Date());
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    loadData();

    
    const intervalId = setInterval(() => {
      if (!isRefreshing) {
        loadData();
      }
    }, 60000); 

    return () => clearInterval(intervalId);
  }, []); 

 
  useEffect(() => {
    setErrorMessage(error);
  }, [error]);

  const handleRefresh = async () => {
    if (isRefreshing) return; 
    setIsRefreshing(true);
    try {
      await fetchAgentStatus();
      await fetchHealthMetrics();
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetCounters = async () => {
    if (isRefreshing) return; 

    setIsRefreshing(true);
    try {
      await fetchHealthMetrics(true);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("Error resetting counters:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAgentControl = async () => {
    if (isRefreshing) return; 

    setIsRefreshing(true);
    try {
      if (agentStatus.running) {
        await stopAgent();
      } else {
        await startAgent();
      }
      await fetchAgentStatus();
    } catch (error) {
      console.error("Error controlling agent:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
  };

  
  if (loading && !healthMetrics && !error && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-gray-200">Loading system health data...</p>
        <p className="text-sm text-blue-400 mt-1">AI Agent is gathering information</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 text-gray-200 min-h-screen">
      <div className="flex justify-between items-center mb-5 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <span className="mr-2">System Health</span>
          <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-md">AI Monitored</span>
        </h1>
        <div className="flex items-center text-sm text-gray-400">
          <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="ml-2 border-gray-700 hover:bg-gray-800 hover:text-blue-400 text-gray-300"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <span className="animate-spin mr-1">⟳</span> Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">AI Agent Error: {errorMessage}</p>
              <p className="text-sm mt-1 text-red-400">
                Some metrics may be unavailable or incomplete
              </p>
            </div>
          </div>
        </div>
      )}

      
      <Card className="mb-6 bg-gray-800 border-gray-700 overflow-hidden">
        <div className={`h-1 w-full ${agentStatus.running ? "bg-green-500" : "bg-red-500"}`}></div>
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white mb-5">Agent Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  agentStatus.running ? "bg-green-500 animate-pulse" : "bg-red-500"
                } mr-2`}
              ></div>
              <div>
                <p className="font-medium text-gray-200">
                  {agentStatus.running ? "Running" : "Stopped"}
                </p>
                <p className="text-sm text-gray-400">
                  AI Agent: {agentStatus.name || "None"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleAgentControl}
              className={
                agentStatus.running
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <span className="animate-spin">⟳</span>
              ) : agentStatus.running ? (
                "Stop Agent"
              ) : (
                "Start Agent"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

     
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-1 h-6 bg-blue-500 rounded-r mr-2"></div>
          <h2 className="text-xl font-bold text-white">AI Monitored Metrics</h2>
        </div>
        <HealthMetrics
          metrics={healthMetrics || {}}
          onRefresh={handleRefresh}
          onReset={handleResetCounters}
        />
      </div>

      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-1 h-6 bg-blue-500 rounded-r mr-2"></div>
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
        </div>
        <p className="text-sm text-blue-400 mb-4">Processed by AI agent system</p>
        <TransactionHistory client={client} onError={handleError} />
      </div>
    </div>
  );
}