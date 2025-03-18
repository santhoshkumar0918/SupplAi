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

// Simple value formatter to handle undefined values
const formatValue = (value: any, defaultValue: string = "-") => {
  if (value === undefined || value === null) return defaultValue;
  return value;
};

const HealthMetrics: React.FC<HealthMetricsProps> = ({
  metrics,
  onRefresh,
  onReset,
}) => {
  // Add debug log but don't render it
  console.log("HealthMetrics received:", metrics);

  // Safe access for nested properties
  const isConnected = metrics?.is_connected === true;
  const isAccessible = metrics?.contract_accessible === true;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">System Health</h2>
        <div>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="mr-2"
          >
            Reset Counters
          </Button>
          <Button onClick={onRefresh} variant="default" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">Blockchain Connected:</td>
                  <td className="py-2 text-right">
                    <span
                      className={`px-2 py-1 rounded-md text-white ${
                        isConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {isConnected ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Contract Accessible:</td>
                  <td className="py-2 text-right">
                    <span
                      className={`px-2 py-1 rounded-md text-white ${
                        isAccessible ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {isAccessible ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Account Balance:</td>
                  <td className="py-2 text-right font-mono">
                    {formatValue(metrics.account_balance, "Unknown")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Last Updated:</td>
                  <td className="py-2 text-right">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Transaction Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">Total Transactions:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.transaction_count, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Successful:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.successful_transactions, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Failed:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.failed_transactions, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Success Rate:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.transaction_success_rate, "0%")}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Temperature Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Temperature Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">Total Breaches:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.temperature_breaches, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Critical Breaches:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.critical_breaches, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Warning Breaches:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.warning_breaches, "0")}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Batch Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Batch Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">Batches Created:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.batches_created, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Batches Completed:</td>
                  <td className="py-2 text-right">
                    {formatValue(metrics.batches_completed, "0")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Completion Rate:</td>
                  <td className="py-2 text-right">
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
