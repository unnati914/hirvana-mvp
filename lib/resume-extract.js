import mammoth from "mammoth";
import { normalizeResumeText } from "./resume-normalize.js";

export { normalizeResumeText } from "./resume-normalize.js";

export function extFromFilename(name) {
  const n = String(name || "").toLowerCase();
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i) : "";
}

/**
 * @param {Buffer} buffer
 * @param {string} ext — lowercase extension including dot, e.g. ".pdf"
 */
export async function extractTextFromBuffer(buffer, ext) {
  const e = ext.toLowerCase();
  if (e === ".txt" || e === ".md" || e === ".markdown") {
    return normalizeResumeText(buffer.toString("utf8"));
  }
  if (e === ".docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return normalizeResumeText(value);
  }
  if (e === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return normalizeResumeText(result.text || "");
    } finally {
      await parser.destroy().catch(() => {});
    }
  }
  throw new Error(`Unsupported extension: ${ext}`);
}
