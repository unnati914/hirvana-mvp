import formidable from "formidable";
import { readFile, unlink } from "fs/promises";
import { extFromFilename, extractTextFromBuffer } from "../../../lib/resume-extract";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_BYTES = 3 * 1024 * 1024;
const MAX_CHARS = 14_000;
const ALLOWED = new Set([".pdf", ".docx", ".txt", ".md", ".markdown"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    maxFileSize: MAX_BYTES,
    allowEmptyFiles: false,
    maxFiles: 1,
  });

  let files;
  try {
    [, files] = await form.parse(req);
  } catch (err) {
    const msg = String(err?.message || "");
    if (err?.code === "LIMIT_FILE_SIZE" || msg.toLowerCase().includes("max file")) {
      return res.status(400).json({ error: "File too large (max 3 MB)." });
    }
    console.error("formidable", err);
    return res.status(400).json({ error: "Could not read upload. Use field name \"file\"." });
  }

  const file = files.file?.[0] || files.resume?.[0];
  if (!file) {
    return res.status(400).json({ error: "No file received. Send multipart field \"file\"." });
  }

  const ext = extFromFilename(file.originalFilename || "");
  if (!ALLOWED.has(ext)) {
    await unlink(file.filepath).catch(() => {});
    return res.status(400).json({
      error: "Unsupported format. Use PDF, DOCX, or TXT (Word .doc is not supported — save as DOCX).",
    });
  }

  let buffer;
  try {
    buffer = await readFile(file.filepath);
  } finally {
    await unlink(file.filepath).catch(() => {});
  }

  let text;
  try {
    text = await extractTextFromBuffer(buffer, ext);
  } catch (e) {
    console.error("extractTextFromBuffer", e?.message || e);
    const hint =
      ext.toLowerCase() === ".pdf"
        ? "PDF could not be parsed (try “Save as” text-based PDF, export DOCX, or paste plain text)."
        : "Could not read text from this file. Try another format or paste plain text.";
    return res.status(422).json({ error: hint });
  }

  text = text.trim();
  if (text.length < 40) {
    return res.status(422).json({
      error:
        "Very little text was extracted (scanned image PDFs often fail). Try DOCX/TXT or paste your resume.",
    });
  }

  let truncated = false;
  if (text.length > MAX_CHARS) {
    text = text.slice(0, MAX_CHARS);
    truncated = true;
  }

  return res.status(200).json({
    text,
    filename: file.originalFilename || "resume",
    charCount: text.length,
    truncated,
  });
}
