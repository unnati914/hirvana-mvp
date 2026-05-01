import { getFeatureById, patchFeature } from "../../../lib/features-store";
import { isAdminAuthorized } from "../../../lib/admin-auth";

export default async function handler(req, res) {
  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid feature id" });
  }

  if (req.method === "GET") {
    try {
      const feature = await getFeatureById(id);
      if (!feature) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ feature });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Could not load feature" });
    }
  }

  if (req.method === "PATCH") {
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({
        error: "Unauthorized or admin secret not set (HIRVANA_ADMIN_SECRET or FEATURES_WRITE_SECRET)",
      });
    }
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
      const updated = await patchFeature(id, {
        status: body?.status,
        title: body?.title,
        description: body?.description,
      });
      if (!updated) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ feature: updated });
    } catch (e) {
      return res.status(400).json({ error: e.message || "Invalid patch" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
