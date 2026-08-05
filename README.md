# The Occasions Event Planners — Studio Portal

A Next.js 14 (App Router) studio SaaS: an **admin CRM** for the team and a
**branded client portal** for couples — plus a public enquiry landing page
and PIN-protected client share links.

**Database:** Prisma Postgres (or any Postgres — Neon, Supabase, Railway,
etc. all work unchanged since it's a standard `postgresql://` connection
string via Prisma).

**Auth:** NextAuth, credentials + bcrypt + JWT. No third-party auth
provider — sessions and role-based access (`admin` | `client`) are handled
entirely inside the app.

## What's included

- **Admin workspace** (`/admin`) — Dashboard, Enquiries, Projects, Post
  Production, Data (analytics), Team, Finances, Automation
- **Client portal** (`/portal`) — account-based login for each client,
  showing their project's quote, payments, contract, schedule, moodboard,
  deliverables, documents
- **Public enquiry landing page** (`/enquire`) — customizable from
  Enquiries → Landing Page in the admin
- **PIN-protected client share links** (`/client/[token]`) — a link +
  4-digit PIN you can hand a client with no account needed, generated from
  a project's Contract tab
- Every module is backed by real create/update actions (Prisma), not
  static mockups

## Setup

1. **Set up a Postgres database.** Any provider works — Prisma Postgres,
   Neon, Supabase, Railway. Get its connection string.
2. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```
   Fill in `DATABASE_URL`, and generate `NEXTAUTH_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   `NEXTAUTH_URL` should be `http://localhost:3000` for local dev, and your
   real deployed URL in production.

   Note: Prisma's CLI (`db push`, `db seed`) only reads `.env`, not
   `.env.local` — keep your real values in `.env`.

3. **Install & set up the database**:
   ```bash
   npm install
   npm run db:push       # creates every table from prisma/schema.prisma
   npm run db:seed       # demo admin + client + project, plus the 4 studio team logins below
   ```
4. **`db:add-team` is also available** if you ever need to add or update
   team logins later without re-running the full seed:
   ```bash
   npm run db:add-team
   ```
   Edit the list in `prisma/add-team.ts` first. Everyone created this way
   gets full admin access — there isn't a restricted-permissions role yet,
   so treat each account as a trusted studio team member.
5. **Run it**:
   ```bash
   npm run dev
   ```
   If you ran `db:seed`, demo logins are:
   - Admin: `admin@theoccasions.studio` / `admin1234`
   - Client: `ananya@example.com` / `client1234`

   Change or remove these before this ever goes anywhere real — they're
   for local development only.

## Deploying

Works on Vercel with zero config beyond environment variables — set
`DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (your production URL)
in the project's Environment Variables, then deploy. `postinstall` already
runs `prisma generate` automatically.

## Where to go next

- Add per-person permission levels (right now every team account is a
  full admin) if you need to restrict what certain team members can see
  or do.
- Wire e-signature for `/portal/contract` and flip the project's contract
  status on completion.
- Add file uploads for moodboard/documents/deliverables (any storage
  provider works alongside Prisma).
- Connect the Automation module to a real scheduler for actual
  WhatsApp/email sends, instead of the manual "Send Now" log it has today.

## Structure

```
prisma/
  schema.prisma          all tables, enums, relations
  seed.ts                 demo admin + client + project
  add-team.ts              real studio team accounts
src/
  app/
    api/auth/[...nextauth]/route.ts   NextAuth handler
    login/                             client-side sign-in form
    admin/                             studio-facing CRM
    portal/                            client-facing portal
    enquire/                           public enquiry landing page
    client/[token]/                    PIN-protected public project view
  components/
    ui/                   Card, Badge, Button, StatCard, FormField
    admin/                 AdminSidebar, ProjectTabs, and other admin widgets
    portal/                PortalSidebar
  lib/
    prisma.ts             Prisma client singleton
    auth.ts                 NextAuth config (credentials + bcrypt + JWT)
    get-session.ts          getServerSession() wrapper for Server Components
    actions/                 server actions, one file per domain
  middleware.ts            edge-side role gating via next-auth/jwt
```
