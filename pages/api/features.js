import { getFeatures, saveFeatures } from "../../lib/features-store";
import { isAdminAuthorized } from "../../lib/admin-auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const features = await getFeatures();
      return res.status(200).json({ features });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Could not load features" });
    }
  }

  if (req.method === "PUT") {
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({
        error: "Unauthorized or admin secret not set (HIRVANA_ADMIN_SECRET or FEATURES_WRITE_SECRET)",
      });
    }
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
      const features = await saveFeatures(body?.features);
      return res.status(200).json({ features });
    } catch (e) {
      return res.status(400).json({ error: e.message || "Invalid payload" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: "Method not allowed" });
}
