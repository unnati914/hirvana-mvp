/**
 * Admin-only routes (feature writes).
 * Set HIRVANA_ADMIN_SECRET, or legacy FEATURES_WRITE_SECRET.
 *
 * Send either:
 *   Authorization: Bearer <secret>
 * or
 *   x-hirvana-admin-secret: <secret>
 */

function getAdminSecret() {
  return process.env.HIRVANA_ADMIN_SECRET || process.env.FEATURES_WRITE_SECRET;
}

function adminMatchesSecret(secret, authorizationHeader, adminHeader) {
  if (!secret || typeof secret !== "string") return false;
  const auth = authorizationHeader || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return bearer === secret || adminHeader === secret;
}

export function isAdminAuthorized(req) {
  const secret = getAdminSecret();
  const h = req.headers || {};
  const auth = h.authorization || "";
  const header = h["x-hirvana-admin-secret"];
  return adminMatchesSecret(secret, auth, header);
}

/** For Next.js middleware (Web `Headers` from `NextRequest`). */
export function isAdminAuthorizedFromFetchHeaders(headers) {
  const secret = getAdminSecret();
  const auth = headers.get("authorization") || "";
  const header = headers.get("x-hirvana-admin-secret") || "";
  return adminMatchesSecret(secret, auth, header);
}
