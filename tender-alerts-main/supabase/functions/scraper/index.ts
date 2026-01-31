import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";

interface TenderInput {
  title: string;
  organization: string;
  location?: string;
  deadline?: string;
  url?: string;
  category?: string;
}

/** DFØ offentlig CSV: https://dfo.no/... kunngjoringer – kolonner kan hete tittel/title, oppdragsgiver/buyer, frist/deadline, url/link, cpv/category */
function parseCSVToTenders(csvText: string, maxRows = 400): TenderInput[] {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const get = (row: string[], ...keys: string[]) => {
    for (const k of keys) {
      const i = headers.indexOf(k.toLowerCase());
      if (i >= 0 && row[i] !== undefined) return row[i].replace(/^"|"$/g, "").trim();
    }
    return "";
  };
  const tenders: TenderInput[] = [];
  for (let i = 1; i < Math.min(lines.length, maxRows + 1); i++) {
    const row = lines[i].split(sep).map((c) => c.replace(/^"|"$/g, "").trim());
    const title = get(row, "tittel", "title", "title_no", "name", "subject");
    const organization = get(row, "oppdragsgiver", "buyer", "buyer_name", "organization", "organisation");
    const deadline = get(row, "frist", "deadline", "response_deadline", "date");
    const url = get(row, "url", "link", "notice_url", "doffin_url", "notice_link");
    const category = get(row, "cpv", "category", "type", "kontraktstype");
    if (title) {
      tenders.push({
        title,
        organization: organization || "Oppdragsgiver ikke oppgitt",
        deadline: deadline || undefined,
        url: url || `https://www.doffin.no/Notice`,
        category: category || undefined,
      });
    }
  }
  return tenders;
}

/** Doffin Search API: GET .../notices/search-esentool med Ocp-Apim-Subscription-Key. Returnerer sannsynligvis content/notices-array. */
async function fetchDoffinSearchApi(subscriptionKey: string, baseUrl: string): Promise<TenderInput[]> {
  const publishedAfter = new Date();
  publishedAfter.setDate(publishedAfter.getDate() - 30);
  const params = new URLSearchParams({
    publishedAfter: publishedAfter.toISOString(),
    statuses: "SUBMITTED",
    size: "200",
    page: "0",
  });
  const url = `${baseUrl.replace(/\/$/, "")}/api/v2/notice/notices/search-esentool?${params}`;
  const res = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": subscriptionKey },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Record<string, unknown>;
  const rawList =
    (data.content as Record<string, unknown>[]) ??
    (data.notices as Record<string, unknown>[]) ??
    (data.items as Record<string, unknown>[]) ??
    (data.results as Record<string, unknown>[]) ??
    [];
  if (!Array.isArray(rawList) || rawList.length === 0) return [];
  const tenders: TenderInput[] = [];
  for (const n of rawList) {
    const get = (...keys: string[]) => {
      for (const k of keys) {
        const v = n[k];
        if (v != null && typeof v === "string") return v;
        if (v != null && typeof v === "object" && "value" in (v as object)) return String((v as { value: unknown }).value);
      }
      return "";
    };
    const title =
      get("title", "noticeTitle", "title_no", "name", "subject", "contractTitle") ||
      get("title_en", "title_no");
    const organization = get("noticeAuthor", "author", "buyer", "organisation", "organization", "oppdragsgiver");
    const deadline =
      get("responseDeadline", "deadline", "frist", "responseDate", "deadlineDate") ||
      get("submissionDeadline");
    const id = get("id", "noticeId", "notice_id");
    const url = id ? `https://www.doffin.no/Notice/${id}` : get("url", "link", "noticeUrl");
    const category = get("cpv", "category", "contractType", "type");
    if (title) {
      tenders.push({
        title,
        organization: organization || "Oppdragsgiver ikke oppgitt",
        deadline: deadline || undefined,
        url: url || "https://www.doffin.no",
        category: category || undefined,
      });
    }
  }
  return tenders;
}

