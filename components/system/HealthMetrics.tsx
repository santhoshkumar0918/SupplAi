// import React from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// interface SystemHealthMetrics {
//   timestamp?: string;
//   is_connected?: boolean;
//   contract_accessible?: boolean;
//   account_balance?: string;
//   transaction_count?: number;
//   successful_transactions?: number;
//   failed_transactions?: number;
//   transaction_success_rate?: string;
//   temperature_breaches?: number;
//   critical_breaches?: number;
//   warning_breaches?: number;
//   batches_created?: number;
//   batches_completed?: number;
// }

// interface HealthMetricsProps {
//   metrics: SystemHealthMetrics;
//   onRefresh: () => void;
//   onReset: () => void;
// }

// // Simple value formatter to handle undefined values
// const formatValue = (value: any, defaultValue: string = "-") => {
//   if (value === undefined || value === null) return defaultValue;
//   return value;
// };

// const HealthMetrics: React.FC<HealthMetricsProps> = ({
//   metrics,
//   onRefresh,
//   onReset,
// }) => {
//   // Add debug log but don't render it
//   console.log("HealthMetrics received:", metrics);

//   // Safe access for nested properties
//   const isConnected = metrics?.is_connected === true;
//   const isAccessible = metrics?.contract_accessible === true;

//   return (
//     <div className="mb-6">
//       <div className="flex justify-between items-center mb-2">
//         <h2 className="text-xl font-semibold">System Health</h2>
//         <div>
//           <Button
//             onClick={onReset}
//             variant="outline"
//             size="sm"
//             className="mr-2"
//           >
//             Reset Counters
//           </Button>
//           <Button onClick={onRefresh} variant="default" size="sm">
//             Refresh
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Connection Status */}
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Connection Status</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <table className="w-full">
//               <tbody>
//                 <tr>
//                   <td className="py-2">Blockchain Connected:</td>
//                   <td className="py-2 text-right">
//                     <span
//                       className={`px-2 py-1 rounded-md text-white ${
//                         isConnected ? "bg-green-500" : "bg-red-500"
//                       }`}
//                     >
//                       {isConnected ? "Yes" : "No"}
//                     </span>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Contract Accessible:</td>
//                   <td className="py-2 text-right">
//                     <span
//                       className={`px-2 py-1 rounded-md text-white ${
//                         isAccessible ? "bg-green-500" : "bg-red-500"
//                       }`}
//                     >
//                       {isAccessible ? "Yes" : "No"}
//                     </span>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Account Balance:</td>
//                   <td className="py-2 text-right font-mono">
//                     {formatValue(metrics.account_balance, "Unknown")}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Last Updated:</td>
//                   <td className="py-2 text-right">
//                     {metrics.timestamp
//                       ? new Date(metrics.timestamp).toLocaleString()
//                       : "-"}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </CardContent>
//         </Card>

//         {/* Transaction Metrics */}
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Transaction Metrics</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <table className="w-full">
//               <tbody>
//                 <tr>
//                   <td className="py-2">Total Transactions:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.transaction_count, "0")}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Successful:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.successful_transactions, "0")}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Failed:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.failed_transactions, "0")}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Success Rate:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.transaction_success_rate, "0%")}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </CardContent>
//         </Card>

//         {/* Temperature Metrics */}
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Temperature Metrics</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <table className="w-full">
//               <tbody>
//                 <tr>
//                   <td className="py-2">Total Breaches:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.temperature_breaches, "0")}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Critical Breaches:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.critical_breaches, "0")}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Warning Breaches:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.warning_breaches, "0")}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </CardContent>
//         </Card>

//         {/* Batch Metrics */}
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg">Batch Metrics</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <table className="w-full">
//               <tbody>
//                 <tr>
//                   <td className="py-2">Batches Created:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.batches_created, "0")}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Batches Completed:</td>
//                   <td className="py-2 text-right">
//                     {formatValue(metrics.batches_completed, "0")}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="py-2">Completion Rate:</td>
//                   <td className="py-2 text-right">
//                     {metrics.batches_created && metrics.batches_created > 0
//                       ? `${(
//                           ((metrics.batches_completed || 0) /
//                             metrics.batches_created) *
//                           100
//                         ).toFixed(0)}%`
//                       : "0%"}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default HealthMetrics;


