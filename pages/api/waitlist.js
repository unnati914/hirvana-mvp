import { appendWaitlistEntry, readWaitlist } from "../../lib/waitlist-store";
import { isAdminAuthorized } from "../../lib/admin-auth";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({
        error: "Unauthorized or admin secret not set (HIRVANA_ADMIN_SECRET or FEATURES_WRITE_SECRET)",
      });
    }
    try {
      const entries = await readWaitlist();
      return res.status(200).json({ count: entries.length, entries });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Could not read waitlist" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const name = body.name?.trim?.() ?? "";
    const email = body.email?.trim?.() ?? "";
    const role = typeof body.role === "string" ? body.role.trim() : "";

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!isNonEmptyString(email) || !isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const entry = {
      name,
      email,
      role: role || null,
      createdAt: new Date().toISOString(),
    };

    try {
      await appendWaitlistEntry(entry);
    } catch (err) {
      console.error("waitlist write failed", err);
      return res.status(500).json({ error: "Could not save signup. Try again later." });
    }

    return res.status(201).json({ ok: true, message: "You’re on the list." });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
