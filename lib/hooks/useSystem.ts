import { useState, useCallback, useEffect } from "react";
import BerrySupplyChainClient from "../api/berrySupplyChainClient";

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

// Define the expected response types
interface ServerStatusResponse {
  status: string;
  agent: string | null;
  agent_running: boolean;
}

interface AgentActionResponse {
  status: string;
  message: string;
}

interface HealthMetricsResponse {
  status: string;
  result?: {
    status: string;
    health_report?: SystemHealthMetrics;
    error?: string;
  };
  health_report?: SystemHealthMetrics;
  error?: string;
}

export function useSystem() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [healthMetrics, setHealthMetrics] =
    useState<SystemHealthMetrics | null>(null);
  const [agentStatus, setAgentStatus] = useState<{
    running: boolean;
    name: string | null;
  }>({
    running: false,
    name: null,
  });

  const client = new BerrySupplyChainClient();

  const fetchHealthMetrics = useCallback(
    async (resetCounters: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        console.log(
          "Fetching health metrics...",
          resetCounters ? "(resetting counters)" : ""
        );
        const response = (await client.getSystemHealth(
          resetCounters
        )) as HealthMetricsResponse;

        console.log("Health metrics response:", response);

        // Handle different possible response formats
        if (
          response?.result?.status === "completed" &&
          response.result.health_report
        ) {
          console.log("Setting health metrics from result.health_report");
          setHealthMetrics(response.result.health_report);
          return response.result.health_report;
        } else if (response?.health_report) {
          console.log("Setting health metrics from direct health_report");
          setHealthMetrics(response.health_report);
          return response.health_report;
        } else {
          // Even if we fail to get proper metrics, set some default values
          // This prevents the UI from showing an error when some data is available
          const fallbackMetrics: SystemHealthMetrics = {
            timestamp: new Date().toISOString(),
            is_connected: false,
            contract_accessible: false,
            account_balance: "Unknown",
            transaction_count: 0,
            successful_transactions: 0,
            failed_transactions: 0,
            transaction_success_rate: "0%",
            temperature_breaches: 0,
            critical_breaches: 0,
            warning_breaches: 0,
            batches_created: 0,
            batches_completed: 0,
            ...extractAnyMetricsFrom(response),
          };

          console.log("Setting fallback health metrics");
          setHealthMetrics(fallbackMetrics);

          // Still throw an error so the UI can show a message
          throw new Error(
            response?.result?.error ||
              response?.error ||
              "Failed to fetch complete system health metrics"
          );
        }
      } catch (err: any) {
        console.error("Error fetching health metrics:", err);
        setError(
          err.message ||
            "An error occurred while fetching system health metrics"
        );

        // Return an empty metrics object to prevent UI from crashing
        return healthMetrics || {};
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Helper function to extract any metrics data from a partial/failed response
  const extractAnyMetricsFrom = (
    response: any
  ): Partial<SystemHealthMetrics> => {
    if (!response) return {};

    const metrics: Partial<SystemHealthMetrics> = {};

    // Try to extract any valid metrics from various possible paths in the response
    if (response.result?.health_report) {
      Object.assign(metrics, response.result.health_report);
    } else if (response.health_report) {
      Object.assign(metrics, response.health_report);
    }

    // Try to extract individual fields from various possible paths
    const extractField = (fieldName: keyof SystemHealthMetrics) => {
      if (response[fieldName] !== undefined)
        metrics[fieldName] = response[fieldName];
      if (response.result?.[fieldName] !== undefined)
        metrics[fieldName] = response.result[fieldName];
    };

    // Try to extract specific fields
    [
      "is_connected",
      "contract_accessible",
      "account_balance",
      "transaction_count",
      "successful_transactions",
      "failed_transactions",
      "temperature_breaches",
      "critical_breaches",
      "warning_breaches",
      "batches_created",
      "batches_completed",
    ].forEach((field) => extractField(field as keyof SystemHealthMetrics));

    return metrics;
  };

  const fetchAgentStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching agent status...");
      const response = (await client.getServerStatus()) as ServerStatusResponse;
      console.log("Agent status response:", response);

      if (response.agent_running !== undefined) {
        setAgentStatus({
          running: response.agent_running,
          name: response.agent || null,
        });
        return response;
      } else {
        throw new Error("Invalid response format for agent status");
      }
    } catch (err: any) {
      console.error("Error fetching agent status:", err);
      setError(err.message || "An error occurred while fetching agent status");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const startAgent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Starting agent...");
      const response = (await client.startAgent()) as AgentActionResponse;
      console.log("Start agent response:", response);

      // Check for success
      if (response.status === "success") {
        // Refresh agent status
        await fetchAgentStatus();
        return true;
      } else {
        throw new Error(response.message || "Failed to start agent");
      }
    } catch (err: any) {
      console.error("Error starting agent:", err);
      setError(err.message || "An error occurred while starting agent");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAgentStatus]);

  const stopAgent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Stopping agent...");
      const response = (await client.stopAgent()) as AgentActionResponse;
      console.log("Stop agent response:", response);

      // Check for success
      if (response.status === "success") {
        // Refresh agent status
        await fetchAgentStatus();
        return true;
      } else {
        throw new Error(response.message || "Failed to stop agent");
      }
    } catch (err: any) {
      console.error("Error stopping agent:", err);
      setError(err.message || "An error occurred while stopping agent");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAgentStatus]);

  // Initialize by fetching agent status
  useEffect(() => {
    fetchAgentStatus().catch(console.error);
  }, [fetchAgentStatus]);

  return {
    loading,
    error,
    healthMetrics,
    agentStatus,
    fetchHealthMetrics,
    fetchAgentStatus,
    startAgent,
    stopAgent,
  };
}
