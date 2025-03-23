import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// Define EduChain Testnet chain
export const educhaTestnet = {
  id: 656476,
  name: "EduChain Testnet",
  network: "educhain-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "EduChain",
    symbol: "EDU",
  },
  rpcUrls: {
    public: { http: ["https://rpc.open-campus-codex.gelato.digital"] },
    default: { http: ["https://rpc.open-campus-codex.gelato.digital"] },
  },
  blockExplorers: {
    default: {
      name: "EduChain Explorer",
      url: "https://edu-chain-testnet.blockscout.com",
    },
  },
} as const;

// Create Wagmi config
export const config = createConfig({
  chains: [mainnet, sepolia, educhaTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [educhaTestnet.id]: http(),
  },
});

// Helper function to add EduChain Testnet to MetaMask
export const addEduChainTestnet = async () => {
  if (!window.ethereum) {
    console.error("MetaMask not detected");
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${educhaTestnet.id.toString(16)}`, // Chain ID must be in hex format
          chainName: educhaTestnet.name,
          nativeCurrency: educhaTestnet.nativeCurrency,
          rpcUrls: [educhaTestnet.rpcUrls.default.http[0]],
          blockExplorerUrls: [educhaTestnet.blockExplorers.default.url],
        },
      ],
    });
    return true;
  } catch (error) {
    console.error("Failed to add EduChain Testnet:", error);
    return false;
  }
};

// Helper function to switch to EduChain Testnet
export const switchToEduChainTestnet = async () => {
  if (!window.ethereum) {
    console.error("MetaMask not detected");
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${educhaTestnet.id.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      return addEduChainTestnet();
    }
    console.error("Failed to switch to EduChain Testnet:", error);
    return false;
  }
};
