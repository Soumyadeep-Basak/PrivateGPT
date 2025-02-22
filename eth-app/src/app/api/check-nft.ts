import { NextRequest, NextResponse } from "next/server";
import { AptosClient } from "aptos";
import dotenv from "dotenv";

dotenv.config();
const client = new AptosClient(process.env.APTOS_RPC || "https://fullnode.mainnet.aptoslabs.com/v1");

export async function POST(req: NextRequest) {
  const { address, contractAddress } = await req.json();
  if (!address || !contractAddress) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  try {
    const accountResources = await client.getAccountResources(address);
    const nftResource = accountResources.find((r) => r.type.includes(contractAddress));

    return NextResponse.json({ ownsNFT: !!nftResource });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to check NFT" }, { status: 500 });
  }
}
