# Supabase Edge Functions

## Deploy

```bash
supabase functions deploy send-alert-email
supabase functions deploy daily-digest
supabase functions deploy unsubscribe
supabase functions deploy scraper
```

## Secrets (Supabase Dashboard > Project Settings > Edge Functions)

- `RESEND_API_KEY` – Resend API key
- `RESEND_FROM_EMAIL` – Sender email (e.g. `varsler@din-domene.no`) after domain verification
- `PUBLIC_APP_URL` – Frontend base URL (e.g. `https://anbudsvarsler.no`) for unsubscribe/settings links
- `UNSUBSCRIBE_JWT_SECRET` – Secret used to sign/verify unsubscribe tokens (any long random string)

## Database Webhook (alerts INSERT)

1. In Supabase Dashboard: **Database** > **Webhooks** > **Create a new hook**
2. **Table:** `public.alerts`
3. **Events:** Insert
4. **Type:** Supabase Edge Function
5. **Function:** `send-alert-email`
6. Save

When a new row is inserted into `alerts`, Supabase will POST the payload to the `send-alert-email` function.

## Cron (daily digest and scraper)

Use an external cron (e.g. Vercel Cron, GitHub Actions) or Supabase pg_cron to call:

- **Daily digest (08:00):** `POST https://<project-ref>.supabase.co/functions/v1/daily-digest`
- **Scraper (e.g. hourly):** `POST https://<project-ref>.supabase.co/functions/v1/scraper`

Add header `Authorization: Bearer <anon-key>` if the function requires auth.

**Doffin / DFØ (scraper) – rekkefølge:**
1. **DOFFIN_SUBSCRIPTION_KEY** (eller **DOFFIN_API_KEY**) – Abonnementsnøkkel fra [Doffin API Management](https://dof-notices-prod-api.developer.azure-api.net/) (Sign up → Create subscription). Scraperen kaller da **Doffin Search API**: `GET /api/v2/notice/notices/search-esentool` med header `Ocp-Apim-Subscription-Key`. Valgfritt: **DOFFIN_API_BASE_URL** – standard er `https://api.doffin.no`; for prod kan du bruke `https://dof-notices-prod-api.azure-api.net`.  
   **Public API download:** For å hente én kunngjøring i sin helhet brukes `GET https://api.doffin.no/public/v2/download/{doffinId}` med samme header; scraperen bruker search og bygger lenke til `https://www.doffin.no/Notice/{doffinId}`.
2. **DOFFIN_API_URL** – Hvis du har en annen JSON-API som returnerer `{ items: [{ title, organization, deadline?, url?, category? }] }`, sett denne.
3. **DOFFIN_CSV_URL** – Offentlig CSV fra DFØ, f.eks. `https://adaapnedataprodst.blob.core.windows.net/kunngjoringer/2022/kunngjoringer_2022.csv` (se [DFØ – Last ned datasettene](https://dfo.no/nokkeltall-og-statistikk/innkjop-i-offentlig-sektor/kunngjoringer-av-konkurranse-pa-doffin)).
4. Hvis ingen av disse er satt, brukes **mock-data**.
