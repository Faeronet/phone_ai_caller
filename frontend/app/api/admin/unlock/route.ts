import { BACKEND_API_BASE_URL } from "@/lib/backend";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const backendRes = await fetch(`${BACKEND_API_BASE_URL}/api/admin/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await backendRes.text();
  return new Response(text, {
    status: backendRes.status,
    headers: backendRes.headers
  });
}

