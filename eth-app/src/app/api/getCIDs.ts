import { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";

const contractABI = [
  "function getCIDs() external view returns (string[] memory)"
];

const contractAddress = "0xYourContractAddressHere"; // Replace with your deployed contract address
const provider = process.env.ALCHEMY_API_URL || "https://ethereum-sepolia-rpc.publicnode.com"; // Use Alchemy or Infura

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ error: "Missing walletAddress" });
  }

  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(provider));
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    // Fetch stored CIDs
    const cids = await contract.methods.getCIDs().call({ from: walletAddress });

    return res.status(200).json({ cids });
  } catch (error: any) {
    console.error("Error fetching CIDs:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch CIDs" });
  }
}
