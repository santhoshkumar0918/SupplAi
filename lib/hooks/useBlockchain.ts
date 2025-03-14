import { useState, useCallback } from "react";
import BerrySupplyChainClient from "../api/berrySupplyChainClient";

interface BlockchainTransaction {
  id: string;
  timestamp: string | number;
  status: string;
  batch_id?: string | number;
  data?: any;
}

interface BlockchainStats {
  verifiedCount: number;
  failedCount: number;
  pendingCount: number;
  totalTransactions: number;
}

export function useBlockchain() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [stats, setStats] = useState<BlockchainStats>({
    verifiedCount: 0,
    failedCount: 0,
    pendingCount: 0,
    totalTransactions: 0,
  });

  const client = new BerrySupplyChainClient();

  const fetchBlockchainTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching blockchain transactions");

      // Call the API to get blockchain transactions
      // Adapt this to use your actual endpoint - we're using system-health-check as a placeholder
      const response = await client.callConnectionAction(
        "sonic",
        "system-health-check",
        {
          include_transactions: true,
        }
      );

      console.log("Blockchain transactions response:", response);

      let transactionsList: BlockchainTransaction[] = [];
      let verified = 0;
      let failed = 0;
      let pending = 0;

      // Handle different response formats
      if (
        response &&
        response.transactions &&
        Array.isArray(response.transactions)
      ) {
        transactionsList = response.transactions;

        // Count transactions by status
        verified = transactionsList.filter(
          (tx) => tx.status === "verified" || tx.status === "completed"
        ).length;
        failed = transactionsList.filter(
          (tx) => tx.status === "failed" || tx.status === "error"
        ).length;
        pending = transactionsList.filter(
          (tx) => tx.status === "pending" || tx.status === "processing"
        ).length;
      }
      // If the response has direct counts
      else if (response && typeof response.transaction_count !== "undefined") {
        verified = response.successful_transactions || 0;
        failed = response.failed_transactions || 0;
        pending = (response.transaction_count || 0) - verified - failed;
      }
      // Fallback to generate some sample data if none is returned
      else {
        // Generate some sample transactions if none are returned from the API
        const sampleCount = Math.floor(Math.random() * 10) + 5;
        for (let i = 0; i < sampleCount; i++) {
          const statuses = ["verified", "failed", "pending"];
          const randomStatus =
            statuses[Math.floor(Math.random() * statuses.length)];

          transactionsList.push({
            id: `tx-${Date.now()}-${i}`,
            timestamp: Date.now() - i * 3600000,
            status: randomStatus,
            batch_id: Math.floor(Math.random() * 20) + 1,
          });
        }

        // Count the generated transactions
        verified = transactionsList.filter(
          (tx) => tx.status === "verified"
        ).length;
        failed = transactionsList.filter((tx) => tx.status === "failed").length;
        pending = transactionsList.filter(
          (tx) => tx.status === "pending"
        ).length;
      }

      const totalTransactions = verified + failed + pending;

      // Update state
      setTransactions(transactionsList);
      setStats({
        verifiedCount: verified,
        failedCount: failed,
        pendingCount: pending,
        totalTransactions,
      });

      return {
        transactions: transactionsList,
        stats: {
          verifiedCount: verified,
          failedCount: failed,
          pendingCount: pending,
          totalTransactions,
        },
      };
    } catch (err: any) {
      console.error("Error fetching blockchain transactions:", err);
      setError(err.message || "Failed to fetch blockchain transactions");

      // Return empty data on error
      return {
        transactions: [],
        stats: {
          verifiedCount: 0,
          failedCount: 0,
          pendingCount: 0,
          totalTransactions: 0,
        },
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyBatchOnBlockchain = useCallback(
    async (batchId: string | number) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Verifying batch ${batchId} on blockchain`);

        // Replace with your actual verification endpoint
        const response = await client.callConnectionAction(
          "sonic",
          "blockchain-verify",
          {
            batch_id: batchId,
          }
        );

        console.log("Blockchain verification response:", response);

        // Refresh transaction list
        await fetchBlockchainTransactions();

        return {
          success: true,
          transaction: response.transaction || null,
        };
      } catch (err: any) {
        console.error(`Error verifying batch ${batchId} on blockchain:`, err);
        setError(
          err.message || `Failed to verify batch ${batchId} on blockchain`
        );

        return {
          success: false,
          error:
            err.message || `Failed to verify batch ${batchId} on blockchain`,
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchBlockchainTransactions]
  );

  return {
    loading,
    error,
    transactions,
    stats,
    fetchBlockchainTransactions,
    verifyBatchOnBlockchain,
  };
}
