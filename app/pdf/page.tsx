import type { Metadata } from "next";
import { PdfSummaryClient } from "./pdf-summary-client";

export const metadata: Metadata = {
  title: "PDF Summary – LabAI",
  description:
    "Upload a lab PDF for an interactive summary, per-test explanations, ratings, glossary, and tips.",
};

export default function PdfPage() {
  return <PdfSummaryClient />;
}

