import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TransactionStatus from "./TranscationStatus";

// Define Transaction interface
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

interface TransactionHistoryProps {
  client: any; // Your API client
  onError?: (error: string) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  client,
  onError,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 10;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Call your API client method to fetch transactions
      const response = await client.getTransactionHistory(page, pageSize);

      if (response.status === "success" && response.transactions) {
        setTransactions(response.transactions);
        setTotalPages(Math.ceil(response.total / pageSize) || 1);
      } else {
        throw new Error(
          response.error || "Failed to fetch transaction history"
        );
      }
    } catch (err: any) {
      console.error("Error fetching transaction history:", err);
      if (onError)
        onError(
          err.message || "An error occurred while fetching transaction history"
        );
      // Set empty transactions but don't break the UI
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetails = () => {
    setSelectedTransaction(null);
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <div className="text-sm">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          disabled={page === totalPages || loading}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button size="sm" onClick={fetchTransactions} disabled={loading}>
            {loading ? <span className="animate-spin mr-1">⟳</span> : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          {selectedTransaction ? (
            <div className="space-y-4">
              <Button variant="outline" size="sm" onClick={handleCloseDetails}>
                Back to list
              </Button>
              <TransactionStatus transaction={selectedTransaction} />
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No transaction history available
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {formatDate(transaction.timestamp)}
                        </TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.success
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {transaction.success ? "Success" : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(transaction)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
