"use client";

import { useMemo, useState } from "react";
import { FileText, Loader2, Sparkles, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PdfSummaryResults } from "@/components/pdf-summary-results";
import type { PdfSummary } from "@/app/api/pdf-summary/schema";

type Status = "idle" | "uploading" | "done" | "error";

export function PdfSummaryClient() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PdfSummary | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) return "Choose a PDF file…";
    return `${file.name} (${Math.ceil(file.size / 1024)} KB)`;
  }, [file]);

  async function handleSubmit() {
    if (!file) return;

    setStatus("uploading");
    setError(null);
    setSummary(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pdf-summary", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string; detail?: string }
          | null;
        const extra =
          process.env.NODE_ENV === "development" && body?.detail
            ? `\n\nDetail: ${body.detail}`
            : "";
        throw new Error((body?.error || `Request failed (${res.status})`) + extra);
      }

      const data = (await res.json()) as PdfSummary;
      setSummary(data);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
  }

  return (
    <div className="min-h-screen px-4 pb-16 pt-10">
      <div className="container mx-auto max-w-5xl space-y-6">
        <div className="space-y-2 text-center">
          <Badge variant="secondary" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            PDF Summary
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Lab reports, explained interactively
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Upload a PDF — get a structured summary, per-test explanations,
            range ratings, a term glossary, optional concept map, and practical
            tips. Educational only; not a substitute for your clinician.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <div className="text-sm font-medium">PDF file</div>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <div className="text-xs text-muted-foreground">{fileLabel}</div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!file || status === "uploading"}
                className="gap-2"
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Summarizing…
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {summary && (
          <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card/80 to-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Analysis ready — explore the tabs below.
            </div>
            <PdfSummaryResults data={summary} />
          </div>
        )}
      </div>
    </div>
  );
}

