# Enkel guide: Slik setter du opp Supabase

Denne guiden forklarer steg for steg hvordan du får AnbudsVarsler til å fungere med Supabase. Du trenger ikke å kunne Supabase fra før.

---

## Hva er Supabase?

Supabase er en tjeneste på nettet som gir deg:
- **Database** – hvor brukere, søkeord og varsler lagres
- **Innlogging** – brukere kan registrere seg og logge inn med e-post og passord
- **Edge Functions** – små programmer som kjører på Supabase sine servere (f.eks. sender e-post)

Du lager ett prosjekt i Supabase, og så kobler du nettsiden din til det prosjektet.

---

## Steg 1: Lag et Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com) og logg inn (eller lag konto).
2. Klikk **New project**.
3. Fyll inn:
   - **Name:** f.eks. «AnbudsVarsler»
   - **Database password:** velg et sterkt passord og **skriv det ned** – du trenger det ikke ofte, men det er viktig å ha det.
4. Klikk **Create new project** og vent til prosjektet er klart (1–2 minutter).

---

## Steg 2: Lag tabellene i databasen

Når prosjektet er klart:

1. I venstremenyen: klikk **SQL Editor**.
2. Klikk **New query**.
3. På PC-en: finn SQL-filen. Den ligger her i prosjektet:
   - **Hvis du har åpnet mappen der `package.json` ligger:**  
     Åpne mappen `supabase`, deretter `migrations`. Filen heter `00001_initial_schema.sql`.
   - **Hvis du har åpnet mappen over (der det står «tender-alerts-main» og så en undermappe med samme navn):**  
     Gå inn i den innerste `tender-alerts-main`-mappen, deretter `supabase` → `migrations` → `00001_initial_schema.sql`.
4. **Kopier SQL-koden.** Du kan enten:
   - åpne filen `00001_initial_schema.sql` i en teksteditor og kopiere alt, eller
   - kopiere hele blokken nedenfor (fra `-- Enable UUID` til siste linje med `handle_new_user();`).

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles: one per auth user, extended with notification settings
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  email_notifications boolean not null default true,
  notification_frequency text not null default 'instant' check (notification_frequency in ('instant', 'daily_digest')),
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User search keywords (e.g. "Asfalt")
create table public.user_keywords (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now(),
  unique(user_id, keyword)
);

-- Alerts: one row per user per matched tender
create table public.alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tender_title text not null,
  tender_organization text not null,
  tender_location text,
  tender_deadline text,
  tender_url text,
  tender_category text,
  matched_keyword text not null,
  created_at timestamptz not null default now()
);

create index idx_user_keywords_user_id on public.user_keywords(user_id);
create index idx_alerts_user_id on public.alerts(user_id);
create index idx_alerts_created_at on public.alerts(created_at desc);

alter table public.profiles enable row level security;
alter table public.user_keywords enable row level security;
alter table public.alerts enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can view own keywords"
  on public.user_keywords for all using (auth.uid() = user_id);
create policy "Users can view own alerts"
  on public.alerts for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();
```

5. Lim det du kopierte inn i SQL Editor i Supabase (i nettleseren).
6. Klikk **Run** (eller trykk Ctrl+Enter).

Hvis alt gikk bra, står det noe med «Success». Da har du laget tre tabeller:
- **profiles** – brukerinnstillinger (e-post på/av, instant eller daglig oppsummering)
- **user_keywords** – brukerens søkeord (f.eks. «Asfalt»)
- **alerts** – varsler som brukeren skal få (ett anbud som matchet et søkeord)

---

## Steg 3: Finn nøklene til nettsiden

Nettsiden må vite *hvilket* Supabase-prosjekt den skal bruke. Det gjør du med to nøkler:

1. I Supabase: klikk **Project Settings** (tannhjulet nederst til venstre).
2. Klikk **API** i venstremenyen.
3. Du ser:
   - **Project URL** – en adresse som slutter på `supabase.co`
   - **anon public** (under Project API keys) – en lang streng med bokstaver og tall

4. På PC-en: lag en fil som heter `.env` i mappen `tender-alerts-main` (samme nivå som `package.json`).
5. Sett inn disse to linjene (erstatt med dine egne verdier fra Supabase):

```
VITE_SUPABASE_URL=din-project-url-her
VITE_SUPABASE_ANON_KEY=din-anon-public-nøkkel-her
```

Eksempel (ikke bruk disse – bruk dine egne):

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

6. Lagre filen. Start nettsiden på nytt med `npm run dev` – da leses `.env` inn.

**Får du «Failed to fetch» når du prøver å registrere deg eller logge inn?**  
Supabase må tillate forespørseler fra adressen du bruker (f.eks. localhost). Gå til **Steg 3b** under.

---

### Steg 3b: Tillat localhost i Supabase (ved «Failed to fetch»)

Hvis du får feilmeldingen «Failed to fetch» når du lager bruker eller logger inn:

1. Gå til [Supabase Dashboard](https://supabase.com/dashboard) og åpne prosjektet ditt.
2. I venstremenyen: **Authentication** → **URL Configuration**.
3. Under **Site URL** skriver du adressen der appen kjører, f.eks.:
   - `http://localhost:8080` (eller den porten Vite viser i terminalen).
