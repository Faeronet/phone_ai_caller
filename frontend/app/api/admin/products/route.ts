import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend";

function rewriteImageUrls(data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "";
  if (!baseUrl || !Array.isArray(data?.products)) return data;
  return {
    ...data,
    products: data.products.map((p: any) => {
      if (typeof p?.imageUrl === "string" && p.imageUrl.startsWith("/uploads/")) {
        return { ...p, imageUrl: `${baseUrl}${p.imageUrl}` };
      }
      return p;
    })
  };
}

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");

  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/api/admin/products`, {
    method: "GET",
    headers: { ...(cookie ? { cookie } : {}) }
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(rewriteImageUrls(data), { status: backendRes.status });
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie");
  const form = await req.formData();

  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: { ...(cookie ? { cookie } : {}) },
    body: form
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}

