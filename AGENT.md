# AGENT.md

How AI was used to build this, and which decisions were mine vs. suggested.

## Tools used

- **Claude (Claude Code / Claude Agent SDK)** for the bulk of implementation: scaffolding,
  API routes, React components, Supabase schema and RPC functions, Docker setup, tests,
  and this documentation.

## What was AI-generated vs. hand-directed

I (Yash) set the architecture decisions and constraints up front, then had Claude
implement against them and iterate:

- **My decisions**: Next.js for both frontend and backend (rather than a separate
  Express server) so the whole thing deploys as one Vercel project; Postgres via
  Supabase for the database; the general shape of the data model (leads +
  append-only activities table for the audit trail).
- **Claude's implementation, my review**: the actual route handlers, the React
  components (`LeadList`, `LeadDetail`, `ActivityTimeline`, `StatusBadge`), the SQL
  schema and RLS policies, the Dockerfile/docker-compose, and the test suite. I read
  through each of these rather than shipping them unread — the sections below call out
  the places I redirected or corrected the first pass.

## Architecture decisions worth flagging

**Writes via SECURITY DEFINER RPC functions instead of a service-role key.** This is
the one decision that came from an environment constraint, not a preference: I didn't
have a safe way to get the Supabase service-role secret into the coding environment
without hardcoding it in a chat transcript. Rather than do that, Claude proposed writing
`create_lead_from_webhook` and `update_lead_status` as Postgres functions with
`SECURITY DEFINER`, granting `EXECUTE` to the anon role, and keeping the app on the
public anon key throughout. I reviewed this and think it's actually a reasonable
pattern independent of the constraint that produced it (least-privilege for the app
process is generally good), but I want to be upfront that it wasn't the first thing
either of us would have reached for — the more conventional approach is a service-role
key in a server-only environment variable. Documented as the first item under
"Trade-offs" in the README.

**Single Next.js app instead of separate Express backend + Vite frontend.** The
assignment allows "a comparable backend framework" to Express/NestJS/Fastify. I decided
partway through to consolidate into one Next.js app after weighing the deployment
story: one Vercel project instead of coordinating a separate Railway/Render backend
deploy, one `vercel.json`-free setup, and Next.js Route Handlers are still Node.js
under the hood. Claude had started scaffolding a separate Express + Vite setup before
this call; I redirected it to Next.js once I'd decided.

## What I'd want a human reviewer to look at first

The RPC-based write path above, and the RLS policies in
`supabase/migrations/20260923000002_rls_and_rpc_functions.sql` — since they're the part
of this build furthest from a default Express+Prisma+service-role setup, and the part
most worth an engineering-judgment conversation in the review.
