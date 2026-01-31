import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { alertEmailHtml } from "../_shared/emailHtml.ts";
import { signUnsubscribeToken } from "../_shared/jwt.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const PUBLIC_APP_URL = Deno.env.get("PUBLIC_APP_URL") ?? "https://anbudsvarsler.no";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "varsler@resend.dev";
const UNSUBSCRIBE_SECRET = Deno.env.get("UNSUBSCRIBE_JWT_SECRET") ?? "";

interface AlertRecord {
  id: string;
  user_id: string;
  tender_title: string;
  tender_organization: string;
  tender_location: string | null;
  tender_deadline: string | null;
  tender_url: string | null;
  tender_category: string | null;
  matched_keyword: string;
  created_at: string;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: AlertRecord;
  old_record: unknown;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as WebhookPayload;
    if (body.type !== "INSERT" || body.table !== "alerts" || !body.record) {
      return new Response(JSON.stringify({ ok: false, reason: "Invalid webhook payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const record = body.record as AlertRecord;
    const supabase = getSupabaseAdmin();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, email_notifications, notification_frequency")
      .eq("id", record.user_id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ ok: false, reason: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!profile.email_notifications || profile.notification_frequency !== "instant") {
      return new Response(JSON.stringify({ ok: true, skipped: "user prefers daily_digest or disabled" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const toEmail = profile.email;
    if (!toEmail) {
      return new Response(JSON.stringify({ ok: false, reason: "No email on profile" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, reason: "RESEND_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const unsubscribeToken = UNSUBSCRIBE_SECRET
      ? await signUnsubscribeToken(record.user_id, UNSUBSCRIBE_SECRET)
      : "";
    const unsubscribeUrl = unsubscribeToken
      ? `${PUBLIC_APP_URL}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
      : `${PUBLIC_APP_URL}/settings`;
    const settingsUrl = `${PUBLIC_APP_URL}/settings`;
    const tenderUrl = record.tender_url ?? "#";
    const deadline = record.tender_deadline ?? "Ikke oppgitt";

    const html = alertEmailHtml({
      keyword: record.matched_keyword,
      tenderTitle: record.tender_title,
      organization: record.tender_organization,
      deadline,
      tenderUrl,
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
        to: [toEmail],
        subject: `Nytt anbud funnet for søkeordet: ${record.matched_keyword}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ ok: false, resend_error: errText }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("profiles")
      .update({
        last_notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.user_id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
