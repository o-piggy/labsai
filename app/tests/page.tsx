import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Common Lab Tests – LabAI",
  description: "Learn about the most common laboratory tests and what they measure.",
};

const testCategories = [
  {
    category: "Blood Count",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    tests: [
      {
        name: "Complete Blood Count (CBC)",
        abbreviation: "CBC",
        description:
          "Measures different components of blood including red blood cells, white blood cells, hemoglobin, hematocrit, and platelets.",
        measures: ["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets", "MCV", "MCH"],
        whyDone: "Screens for anemia, infection, inflammation, and blood disorders.",
      },
      {
        name: "Hemoglobin A1c",
        abbreviation: "HbA1c",
        description:
          "Reflects average blood sugar levels over the past 2-3 months by measuring the percentage of hemoglobin coated with glucose.",
        measures: ["HbA1c %"],
        whyDone: "Diagnoses and monitors diabetes and prediabetes.",
      },
    ],
  },
  {
    category: "Metabolic",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    tests: [
      {
        name: "Basic Metabolic Panel",
        abbreviation: "BMP",
        description:
          "Checks blood chemistry to evaluate kidney function, fluid balance, blood sugar, and electrolytes.",
        measures: ["Glucose", "Calcium", "Sodium", "Potassium", "CO2", "Chloride", "BUN", "Creatinine"],
        whyDone: "Screens for kidney disease, diabetes, and electrolyte imbalances.",
      },
      {
        name: "Comprehensive Metabolic Panel",
        abbreviation: "CMP",
        description:
          "Expands the BMP to also include liver function tests, giving a broader view of organ health.",
        measures: ["All BMP values", "ALT", "AST", "ALP", "Bilirubin", "Albumin", "Total Protein"],
        whyDone: "Evaluates kidney and liver function, electrolytes, and blood sugar.",
      },
      {
        name: "Liver Function Tests",
        abbreviation: "LFT",
        description:
          "Measures enzymes and proteins to assess how well your liver is working.",
        measures: ["ALT", "AST", "ALP", "GGT", "Bilirubin", "Albumin", "Prothrombin Time"],
        whyDone: "Detects liver damage, disease, or dysfunction.",
      },
    ],
  },
  {
    category: "Lipids & Heart",
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    tests: [
      {
        name: "Lipid Panel",
        abbreviation: "Lipids",
        description:
          "Measures fats (lipids) in your blood to assess cardiovascular disease risk.",
        measures: ["Total Cholesterol", "LDL", "HDL", "Triglycerides", "VLDL"],
        whyDone: "Evaluates risk of heart disease and stroke.",
      },
      {
        name: "C-Reactive Protein",
        abbreviation: "CRP / hsCRP",
        description:
          "Measures inflammation in the body. High-sensitivity CRP is used specifically for cardiovascular risk.",
        measures: ["CRP mg/L"],
        whyDone: "Detects inflammation and assesses cardiovascular risk.",
      },
    ],
  },
  {
    category: "Thyroid",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    tests: [
      {
        name: "Thyroid Stimulating Hormone",
        abbreviation: "TSH",
        description:
          "Measures how well your thyroid gland is working. It is the primary screening test for thyroid disorders.",
        measures: ["TSH mIU/L"],
        whyDone: "Screens for underactive (hypothyroid) or overactive (hyperthyroid) thyroid.",
      },
      {
        name: "Thyroid Panel",
        abbreviation: "T3/T4",
        description:
          "More detailed look at thyroid hormones. Free T4 and Free T3 show how much active hormone is available.",
        measures: ["TSH", "Free T4", "Free T3", "Total T4", "Total T3"],
        whyDone: "Diagnoses thyroid disease and monitors thyroid treatment.",
      },
    ],
  },
  {
    category: "Vitamins & Minerals",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    tests: [
      {
        name: "Vitamin D",
        abbreviation: "25-OH Vit D",
        description:
          "Measures 25-hydroxyvitamin D, the main form of vitamin D stored in the body.",
        measures: ["25-OH Vitamin D ng/mL"],
        whyDone: "Checks for vitamin D deficiency, which affects bone health and immunity.",
      },
      {
        name: "Vitamin B12 & Folate",
        abbreviation: "B12/Folate",
        description:
          "Measures levels of vitamin B12 and folic acid, both essential for red blood cell production and nerve function.",
        measures: ["Vitamin B12 pg/mL", "Folate ng/mL"],
        whyDone: "Diagnoses deficiencies that cause anemia and neurological symptoms.",
      },
      {
        name: "Iron Studies",
        abbreviation: "Iron Panel",
        description:
          "Evaluates iron levels and storage in the body to diagnose different types of iron disorders.",
        measures: ["Serum Iron", "TIBC", "Ferritin", "Transferrin Saturation"],
        whyDone: "Diagnoses iron deficiency anemia or iron overload conditions.",
      },
    ],
  },
  {
    category: "Diabetes",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    tests: [
      {
        name: "Fasting Blood Glucose",
        abbreviation: "FBG",
        description:
          "Measures blood sugar after an overnight fast. One of the most common tests to screen for diabetes.",
        measures: ["Glucose mg/dL"],
        whyDone: "Screens for diabetes and prediabetes.",
      },
      {
        name: "Insulin & C-Peptide",
        abbreviation: "Insulin",
        description:
          "Measures how much insulin the pancreas is producing. C-peptide reflects insulin production more accurately.",
        measures: ["Fasting Insulin µIU/mL", "C-Peptide ng/mL"],
        whyDone: "Evaluates insulin resistance, type 1 vs type 2 diabetes, and pancreatic function.",
      },
    ],
  },
];

export default function TestsPage() {
  return (
    <div className="min-h-screen px-4 pb-16 pt-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold">Common Lab Tests Explained</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Learn what the most common laboratory tests measure, why doctors
            order them, and what the values represent. Select any test to ask
            the AI about your specific results.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Reference ranges below are general guidelines. Normal values can
            vary between labs, patient age, sex, and other factors. Always
            interpret results in the context of your full clinical picture with
            your healthcare provider.
          </span>
        </div>

        {/* Test Categories */}
        <div className="space-y-10">
          {testCategories.map((category) => (
            <div key={category.category}>
              <div className="mb-4 flex items-center gap-3">
                <Badge variant="outline" className={category.color}>
                  {category.category}
                </Badge>
                <Separator className="flex-1" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.tests.map((test) => (
                  <Card
                    key={test.name}
                    className="flex flex-col transition-colors hover:border-primary/50"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight">
                          {test.name}
                        </CardTitle>
                        <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                          {test.abbreviation}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3">
                      <p className="text-sm text-muted-foreground">
                        {test.description}
                      </p>

                      <div>
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                          Measures
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {test.measures.map((m) => (
                            <Badge key={m} variant="outline" className="text-xs">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Why ordered: </span>
                        {test.whyDone}
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-auto gap-1.5"
                      >
                        <Link
                          href={`/chat?test=${encodeURIComponent(test.name)}`}
                        >
                          Ask AI about this test
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Don&apos;t see your test here? Ask LabAI directly.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/chat">
              Analyze My Results
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
