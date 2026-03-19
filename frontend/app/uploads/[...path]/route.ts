import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  const relPath = (params.path ?? []).join("/");
  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/uploads/${relPath}`, {
    method: "GET"
  });

  const contentType = backendRes.headers.get("content-type");
  const headers = new Headers();
  if (contentType) headers.set("content-type", contentType);

  // Stream file to client (browser).
  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers
  });
}

