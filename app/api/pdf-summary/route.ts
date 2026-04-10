import { generateObject } from "ai";
import { extractPdfTextForSummary } from "@/lib/pdf-text";
import { pdfSummarySchema } from "./schema";
import { getLanguageModel } from "@/lib/ai/providers";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isQuotaError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("exceeded your current quota") ||
    m.includes("quota exceeded") ||
    m.includes("check your plan and billing") ||
    m.includes("billing details")
  );
}

function isHighDemandError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("high demand") || m.includes("please try again later");
}

function truncateForModel(input: string, maxChars: number) {
  const cleaned = input.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  return cleaned.slice(0, maxChars) + " …[truncated]";
}

export async function POST(req: Request) {
  let model;
  try {
    model = getLanguageModel(process.env.PDF_SUMMARY_MODEL);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error:
          err instanceof Error
            ? err.message
            : "AI service is not configured.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return new Response(JSON.stringify({ error: "Missing PDF file." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (file.type !== "application/pdf") {
    return new Response(JSON.stringify({ error: "File must be a PDF." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let extractedText = "";
  try {
    extractedText = await extractPdfTextForSummary(buffer);
  } catch (err) {
    console.error("pdf-summary: pdf parse failed", err);
    return new Response(
      JSON.stringify({
        error: "Could not read this PDF. Try another file.",
        ...(process.env.NODE_ENV === "development"
          ? { detail: err instanceof Error ? err.message : String(err) }
          : {}),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!extractedText.trim()) {
    return new Response(
      JSON.stringify({
        error:
          "No text could be extracted from this PDF. It may be unreadable, encrypted, or need a smaller file. Try a text-based PDF or fewer pages.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Keep prompt size predictable; PDFs can be huge.
  const docText = truncateForModel(extractedText, 18_000);

  const instructions =
    "You are helping users understand a document that may be a lab report or general medical text.\n\n" +
    "Rules:\n" +
    "- Educational only: never diagnose, prescribe, or replace a clinician.\n" +
    "- Plain language; no markdown.\n" +
    "- If the text contains lab results with values and (when present) reference ranges, set isLabHeavy=true and fill labMarkers with ONE object per distinct test/value. " +
    "Classify status: below (under reference), normal (within range), high_normal (upper-normal/borderline high), critical (dangerously far from range or explicitly flagged), unknown (missing ref or unclear). " +
    "If there are no labs, labMarkers=[].\n" +
    "- termExplanation: what the test measures. interpretation: brief educational read vs the reference — not a diagnosis.\n" +
    "- healthTips: 3–8 short, practical general tips that fit the results (diet, follow-up with doctor, hydration, etc.). No drug dosing.\n" +
    "- keyTerms: define important jargon from the document (max ~20).\n" +
    "- Concept map: if a small graph helps (themes and links), add nodes (id unique strings) and edges (source/target node ids). If not useful (e.g. pure table of numbers), set nodes=[] and edges=[].\n" +
    "- summary: overall takeaway for a lay reader.\n\n" +
    "Document text:\n" +
    docText;

  let output;
  try {
    const result = await generateObject({
      model,
      schema: pdfSummarySchema,
      prompt: instructions,
      temperature: 0,
      maxRetries: 3,
    });
    output = result.object;
  } catch (err) {
    // Fallback: Gemini models can return transient “high demand” or schema-mismatch.
    // Try a second, more conservative model to improve reliability.
    const msg = errorMessage(err);

    if (isQuotaError(msg)) {
      console.error("pdf-summary: quota exceeded", err);
      return new Response(
        JSON.stringify({
          error:
            "Gemini API quota exceeded for this API key. Check your Google AI Studio plan/billing and rate limits, or switch providers (e.g. set OPENAI_API_KEY) and try again.",
          ...(process.env.NODE_ENV === "development"
            ? { detail: msg }
            : {}),
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    if (isHighDemandError(msg)) {
      try {
        const fallbackModel = getLanguageModel("google/gemini-2.0-flash");
        const result = await generateObject({
          model: fallbackModel,
          schema: pdfSummarySchema,
          prompt: instructions,
          temperature: 0,
          maxRetries: 3,
        });
        output = result.object;
      } catch (err2) {
        console.error("pdf-summary: generateObject failed (fallback)", err2);
        const msg2 = errorMessage(err2);
        if (isQuotaError(msg2)) {
          return new Response(
            JSON.stringify({
              error:
                "Gemini API quota exceeded for this API key. Check your Google AI Studio plan/billing and rate limits, or switch providers (e.g. set OPENAI_API_KEY) and try again.",
              ...(process.env.NODE_ENV === "development"
                ? { detail: msg2 }
                : {}),
            }),
            { status: 429, headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({
            error:
              "Summary could not be generated. Check your API key and network, then try again.",
            ...(process.env.NODE_ENV === "development"
              ? { detail: msg2 }
              : {}),
          }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      console.error("pdf-summary: generateObject failed", err);
      const msg3 = errorMessage(err);
      return new Response(
        JSON.stringify({
          error:
            "Summary could not be generated. Check your API key and network, then try again.",
          ...(process.env.NODE_ENV === "development"
            ? { detail: msg3 }
            : {}),
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify(output), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

