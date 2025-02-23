import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Wallet } from "lucide-react";

const WalletConnect: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  let web3: Web3 | null = null;
  if (typeof window !== "undefined" && (window as any).ethereum) {
    web3 = new Web3((window as any).ethereum);
  }

  const connectWallet = async () => {
    setError(null);
    try {
      if (!web3) throw new Error("MetaMask is not installed.");
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
    } catch (err: any) {
      setError(err.message || "Error connecting to MetaMask.");
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) setWalletAddress(accounts[0]);
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        onClick={connectWallet}
        className={`px-4 py-2 rounded-md text-white ${walletAddress ? "bg-green-600" : "bg-blue-600"}`}
      >
        <Wallet className="w-5 h-5 mr-2 inline" />
        {walletAddress ? "Connected" : "Connect Wallet"}
      </button>
      {walletAddress && <div className="text-sm text-gray-500">{walletAddress}</div>}
    </div>
  );
};

export default WalletConnect;
