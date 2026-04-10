"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import {
  FlaskConical,
  Send,
  RotateCcw,
  ClipboardPaste,
  Bot,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
// Default model is Gemini 2.5 Flash (configured in lib/ai/models.ts).
import {
  getLabGlossaryRegex,
  LAB_GLOSSARY_TIP_BY_LOWER,
} from "@/lib/lab-glossary";

const STARTER_PROMPTS = [
  "My CBC shows WBC: 11.2, RBC: 4.8, Hemoglobin: 14.2, Hematocrit: 42%, Platelets: 250",
  "TSH: 5.8 mIU/L, Free T4: 0.9 ng/dL, Free T3: 2.8 pg/mL",
  "Total Cholesterol: 220, LDL: 145, HDL: 42, Triglycerides: 180",
  "Fasting Glucose: 108 mg/dL, HbA1c: 6.1%",
];

type PointNode = {
  id: string;
  kind: "title" | "result" | "point" | "note";
  text: string;
};

function hashId(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function isSeparatorLine(line: string) {
  // Hindari pembatas ---, --, garis panjang, dll.
  if (/^[\s\-–—_=~*]{3,}$/.test(line)) return true;
  if (/^[\s\-–—_=~*]+$/.test(line) && line.replace(/[\s\-–—_=~*]/g, "").length === 0)
    return true;
  return false;
}

function stripOuterMarkdownNoise(line: string) {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/^\*\*\s*/, "")
    .replace(/\s*\*\*$/, "");
}

/** Baris hasil tes: "Nama (panjang) : Your Result …" */
function isResultHeaderLine(line: string) {
  return /:\s*Your Result\b/i.test(line) || /\bYour Result\s*:/i.test(line);
}

function parseBoldParts(input: string): { bold: boolean; text: string }[] {
  const out: { bold: boolean; text: string }[] = [];
  let i = 0;
  while (i < input.length) {
    if (input.slice(i, i + 2) === "**") {
      const end = input.indexOf("**", i + 2);
      if (end === -1) {
        out.push({ bold: false, text: input.slice(i) });
        break;
      }
      out.push({ bold: true, text: input.slice(i + 2, end) });
      i = end + 2;
    } else {
      const next = input.indexOf("**", i);
      const end = next === -1 ? input.length : next;
      out.push({ bold: false, text: input.slice(i, end) });
      i = end;
    }
  }
  if (out.length === 0) out.push({ bold: false, text: input });
  return out;
}

function removeStrayAsterisks(s: string) {
  return s.replace(/\*\*/g, "");
}

function parseLinesToNodes(
  lines: string[],
  groupKey: string | number
): PointNode[] {
  const nodes: PointNode[] = [];
  for (const line of lines) {
    if (isSeparatorLine(line)) continue;

    const heading = line.match(/^#{2,6}\s+(.*)$/);
    if (heading) {
      nodes.push({
        id: `t_${groupKey}_${hashId(line)}`,
        kind: "title",
        text: heading[1].trim(),
      });
      continue;
    }

    const cleaned = stripOuterMarkdownNoise(line);
    if (!cleaned) continue;

    const bullet = cleaned.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      nodes.push({
        id: `p_${groupKey}_${hashId(line)}`,
        kind: "point",
        text: bullet[1].trim(),
      });
      continue;
    }

    if (isResultHeaderLine(cleaned)) {
      nodes.push({
        id: `r_${groupKey}_${hashId(line)}`,
        kind: "result",
        text: cleaned,
      });
      continue;
    }

    nodes.push({
      id: `p_${groupKey}_${hashId(line)}`,
      kind: "point",
      text: cleaned,
    });
  }

  return nodes;
}

/** Pisah blok setelah baris hasil: intro → rentang & interpretasi → faktor lain. */
function splitRestByRefAndCaveats(rest: PointNode[]): PointNode[][] {
  if (rest.length === 0) return [];

  const refIdx = rest.findIndex(
    (n) =>
      /\btypical reference range\b|\breference range\b.*\b(often|around|usually|can vary|vary slightly)\b/i.test(
        n.text
      ) || /\b0\.\d+\s+to\s+\d/i.test(n.text)
  );
  const caveIdx = rest.findIndex((n) =>
    /^(Factors like|Other factors|Certain medications|Additionally,|It'?s also worth)/i.test(
      n.text.trim()
    )
  );

  if (refIdx === -1) {
    return [rest];
  }

  const out: PointNode[][] = [];
  if (refIdx > 0) {
    out.push(rest.slice(0, refIdx));
  }
  const endMid = caveIdx === -1 ? rest.length : caveIdx;
  out.push(rest.slice(refIdx, endMid));
  if (caveIdx !== -1 && caveIdx < rest.length) {
    out.push(rest.slice(caveIdx));
  }
  return out.filter((g) => g.length > 0);
}

