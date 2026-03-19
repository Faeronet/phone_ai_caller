import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend";

export async function GET() {
  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/api/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}

