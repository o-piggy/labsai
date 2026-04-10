import Link from "next/link";
import {
  FlaskConical,
  Brain,
  MessageCircle,
  Shield,
  ChevronRight,
  Activity,
  Microscope,
  HeartPulse,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Explanations",
    description:
      "Our AI understands hundreds of lab markers and translates medical jargon into clear, plain language anyone can understand.",
  },
  {
    icon: MessageCircle,
    title: "Conversational Interface",
    description:
      "Ask follow-up questions naturally. Get context about what's normal, what's concerning, and what steps to consider.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "No data is stored. Your lab results are processed in real time and never retained on our servers.",
  },
  {
    icon: Activity,
    title: "Range Interpretation",
    description:
      "Understand whether your values are within normal range, slightly elevated, or require attention — all in context.",
  },
  {
    icon: Microscope,
    title: "Wide Test Coverage",
    description:
      "From CBC and metabolic panels to thyroid, lipids, hormones, and more — we cover the most common lab tests.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get explanations in seconds. Stream responses mean you start reading before the AI is even done writing.",
  },
];

const steps = [
  {
    step: "01",
    title: "Paste Your Results",
    description:
      "Copy your lab report text or type specific values. No special format required.",
  },
  {
    step: "02",
    title: "AI Analyzes",
    description:
      "Our AI identifies each test, checks reference ranges, and builds a personalized explanation.",
  },
  {
    step: "03",
    title: "Understand & Ask",
    description:
      "Read your plain-language summary, then ask any follow-up questions you have.",
  },
];

const commonTests = [
  "Complete Blood Count (CBC)",
  "Comprehensive Metabolic Panel",
  "Lipid Panel",
  "Thyroid Function (TSH, T3, T4)",
  "HbA1c & Glucose",
  "Vitamin D & B12",
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <HeartPulse className="mr-1.5 h-3 w-3" />
            AI Lab Test Explainer
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Understand Your{" "}
            <span className="text-primary">Lab Results</span>{" "}
            Instantly
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Confused by your blood work? Paste your lab results and our AI
            explains every value in plain language — what it means, why it
            matters, and what to discuss with your doctor.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/chat">
                Analyze My Results
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/tests">
                <BookOpen className="h-4 w-4" />
                Browse Common Tests
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Common tests ticker */}
      <section className="border-y border-border/50 bg-muted/30 px-4 py-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Covers:
            </span>
            {commonTests.map((test) => (
              <Badge key={test} variant="outline" className="text-xs">
                {test}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              + many more
            </Badge>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">
              Three simple steps from confusion to clarity.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+2rem)] top-6 hidden h-px w-[calc(100%-4rem)] bg-border md:block" />
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-mono text-sm font-bold">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Everything You Need</h2>
            <p className="text-muted-foreground">
              Built to make medical information accessible and understandable.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group transition-colors hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <FlaskConical className="mx-auto mb-4 h-12 w-12 text-primary opacity-80" />
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Understand Your Results?
          </h2>
          <p className="mb-8 text-muted-foreground">
            No account needed. Just paste your lab values and get instant
            AI-powered explanations. Always remember to consult your doctor for
            medical advice.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/chat">
              Start Analyzing
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