function clusterSingleBlockNodes(nodes: PointNode[]): PointNode[][] {
  const note = nodes.find((n) => n.kind === "note");
  const core = note ? nodes.filter((n) => n.kind !== "note") : [...nodes];

  const groups: PointNode[][] = [];
  if (core.length === 0) {
    if (note) return [[note]];
    return [];
  }

  if (core[0]?.kind === "result") {
    groups.push([core[0]]);
    const rest = core.slice(1);
    if (rest.length) {
      groups.push(...splitRestByRefAndCaveats(rest));
    }
  } else {
    groups.push(...splitRestByRefAndCaveats(core));
  }

  if (note) {
    if (groups.length === 0) groups.push([]);
    groups[groups.length - 1].push(note);
  }
  return groups.filter((g) => g.length > 0);
}

function toGroupedPointNodes(text: string): PointNode[][] {
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length >= 2) {
    const groups: PointNode[][] = [];
    for (let i = 0; i < paragraphs.length; i++) {
      const lines = paragraphs[i]
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const groupNodes = parseLinesToNodes(lines, `para_${i}`);
      if (groupNodes.length) groups.push(groupNodes);
    }
    return groups.filter((g) => g.length > 0);
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const nodes = parseLinesToNodes(lines, 0);
  return clusterSingleBlockNodes(nodes);
}

function isJunkAssistantReply(raw: string) {
  const t = raw.trim();
  if (!t) return true;

  // Filter balasan “template” yang tidak diinginkan (greeting + disclaimer panjang).
  const greeting =
    /^hello\b|^hi\b|^halo\b|^hai\b|^selamat\b/i.test(t) &&
    /(thank you|terima kasih|sharing your lab results|hasil lab)/i.test(t);

  const longDisclaimer =
    /(i'?m an ai|i am an ai|not a medical doctor|educational purposes only|bukan dokter|hanya untuk tujuan edukasi)/i.test(
      t
    ) &&
    t.length > 140;

  // Jika isinya cuma disclaimer tanpa data tes, sembunyikan.
  const mentionsTest =
    /\bTSH\b|\bFree T4\b|\bFree T3\b|\bHbA1c\b|\bCBC\b|\bWBC\b|\bRBC\b|\bLDL\b|\bHDL\b/i.test(
      t
    ) || /Your Result/i.test(t);

  if ((greeting || longDisclaimer) && !mentionsTest) return true;
  if (longDisclaimer && !/Your Result/i.test(t)) return true;
  return false;
}

function renderWithTooltips(text: string): ReactNode {
  const re = getLabGlossaryRegex();
  re.lastIndex = 0;
  const parts: React.ReactNode[] = [];

  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const matched = m[1];
    const start = m.index;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));

    const tip = LAB_GLOSSARY_TIP_BY_LOWER.get(matched.toLowerCase());
    if (tip) {
      parts.push(
        <Tooltip key={`${start}_${matched}`}>
          <TooltipTrigger asChild>
            <span
              className="cursor-help underline decoration-dotted decoration-primary/80 underline-offset-[3px]"
            >
              {matched}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-sm text-left text-xs leading-snug"
          >
            {tip}
          </TooltipContent>
        </Tooltip>
      );
    } else {
      parts.push(matched);
    }

    lastIndex = start + matched.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  if (parts.length === 0) return text;
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

/** Teks biasa: **bold** → <strong>, tanpa menampilkan asterisk; lalu tooltip istilah. */
function renderLineWithBoldAndTooltips(text: string): ReactNode {
  const segments = parseBoldParts(text).map((s) => ({
    ...s,
    text: removeStrayAsterisks(s.text),
  }));
  const hasBold = segments.some((s) => s.bold);
  if (!hasBold) return renderWithTooltips(segments[0]?.text ?? text);

  return (
    <>
      {segments.map((part, idx) => {
        const inner = renderWithTooltips(part.text);
        return part.bold ? (
          <strong key={idx} className="font-semibold text-foreground">
            {inner}
          </strong>
        ) : (
          <span key={idx}>{inner}</span>
        );
      })}
    </>
  );
}

