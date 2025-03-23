"use client";

import {
  useConnect,
  useAccount,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  Wallet,
  ExternalLink,
  Copy,
  Power,
  User,
  AlertTriangle,
} from "lucide-react";

// Define EduChain Testnet constants
const EDUCHAIN_CHAIN_ID = 656476;

const CHAIN_NAMES: { [key: number]: string } = {
  656476: "EduChain Testnet",
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
};

// Function to add EduChain Testnet to MetaMask
const addEduChainTestnet = async () => {
  if (!window.ethereum) {
    console.error("MetaMask not detected");
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${EDUCHAIN_CHAIN_ID.toString(16)}`, // Convert to hex
          chainName: "EduChain Testnet",
          nativeCurrency: {
            name: "EduChain",
            symbol: "EDU",
            decimals: 18,
          },
          rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
          blockExplorerUrls: ["https://edu-chain-testnet.blockscout.com"],
        },
      ],
    });
    console.log("EduChain Testnet added to MetaMask!");
    return true;
  } catch (error) {
    console.error("Failed to add EduChain Testnet:", error);
    return false;
  }
};

// Function to switch to EduChain Testnet
const switchToEduChainTestnet = async () => {
  if (!window.ethereum) {
    console.error("MetaMask not detected");
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${EDUCHAIN_CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      return addEduChainTestnet();
    }
    console.error("Failed to switch to EduChain Testnet:", error);
    return false;
  }
};

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({
    address: address as `0x${string}`,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsCorrectNetwork(chainId === EDUCHAIN_CHAIN_ID);
  }, [chainId]);

  const handleConnect = async () => {
    try {
      // First, try to add the network
      await addEduChainTestnet();

      // Then connect
      connect({
        connector: injected(),
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: EDUCHAIN_CHAIN_ID });
      } else {
        await switchToEduChainTestnet();
      }
      setIsCorrectNetwork(true);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // You could add a toast notification here
    }
  };

  const openExplorer = () => {
    if (address) {
      window.open(
        `https://edu-chain-testnet.blockscout.com/address/${address}`,
        "_blank"
      );
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
      >
        <Wallet className="w-5 h-5" />
        <span className="font-semibold">Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all relative"
      >
        <User className="w-5 h-5 text-gray-600" />
        {!isCorrectNetwork ? (
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-yellow-500 border-2 border-white" />
        ) : (
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
          <div className="p-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Connected with MetaMask
              </span>
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
              >
                <Power className="w-4 h-4" />
                Disconnect
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {address ? formatAddress(address) : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    {balance?.formatted
                      ? `${parseFloat(balance.formatted).toFixed(4)} ${
                          balance.symbol
                        }`
                      : "Loading..."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyAddress}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg flex-1"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>
              <button
                onClick={openExplorer}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg flex-1"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Network</span>
                {isCorrectNetwork ? (
                  <span className="font-medium">
                    {CHAIN_NAMES[chainId] || `Chain ${chainId}`}
                  </span>
                ) : (
                  <button
                    onClick={handleSwitchNetwork}
                    className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Switch to EduChain Testnet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
