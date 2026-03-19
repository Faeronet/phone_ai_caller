import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cookie = req.headers.get("cookie");

  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/api/admin/products/${params.id}`, {
    method: "DELETE",
    headers: { ...(cookie ? { cookie } : {}) }
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}

