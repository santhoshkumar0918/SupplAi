"use client";

import React, { useEffect, useState } from "react";
import { useSystem } from "../../lib/hooks/useSystem";
import { useBatch } from "../../lib/hooks/useBatch";
import BatchList from "../../components/batches/BatchList";
import HealthMetrics from "../../components/system/HealthMetrics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import DashboardWrapper from "@/components/layout/DashBoardWrapper";
import {
  Activity,
  LayoutDashboard,
  Package,
  Thermometer,
  Cpu,
  Brain,
  Bot,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const {
    healthMetrics,
    fetchHealthMetrics,
    loading: systemLoading,
  } = useSystem();
  const { batches, fetchBatches, loading: batchLoading } = useBatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadData() {
      try {
        await Promise.all([fetchHealthMetrics(), fetchBatches()]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const intervalId = setInterval(() => {
      fetchHealthMetrics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchHealthMetrics, fetchBatches]);

  const handleRefreshHealthMetrics = () => {
    fetchHealthMetrics();
  };

  const handleResetCounters = () => {
    fetchHealthMetrics(true);
  };

  if (loading || systemLoading || batchLoading) {
    return (
      <DashboardWrapper>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-blue-400 font-medium">
            AI Agents Processing Data...
          </p>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-500" />
            Berry Supply Chain Intelligence
          </h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshHealthMetrics}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-blue-400 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* AI Status Banner */}
        <Card className="bg-blue-900/20 border border-blue-500/50 backdrop-blur-sm mb-8">
          <CardContent className="p-3">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
              <Bot className="h-5 w-5 mr-2 text-blue-400" />
              <p className="text-sm text-blue-300">
                <span className="font-semibold">AI Agents Active:</span> All
                systems operational. Processing {batches.length} batches with{" "}
                {healthMetrics?.successful_transactions || 0} verified
                blockchain transactions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Batch Stats Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center text-white">
                <Package className="h-5 w-5 mr-2 text-blue-500" />
                Batch Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-4xl font-bold text-blue-500 mb-1">
                  {batches.length}
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Total Monitored Batches
                </p>

                <div className="w-full mt-2 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="text-xl font-semibold text-blue-400">
                      {
                        batches.filter((b) => b.batch_status === "InTransit")
                          .length
                      }
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Activity className="h-3 w-3 mr-1 text-blue-500" />
                      In Transit
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xl font-semibold text-green-400">
                      {
                        batches.filter((b) => b.batch_status === "Delivered")
                          .length
                      }
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Stats Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center text-white">
                <Thermometer className="h-5 w-5 mr-2 text-blue-500" />
                Temperature Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-4xl font-bold text-blue-500 mb-1">
                  {healthMetrics?.temperature_breaches || 0}
                </div>
                <p className="text-gray-400 text-sm mb-3">Detected Anomalies</p>

                <div className="w-full mt-2 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="text-xl font-semibold text-red-400">
                      {healthMetrics?.critical_breaches || 0}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                      Critical
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xl font-semibold text-yellow-400">
                      {healthMetrics?.warning_breaches || 0}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
                      Warnings
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Stats Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center text-white">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                Blockchain Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-4xl font-bold text-blue-500 mb-1">
                  {healthMetrics?.transaction_count || 0}
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Ledger Transactions
                </p>

                <div className="w-full mt-2 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="text-xl font-semibold text-green-400">
                      {healthMetrics?.successful_transactions || 0}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                      Verified
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xl font-semibold text-red-400">
                      {healthMetrics?.failed_transactions || 0}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                      Failed
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Quality Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center text-white">
                <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                AI Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex justify-center mb-3">
                  <div className="relative h-16 w-16 mb-2">
                    <div className="absolute inset-0 h-full w-full rounded-full bg-blue-900/30 border border-blue-500/50 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-blue-500 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 h-full w-full rounded-full border-t-2 border-blue-500 animate-spin"></div>
                  </div>
                </div>

                <div className="text-center mt-2">
                  <p className="text-sm text-gray-400">Quality Monitoring</p>
                  <div className="text-blue-400 font-semibold mt-1">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-800 border-gray-700 mb-6">
            <TabsTrigger value="overview">Batches Overview</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-500" />
                  Active Batch Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BatchList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Blockchain & System Health
                </CardTitle>
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-blue-400"
                    onClick={handleResetCounters}
                  >
                    Reset Counters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <HealthMetrics
                  metrics={healthMetrics || {}}
                  onRefresh={handleRefreshHealthMetrics}
                  onReset={handleResetCounters}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Processing Indicators */}
        <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-500" />
              AI Agent Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  task: "Quality Analysis",
                  progress: 92,
                  color: "bg-blue-500",
                },
                {
                  task: "Temperature Monitoring",
                  progress: 78,
                  color: "bg-green-500",
                },
                {
                  task: "Blockchain Verification",
                  progress: 85,
                  color: "bg-purple-500",
                },
                {
                  task: "Predictive Maintenance",
                  progress: 64,
                  color: "bg-blue-500",
                },
              ].map((task) => (
                <div key={task.task} className="space-y-2">
                  <div className="flex items-center justify-between text-gray-300">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span>{task.task}</span>
                    </div>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className={task.color} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  );
}
