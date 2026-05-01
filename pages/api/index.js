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
        list: { methods: ["GET", "PUT"], path: "/api/features", note: "PUT requires admin secret" },
        one: { methods: ["GET", "PATCH"], path: "/api/features/:id", note: "PATCH requires admin secret" },
      },
      waitlist: {
        signup: { method: "POST", path: "/api/waitlist" },
        export: { method: "GET", path: "/api/waitlist", note: "GET requires admin secret" },
      },
      resume: { method: "GET", path: "/api/resume" },
    },
    auth: {
      admin:
        "Set HIRVANA_ADMIN_SECRET (or legacy FEATURES_WRITE_SECRET). Send Authorization: Bearer <secret> or x-hirvana-admin-secret header.",
    },
  });
}
