import { getFeatureById } from "../../lib/features-store";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const resumeFeature = await getFeatureById("resume-ai");
    res.status(200).json({
      message: "Resume AI endpoint — generation not wired yet.",
      feature: resumeFeature
        ? { id: resumeFeature.id, title: resumeFeature.title, status: resumeFeature.status }
        : null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not load feature" });
  }
}
