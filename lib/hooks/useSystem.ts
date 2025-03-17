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

// Updated interface to match actual API response format
interface HealthMetricsResponse {
  status?: string;
  result?: any; // More flexible typing to handle various response structures
  health_report?: SystemHealthMetrics;
  error?: string;
  success?: boolean;
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

        // Get raw response from the API
        const response = await client.getSystemHealth(resetCounters);

        // Log the entire response for debugging
        console.log(
          "Raw health metrics response:",
          JSON.stringify(response, null, 2)
        );

        // Try to extract health metrics from various possible paths in the response
        let extractedMetrics: SystemHealthMetrics | null = null;

        // Check all possible paths where health metrics might be located
        if (response?.result?.health_report) {
          console.log("Found health_report in result.health_report");
          extractedMetrics = response.result.health_report;
        } else if (response?.health_report) {
          console.log("Found direct health_report");
          extractedMetrics = response.health_report;
        } else if (response?.result?.report?.health_metrics) {
          console.log("Found health_metrics in result.report");
          extractedMetrics = response.result.report.health_metrics;
        } else if (response?.result) {
          // If metrics are directly in the result object
          console.log("Checking for metrics directly in result object");
          extractedMetrics = extractFieldsAsHealthMetrics(response.result);
        } else if (response) {
          // Last resort: try to extract metrics from the top-level response
          console.log("Checking for metrics in top-level response");
          extractedMetrics = extractFieldsAsHealthMetrics(response);
        }

        if (extractedMetrics && hasMinimumRequiredFields(extractedMetrics)) {
          console.log(
            "Successfully extracted health metrics:",
            extractedMetrics
          );
          setHealthMetrics(extractedMetrics);
          return extractedMetrics;
        }

        // If we reach here, we couldn't extract valid metrics
        console.log("Could not extract valid health metrics, using fallback");

        // Create fallback metrics
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
          // Merge any metrics we could extract
          ...extractAnyMetricsFrom(response),
        };

        console.log("Using fallback health metrics:", fallbackMetrics);
        setHealthMetrics(fallbackMetrics);

        // Throw an error for UI notification, but don't break the app
        const errorMsg =
          getErrorMessage(response) ||
          "Failed to fetch complete system health metrics";
        throw new Error(errorMsg);
      } catch (err: any) {
        console.error("Error fetching health metrics:", err);
        setError(
          err.message ||
            "An error occurred while fetching system health metrics"
        );

        // Return the current metrics to prevent UI from crashing
        return healthMetrics || {};
      } finally {
        setLoading(false);
      }
    },
    [healthMetrics]
  );

  // Helper function to check if we have minimum required fields for valid metrics
  const hasMinimumRequiredFields = (metrics: any): boolean => {
    // Define which fields are required for metrics to be considered valid
    const requiredFields = ["is_connected", "contract_accessible"];

    // Check if at least some of the required fields exist
    return requiredFields.some((field) => metrics[field] !== undefined);
  };

  // Helper function to extract error message from response
  const getErrorMessage = (response: any): string | null => {
    if (response?.error) return response.error;
    if (response?.result?.error) return response.result.error;
    if (
      typeof response?.result === "string" &&
      response.result.includes("error")
    )
      return response.result;
    return null;
  };

  // Helper function to extract fields as health metrics
  const extractFieldsAsHealthMetrics = (obj: any): SystemHealthMetrics => {
    if (!obj || typeof obj !== "object") return {};

    const metrics: SystemHealthMetrics = {};
    const metricFields: (keyof SystemHealthMetrics)[] = [
      "is_connected",
      "contract_accessible",
      "account_balance",
      "transaction_count",
      "successful_transactions",
      "failed_transactions",
      "transaction_success_rate",
      "temperature_breaches",
      "critical_breaches",
      "warning_breaches",
      "batches_created",
      "batches_completed",
      "timestamp",
    ];

    // Extract any matching fields
    metricFields.forEach((field) => {
      if (obj[field] !== undefined) {
        metrics[field] = obj[field];
      }
    });

    return metrics;
  };

  // Helper function to extract any metrics data from a partial/failed response
  const extractAnyMetricsFrom = (
    response: any
  ): Partial<SystemHealthMetrics> => {
    if (!response) return {};

    const metrics: Partial<SystemHealthMetrics> = {};

    // Try to extract metrics from various possible paths
    if (response.result?.health_report) {
      Object.assign(metrics, response.result.health_report);
    } else if (response.health_report) {
      Object.assign(metrics, response.health_report);
    } else if (response.result?.report?.health_metrics) {
      Object.assign(metrics, response.result.report.health_metrics);
    }

    // Direct extraction of fields from various paths
    const metricFields: (keyof SystemHealthMetrics)[] = [
      "is_connected",
      "contract_accessible",
      "account_balance",
      "transaction_count",
      "successful_transactions",
      "failed_transactions",
      "transaction_success_rate",
      "temperature_breaches",
      "critical_breaches",
      "warning_breaches",
      "batches_created",
      "batches_completed",
      "timestamp",
    ];

    // Try to extract fields from various paths
    metricFields.forEach((field) => {
      // Check various paths for each field
      if (response[field] !== undefined) metrics[field] = response[field];
      if (response.result?.[field] !== undefined)
        metrics[field] = response.result[field];
      if (response.result?.report?.[field] !== undefined)
        metrics[field] = response.result.report[field];
    });

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
