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

// Define a proper return type for system health
interface SystemHealthResponse {
  status?: string;
  success?: boolean;
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
  result?: any;
  error?: string;
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

  /**
   * Get headers for API requests
   */
  getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    return headers;
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
        headers: this.getHeaders(),
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

  // Call registered action method
  async perform_registered_action(
    action: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    try {
      console.log(`Calling registered action ${action} with params:`, params);

      const response = await fetch(endpoints.registeredActionUrl, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          connection: "registered", // This value doesn't matter for registered actions
          action,
          params,
        }),
      });

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

      const responseData = await response.json();

      // Handle different response formats
      if (responseData.result) {
        return responseData.result;
      }

      return responseData;
    } catch (error) {
      console.error(`Error calling registered action ${action}:`, error);
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

  async getSystemHealth(
    resetCounters: boolean = false
  ): Promise<SystemHealthResponse> {
    try {
      console.log("Calling sonic.system-health-check with params:", {
        reset_counters: resetCounters,
      });

      const response = await this.callConnectionAction(
        "sonic",
        "system-health-check",
        {
          reset_counters: resetCounters,
        }
      );

      // Log the raw response for debugging
      console.log("Raw system health check response:", response);

      // Check if we already have the expected format
      if (response.success && response.health_report) {
        // Already in the expected format, return as is
        return response;
      }

      // Otherwise, try to normalize the response
      const normalizedResponse: SystemHealthResponse = {
        success: true,
      };

      // Check if response comes with a nested health_report
      if (response.health_report) {
        normalizedResponse.health_report = response.health_report;
        return normalizedResponse;
      }

      // Check if response comes from the Python backend (different format)
      if (response.status === "completed" && response.result?.health_report) {
        normalizedResponse.health_report = response.result.health_report;
        return normalizedResponse;
      }

      // Check if the response itself is the health report
      if (
        response.timestamp &&
        (response.is_connected !== undefined ||
          response.transaction_count !== undefined)
      ) {
        normalizedResponse.health_report = {
          timestamp: response.timestamp,
          connection: {
            is_connected: response.is_connected,
            account: response.account_balance ? "Connected Account" : undefined,
            balance: parseFloat(response.account_balance) || 0,
          },
          transactions: {
            sent: response.transaction_count || 0,
            successful: response.successful_transactions || 0,
            failed: response.failed_transactions || 0,
            success_rate: response.transaction_success_rate || "0%",
          },
        };
        return normalizedResponse;
      }

      // Handle the error case
      if (response.error || response.status === "failed") {
        return {
          success: false,
          error: response.error || "Unknown error during health check",
        };
      }

      // If we reach here, we couldn't normalize the response
      console.warn("Could not normalize health check response:", response);

      // Return the raw response as the health_report as a last resort
      normalizedResponse.health_report = {
        timestamp: new Date().toISOString(),
        connection: {
          is_connected: false,
          network: "unknown",
          account: undefined,
          balance: 0,
        },
        transactions: {
          sent: 0,
          successful: 0,
          failed: 0,
          success_rate: "0%",
          total_gas_used: 0,
          avg_gas_used: 0,
          total_cost: "0.000000 Sonic Tokens",
        },
        counters_reset: resetCounters,
      };

      return normalizedResponse;
    } catch (error) {
      console.error("Error in getSystemHealth:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
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

  /**
   * Fetch transaction history with pagination
   * @param {number} page - The page number to fetch (starting from 1)
   * @param {number} pageSize - Number of transactions per page
   * @returns {Promise<{status: string, transactions?: Transaction[], total?: number, error?: string}>}
   */
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
      // Use the registered action instead of connection action
      const result = await this.perform_registered_action(
        "get-transaction-history",
        {
          page,
          limit: pageSize,
        }
      );

      console.log("Transaction history result:", result);

      // If backend implementation is not ready, fall back to mock data
      if (result.error || !result.transactions) {
        console.warn("Transaction history API returned error, using mock data");
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
      console.warn("Falling back to mock transaction data");
      return await this.getTransactionHistoryMock(page, pageSize);
    }
  }

  /**
   * Mock implementation for transaction history
   * @param {number} page - The page number to fetch (starting from 1)
   * @param {number} pageSize - Number of transactions per page
   * @returns {Promise<{status: string, transactions: Transaction[], total: number}>}
   */
  async getTransactionHistoryMock(
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
        transaction_url: `https://etherscan.io/tx/0x${(index + 1)
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

  /**
   * Get a single transaction by hash
   * @param {string} txHash - Transaction hash
   * @returns {Promise<{status: string, transaction?: Transaction, error?: string}>}
   */
  async getTransaction(txHash: string): Promise<{
    status: string;
    transaction?: Transaction;
    error?: string;
  }> {
    try {
      // Use the registered action instead of connection action
      const result = await this.perform_registered_action(
        "get-transaction-details",
        {
          transaction_hash: txHash,
        }
      );

      // If backend implementation is not ready, fall back to mock
      if (result.error || !result.transaction) {
        // Find the transaction in mock data
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
}

export default BerrySupplyChainClient;
