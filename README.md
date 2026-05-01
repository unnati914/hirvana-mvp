# Hirvana MVP

## Run locally
npm install
npm run dev

## Database (PostgreSQL + Prisma)
Optional: with `DATABASE_URL` set, features and waitlist use Postgres; otherwise `data/*.json` is used.

1. Start local Postgres: `npm run db:up` (requires [Docker](https://docs.docker.com/get-docker/)).
2. Copy `.env.example` → `.env.local` and set:
   `DATABASE_URL="postgresql://hirvana:hirvana@localhost:5432/hirvana?schema=public"`
3. Apply schema: `npm run db:migrate`
4. Seed features: `npm run db:seed`
5. Stop DB when done: `npm run db:down`

## Hosting (recommended: Vercel + managed Postgres)
1. **Postgres** — Create a database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app)). Copy the connection string (often includes `?sslmode=require`).
2. **GitHub** — Push this repo to GitHub.
3. **Vercel** — [Import the project](https://vercel.com/new). Framework: Next.js. This repo includes `vercel.json` so the build runs **`npm run vercel-build`** (runs `prisma migrate deploy` then `next build`).
4. **Environment variables** in the Vercel project (Settings → Environment Variables), for Production (and Preview if you want):

   | Name | Notes |
   |------|--------|
   | `DATABASE_URL` | Required for DB-backed features & waitlist. Without it, APIs fall back to `data/*.json` (not ideal on serverless—prefer a real DB). |
   | `HIRVANA_ADMIN_SECRET` | Protects admin APIs: `GET /api/waitlist`, `PUT /api/features`, `PATCH /api/features/:id`. |
   | `NEXT_PUBLIC_UPI_ID` | Optional; defaults in app if unset. |
   | `NEXT_PUBLIC_UPI_PAYEE_NAME` | Optional. |
   | `NEXT_PUBLIC_UPI_AMOUNT` | Optional; rupees as string. |

5. **First deploy** — After the first successful deploy, run **`npm run db:seed`** once against production (from your machine with `DATABASE_URL` pointing at prod, or Neon’s SQL editor / a one-off job) if you want seeded feature rows.

**Other hosts** — Any Node host can run `npm run build` (or `vercel-build` if you use Postgres) and `npm run start`. Use a managed Postgres URL in `DATABASE_URL`; do not rely on `docker-compose` on the server unless you operate the VM yourself.

## Pages
- / → Landing
- /waitlist → Waitlist
- /pay → Payment
- /dashboard → Dashboard
