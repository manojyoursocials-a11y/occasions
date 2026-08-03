# Aperture Weddings — Studio Portal

A Next.js 14 (App Router) skeleton for an event-planning studio SaaS: an
**admin CRM** for the studio team and a **branded client portal** for
couples.

**Supabase is used purely as a hosted Postgres database.** Auth, sessions,
and role-based access are handled entirely inside the app with NextAuth
(credentials + bcrypt + JWT) and Prisma — no Supabase Auth, no Supabase
client libraries.

## What's included

**Auth & access control**
- NextAuth credentials provider: email + password, hashed with bcrypt,
  checked against a `users` table via Prisma
- JWT sessions, with `role` (`admin` | `client`) baked into the token
- `middleware.ts` reads the JWT at the edge (`next-auth/jwt`) and keeps
  clients out of `/admin`, admins out of `/portal`, and everyone out of
  both while signed out
- No RLS needed — the app is the only thing that talks to the database,
  so authorization lives in the middleware + page queries

**Admin workspace** (`/admin`)
- Dashboard — leads, active projects, quoted vs. collected totals
- Leads — enquiry pipeline
- Clients & Projects — every booked couple
- Team — crew roster
- Payments — every installment across every project
- Post-Production — deliverable tracking by editor/status
- Automation — follow-up rules + activity log

**Client portal** (`/portal`) — mirrors the reference screenshot
- Dashboard — contract alert, total quote + amount paid, event countdown,
  next payment due, contract status, gallery progress
- Quote & Payments, Contract, Event Schedule, Moodboard, Team,
  Deliverables, Documents, WhatsApp Group
- Sidebar locks Team / Deliverables / WhatsApp until the contract is signed

## Setup

1. **Create a Supabase project** at supabase.com — you only need it for the
   Postgres database, so the free tier is plenty to start.
2. **Get your connection string**: Project Settings → Database →
   Connection string → URI. Use the pooled ("Transaction") string if you'll
   deploy to a serverless/edge platform; the direct string is simplest for
   local development.
3. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in `DATABASE_URL` with the string from step 2, and generate
   `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
4. **Install & set up the database**:
   ```bash
   npm install
   npm run db:push     # creates every table from prisma/schema.prisma
   npm run db:seed     # creates a demo admin + client + project
   ```
5. **Run it**:
   ```bash
   npm run dev
   ```
   Seeded logins:
   - Admin: `admin@aperture.studio` / `admin1234`
   - Client: `ananya@example.com` / `client1234`

   Change these immediately if this ever leaves your machine — the seed
   script is for local development only.
6. **Add real users**: for now, create them directly via Prisma Studio
   (`npm run db:studio`) or a small script, hashing the password with
   `bcryptjs` the same way `prisma/seed.ts` does. A proper admin-facing
   "invite a client" flow is a natural next feature to build.

## Pushing to GitHub

This project is already a git repo with an initial commit. To publish it:

```bash
# create an empty repo on GitHub first (github.com/new), then:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

`.env.local` is already git-ignored, so your database URL and secrets
won't be committed.

## Where to go next

- Add a public lead-capture form that inserts into `leads` — the "Leads"
  pillar from the brief.
- Wire e-signature for `/portal/contract` and flip `Project.contractStatus`
  on completion.
- Add file uploads for moodboard/documents/deliverables (Supabase Storage,
  S3, or UploadThing all work fine alongside a Prisma-only setup).
- Connect the Automation module to a real scheduler (a cron job or queue
  calling WhatsApp/email APIs) instead of the static rule cards shown now.
- Swap the `brand` color palette in `tailwind.config.ts` for your real
  brand once you have it.

## Structure

```
prisma/
  schema.prisma         all tables, enums, relations
  seed.ts                demo admin + client + project
src/
  app/
    api/auth/[...nextauth]/route.ts   NextAuth handler
    api/me/route.ts                    role lookup used right after login
    login/                              client-side sign-in form
    admin/                              studio-facing CRM
    portal/                             client-facing portal
    providers.tsx                       SessionProvider wrapper
  components/
    ui/                  Card, Badge, Button, StatCard
    admin/                AdminSidebar
    portal/               PortalSidebar
  lib/
    prisma.ts            Prisma client singleton
    auth.ts               NextAuth config (credentials + bcrypt + JWT)
    get-session.ts        getServerSession() wrapper for Server Components
    utils.ts
  middleware.ts           edge-side role gating via next-auth/jwt
  types/next-auth.d.ts    typed session.user.id / role
```
