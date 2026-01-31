const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function signUnsubscribeToken(userId: string, secret: string): Promise<string> {
  const payload = JSON.stringify({
    sub: userId,
    purpose: "unsubscribe",
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  });
  const payloadB64 = base64UrlEncode(encoder.encode(payload));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );
  const sigB64 = base64UrlEncode(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

export async function verifyUnsubscribeToken(
  token: string,
  secret: string
): Promise<{ userId: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sig = base64UrlDecode(sigB64);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sig,
    encoder.encode(payloadB64)
  );
  if (!valid) return null;
  try {
    const json = decoder.decode(base64UrlDecode(payloadB64));
    const data = JSON.parse(json);
    if (data.purpose !== "unsubscribe" || !data.sub) return null;
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: data.sub };
  } catch {
    return null;
  }
}
