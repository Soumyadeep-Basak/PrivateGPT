"use client";

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react"; // For loading icon

const ConnectMetaMask: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  let web3: Web3 | null = null;
  if (typeof window !== "undefined" && (window as any).ethereum) {
    web3 = new Web3((window as any).ethereum);
  }

  // Function to connect MetaMask
  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!web3) {
        throw new Error("MetaMask is not installed.");
      }
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || "Error connecting to MetaMask.");
      console.error(err);
    }
    setLoading(false);
  };

  // Function to disconnect MetaMask (not fully supported but clears state)
  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
  };

  // Check if MetaMask is connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (web3) {
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (err) {
          console.error("Error checking MetaMask connection:", err);
        }
      }
    };
    checkWalletConnection();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Connect Your Ethereum Wallet</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {isConnected ? (
          <div className="space-y-4">
            <Alert className="bg-green-100 border-green-500">
              <AlertTitle>Connected!</AlertTitle>
              <AlertDescription>Wallet Address: {walletAddress}</AlertDescription>
            </Alert>
            <Button variant="destructive" onClick={disconnectWallet} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button onClick={connectWallet} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Connect MetaMask"}
            </Button>
            {error && (
              <Alert className="bg-red-100 border-red-500">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectMetaMask;
