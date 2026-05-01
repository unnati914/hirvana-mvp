export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(200).json({
    service: "hirvana-mvp",
    description: "Next.js Pages API routes",
    routes: {
      health: { method: "GET", path: "/api/health" },
      catalog: { method: "GET", path: "/api" },
      features: {
        list: { methods: ["GET", "PUT"], path: "/api/features", note: "PUT requires admin secret; DATABASE_URL required to persist" },
        one: { methods: ["GET", "PATCH"], path: "/api/features/:id", note: "PATCH requires admin secret" },
      },
      signup: {
        register: {
          method: "POST",
          path: "/api/signup",
          note: "Requires DATABASE_URL (User row). Optional Resend if RESEND_API_KEY set. See README.",
        },
      },
      resume: {
        meta: { method: "GET", path: "/api/resume" },
        extract: { method: "POST", path: "/api/resume/extract" },
        optimize: { method: "POST", path: "/api/resume/optimize" },
      },
    },
    auth: {
      admin:
        "Set HIRVANA_ADMIN_SECRET (or legacy FEATURES_WRITE_SECRET). Send Authorization: Bearer <secret> or x-hirvana-admin-secret header.",
      nextauth:
        "NextAuth at /api/auth/* — set NEXTAUTH_SECRET, NEXTAUTH_URL. Email sign-in: DATABASE_URL + migrate (User table) for accounts, or HIRVANA_AUTH_EMAIL + HIRVANA_AUTH_PASSWORD_HASH for a single env user. Optional: GITHUB_ID + GITHUB_SECRET. See README.",
    },
  });
}
