import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { address } = await req.json();
  if (!address) return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });

  try {
    const result = await pool.query(
      "INSERT INTO wallets (address) VALUES ($1) ON CONFLICT (address) DO UPDATE SET address = EXCLUDED.address RETURNING id",
      [address]
    );

    return NextResponse.json({ uid: result.rows[0].id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
