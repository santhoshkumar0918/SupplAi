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
  berryType?: string;
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
  agent: string | null;
  agent_running: boolean;
  health_report?: {
    timestamp?: string;
    connection?: {
      is_connected?: boolean;
      network?: string;
      account?: string | undefined;
      balance?: number;
    };
    transactions?: {
      sent?: number;
      successful?: number;
      failed?: number;
      success_rate?: string;
      total_gas_used?: number;
      avg_gas_used?: number;
      total_cost?: string;
    };
    counters_reset?: boolean;
  };
}

interface Transaction {
  id: string;
  transaction_hash: string;
  transaction_url?: string;
  timestamp: string;
  type: string;
  success: boolean;
  gas_used?: number;
  execution_time?: number;
  error?: string;
}

class BerrySupplyChainClient {
  // Define the connection name as a class property to easily update it
  private connectionName = "educhain";
  private initialized = false;

  // Initialize method to ensure agent is loaded and running
  async initialize(): Promise<boolean> {
    try {
      // If already initialized, return true
      if (this.initialized) {
        return true;
      }

      // Check server status to see if an agent is loaded
      const status = await this.getServerStatus();
      if (status.agent) {
        console.log(`Agent already loaded: ${status.agent}`);
        this.initialized = true;
        return true;
      }

      // Get list of available agents
      const agentsResponse = await this.listAgents();
      const agents = agentsResponse.agents || [];

      if (agents.length === 0) {
        console.error("No agents available on server");
        return false;
      }

      // Try to load the BerryMonitorAgent or fall back to first available
      const agentToLoad = agents.includes("BerryMonitorAgent")
        ? "BerryMonitorAgent"
        : agents[0];

      // Load the agent
      const loadResult = await this.loadAgent(agentToLoad);
      if (loadResult.status !== "success") {
        console.error(`Failed to load agent: ${JSON.stringify(loadResult)}`);
        return false;
      }

      // Start the agent
      const startResult = await this.startAgent();
      if (startResult.status !== "success") {
        console.error(`Failed to start agent: ${JSON.stringify(startResult)}`);
        return false;
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Error during initialization:", error);
      return false;
    }
  }

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

  // Berry temperature monitoring methods
  async monitorTemperature(
    batchId: string,
    temperature: number,
    location: string
  ): Promise<any> {
    const result = await this.callConnectionAction(
      this.connectionName,
      "monitor-berry-temperature",
      {
        batch_id: parseInt(batchId),
        temperature,
        location,
      }
    );

    return this.normalizeResult(result);
  }

  async manageBerryQuality(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      this.connectionName,
      "manage-berry-quality",
      {
        batch_id: parseInt(batchId),
      }
    );

    return this.normalizeResult(result);
  }

  async processRecommendations(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      this.connectionName,
      "process-agent-recommendations",
      {
        batch_id: parseInt(batchId),
      }
    );

