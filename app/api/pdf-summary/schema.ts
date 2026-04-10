import { z } from "zod";

/** How a value sits vs the stated reference — educational only, not a diagnosis. */
export const labMarkerStatusSchema = z.enum([
  "below",
  "normal",
  "high_normal",
  "critical",
  "unknown",
]);

export const labMarkerSchema = z.object({
  name: z.string().min(1).describe("Full test name as in the document."),
  abbreviation: z
    .string()
    .nullable()
    .describe("Short code e.g. TSH, WBC; null if none."),
  valueText: z
    .string()
    .nullable()
    .describe("Numeric or text result as printed."),
  unit: z.string().nullable(),
  referenceRangeText: z
    .string()
    .nullable()
    .describe("Reference interval from the document if present."),
  status: labMarkerStatusSchema.describe(
    "below=under ref; normal=in range; high_normal=high-normal/borderline; critical=dangerously off; unknown=not classifiable."
  ),
  termExplanation: z
    .string()
    .min(1)
    .describe("What this test measures, in plain language."),
  interpretation: z
    .string()
    .min(1)
    .describe("Brief educational read of this result vs ref; no diagnosis."),
});

export const glossaryEntrySchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
});

export const pdfNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).describe("Short node label."),
  detail: z
    .string()
    .min(1)
    .describe("1–3 sentences expanding the node."),
});

export const pdfEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  label: z
    .string()
    .nullable()
    .describe("Optional edge label; use null if none."),
});

export const pdfSummarySchema = z.object({
  title: z.string().min(1).describe("Short title for the document."),
  summary: z
    .string()
    .min(1)
    .describe("Concise overall summary in plain language, no markdown."),
  isLabHeavy: z
    .boolean()
    .describe("True if the PDF is mainly lab/chemistry results."),
  labMarkers: z
    .array(labMarkerSchema)
    .max(45)
    .describe(
      "Each distinct lab value found; empty array if not a lab-style document."
    ),
  healthTips: z
    .array(z.string().min(1))
    .max(12)
    .describe(
      "Practical, general wellness tips tied to the results (no prescriptions)."
    ),
  keyTerms: z
    .array(glossaryEntrySchema)
    .max(28)
    .describe(
      "Important medical terms from the document with short definitions."
    ),
  nodes: z
    .array(pdfNodeSchema)
    .min(0)
    .max(20)
    .describe(
      "Concept-map nodes; use 0 if not useful, otherwise 3+ key ideas."
    ),
  edges: z
    .array(pdfEdgeSchema)
    .max(40)
    .describe("Relationships between nodes; empty if nodes empty."),
})
  .refine(
    (o) => o.nodes.length > 0 || o.edges.length === 0,
    { message: "edges must be empty when nodes are empty." }
  );

export type PdfSummary = z.infer<typeof pdfSummarySchema>;
export type LabMarkerStatus = z.infer<typeof labMarkerStatusSchema>;
export type LabMarker = z.infer<typeof labMarkerSchema>;
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
