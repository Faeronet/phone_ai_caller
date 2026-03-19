import * as crypto from "crypto";

export const ADMIN_COOKIE_NAME = "phone_ai_caller_admin";

const ALGO = "sha256";

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, "base64");
}

export function createAdminToken() {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) throw new Error("ADMIN_SECRET_KEY is not set");

  const nonce = crypto.randomBytes(24);
  const nonceB64 = base64UrlEncode(nonce);
  const sig = crypto.createHmac(ALGO, secret).update(nonceB64).digest("hex");
  return `${nonceB64}.${sig}`;
}

export function verifyAdminToken(token: string) {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) return false;
  const [nonceB64, sig] = token.split(".");
  if (!nonceB64 || !sig) return false;

  const expectedSig = crypto.createHmac(ALGO, secret).update(nonceB64).digest("hex");
  if (sig.length !== expectedSig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig));
}

export function formatAdminCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  };
}

