import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie");
  const body = await req.json().catch(() => ({}));

  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {})
    },
    body: JSON.stringify(body)
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}

