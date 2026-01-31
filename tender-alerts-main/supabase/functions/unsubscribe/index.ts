import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { verifyUnsubscribeToken } from "../_shared/jwt.ts";

const UNSUBSCRIBE_JWT_SECRET = Deno.env.get("UNSUBSCRIBE_JWT_SECRET") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let token: string | null = null;
    if (req.method === "POST") {
      const body = (await req.json()) as { token?: string };
      token = body.token ?? null;
    } else {
      const url = new URL(req.url);
      token = url.searchParams.get("token");
    }

    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!UNSUBSCRIBE_JWT_SECRET) {
      return new Response(
        JSON.stringify({ ok: false, error: "Server misconfigured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload = await verifyUnsubscribeToken(token, UNSUBSCRIBE_JWT_SECRET);
    if (!payload) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid or expired token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({
        email_notifications: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.userId);

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Du er nå meldt av varsling." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
