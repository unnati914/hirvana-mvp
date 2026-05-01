# Hirvana MVP

## Run locally
npm install
npm run dev

If dev shows **`Cannot find module './chunks/vendor-chunks/next.js'`** or random **`GET /_next/static/... 500`**, stop the server and run **`npm run dev:clean`** (deletes `.next` and starts fresh).

## Database (PostgreSQL + Prisma)
**Accounts and the feature catalog live in Postgres** when **`DATABASE_URL`** is set. Without it, **Create account** and admin feature writes are unavailable; the app still serves the marketing UI using **in-memory default features** (read-only catalog).

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
   | `DATABASE_URL` | **Required** for **Create account**, email/password users (**`User`** table), and persisting **`PUT /api/features`**. |
   | `HIRVANA_ADMIN_SECRET` | Protects admin APIs: **`PUT /api/features`**, **`PATCH /api/features/:id`**. |
   | `NEXT_PUBLIC_UPI_ID` | Optional; defaults in app if unset. |
   | `NEXT_PUBLIC_UPI_PAYEE_NAME` | Optional. |
   | `NEXT_PUBLIC_UPI_AMOUNT` | Optional; rupees as string. |
   | `OPENAI_API_KEY` | Optional; enables GPT pass on **`POST /api/resume/optimize`** (otherwise rules-only). |
   | `NEXTAUTH_URL` | Site origin, e.g. `https://your-app.vercel.app` (local: `http://localhost:3000`). |
   | `NEXTAUTH_SECRET` | Random string (`openssl rand -base64 32`). Signs session cookies. |
   | `RESEND_API_KEY` | Optional; [Resend](https://resend.com) for **account created** email after sign-up. |
   | `SIGNUP_EMAIL_FROM` | Optional; from-address for that email (else Resend onboarding sender). |
   | `HIRVANA_AUTH_EMAIL` | Optional; allowed email for **email/password** sign-in (single env user). |
   | `HIRVANA_AUTH_PASSWORD_HASH` | Optional; **bcrypt** hash of that user’s password (never commit plain passwords). |
   | `GITHUB_ID` | Optional; GitHub OAuth App client ID ([Developer settings](https://github.com/settings/developers)). |
   | `GITHUB_SECRET` | Optional; GitHub OAuth App client secret. |

5. **First deploy** — After the first successful deploy, run **`npm run db:seed`** once against production (from your machine with `DATABASE_URL` pointing at prod, or Neon’s SQL editor / a one-off job) if you want seeded feature rows.

## Sign-in (NextAuth.js)
**`/login`** is the only auth screen: **Welcome back** (email/password and optional GitHub) and, when Postgres is configured, **Create account** on the same page (side by side on wide screens, stacked on small). Legacy **`/signup`** redirects to **`/login`**. **`/`** and the rest of the app require a session; guests are sent to **`/login`** via **`middleware.js`** (NextAuth **`withAuth`**), with **`callbackUrl`** preserved.

**Public (no session):** **`/login`**, **`/api/auth/*`**, **`/api/health`**, **`/api/signup`** (POST register — requires **`DATABASE_URL`**).

**Admin API without user session:** any **`/api/*`** request that sends a valid **`HIRVANA_ADMIN_SECRET`** as **`Authorization: Bearer …`** or **`x-hirvana-admin-secret`** (same as `lib/admin-auth.js`) is allowed through middleware so scripts can **`PUT /api/features`**, etc.

Configure **`NEXTAUTH_SECRET`** and **`NEXTAUTH_URL`**, then enable **at least one** sign-in path (Postgres **`User`** accounts, env-only user, and/or GitHub).

### Sign up (new accounts)
Set **`DATABASE_URL`** and run **`npm run db:migrate`**. **Create account** on **`/login`** writes to the **`User`** table (email, optional name, bcrypt password hash).

**Account created email (optional):** set **`RESEND_API_KEY`**. After each successful sign-up, the API can send **Your Hirvana account is ready** with a link to **`/login`**. Optional **`SIGNUP_EMAIL_FROM`**; otherwise Resend’s onboarding sender. Set **`NEXTAUTH_URL`** so the link matches your site.

### Email / password sign-in
- **Postgres:** sign-in checks the **`User`** table for accounts created via **Create account** on **`/login`**.
- **Single env user:** **`HIRVANA_AUTH_EMAIL`** + **`HIRVANA_AUTH_PASSWORD_HASH`** (bcrypt) — optional alongside **`User`** rows.

Generate a hash (from the project root, after `npm install`):

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password-here', 10))"
```

Copy the printed string into **`HIRVANA_AUTH_PASSWORD_HASH`** in `.env.local` (for the env-only demo user).

### GitHub
1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (and your production URL for deploy).
3. Set **`GITHUB_ID`** and **`GITHUB_SECRET`**.

Restart **`npm run dev`** after env changes.

If nothing is configured (no **`NEXTAUTH_SECRET`**, or no Postgres / env / GitHub path), **`/login`** shows only the setup instructions.

## Resume hub (free)
- **`/resume`** — Upload **PDF, DOCX, or TXT** (or paste text). **`POST /api/resume/extract`** pulls plain text from the file (max 3 MB; trimmed to 14k chars). Optional JD for keyword overlap. **`POST /api/resume/optimize`** returns priority fixes, **line-level corrections** (when GPT is available), and **stronger bullet** suggestions, plus merged heuristics. Set **`OPENAI_API_KEY`** on the server for GPT; otherwise rules-only.

**Other hosts** — Any Node host can run `npm run build` (or `vercel-build` if you use Postgres) and `npm run start`. Use a managed Postgres URL in `DATABASE_URL`; do not rely on `docker-compose` on the server unless you operate the VM yourself.

## Pages
- / → Marketing landing (session required; middleware → **`/login`** if not signed in)
- /login → sign in + create account on the same page (two columns on large viewports when DB sign-up is on). **`/signup`** → **`/login`**. Old **`/waitlist`** → **`/login`**.
- /dashboard → Product catalog + links to tools
- /tracker, /prep, /resume, /pay → session required (same middleware)
