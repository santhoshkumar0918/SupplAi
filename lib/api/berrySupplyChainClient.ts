import * as endpoints from "./endpoints";

// Types that will need to be defined properly in types/api.ts and others
interface Batch {
  id: string;
  name: string;
  createdAt: string;
  status: string;
  currentTemperature?: number;
  optimalTempMin: number;
  optimalTempMax: number;
  qualityScore?: number;
  shelfLifePrediction?: string;
  recommendations?: string[];
  // Add other batch properties as needed
}

interface TemperatureReading {
  batchId: string;
  temperature: number;
  timestamp: string;
  isBreached: boolean;
  location: string;
}

interface QualityAssessment {
  batchId: string;
  qualityScore: number;
  shelfLifePrediction: string;
  recommendations: string[];
  lastUpdated: string;
}

interface SystemHealth {
  status: string;
  agentStatus: string;
  connectionStatus: Record<string, string>;
  lastSyncTimestamp: string;
  pendingTransactions: number;
  systemLoad: number;
}

class BerrySupplyChainClient {
  // General methods
  async getServerStatus(): Promise<{
    status: string;
    agent: string | null;
    agent_running: boolean;
  }> {
    const response = await fetch(endpoints.getServerStatusUrl);
    return this.handleResponse(response);
  }

  async listAgents(): Promise<{ agents: string[] }> {
    const response = await fetch(endpoints.listAgentsUrl);
    return this.handleResponse(response);
  }

  async loadAgent(
    agentName: string
  ): Promise<{ status: string; agent: string }> {
    const url = endpoints.loadAgentUrl.replace("%agentName%", agentName);
    const response = await fetch(url, { method: "POST" });
    return this.handleResponse(response);
  }

  async listConnections(): Promise<{
    connections: Record<
      string,
      { configured: boolean; is_llm_provider: boolean }
    >;
  }> {
    const response = await fetch(endpoints.listConnectionsUrl);
    return this.handleResponse(response);
  }

  async listConnectionActions(
    connectionName: string
  ): Promise<{ connection: string; actions: Record<string, any> }> {
    const url = endpoints.listConnectionActionsUrl.replace(
      "%connectionName%",
      connectionName
    );
    const response = await fetch(url);
    return this.handleResponse(response);
  }

