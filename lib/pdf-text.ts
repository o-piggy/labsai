import { createWorker } from "tesseract.js";
import { extractText, getDocumentProxy, renderPageAsImage } from "unpdf";

const DEFAULT_OCR_MAX_PAGES = 5;
/** Max width (px) for rendered page images — keeps OCR memory/time reasonable on Vercel. */
const OCR_PAGE_MAX_WIDTH = 1400;

function getOcrMaxPages(): number {
  const raw = process.env.PDF_OCR_MAX_PAGES;
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_OCR_MAX_PAGES;
  if (!Number.isFinite(n) || n < 1) return DEFAULT_OCR_MAX_PAGES;
  return Math.min(n, 12);
}

/**
 * Text extraction: unpdf (PDF.js) first, then light OCR on rasterized pages (Tesseract.js).
 * OCR only runs when embedded text is empty, for up to `PDF_OCR_MAX_PAGES` pages.
 * (pdf-parse was removed — it bundled a conflicting pdfjs copy that broke Next.js webpack.)
 */
export async function extractPdfTextForSummary(buffer: Buffer): Promise<string> {
  try {
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    const merged = (text ?? "").trim();
    if (merged.length > 0) {
      return text ?? "";
    }
  } catch {
    // Fall through to OCR.
  }

  try {
    return await ocrPdfPagesLight(buffer);
  } catch (err) {
    console.error("pdf-summary: OCR failed", err);
    return "";
  }
}

async function ocrPdfPagesLight(buffer: Buffer): Promise<string> {
  const maxPages = getOcrMaxPages();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const pagesToRead = Math.min(pdf.numPages, maxPages);

  const canvasImport = () => import("@napi-rs/canvas");
  const worker = await createWorker("eng");
  const parts: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pagesToRead; pageNumber++) {
      const imageAb = await renderPageAsImage(pdf, pageNumber, {
        canvasImport,
        width: OCR_PAGE_MAX_WIDTH,
      });
      const { data } = await worker.recognize(Buffer.from(imageAb));
      const pageText = data.text?.trim();
      if (pageText) parts.push(pageText);
    }
  } finally {
    await worker.terminate();
    await pdf.destroy();
  }

  return parts.join("\n\n");
}
