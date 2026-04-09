"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "My CBC shows WBC: 11.2, RBC: 4.8, Hemoglobin: 14.2, Hematocrit: 42%, Platelets: 250",
  "TSH: 5.8 mIU/L, Free T4: 0.9 ng/dL, Free T3: 2.8 pg/mL",
  "Total Cholesterol: 220, LDL: 145, HDL: 42, Triglycerides: 180",
  "Fasting Glucose: 108 mg/dL, HbA1c: 6.1%",
];

export function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
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
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur">
        <div className="container mx-auto flex max-w-4xl items-center justify-between">
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
        <div className="container mx-auto max-w-4xl space-y-6">
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

              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  LabAI is for educational purposes only. Always consult a
                  qualified healthcare provider for medical advice and diagnosis.
                </span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <Card
                    className={cn(
                      "max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card"
                    )}
                  >
                    <CardContent className="p-3">
                      {message.role === "assistant" && (
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <Badge variant="secondary" className="h-5 text-[10px]">
                            LabAI
                          </Badge>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.parts.map((part, index) =>
                          part.type === "text" ? (
                            <span key={index}>{part.text}</span>
                          ) : null
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <Card className="max-w-[80%]">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-64" />
                        <Skeleton className="h-3 w-40" />
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
              rows={3}
              className="resize-none text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-auto shrink-0 self-end px-3 py-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Press Enter to send · Shift+Enter for new line · Educational use
            only — not a substitute for medical advice
          </p>
        </div>
      </div>
    </div>
  );
}