    return this.normalizeResult(result);
  }

  // Batch management methods
  async createBatch(berryType: string): Promise<any> {
    // Ensure we're initialized before making the request
    if (!this.initialized && !(await this.initialize())) {
      throw new Error("Failed to initialize client");
    }

    const result = await this.callConnectionAction(
      this.connectionName,
      "manage-batch-lifecycle",
      {
        action: "create",
        berry_type: berryType,
      }
    );

    return this.normalizeResult(result);
  }

  async getBatchStatus(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      this.connectionName,
      "manage-batch-lifecycle",
      {
        action: "status",
        batch_id: parseInt(batchId),
      }
    );

    return this.normalizeResult(result);
  }

  async getBatchReport(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      this.connectionName,
      "manage-batch-lifecycle",
      {
        action: "report",
        batch_id: parseInt(batchId),
      }
    );

    return this.normalizeResult(result);
  }

  async completeBatch(batchId: string): Promise<any> {
    const result = await this.callConnectionAction(
      this.connectionName,
      "manage-batch-lifecycle",
      {
        action: "complete",
        batch_id: parseInt(batchId),
      }
    );

    return this.normalizeResult(result);
  }

  async manageBatchSequence(
    berryType: string,
    temperatures: number[],
    locations: string[],
    completeShipment: boolean
  ): Promise<any> {
    const result = await this.callConnectionAction(
      this.connectionName,
      "manage-batch-sequence",
      {
        berry_type: berryType,
        temperatures,
        locations,
        complete_shipment: completeShipment,
      }
    );

    return this.normalizeResult(result);
  }

  // System health and monitoring
  async getSystemHealth(resetCounters: boolean = false): Promise<SystemHealth> {
    const result = await this.callConnectionAction(
      this.connectionName,
      "system-health-check",
      {
        reset_counters: resetCounters,
      }
    );

    return this.normalizeResult(result);
  }

  // Transaction history methods
  async getTransactionHistory(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    status: string;
    transactions?: Transaction[];
    total?: number;
    error?: string;
  }> {
    try {
      const result = await this.perform_registered_action(
        "get-transaction-history",
        {
          page,
          limit: pageSize,
        }
      );

      // Log the raw response for debugging
      console.log("Transaction history result:", result);

      // Normalize the response
      if (result.error || !result.transactions) {
        return await this.getTransactionHistoryMock(page, pageSize);
      }

      return {
        status: "success",
        transactions: result.transactions || [],
        total: result.total || 0,
      };
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      // Fall back to mock data
      return await this.getTransactionHistoryMock(page, pageSize);
    }
  }

  async getTransaction(txHash: string): Promise<{
    status: string;
    transaction?: Transaction;
    error?: string;
  }> {
    try {
      const result = await this.perform_registered_action(
        "get-transaction-details",
        {
          transaction_hash: txHash,
        }
      );

      // If backend implementation is not ready, fall back to mock
      if (result.error || !result.transaction) {
        const mockData = await this.getTransactionHistoryMock(1, 20);
        const transaction = mockData.transactions.find(
          (tx) => tx.transaction_hash === txHash
        );

        if (transaction) {
          return {
            status: "success",
            transaction,
          };
        } else {
          return {
            status: "error",
            error: `Transaction with hash ${txHash} not found`,
          };
        }
      }

      return {
        status: "success",
        transaction: result.transaction,
      };
    } catch (error) {
      console.error(`Error fetching transaction ${txHash}:`, error);

      // Fall back to mock data
      const mockData = await this.getTransactionHistoryMock(1, 20);
      const transaction = mockData.transactions.find(
        (tx) => tx.transaction_hash === txHash
      );

      if (transaction) {
        return {
          status: "success",
          transaction,
        };
      } else {
        return {
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  // Agent control methods
  async startAgent(): Promise<{ status: string; message: string }> {
    const response = await fetch(endpoints.startAgentUrl, {
      method: "POST",
    });
    return this.handleResponse(response);
  }

  async stopAgent(): Promise<{ status: string; message: string }> {
    const response = await fetch(endpoints.stopAgentUrl, {
      method: "POST",
    });
    return this.handleResponse(response);
  }

  // Helper methods for connection actions with retry and error handling
  private async callConnectionAction(
    connection: string,
    action: string,
    params: Record<string, any> = {},
    retries: number = 3
  ): Promise<any> {
    let attempts = 0;

    while (attempts < retries) {
      try {
        console.log(`Calling ${connection}.${action} with params:`, params);

        const response = await fetch(endpoints.actionUrl, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            connection,
            action,
            params,
          }),
        });

        // Try to log the response for debugging
        let responseData;
        try {
          responseData = await response.json();
          console.log(`Response from ${connection}.${action}:`, responseData);
        } catch (parseError) {
          console.warn(
            `Response is not JSON: ${(await response.text()).slice(0, 100)}...`
          );
          responseData = { raw_response: await response.text() };
        }

        if (!response.ok) {
          let errorMessage =
            responseData?.detail ||
            `API request failed: ${response.status} ${response.statusText}`;

          // Check if the error is due to no agent being loaded
          if (
            response.status === 400 &&
            (errorMessage.includes("No agent loaded") ||
              responseData?.detail?.includes("No agent loaded"))
          ) {
            console.log("No agent loaded. Attempting to initialize...");
            this.initialized = false;
            if (await this.initialize()) {
              console.log("Successfully initialized. Retrying request...");
              attempts++;
              continue;
            }
          }

          throw new Error(errorMessage);
        }

        return responseData.result || responseData;
      } catch (error) {
        attempts++;
        console.error(
          `Error calling ${connection}.${action} (Attempt ${attempts}/${retries}):`,
          error
        );

        if (attempts < retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempts);
          console.log(`Retrying in ${delay} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        } else {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }
    }

    // This should not be reached due to the return in the last catch block
    return {
      success: false,
      error: `Failed after ${retries} attempts`,
    };
  }

  private async perform_registered_action(
    action: string,
    params: Record<string, any> = {},
    retries: number = 3
  ): Promise<any> {
    // Ensure we're initialized before making the request
    if (!this.initialized && !(await this.initialize())) {
      throw new Error("Failed to initialize client");
    }

    let attempts = 0;

    while (attempts < retries) {
      try {
        console.log(`Calling registered action ${action} with params:`, params);

        const response = await fetch(endpoints.registeredActionUrl, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            connection: "registered",
            action,
            params,
          }),
        });

        // Try to log the response for debugging
        let responseData;
        try {
          responseData = await response.json();
          console.log(`Response from registered.${action}:`, responseData);
        } catch (parseError) {
          console.warn(
            `Response is not JSON: ${(await response.text()).slice(0, 100)}...`
          );
          responseData = { raw_response: await response.text() };
        }

        if (!response.ok) {
          let errorMessage =
            responseData?.detail ||
            `API request failed: ${response.status} ${response.statusText}`;

          // Check if the error is due to no agent being loaded
          if (
            response.status === 400 &&
            (errorMessage.includes("No agent loaded") ||
              responseData?.detail?.includes("No agent loaded"))
          ) {
            console.log("No agent loaded. Attempting to initialize...");
            this.initialized = false;
            if (await this.initialize()) {
              console.log("Successfully initialized. Retrying request...");
              attempts++;
              continue;
            }
          }

          throw new Error(errorMessage);
        }

        return responseData.result || responseData;
      } catch (error) {
        attempts++;
        console.error(
          `Error calling registered action ${action} (Attempt ${attempts}/${retries}):`,
          error
        );

        if (attempts < retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempts);
          console.log(`Retrying in ${delay} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        } else {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }
    }

    // This should not be reached due to the return in the last catch block
    return {
      success: false,
      error: `Failed after ${retries} attempts`,
    };
  }

  // Utility methods
  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

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

  // Normalization method to ensure consistent response format
  private normalizeResult(result: any): any {
    // If result is already normalized, return as is
    if (result && result.success !== undefined) {
      return result;
    }

    // Handle different response formats
    if (result && result.status === "completed") {
      return {
        success: true,
        ...result.result,
      };
    }

    // Default to a successful response with the original result
    return {
      success: true,
      ...result,
    };
  }

  // Mock method for transaction history
  private async getTransactionHistoryMock(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    status: string;
    transactions: Transaction[];
    total: number;
  }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create mock transactions
    const mockTransactions: Transaction[] = Array(20)
      .fill(null)
      .map((_, index) => ({
        id: `tx-${index + 1}`,
        transaction_hash: `0x${(index + 1).toString(16).padStart(64, "0")}`,
        transaction_url: `https://explorer.sonic.dev/tx/0x${(index + 1)
          .toString(16)
          .padStart(64, "0")}`,
        timestamp: new Date(Date.now() - index * 3600000).toISOString(),
        type:
          index % 3 === 0
            ? "Batch Creation"
            : index % 3 === 1
            ? "Temperature Update"
            : "Status Change",
        success: index % 5 !== 0, // Make every 5th transaction a failure
        gas_used: 75000 + Math.floor(Math.random() * 50000),
        execution_time: 1 + Math.random() * 3,
        ...(index % 5 === 0
          ? { error: "Transaction reverted: gas limit exceeded" }
          : {}),
      }));

    // Calculate total for pagination
    const total = mockTransactions.length;

    // Calculate start and end indices for the requested page
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    // Return mock response
    return {
      status: "success",
      transactions: mockTransactions.slice(startIndex, endIndex),
      total: total,
    };
  }

  // Utility method to get temperature history for a batch
  async getTemperatureHistory(batchId: string): Promise<TemperatureReading[]> {
    try {
      const batchReport = await this.getBatchReport(batchId);

      // Try different paths to find temperature history
      let temperatureHistory: any[] = [];
      if (batchReport?.report?.temperature_history) {
        temperatureHistory = batchReport.report.temperature_history;
      } else if (batchReport?.temperature_stats?.readings) {
        temperatureHistory = batchReport.temperature_stats.readings;
      } else if (batchReport?.report?.temperature_stats?.readings) {
        temperatureHistory = batchReport.report.temperature_stats.readings;
      }

      // Transform to TemperatureReading format
      return temperatureHistory.map((reading) => {
        // Handle different input formats
        if (Array.isArray(reading)) {
          // [timestamp, temperature, location, isBreached]
          return {
            batchId: batchId,
            temperature: reading[1] / 10.0, // Assuming temperature is stored as integer * 10
            timestamp: new Date(reading[0] * 1000).toISOString(), // Convert timestamp
            location: reading[2] || "Unknown",
            isBreached: reading[3] || false,
          };
        } else if (typeof reading === "object") {
          // Handle object format
          return {
            batchId: batchId,
            temperature: reading.temperature || reading.temp || 0,
            timestamp: reading.timestamp || new Date().toISOString(),
            location: reading.location || "Unknown",
            isBreached: reading.isBreached || false,
          };
        }

        // Fallback for unexpected format
        return {
          batchId: batchId,
          temperature: 0,
          timestamp: new Date().toISOString(),
          location: "Unknown",
          isBreached: false,
        };
      });
    } catch (error) {
      console.error(
        `Failed to get temperature history for batch ${batchId}:`,
        error
      );
      return []; // Return empty array on error
    }
  }

  // Utility method to get quality assessment for a batch
  async getQualityAssessment(batchId: string): Promise<QualityAssessment> {
    try {
      const qualityResult = await this.manageBerryQuality(batchId);

      // Transform to QualityAssessment interface
      return {
        batchId: batchId,
        qualityScore: qualityResult.quality_score || 0,
        shelfLifePrediction: `${qualityResult.shelf_life_hours || 0} hours`,
        recommendations: qualityResult.recommended_action
          ? [qualityResult.recommended_action]
          : [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `Failed to get quality assessment for batch ${batchId}:`,
        error
      );
      return {
        batchId: batchId,
        qualityScore: 0,
        shelfLifePrediction: "Unknown",
        recommendations: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // Utility method to get all batches
  async getAllBatches(): Promise<Batch[]> {
    try {
      const result = await this.callConnectionAction(
        this.connectionName,
        "manage-batch-lifecycle",
        {
          action: "list",
        }
      );

      // Transform batches to Batch interface
      return (result || []).map((batch: any) => ({
        id: batch.batchId?.toString() || "",
        name: `${batch.berryType || "Unknown"} Batch`,
        createdAt: batch.startTime
          ? new Date(batch.startTime * 1000).toISOString()
          : new Date().toISOString(),
        status: this.mapBatchStatus(batch.status),
        currentTemperature: batch.currentTemperature,
        optimalTempMin: 0, // Default value, adjust as needed
        optimalTempMax: 4, // Default value, adjust as needed
        qualityScore: batch.qualityScore,
        shelfLifePrediction: batch.predictedShelfLife
          ? `${Math.round(batch.predictedShelfLife / 3600)} hours`
          : "Unknown",
        berryType: batch.berryType,
      }));
    } catch (error) {
      console.error("Failed to get all batches:", error);
      return [];
    }
  }

  // Helper method to map batch status
  private mapBatchStatus(status: number): string {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "In Transit";
      case 2:
        return "Completed";
      case 3:
        return "Delayed";
      case 4:
        return "Cancelled";
      default:
        return "Unknown";
    }
  }
}

export default BerrySupplyChainClient;
