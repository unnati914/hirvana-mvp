export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(200).json({
    ok: true,
    service: "hirvana-mvp",
    time: new Date().toISOString(),
  });
}
