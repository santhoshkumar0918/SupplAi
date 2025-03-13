"use client";
import React, { useEffect, useState } from "react";
import { useSystem } from "../../../lib/hooks/useSystem";
import HealthMetrics from "../../../components/system/HealthMetrics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "../../../components/ui/button";

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

  useEffect(() => {
    const loadData = async () => {
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

    // Set up a refresh interval - but only if we're not already refreshing
    const intervalId = setInterval(() => {
      if (!isRefreshing) {
        fetchHealthMetrics().catch(console.error);
        setLastRefreshTime(new Date());
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchAgentStatus, fetchHealthMetrics, agentStatus.running]);

  const handleRefresh = async () => {
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

  // Show loading indicator when initial data is loading
  if (loading && !healthMetrics && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p>Loading system health data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Health</h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="ml-2"
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
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
              <p className="font-medium">Error: {error}</p>
              <p className="text-sm mt-1">
                Some metrics may be unavailable or incomplete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agent Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  agentStatus.running ? "bg-green-500" : "bg-red-500"
                } mr-2`}
              ></div>
              <div>
                <p className="font-medium">
                  Status: {agentStatus.running ? "Running" : "Stopped"}
                </p>
                <p className="text-sm text-gray-500">
                  Agent: {agentStatus.name || "None"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleAgentControl}
              className={
                agentStatus.running
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
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

      {/* Health Metrics */}
      <HealthMetrics
        metrics={healthMetrics || {}}
        onRefresh={handleRefresh}
        onReset={handleResetCounters}
      />

      {/* Transaction History */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              Transaction history viewer coming soon
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