4. Under **Redirect URLs** klikker du **Add URL** og legger til:
   - `http://localhost:8080/**`
   - Eventuelt også `http://localhost:5173/**` og `http://127.0.0.1:8080/**` hvis du bytter port.
5. Klikk **Save**.

Prøv å registrere deg eller logge inn på nytt.

---

### Feilsøking: «Kunne ikke nå Supabase» / «Failed to fetch»

Hvis du fortsatt får feil etter Steg 3b, gå gjennom dette punkt for punkt:

**1. Er prosjektet pauset?**  
Supabase (gratis) setter prosjekter i «dvale» etter litt inaktivitet.  
- Åpne [Supabase Dashboard](https://supabase.com/dashboard) og se på prosjektet.  
- Står det **«Project is paused»** eller **«Restore project»**? Klikk **Restore** og vent 1–2 minutter, prøv igjen.

**2. Riktig URL og nøkkel i .env**  
- Åpne filen `.env` i prosjektmappen (der `package.json` ligger).  
- **VITE_SUPABASE_URL** skal være *nøyaktig* som i Supabase: **Project Settings** → **API** → **Project URL** (f.eks. `https://xxxxx.supabase.co` – uten skråstrek på slutten).  
- **VITE_SUPABASE_ANON_KEY** skal være *hele* **anon public**-nøkkelen fra **Project Settings** → **API** → **Project API keys**.  
- Lagre `.env`, stopp appen (Ctrl+C i terminalen) og kjør `npm run dev` på nytt.

**3. Authentication → URL Configuration (nøye)**  
- **Authentication** → **URL Configuration**.  
- **Site URL:** Skal være *nøyaktig* der du åpner appen, f.eks. `http://localhost:8080` eller `http://localhost:5173` (ingen skråstrek på slutten, ingen `/dashboard` osv.).  
- **Redirect URLs:** Klikk **Add URL** og legg inn *én* av disse (avhengig av port):  
  - `http://localhost:8080/**`  
  - eller `http://localhost:5173/**`  
  Legg gjerne inn begge. Klikk **Save**.

**4. E-post-provider må være på**  
- **Authentication** → **Providers** → **Email**.  
- **Enable Email provider** må være **ON** (grønn). Lagre hvis du endret.

**5. Nettleser og utvidelser**  
- Prøv et **inkognito-/privat vindu** (da er utvidelser vanligvis skrudd av).  
- Prøv en annen nettleser (f.eks. Edge hvis du bruker Chrome).

**6. Se den faktiske feilen**  
- Åpne **Utviklerverktøy** (F12) → **Network** (Nettverk).  
- Prøv å registrere deg igjen.  
- Klikk på den røde eller mislykkede forespørselen (f.eks. `signup` eller `token`).  
- Sjekk **Status** (f.eks. 0, 403, 500) og **Response** (svartekst). Si fra hva du ser hvis du trenger mer hjelp.

---

Nå kan brukere registrere seg, logge inn og se sine søkeord og varsler.

---

## Steg 4: E-post med Resend (valgfritt, men anbefalt)

For at brukere skal få e-post når det kommer nye anbud, bruker vi Resend.

1. Gå til [resend.com](https://resend.com) og lag konto.
2. Under **API Keys**: lag en ny nøkkel og kopier den.
3. I Supabase: **Project Settings** → **Edge Functions** → **Secrets** (eller **Manage secrets**).
4. Legg til disse (klikk Add secret for hver):
   - **RESEND_API_KEY** = nøkkelen du kopierte fra Resend
   - **RESEND_FROM_EMAIL** = f.eks. `varsler@resend.dev` (Resend gir deg en test-adresse; for eget domene må du verifisere domenet i Resend)
   - **PUBLIC_APP_URL** = adressen til nettsiden din, f.eks. `http://localhost:5173` under utvikling eller `https://din-side.no` i produksjon
   - **UNSUBSCRIBE_JWT_SECRET** = en lang tilfeldig streng (f.eks. 32 tegn) – brukes til «Meld av varsling»-lenken
   - **DOFFIN_SUBSCRIPTION_KEY** = abonnementsnøkkel fra [Doffin API](https://dof-notices-prod-api.developer.azure-api.net/) (Sign up → Create subscription) – da henter scraperen ekte anbud fra Doffin i stedet for eksempeldata

Uten disse vil ikke e-post sendes, men resten av appen fungerer.

---

## Steg 5: Deploy Edge Functions (små programmer på Supabase)

Edge Functions er koden som sender e-post og kjører scraper. De må lastes opp til Supabase én gang.

1. Installer Supabase CLI på PC-en: [Supabase CLI](https://supabase.com/docs/guides/cli) (følg «Install the Supabase CLI»).
2. Åpne terminal/kommandolinje i prosjektmappen `tender-alerts-main`.
3. Logg inn: `supabase login`
4. Koble til prosjektet: `supabase link` (velg prosjektet du lagde).
5. Deploy alle funksjonene:

```bash
supabase functions deploy send-alert-email
supabase functions deploy daily-digest
supabase functions deploy unsubscribe
supabase functions deploy scraper
```

Når det står «Deployed» er de klare.

---

## Steg 6: Webhook – når nytt varsel skal sende e-post

Du vil at Supabase skal *automatisk* kalle e-post-funksjonen når noen legger inn en ny rad i tabellen `alerts`. Det kalles en webhook.

1. I Supabase: **Database** → **Webhooks** (i venstremenyen under Database).
2. Klikk **Create a new hook**.
3. Fyll inn:
   - **Name:** f.eks. «Send e-post ved nytt varsel»
   - **Table:** velg `public.alerts`
   - **Events:** kryss av **Insert** (når en ny rad legges inn)
   - **Type:** Supabase Edge Function
   - **Function:** velg `send-alert-email`
4. Klikk **Create webhook**.

Da vil Supabase kalle `send-alert-email` hver gang scraper (eller noe annet) legger inn en ny rad i `alerts`. Hvis brukeren har «Instant» varsler, sendes e-posten med én gang.

---

## Steg 7: Scraper og daglig oppsummering (cron)

**Scraper** = et program som «henter» nye anbud (foreløpig brukes noen eksempel-anbud i koden) og legger dem inn i `alerts`.  
**Daglig oppsummering** = en e-post kl. 08:00 med alle nye varsler for brukere som har valgt «Daglig oppsummering».

For at disse skal kjøre automatisk, må noe *kalle* dem på bestemte tidspunkter. Supabase har ikke en enkel «cron»-knapp i dashbordet, så du har to enkle valg:

**A) Manuelt (for testing)**  
- Gå til **Edge Functions** → velg `scraper` → **Invoke** (eller bruk «Test»). Da kjører scraperen én gang.  
- Samme for `daily-digest` hvis du vil teste daglig e-post.

**B) Automatisk med ekstern cron**  
Bruk en tjeneste som kan sende en forespørsel på nettet på et tidspunkt, f.eks.:
- [cron-job.org](https://cron-job.org) (gratis)
- Eller Vercel Cron / GitHub Actions hvis du bruker det

Du må da bruke:
- **URL:** `https://DITT-PROJEKT-REF.supabase.co/functions/v1/scraper` (finn «Project URL» under API – ref er den korte id-en i URL-en).
- **Metode:** POST
- **Frekvens:** f.eks. hver time for scraper, og kl. 08:00 for `daily-digest` (bruk URL med `daily-digest` i stedet for `scraper`).

Hvis du vil kan vi lage en enda enklere «Kjør scraper»-knapp i nettsiden som du trykker på manuelt – da trenger du ikke cron i starten.

---

## Oppsummert: Hva du må gjøre minst

1. **Lag Supabase-prosjekt** og kjør SQL-migrasjonen (Steg 1 og 2).
2. **Lag `.env`** med `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` (Steg 3).
3. Kjør `npm run dev` – da kan du registrere deg, logge inn, legge til søkeord og se innstillinger.

For at e-post og varsler skal fungere fullt ut:
4. Opprett Resend-konto og legg inn **Secrets** i Supabase (Steg 4).
5. **Deploy Edge Functions** (Steg 5).
6. **Lag webhook** på `alerts` som kaller `send-alert-email` (Steg 6).
7. **Kjør scraper** manuelt eller sett opp cron (Steg 7).

Hvis noe er uklart, si fra hvilket steg du står på, så kan vi forenkle bare den delen.