/** Hent anbud: 1) Doffin Search API (subscription key), 2) DOFFIN_API_URL (JSON), 3) DOFFIN_CSV_URL (CSV), 4) mock */
async function fetchTenders(): Promise<TenderInput[]> {
  const subscriptionKey = Deno.env.get("DOFFIN_SUBSCRIPTION_KEY") ?? Deno.env.get("DOFFIN_API_KEY");
  const doffinBaseUrl =
    Deno.env.get("DOFFIN_API_BASE_URL") ?? "https://api.doffin.no";
  if (subscriptionKey) {
    try {
      const list = await fetchDoffinSearchApi(subscriptionKey, doffinBaseUrl);
      if (list.length > 0) return list;
    } catch (_e) {
      // fallback
    }
  }

  const apiUrl = Deno.env.get("DOFFIN_API_URL");
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = (await res.json()) as { items?: TenderInput[]; tenders?: TenderInput[] };
        const list = data.items ?? data.tenders ?? [];
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (_e) {
      // fallback
    }
  }

  const csvUrl = Deno.env.get("DOFFIN_CSV_URL");
  if (csvUrl) {
    try {
      const res = await fetch(csvUrl);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseCSVToTenders(text);
        if (parsed.length > 0) return parsed;
      }
    } catch (_e) {
      // fallback to mock
    }
  }

  return [
    {
      title: "Asfaltering av kommunale veier 2025-2027",
      organization: "Trondheim kommune",
      location: "Trøndelag",
      deadline: "15. mars 2025",
      url: "https://www.doffin.no/notice/example-1",
      category: "Vei og transport",
    },
    {
      title: "Vedlikehold av fylkesveier - Region Vest",
      organization: "Vestland fylkeskommune",
      location: "Vestland",
      deadline: "22. mars 2025",
      url: "https://www.doffin.no/notice/example-2",
      category: "Vei og transport",
    },
    {
      title: "Snøbrøyting og vintervedlikehold 2025/2026",
      organization: "Bærum kommune",
      location: "Viken",
      deadline: "1. april 2025",
      url: "https://www.doffin.no/notice/example-3",
      category: "Drift og vedlikehold",
    },
  ];
}

function tenderMatchesKeyword(tender: TenderInput, keyword: string): boolean {
  const k = keyword.toLowerCase();
  const title = (tender.title ?? "").toLowerCase();
  const org = (tender.organization ?? "").toLowerCase();
  const cat = (tender.category ?? "").toLowerCase();
  return title.includes(k) || org.includes(k) || cat.includes(k);
}

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

  try {
    const supabase = getSupabaseAdmin();

    const { data: userKeywords, error: kwError } = await supabase
      .from("user_keywords")
      .select("user_id, keyword");

    if (kwError || !userKeywords?.length) {
      return new Response(
        JSON.stringify({ ok: true, inserted: 0, reason: "No user keywords" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const profilesWithNotifications = await supabase
      .from("profiles")
      .select("id")
      .eq("email_notifications", true);
    const enabledUserIds = new Set(
      (profilesWithNotifications.data ?? []).map((p) => p.id)
    );

    const tenders = await fetchTenders();
    let inserted = 0;

    for (const tender of tenders) {
      for (const { user_id, keyword } of userKeywords) {
        if (!enabledUserIds.has(user_id)) continue;
        if (!tenderMatchesKeyword(tender, keyword)) continue;

        const { data: existing } = await supabase
          .from("alerts")
          .select("id")
          .eq("user_id", user_id)
          .eq("tender_title", tender.title)
          .eq("matched_keyword", keyword)
          .limit(1)
          .maybeSingle();

        if (existing) continue;

        const { error: insertErr } = await supabase.from("alerts").insert({
          user_id,
          tender_title: tender.title,
          tender_organization: tender.organization,
          tender_location: tender.location ?? null,
          tender_deadline: tender.deadline ?? null,
          tender_url: tender.url ?? null,
          tender_category: tender.category ?? null,
          matched_keyword: keyword,
        });

        if (!insertErr) inserted++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, inserted, tendersChecked: tenders.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
