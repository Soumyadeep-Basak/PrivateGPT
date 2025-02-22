import { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";

const contractABI = [
  "function storeCID(string memory cid) external"
];

const contractAddress = "0xYourContractAddressHere"; // Replace with your deployed contract address
const provider = process.env.ALCHEMY_API_URL || "https://ethereum-sepolia-rpc.publicnode.com"; // Use Alchemy or Infura

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { walletAddress, cid } = req.body;

  if (!walletAddress || !cid) {
    return res.status(400).json({ error: "Missing walletAddress or cid" });
  }

  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(provider));
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    // Send transaction (User must sign via MetaMask)
    const tx = await contract.methods.storeCID(cid).send({ from: walletAddress });

    return res.status(200).json({ message: "CID stored successfully", transaction: tx });
  } catch (error: any) {
    console.error("Error storing CID:", error);
    return res.status(500).json({ error: error.message || "Failed to store CID" });
  }
}
