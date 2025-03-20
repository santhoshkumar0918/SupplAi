// import React, { useState, useEffect } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableHead,
//   TableCell,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import TransactionStatus from "./TranscationStatus";

// // Define Transaction interface
// interface Transaction {
//   id: string;
//   transaction_hash: string;
//   transaction_url?: string;
//   timestamp: string;
//   type: string;
//   success: boolean;
//   gas_used?: number;
//   execution_time?: number;
//   error?: string;
// }

// interface TransactionHistoryProps {
//   client: any; // Your API client
//   onError?: (error: string) => void;
// }

// const TransactionHistory: React.FC<TransactionHistoryProps> = ({
//   client,
//   onError,
// }) => {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [selectedTransaction, setSelectedTransaction] =
//     useState<Transaction | null>(null);
//   const [page, setPage] = useState<number>(1);
//   const [totalPages, setTotalPages] = useState<number>(1);
//   const pageSize = 10;

//   const fetchTransactions = async () => {
//     setLoading(true);
//     try {
//       // Call your API client method to fetch transactions
//       const response = await client.getTransactionHistory(page, pageSize);

//       if (response.status === "success" && response.transactions) {
//         setTransactions(response.transactions);
//         setTotalPages(Math.ceil(response.total / pageSize) || 1);
//       } else {
//         throw new Error(
//           response.error || "Failed to fetch transaction history"
//         );
//       }
//     } catch (err: any) {
//       console.error("Error fetching transaction history:", err);
//       if (onError)
//         onError(
//           err.message || "An error occurred while fetching transaction history"
//         );
//       // Set empty transactions but don't break the UI
//       setTransactions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTransactions();
//   }, [page]);

//   const handleViewDetails = (transaction: Transaction) => {
//     setSelectedTransaction(transaction);
//   };

//   const handleCloseDetails = () => {
//     setSelectedTransaction(null);
//   };

//   const formatDate = (timestamp: string) => {
//     try {
//       return new Date(timestamp).toLocaleString();
//     } catch (e) {
//       return timestamp;
//     }
//   };

//   const renderPagination = () => {
//     return (
//       <div className="flex items-center justify-between mt-4">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => setPage((p) => Math.max(1, p - 1))}
//           disabled={page === 1 || loading}
//         >
//           Previous
//         </Button>
//         <div className="text-sm">
//           Page {page} of {totalPages}
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
//           disabled={page === totalPages || loading}
//         >
//           Next
//         </Button>
//       </div>
//     );
//   };

//   return (
//     <div className="mt-8">
//       <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>Recent Transactions</CardTitle>
//           <Button size="sm" onClick={fetchTransactions} disabled={loading}>
//             {loading ? <span className="animate-spin mr-1">⟳</span> : "Refresh"}
//           </Button>
//         </CardHeader>
//         <CardContent>
//           {selectedTransaction ? (
//             <div className="space-y-4">
//               <Button variant="outline" size="sm" onClick={handleCloseDetails}>
//                 Back to list
//               </Button>
//               <TransactionStatus transaction={selectedTransaction} />
//             </div>
//           ) : loading ? (
//             <div className="flex justify-center py-8">
//               <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
//             </div>
//           ) : transactions.length === 0 ? (
//             <div className="text-center py-6 text-gray-500">
//               No transaction history available
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Date</TableHead>
//                       <TableHead>Type</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {transactions.map((transaction) => (
//                       <TableRow key={transaction.id}>
//                         <TableCell>
//                           {formatDate(transaction.timestamp)}
//                         </TableCell>
//                         <TableCell>{transaction.type}</TableCell>
//                         <TableCell>
//                           <Badge
//                             className={
//                               transaction.success
//                                 ? "bg-green-100 text-green-800"
//                                 : "bg-red-100 text-red-800"
//                             }
//                           >
//                             {transaction.success ? "Success" : "Failed"}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleViewDetails(transaction)}
//                           >
//                             View Details
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//               {renderPagination()}
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default TransactionHistory;


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
  client: any;  
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
          className="border-gray-700 text-black hover:bg-gray-700 hover:text-white"
        >
          Previous
        </Button>
        <div className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          disabled={page === totalPages || loading}
          className="border-gray-700 text-black hover:bg-gray-700 hover:text-white"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg text-gray-200">
      <div className="flex items-center mb-4 border-b border-gray-300 pb-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
        <h2 className="text-2xl font-bold text-white">AI Transaction Ledger</h2>
      </div>
      
      <Card className="bg-gray-900 border-none shadow-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gray-900 border-b border-gray-300 pb-4">
          <CardTitle className="text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Recent Transactions
          </CardTitle>
          <Button 
            size="sm" 
            onClick={fetchTransactions} 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? <span className="animate-spin mr-1">⟳</span> : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent className="bg-gray-900 text-gray-300 pt-4">
          {selectedTransaction ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCloseDetails}
                className="border-gray-300 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Back to list
              </Button>
              <TransactionStatus transaction={selectedTransaction} />
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No transaction history available
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-300">
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Type</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id} 
                        className="border-b border-gray-300 hover:bg-gray-700/50"
                      >
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {formatDate(transaction.timestamp)}
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center">
                            {transaction.type.toLowerCase().includes('create') && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                            {transaction.type.toLowerCase().includes('update') && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            )}
                            {transaction.type.toLowerCase().includes('delete') && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            {!['create', 'update', 'delete'].some(type => transaction.type.toLowerCase().includes(type)) && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            )}
                            {transaction.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.success
                                ? "bg-green-500 text-white border border-green-600"
                                : "bg-red-900 text-red-300 border border-red-600"
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
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-600"
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