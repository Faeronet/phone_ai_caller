import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend";

export async function GET() {
  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/api/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  const data = await backendRes.json().catch(() => ({}));
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "";
  if (baseUrl && Array.isArray(data?.products)) {
    data.products = data.products.map((p: any) => {
      if (typeof p?.imageUrl === "string" && p.imageUrl.startsWith("/uploads/")) {
        return { ...p, imageUrl: `${baseUrl}${p.imageUrl}` };
      }
      return p;
    });
  }

  return NextResponse.json(data, { status: backendRes.status });
}

