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

  // Create an instance of the client for the TransactionHistory component
  const client = new BerrySupplyChainClient();

  useEffect(() => {
    // Initialize with a single data load
    const loadData = async () => {
      if (isRefreshing) return; // Prevent concurrent fetches

      setIsRefreshing(true);
      try {
        // First check agent status
        await fetchAgentStatus();

        // Then fetch health metrics if agent is running
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

    // Set up a refresh interval - with safety check for isRefreshing
    const intervalId = setInterval(() => {
      if (!isRefreshing) {
        loadData();
      }
    }, 60000); // Refresh every 60 seconds instead of 30 for less load

    return () => clearInterval(intervalId);
  }, []); // Only run once on mount, don't include dependencies that change

  // Update error message when error prop changes
  useEffect(() => {
    setErrorMessage(error);
  }, [error]);

  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent concurrent refreshes

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
    if (isRefreshing) return; // Prevent concurrent actions

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
    if (isRefreshing) return; // Prevent concurrent actions

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

  // Show initial loading indicator
  if (loading && !healthMetrics && !error && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-200">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p>Loading system health data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      {/* Main content area - adjusted for navbar */}
      <div className="pt-16 pb-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">System Health</h1>
              <p className="text-blue-400 mt-1">AI Agent Monitoring Dashboard</p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2"></div>
                <span>Live monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-400 hover:bg-blue-900/50"
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
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-red-400 flex-shrink-0"
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
                  <p className="font-medium">Error: {errorMessage}</p>
                  <p className="text-sm mt-1">
                    Some metrics may be unavailable or incomplete
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Agent Status */}
          <Card className="mb-6 bg-gray-800 border-0 shadow-lg shadow-blue-900/10">
            <CardHeader className="border-b border-gray-700 pb-3">
              <CardTitle className="text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm4 3a1 1 0 00-1-1H8a1 1 0 000 2h5a1 1 0 001-1z" clipRule="evenodd"/>
                </svg>
                Agent Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      agentStatus.running ? "bg-green-500 animate-pulse" : "bg-red-500"
                    } mr-2`}
                  ></div>
                  <div>
                    <p className="font-medium text-white">
                      Status: {agentStatus.running ? "Running" : "Stopped"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Agent: <span className="text-blue-400">{agentStatus.name || "None"}</span>
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAgentControl}
                  className={
                    agentStatus.running
                      ? "bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
                      : "bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                  }
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <span className="animate-spin">⟳</span>
                  ) : agentStatus.running ? (
                    <>
                      <svg className="w-4 h-4 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"/>
                      </svg>
                      Stop Agent
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                      </svg>
                      Start Agent
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <h2 className="text-xl font-semibold text-white">Health Metrics</h2>
              <div className="ml-2 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full">AI Monitored</div>
            </div>
            <HealthMetrics
              metrics={healthMetrics || {}}
              onRefresh={handleRefresh}
              onReset={handleResetCounters}
            />
          </div>

          {/* Transaction History */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <h2 className="text-xl font-semibold text-white">Transaction History</h2>
              <div className="ml-2 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full">AI Processed</div>
            </div>
            <TransactionHistory client={client} onError={handleError} />
          </div>
        </div>
      </div>
    </div>
  );
}