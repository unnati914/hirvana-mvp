import { getFeatureById } from "../../lib/features-store";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const resumeFeature = await getFeatureById("resume-ai");
    res.status(200).json({
      message: "Resume API — free hub at /resume; extract text from uploads; POST /api/resume/optimize for full pass.",
      hasOpenAi: Boolean(process.env.OPENAI_API_KEY?.trim()),
      feature: resumeFeature
        ? { id: resumeFeature.id, title: resumeFeature.title, status: resumeFeature.status }
        : null,
      routes: {
        extract: { method: "POST", path: "/api/resume/extract", note: "multipart file → text (PDF, DOCX, TXT)" },
        optimize: { method: "POST", path: "/api/resume/optimize", note: "Public; optional OpenAI on server" },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not load feature" });
  }
}
