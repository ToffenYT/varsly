import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { digestEmailHtml } from "../_shared/emailHtml.ts";
import { signUnsubscribeToken } from "../_shared/jwt.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const PUBLIC_APP_URL = Deno.env.get("PUBLIC_APP_URL") ?? "https://anbudsvarsler.no";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "varsler@resend.dev";
const UNSUBSCRIBE_JWT_SECRET = Deno.env.get("UNSUBSCRIBE_JWT_SECRET") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ ok: false, reason: "RESEND_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, last_notified_at")
      .eq("email_notifications", true)
      .eq("notification_frequency", "daily_digest");

    if (profileError || !profiles?.length) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, reason: "No daily_digest users" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    const since = new Date();
    since.setDate(since.getDate() - 1);
    const sinceIso = since.toISOString();

    for (const profile of profiles) {
      const email = profile.email;
      if (!email) continue;

      const { data: alerts, error: alertsError } = await supabase
        .from("alerts")
        .select("id, tender_title, tender_organization, tender_deadline, tender_url, matched_keyword")
        .eq("user_id", profile.id)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false });

      if (alertsError || !alerts?.length) continue;

      const unsubscribeToken = UNSUBSCRIBE_JWT_SECRET
        ? await signUnsubscribeToken(profile.id, UNSUBSCRIBE_JWT_SECRET)
        : "";
      const unsubscribeUrl = unsubscribeToken
        ? `${PUBLIC_APP_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
        : `${PUBLIC_APP_URL}/settings`;
      const settingsUrl = `${PUBLIC_APP_URL}/settings`;

      const items = alerts.map((a) => ({
        keyword: a.matched_keyword,
        tenderTitle: a.tender_title,
        organization: a.tender_organization,
        deadline: a.tender_deadline ?? "Ikke oppgitt",
        tenderUrl: a.tender_url ?? "#",
      }));

      const html = digestEmailHtml({
        items,
        unsubscribeUrl,
        settingsUrl,
      });

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: `Dagens oppsummering – ${alerts.length} nye anbud`,
          html,
        }),
      });

      if (!res.ok) continue;

      await supabase
        .from("profiles")
        .update({
          last_notified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      sent++;
    }

    return new Response(
      JSON.stringify({ ok: true, sent, usersChecked: profiles.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