export function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    []
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleReset = () => {
    setMessages([]);
    setInputValue("");
  };

  const isEmpty = messages.length === 0;

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur">
        <div className="container mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-sm font-semibold">Lab Result Analyzer</h1>
              <p className="text-xs text-muted-foreground">
                Paste your results and ask questions
              </p>
            </div>
          </div>
          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-5xl">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-8 pt-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FlaskConical className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold">
                  What do your lab results mean?
                </h2>
                <p className="max-w-md text-muted-foreground">
                  Paste your lab values below or use one of these examples to
                  get started.
                </p>
              </div>

              <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleStarterPrompt(prompt)}
                    className="rounded-lg border border-border/70 bg-card p-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-foreground"
                  >
                    <ClipboardPaste className="mb-1.5 h-3.5 w-3.5" />
                    {prompt}
                  </button>
                ))}
              </div>

            </div>
          ) : (
            <>
              <div className="mx-auto flex w-full max-w-full flex-col items-center gap-4 px-2">
                {messages.map((message) => {
                  const raw =
                    message.parts
                      .map((p) => (p.type === "text" ? p.text : ""))
                      .join("")
                      .trim() || "";

                  if (message.role === "user") {
                    return (
                      <div key={message.id} className="w-full">
                        <div className="mx-auto w-fit max-w-full rounded-full border border-border/70 bg-muted/60 px-4 py-2 text-center text-sm text-foreground shadow-sm">
                          <span className="mr-2 inline-flex align-middle text-muted-foreground">
                            <User className="h-4 w-4" />
                          </span>
                          <span className="align-middle">{raw}</span>
                        </div>
                      </div>
                    );
                  }

                  if (isJunkAssistantReply(raw)) return null;
                  const nodeGroups = toGroupedPointNodes(raw);
                  return (
                    <div key={message.id} className="w-full">
                      <div className="mx-auto mb-2 flex w-fit items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                        <Bot className="h-3 w-3" />
                        <span className="font-medium">LabAI</span>
                      </div>

                      <div className="mx-auto flex w-full max-w-[60vw] flex-col gap-6 sm:gap-8">
                        {nodeGroups.map((group, gi) => (
                          <div
                            key={`g_${message.id}_${gi}`}
                            className="flex flex-col gap-0.5 rounded-xl border border-border/55 bg-card/25 p-1.5 ring-1 ring-foreground/5"
                          >
                            {group.map((n) => (
                              <Card
                                key={n.id}
                                size="sm"
                                className={cn(
                                  "w-full min-w-0 gap-0 rounded-md border-0 bg-muted/15 py-0 text-[13px] shadow-none backdrop-blur",
                                  "transition-colors hover:bg-muted/25",
                                  n.kind === "title" && "bg-muted/20",
                                  n.kind === "result" && "bg-primary/8 ring-1 ring-primary/15",
                                  n.kind === "note" &&
                                    "bg-amber-500/[0.06] ring-1 ring-amber-500/15"
                                )}
                              >
                                <CardContent className="px-2 py-1">
                                  {n.kind === "title" ? (
                                    <div className="text-pretty text-sm font-semibold leading-relaxed break-words">
                                      {renderLineWithBoldAndTooltips(n.text)}
                                    </div>
                                  ) : n.kind === "result" ? (
                                    <div className="text-pretty text-sm font-medium leading-relaxed break-words">
                                      {renderLineWithBoldAndTooltips(n.text)}
                                    </div>
                                  ) : n.kind === "note" ? (
                                    <div className="text-pretty text-[11px] leading-relaxed break-words text-amber-700 dark:text-amber-300">
                                      {n.text}
                                    </div>
                                  ) : (
                                    <div className="text-pretty text-[13px] leading-relaxed break-words text-foreground/95">
                                      {renderLineWithBoldAndTooltips(n.text)}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isLoading && (
                <div className="mx-auto mt-2 flex w-full max-w-[60vw] flex-col gap-1.5">
                  <Card className="w-full gap-0 rounded-lg border border-border/60 bg-card/80 py-0 shadow-none">
                    <CardContent className="px-2 py-1">
                      <div className="space-y-1.5">
                        <Skeleton className="h-2.5 w-40" />
                        <Skeleton className="h-2.5 w-52" />
                        <Skeleton className="h-2.5 w-36" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="w-full gap-0 rounded-lg border border-border/60 bg-card/80 py-0 shadow-none">
                    <CardContent className="px-2 py-1">
                      <div className="space-y-1.5">
                        <Skeleton className="h-2.5 w-36" />
                        <Skeleton className="h-2.5 w-48" />
                        <Skeleton className="h-2.5 w-40" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Something went wrong. Please check your API key configuration
                    and try again.
                  </span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator />

      {/* Input area */}
      <div className="bg-background px-4 py-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your lab results here or ask a question... (e.g. 'My glucose is 112 mg/dL, what does that mean?')"
              disabled={isLoading}
              rows={2}
              className="min-h-0 resize-none py-2 text-sm leading-snug"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-10 w-10 shrink-0 self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
