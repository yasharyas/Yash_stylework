# Lead Intake Service

A small service that receives leads from a Meta Ads webhook, stores them, keeps an audit
trail of what happened to each one, and lets you review and update them from a web UI.

**Live app:** _added after deploy_
**Repo:** https://github.com/yasharyas/Yash_stylework

## Architecture

Single Next.js 16 (App Router) application deployed on Vercel, backed by a Supabase
Postgres database:

- **Frontend**: React + TypeScript, rendered by Next.js. `LeadList` (home page) and
  `LeadDetail` + `ActivityTimeline` (`/leads/[id]`) are client components that call the
  API routes below over `fetch`.
- **Backend**: Next.js Route Handlers under `src/app/api/`, running on Node.js. This is
  the "comparable backend framework" option from the brief — same runtime and routing
  model as Express, just co-located with the frontend in one deployable.
- **Database**: Postgres via Supabase (`leads`, `activities` tables). Row Level Security
  is enabled on both tables. Reads go through a normal `select` with the public anon
  key. **Writes go through two `SECURITY DEFINER` Postgres functions**
  (`create_lead_from_webhook`, `update_lead_status`) rather than raw table inserts, so
  the app never needs the Supabase service-role secret. See "Trade-offs" below.

```
Meta Ads ──POST /api/webhook/meta-lead──▶ create_lead_from_webhook() ──▶ leads + activities
                                                                              │
Browser ──GET /api/leads, GET /api/leads/:id──────────────────────────────┘ (reads)
Browser ──PATCH /api/leads/:id/status──▶ update_lead_status() ──▶ leads + activities
```

### Endpoints

| Method | Path                      | Purpose                                          |
| ------ | ------------------------- | ------------------------------------------------- |
| POST   | `/api/webhook/meta-lead`  | Ingest a lead from the Meta Ads webhook            |
| GET    | `/api/leads`               | List leads (`?status=`, `?q=` filters)             |
| GET    | `/api/leads/:id`           | Lead detail + its activity timeline                |
| PATCH  | `/api/leads/:id/status`    | Change a lead's status (records an activity)       |

### Audit trail

Every mutation writes a row to `activities`: `lead_created` when the webhook creates a
lead, `status_changed` on every status transition (with the `from`/`to` values in
`metadata`). `lead_updated` is defined in the schema for future edit-in-place features
but isn't triggered yet, since the brief's only mutation besides creation is a status
change.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and anon
   key (`Settings → API` in the Supabase dashboard).
3. Apply the schema in `supabase/migrations/` to your Supabase project (via the SQL
   editor, or `supabase db push` if you use the CLI). This creates the `leads` and
   `activities` tables, RLS policies, and the two RPC functions.
4. `npm run dev` — app runs at `http://localhost:3000`.

## Testing

```
npm test
```

Covers the Zod validation schemas for the webhook payload and the status-update body
(accepts Meta's `name`/`full_name` field variance, rejects invalid emails/statuses,
keeps unrecognized fields for `raw_payload`).

Given the time box, tests focus on validation logic rather than the API routes or UI,
since that's where malformed input is most likely and cheapest to catch. Route-level
integration tests (hitting a real or mocked Supabase) and component tests would be the
next things to add — see "Future Improvements."

## Deployment

Deployed on Vercel as a single project (frontend + API routes together). Environment
variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are configured
in the Vercel project settings.

### Docker

A `Dockerfile` and `docker-compose.yml` are included for running the app in a container
against the same Supabase project (there's no local Postgres container — the schema and
RPC functions already live in Supabase, and duplicating them locally would just be two
sources of truth to keep in sync for a take-home). Build/run:

```
docker compose up --build
```

Needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your shell
environment or a `.env` file next to `docker-compose.yml`. I verified the Next.js
standalone build output (what the Dockerfile copies into the final image) builds
correctly; I wasn't able to run `docker build` itself in the sandbox this was written in
(no Docker daemon available there), so please flag it if the image doesn't build cleanly
on your end.

## Trade-offs

- **Writes via SECURITY DEFINER RPCs, not the service-role key.** The straightforward
  approach would be a service-role Supabase client on the server for writes. I didn't
  have a safe way to pull that secret into this environment, so instead the two write
  paths (`create_lead_from_webhook`, `update_lead_status`) are Postgres functions that
  run with elevated privilege internally but are only reachable through the narrow
  interface each function defines — the app itself only ever holds the public anon key.
  It's a reasonable pattern in general (least-privilege for the app process), and it
  happens to route around not having the secret, but the honest trade-off is that
  business logic now lives partly in SQL functions instead of application code, which is
  less familiar to most Node engineers and harder to unit test in isolation.
- **No authentication on the webhook or status-update endpoints.** Meta's real webhook
  system uses a verify token + signature check; a production version would validate that
  here as well as put the status-update endpoint behind normal user auth. Both are
  open in this build to keep the assignment scope contained — noted so it's clear this
  isn't an oversight.
- **Filtering does substring search across three columns** (`full_name`, `email`,
  `phone`) with `ilike`, which is fine at this scale but won't use an index once the
  table is large. A production version would add a `pg_trgm` index or move search to a
  dedicated search service if lead volume grew.
- **No pagination on `GET /leads`.** Fine for a take-home dataset; would need
  cursor-based pagination before this could handle a real ad account's lead volume.

## Scaling considerations

- The `activities` table will grow much faster than `leads` (many activities per lead).
  It's already indexed on `lead_id`; a time-based partition would help once it's large.
- Postgres RPCs keep the two write paths atomic (lead + activity insert happen in one
  transaction) without needing application-level transaction handling, which will keep
  working the same way even if the app layer moves to multiple instances or a queue in
  front of the webhook.
- If Meta's webhook volume grew beyond what a single synchronous request should handle,
  I'd put a queue (e.g. a Postgres-backed job table, or Supabase's `pgmq`) in front of
  `create_lead_from_webhook` and process asynchronously, returning `202 Accepted`
  immediately.

## Future improvements

- Webhook signature verification (Meta signs payloads with `X-Hub-Signature-256`).
- Auth (even a shared API key) on `/api/leads/:id/status` and the webhook.
- Optimistic UI update on status change instead of a full refetch.
- Pagination and a `pg_trgm` index for `GET /leads` search.
- Route-level integration tests and component tests for `LeadList`/`LeadDetail`.
- Bulk actions (e.g. bulk status change) on the Lead List.
