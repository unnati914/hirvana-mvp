/**
 * Admin-only routes (waitlist export, feature writes).
 * Set HIRVANA_ADMIN_SECRET, or legacy FEATURES_WRITE_SECRET.
 *
 * Send either:
 *   Authorization: Bearer <secret>
 * or
 *   x-hirvana-admin-secret: <secret>
 */
export function isAdminAuthorized(req) {
  const secret = process.env.HIRVANA_ADMIN_SECRET || process.env.FEATURES_WRITE_SECRET;
  if (!secret || typeof secret !== "string") return false;
  const auth = req.headers?.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = req.headers?.["x-hirvana-admin-secret"];
  return bearer === secret || header === secret;
}
