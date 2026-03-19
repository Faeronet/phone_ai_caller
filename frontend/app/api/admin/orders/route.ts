import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");

  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/api/admin/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {})
    }
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}