import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SystemHealthMetrics {
  timestamp?: string;
  is_connected?: boolean;
  contract_accessible?: boolean;
  account_balance?: string;
  transaction_count?: number;
  successful_transactions?: number;
  failed_transactions?: number;
  transaction_success_rate?: string;
  temperature_breaches?: number;
  critical_breaches?: number;
  warning_breaches?: number;
  batches_created?: number;
  batches_completed?: number;
}

interface HealthMetricsProps {
  metrics: SystemHealthMetrics;
  onRefresh: () => void;
  onReset: () => void;
}

 
const formatValue = (value: any, defaultValue: string = "-") => {
  if (value === undefined || value === null) return defaultValue;
  return value;
};

const HealthMetrics: React.FC<HealthMetricsProps> = ({
  metrics,
  onRefresh,
  onReset,
}) => {
   
  console.log("HealthMetrics received:", metrics);

   
  const isConnected = metrics?.is_connected === true;
  const isAccessible = metrics?.contract_accessible === true;

  return (
    <div className="mb-6 bg-gray-800 p-6 rounded-xl shadow-lg text-gray-200">
      <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
          <h2 className="text-xl font-semibold text-white">AI System Health Monitor</h2>
        </div>
        <div>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="mr-2 border-gray-600 hover:bg-gray-700 text-black"
          >
            Reset Counters
          </Button>
          <Button 
            onClick={onRefresh} 
            variant="default" 
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card className="bg-gray-900 border-none shadow-md overflow-hidden">
          <CardHeader className="pb-2 bg-gray-900 border-b border-gray-300">
            <CardTitle className="text-lg text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-900 text-white">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Blockchain Connected:</td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-1 rounded-md text-white ${
                        isConnected ? "bg-green-500" : "bg-red-600"
                      }`}
                    >
                      {isConnected ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Contract Accessible:</td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-1 rounded-md text-white ${
                        isAccessible ? "bg-green-500" : "bg-red-600"
                      }`}
                    >
                      {isAccessible ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Account Balance:</td>
                  <td className="py-3 text-right font-mono text-blue-500">
                    {formatValue(metrics.account_balance, "Unknown")}
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Last Updated:</td>
                  <td className="py-3 text-right text-white">
                    {metrics.timestamp
                      ? new Date(metrics.timestamp).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Transaction Metrics */}
        <Card className="bg-gray-900 border-none shadow-md overflow-hidden">
          <CardHeader className="pb-2 bg-gray-900 border-b border-gray-300">
            <CardTitle className="text-lg text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Transaction Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-900 text-white">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Total Transactions:</td>
                  <td className="py-3 text-right font-semibold text-white">
                    {formatValue(metrics.transaction_count, "0")}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Successful:</td>
                  <td className="py-3 text-right text-green-500">
                    +{formatValue(metrics.successful_transactions, "0")}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Failed:</td>
                  <td className="py-3 text-right text-red-600">
                    -{formatValue(metrics.failed_transactions, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Success Rate:</td>
                  <td className="py-3 text-right text-blue-500 font-medium">
                    {formatValue(metrics.transaction_success_rate, "0%")}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Temperature Metrics */}
        <Card className="bg-gray-900 border-none shadow-md overflow-hidden">
          <CardHeader className="pb-2 bg-gray-900 border-b border-gray-300">
            <CardTitle className="text-lg text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Temperature Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-900 text-white">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Total Breaches:</td>
                  <td className="py-3 text-right font-semibold text-white">
                    {formatValue(metrics.temperature_breaches, "0")}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Critical Breaches:</td>
                  <td className="py-3 text-right text-red-600">
                    {formatValue(metrics.critical_breaches, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Warning Breaches:</td>
                  <td className="py-3 text-right text-yellow-600">
                    {formatValue(metrics.warning_breaches, "0")}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Batch Metrics */}
        <Card className="bg-gray-900 border-none shadow-md overflow-hidden">
          <CardHeader className="pb-2 bg-gray-900 border-b border-gray-300">
            <CardTitle className="text-lg text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              AI Batch Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gray-900 text-white">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Batches Created:</td>
                  <td className="py-3 text-right font-semibold text-white">
                    {formatValue(metrics.batches_created, "0")}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-3">Batches Completed:</td>
                  <td className="py-3 text-right text-green-500">
                    {formatValue(metrics.batches_completed, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Completion Rate:</td>
                  <td className="py-3 text-right text-blue-500 font-medium">
                    {metrics.batches_created && metrics.batches_created > 0
                      ? `${(
                          ((metrics.batches_completed || 0) /
                            metrics.batches_created) *
                          100
                        ).toFixed(0)}%`
                      : "0%"}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthMetrics;