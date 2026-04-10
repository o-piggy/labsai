"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  GitBranch,
  HeartPulse,
  LayoutGrid,
  Sparkles,
} from "lucide-react";

import type {
  LabMarkerStatus,
  PdfSummary,
} from "@/app/api/pdf-summary/schema";
import { PdfNodeView } from "@/components/pdf-node-view";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<LabMarkerStatus, string> = {
  below: "Below range",
  normal: "Normal",
  high_normal: "High-normal",
  critical: "Critical",
  unknown: "Unclear",
};

function statusStyles(status: LabMarkerStatus) {
  switch (status) {
    case "normal":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
    case "high_normal":
      return "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100";
    case "below":
      return "border-sky-500/35 bg-sky-500/10 text-sky-900 dark:text-sky-100";
    case "critical":
      return "border-destructive/50 bg-destructive/15 text-destructive";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

function StatusBadge({ status }: { status: LabMarkerStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("shrink-0 font-medium", statusStyles(status))}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function PdfSummaryResults({ data }: { data: PdfSummary }) {
  const [query, setQuery] = useState("");

  const filteredLabs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.labMarkers;
    return data.labMarkers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.abbreviation?.toLowerCase().includes(q) ?? false) ||
        m.termExplanation.toLowerCase().includes(q)
    );
  }, [data.labMarkers, query]);

  const statusCounts = useMemo(() => {
    const c: Record<LabMarkerStatus, number> = {
      below: 0,
      normal: 0,
      high_normal: 0,
      critical: 0,
      unknown: 0,
    };
    for (const m of data.labMarkers) c[m.status]++;
    return c;
  }, [data.labMarkers]);

  const hasMap = data.nodes.length > 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{data.title}</h2>
            <p className="text-sm text-muted-foreground">
              {data.isLabHeavy
                ? "Lab-focused report — interactive breakdown below."
                : "Document summary — explore tabs for details and terms."}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full gap-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
            <TabsTrigger value="overview" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="labs" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Results
              {data.labMarkers.length > 0 && (
                <span className="ml-0.5 rounded-md bg-background/80 px-1.5 py-0 text-[10px] font-semibold tabular-nums">
                  {data.labMarkers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="terms" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Terms
              {data.keyTerms.length > 0 && (
                <span className="ml-0.5 rounded-md bg-background/80 px-1.5 py-0 text-[10px] font-semibold tabular-nums">
                  {data.keyTerms.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              Map
            </TabsTrigger>
            <TabsTrigger value="tips" className="gap-1.5">
              <HeartPulse className="h-3.5 w-3.5" />
              Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-4">
            <Card className="overflow-hidden border-border/80">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <CardTitle className="text-base">Summary</CardTitle>
                <CardDescription>
                  Plain-language overview — not medical advice.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="whitespace-pre-wrap text-pretty text-sm leading-relaxed text-foreground/95">
                  {data.summary}
                </p>
              </CardContent>
            </Card>

            {data.labMarkers.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    At a glance
                  </CardTitle>
                  <CardDescription>
                    Counts by how values sit versus the reference on the report.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "below",
                        "normal",
                        "high_normal",
                        "critical",
                        "unknown",
                      ] as const
                    ).map((k) => (
                      <Badge
                        key={k}
                        variant="secondary"
                        className="gap-1.5 px-3 py-1 font-normal"
                      >
                        <span className="text-muted-foreground">
                          {STATUS_LABEL[k]}:
                        </span>
                        <span className="font-semibold tabular-nums">
                          {statusCounts[k]}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="labs" className="mt-0 space-y-4">
            {data.labMarkers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No structured lab table was detected in this PDF. Check the
                  summary and terms tabs, or try a clearer lab report export.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Expand a row for what the test measures and how to read your
                    value.
                  </p>
                  <Input
                    placeholder="Filter tests…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                <Accordion type="multiple" className="space-y-3">
                  {filteredLabs.map((m, idx) => (
                    <AccordionItem
                      key={`${m.name}-${idx}`}
                      value={`m-${idx}`}
                      className="overflow-hidden rounded-xl border border-border/80 bg-card"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline [&>svg]:mt-1">
                        <div className="flex w-full flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between sm:pr-4">
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold leading-tight">
                                {m.name}
                              </span>
                              {m.abbreviation && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="font-mono text-[11px]"
                                    >
                                      {m.abbreviation}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    Abbreviation as printed on the report.
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                              <span>
                                <span className="text-foreground/90">
                                  {m.valueText ?? "—"}
                                </span>
                                {m.unit ? ` ${m.unit}` : ""}
                              </span>
                              {m.referenceRangeText && (
                                <span className="text-xs">
                                  Ref: {m.referenceRangeText}
                                </span>
                              )}
                            </div>
                          </div>
                          <StatusBadge status={m.status} />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-border/60 bg-muted/15 px-4 pb-4">
                        <div className="space-y-3 pt-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              What it is
                            </div>
                            <p className="mt-1 text-sm leading-relaxed">
                              {m.termExplanation}
                            </p>
                          </div>
                          <Separator />
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              How to read this result
                            </div>
                            <p className="mt-1 text-sm leading-relaxed">
                              {m.interpretation}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {filteredLabs.length === 0 && query && (
                  <p className="text-center text-sm text-muted-foreground">
                    No tests match “{query}”.
                  </p>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="terms" className="mt-0">
            {data.keyTerms.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No glossary terms were extracted. Try a text-based PDF.
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[min(60vh,520px)] rounded-xl border border-border/80">
                <div className="space-y-0 p-1">
                  {data.keyTerms.map((t, i) => (
                    <div
                      key={`${t.term}-${i}`}
                      className="border-b border-border/50 px-4 py-3 last:border-b-0"
                    >
                      <div className="font-medium text-foreground">{t.term}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {t.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            {hasMap ? (
              <PdfNodeView summary={data} />
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No concept map for this document.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tips" className="mt-0">
            {data.healthTips.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No tips generated. Follow your clinician&apos;s advice.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Health tips</CardTitle>
                  <CardDescription>
                    General wellness ideas tied to your report — not treatment
                    instructions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {data.healthTips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Educational use only. LabAI does not diagnose or treat. Always follow
          your healthcare provider for medical decisions.
        </p>
      </div>
    </TooltipProvider>
  );
}
