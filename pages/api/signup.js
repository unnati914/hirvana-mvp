import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { sendAccountCreatedEmail } from "../../lib/signup-email";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return res.status(503).json({
      error: "Sign up requires PostgreSQL. Set DATABASE_URL and run npm run db:migrate.",
    });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";

  if (!isValidEmail(emailRaw)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: "Password is too long" });
  }

  const email = emailRaw.toLowerCase();
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
    });
    await sendAccountCreatedEmail({ email, name: name || null });
    return res.status(201).json({ ok: true });
  } catch (e) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    console.error(e);
    return res.status(500).json({ error: "Could not create account" });
  }
}