  // Fixed method for calling connection actions
  async callConnectionAction(
    connection: string,
    action: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    try {
      console.log(`Calling ${connection}.${action} with params:`, params);

      const response = await fetch(endpoints.actionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connection,
          action,
          params,
        }),
      });

      if (!response.ok) {
        // Check if this is a "Connection not found" error
        let errorMessage = "";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData?.detail ||
            `API request failed: ${response.status} ${response.statusText}`;
        } catch (parseError) {
          // If we can't parse the JSON response
          errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        }

        if (
          errorMessage.includes("Connection") &&
          errorMessage.includes("not found")
        ) {
          try {
            // Try listing available connections for better error messages
            const connections = await this.listConnections();
            console.error(
              `Connection '${connection}' not found. Available connections:`,
              connections.connections
                ? Object.keys(connections.connections)
                : "None"
            );
          } catch (connError) {
            console.error("Could not fetch connections list:", connError);
          }
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      // Normalize response format
      if (responseData.result) {
        // Add success flag if needed
        if (
          typeof responseData.result === "object" &&
          !responseData.result.success
        ) {
          responseData.result.success = responseData.status === "success";
        }
        return responseData.result;
      }

      return responseData;
    } catch (error) {
      console.error(`Error calling ${connection}.${action}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Berry temperature monitoring methods
  async monitorTemperature(
    batchId: string,
    temperature: number,
    location: string
  ): Promise<any> {
    const result = await this.callConnectionAction(
      "sonic",
      "monitor-berry-temperature",
      {
        batch_id: parseInt(batchId),
        temperature,
        location,
      }
    );

    // Ensure the response has success field
    if (result && typeof result === "object" && !result.success) {
      if (result.status === "completed" || result.status === "success") {
        result.success = true;
      }
    }

    return result;
  }

  async manageBerryQuality(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      "sonic",
      "manage-berry-quality",
      {
        batch_id: parseInt(batchId),
      }
    );

    // Normalize response format
    if (result && typeof result === "object" && !result.success) {
      if (result.status === "completed" || result.status === "success") {
        result.success = true;
      }
    }

    return result;
  }

  async processRecommendations(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      "sonic",
      "process-agent-recommendations",
      {
        batch_id: parseInt(batchId),
      }
    );

    // Normalize response format
    if (result && typeof result === "object" && !result.success) {
      if (result.status === "completed" || result.status === "success") {
        result.success = true;
      }
    }

    return result;
  }

  // Batch management methods
  async createBatch(berryType: string): Promise<any> {
    const result = await this.callConnectionAction(
      "sonic",
      "manage-batch-lifecycle",
      {
        action: "create",
        berry_type: berryType,
      }
    );

    // Normalize response format
    if (result && typeof result === "object" && !result.success) {
      if (result.status === "completed" || result.status === "success") {
        result.success = true;
      }
    }

    return result;
  }

  async getBatchStatus(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      "sonic",
      "manage-batch-lifecycle",
      {
        action: "status",
        batch_id: parseInt(batchId),
      }
    );

    // Normalize response format
    if (result && typeof result === "object" && !result.success) {
      if (result.status === "completed" || result.status === "success") {
        result.success = true;
      }
    }

    return result;
  }

  async getBatchReport(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      "sonic",
      "manage-batch-lifecycle",
      {
        action: "report",
        batch_id: parseInt(batchId),
      }
    );

    // Normalize response format
    if (result && typeof result === "object" && !result.success) {
      if (result.status === "completed" || result.status === "success") {
        result.success = true;
      }
    }

    return result;
  }

  async completeBatch(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      "sonic",
      "manage-batch-lifecycle",
      {
        action: "complete",
        batch_id: parseInt(batchId),
      }
    );

    // Normalize response format
    if (result && typeof result === "object" && !result.success) {
      if (result.status === "completed" || result.status === "redirected") {
        result.success = true;
      }
    }

    return result;
  }

  async manageBatchSequence(
    berryType: string,
    temperatures: number[],
    locations: string[],
    completeShipment: boolean
  ): Promise<any> {
    const result = await this.callConnectionAction(
      "sonic",
      "manage-batch-sequence",
      {
        berry_type: berryType,
        temperatures,
        locations,
        complete_shipment: completeShipment,
      }
    );

    // Normalize response format
    if (result && typeof result === "object" && !result.success) {
      if (result.status === "completed" || result.status === "success") {
        result.success = true;
      }
    }

    return result;
  }

  // System health method
  async getSystemHealth(resetCounters: boolean = false): Promise<any> {
    return this.callConnectionAction("sonic", "system-health-check", {
      reset_counters: resetCounters,
    });
  }

  // Agent control methods
  async startAgent(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(endpoints.startAgentUrl, {
        method: "POST",
      });
      return this.handleResponse(response);
    } catch (error: any) {
      // If agent is already running, consider it a success
      if (error.message && error.message.includes("Agent already running")) {
        return { status: "success", message: "Agent is already running" };
      }
      throw error;
    }
  }

  async stopAgent(): Promise<{ status: string; message: string }> {
    const response = await fetch(endpoints.stopAgentUrl, {
      method: "POST",
    });
    return this.handleResponse(response);
  }

  // Helper methods
  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      let errorMessage = "";
      try {
        const errorData = await response.json();
        errorMessage =
          errorData?.detail ||
          `API request failed: ${response.status} ${response.statusText}`;
      } catch (parseError) {
        errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Utility methods
  async getAllBatches(): Promise<any[]> {
    return this.callConnectionAction("sonic", "manage-batch-lifecycle", {
      action: "list",
    });
  }

  async getTemperatureHistory(batchId: string): Promise<any[]> {
    const batchReport = await this.getBatchReport(batchId);

    // Try different paths to find temperature history
    let temperatureHistory = [];
    if (batchReport?.report?.temperature_history) {
      temperatureHistory = batchReport.report.temperature_history;
    } else if (batchReport?.temperature_stats?.readings) {
      temperatureHistory = batchReport.temperature_stats.readings;
    } else if (batchReport?.report?.temperature_stats?.readings) {
      temperatureHistory = batchReport.report.temperature_stats.readings;
    }

    return temperatureHistory || [];
  }

  async getQualityAssessment(batchId: string): Promise<any> {
    return this.manageBerryQuality(batchId);
  }
}

export default BerrySupplyChainClient;
