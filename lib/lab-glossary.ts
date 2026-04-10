/**
 * Common lab / clinical terms — underlined with hover definitions (educational, not diagnosis).
 * Longer phrases must match first (sorted in the tooltip matcher).
 */
export const LAB_GLOSSARY: Record<string, string> = {
  "Thyroid-Stimulating Hormone":
    "A pituitary hormone that tells your thyroid how much hormone to make.",
  "Thyroid-Stimulating Hormone (TSH)":
    "A pituitary hormone that tells your thyroid how much hormone to make.",
  "pituitary gland":
    "A small gland at the base of the brain that releases several hormones, including TSH.",
  "thyroid gland":
    "A butterfly-shaped gland in the neck that makes thyroid hormones (T4/T3).",
  "thyroid hormones":
    "Hormones (e.g. T4 and T3) that regulate metabolism, energy, and many body systems.",
  thyroxine: "The main thyroid hormone known as T4.",
  triiodothyronine: "An active thyroid hormone known as T3.",
  hypothyroidism:
    "Underactive thyroid; often raises TSH and may lower free thyroid hormones.",
  hyperthyroidism:
    "Overactive thyroid; often lowers TSH and may raise thyroid hormone levels.",
  messenger:
    "Here: a chemical signal (often a hormone) that carries instructions between body parts.",

  TSH: "Thyroid-stimulating hormone from the pituitary; regulates thyroid hormone production.",
  "Free T4":
    "The unbound (active-available) fraction of thyroxine (T4) in blood.",
  "Free T3":
    "The unbound (active-available) fraction of triiodothyronine (T3) in blood.",
  FT4: "Short for Free T4.",
  FT3: "Short for Free T3.",
  T4: "Thyroxine; a major thyroid hormone.",
  T3: "Triiodothyronine; a potent thyroid hormone.",
  HbA1c:
    "Average blood sugar over roughly the past 2–3 months (glycated hemoglobin).",
  A1c: "Same idea as HbA1c: a long-term blood sugar average.",
  CBC: "Complete blood count — measures blood cells (red/white/platelets).",
  BMP: "Basic metabolic panel — electrolytes and kidney markers (names vary by lab).",
  CMP: "Comprehensive metabolic panel — broader chemistry screen than a BMP.",
  "complete blood count": "Counts and sizes blood cells (CBC).",

  WBC: "White blood cells — part of the immune system.",
  RBC: "Red blood cells — carry oxygen via hemoglobin.",
  "white blood cells": "Immune cells in blood (WBC).",
  "red blood cells": "Oxygen-carrying cells in blood (RBC).",
  platelets: "Tiny cell fragments that help blood clot.",
  hemoglobin: "Oxygen-carrying protein inside red blood cells.",
  hematocrit: "Percent of blood volume made up by red blood cells.",
  MCV: "Mean corpuscular volume — average red blood cell size.",
  MCH: "Mean corpuscular hemoglobin — average hemoglobin per red cell.",
  MCHC: "Mean corpuscular hemoglobin concentration.",
  RDW: "Red cell distribution width — variation in red blood cell size.",
  MPV: "Mean platelet volume — average platelet size.",

  glucose: "Blood sugar — a main energy source; measured fasting or random.",
  "fasting glucose": "Blood sugar after fasting — used for diabetes screening.",
  "blood sugar": "Glucose concentration in blood.",
  creatinine: "A waste product from muscle; used to assess kidney filtration.",
  eGFR: "Estimated glomerular filtration rate — a kidney function estimate.",
  BUN: "Blood urea nitrogen — influenced by kidneys, hydration, and protein intake.",
  "reference range":
    "The interval a lab uses as a guide; can differ between laboratories.",
  "typical reference range":
    "A commonly cited guide range; not a diagnosis by itself.",
  "normal range":
    "Colloquial term for reference intervals; still needs clinical context.",

  ALT: "Alanine aminotransferase — a liver enzyme that can rise with liver stress.",
  AST: "Aspartate aminotransferase — enzyme in liver/muscle; needs context.",
  GGT: "Gamma-glutamyl transferase — often related to bile ducts/alcohol use.",
  ALP: "Alkaline phosphatase — bone/liver-related enzyme; pattern matters.",
  bilirubin: "A pigment from red blood cell breakdown; processed by the liver.",
  albumin: "A major blood protein made by the liver.",
  "total protein": "Total protein concentration in blood serum.",

  sodium: "A key electrolyte for fluid balance and nerve function.",
  potassium: "A key electrolyte for heart, muscle, and nerve function.",
  chloride: "An electrolyte that often tracks with sodium balance.",
  CO2: "On panels, often reflects bicarbonate / acid–base status.",
  calcium: "Mineral important for bones, nerves, and muscle signaling.",
  magnesium: "Mineral involved in nerves, muscles, and many enzymes.",
  phosphorus: "Mineral linked to bones and energy metabolism.",
  "uric acid": "Breakdown product of purines; linked to gout risk among other things.",

  cholesterol: "A blood fat used to build cells; part of a lipid panel.",
  triglycerides: "A blood fat influenced by diet and metabolism.",
  LDL: "Low-density lipoprotein — often called “bad cholesterol.”",
  HDL: "High-density lipoprotein — often called “good cholesterol.”",
  VLDL: "Very-low-density lipoprotein — carries triglycerides.",
  "non-HDL cholesterol": "Total cholesterol minus HDL — atherogenic cholesterol estimate.",

  insulin: "Hormone that helps cells take glucose out of the blood.",
  CRP: "C-reactive protein — a marker of inflammation (non-specific).",
  ESR: "Erythrocyte sedimentation rate — can rise with inflammation (non-specific).",
  ferritin: "Iron-storage protein; used to assess iron stores (interpret broadly).",
  iron: "Serum iron — part of iron deficiency/overload evaluation.",
  TIBC: "Total iron-binding capacity — helps interpret iron studies.",
  "vitamin D": "Vitamin important for bones, immunity, and many tissues.",
  B12: "Vitamin B12 — important for blood cells and nerves.",
  folate: "Folate (vitamin B9) — important for making blood cells.",

  hormone: "A chemical messenger carried by blood to regulate organ function.",
  metabolism: "How your body turns food into energy and building blocks.",
  inflammation: "The body’s response to injury or infection; can affect many labs.",
  "immune system": "Defenses against infections and foreign substances.",
  antibodies: "Proteins that recognize germs or other targets.",
  infection: "Illness caused by bacteria, viruses, fungi, or parasites.",
  pregnancy: "Many hormones and reference ranges change during pregnancy.",

  "mIU/L": "Concentration unit: milli–international units per liter.",
  "ng/dL": "Very small concentration: nanograms per deciliter.",
  "pg/mL": "Very small concentration: picograms per milliliter.",
  "mg/dL": "Common unit for glucose, lipids, and many chemistries.",
  "g/dL": "Common unit for hemoglobin and total protein.",
  "mmol/L": "SI concentration unit used in many countries.",
  "IU/L": "Enzyme activity unit: international units per liter.",
  fL: "Femtoliter — unit of red blood cell volume (size).",
  pg: "Picogram — very small mass unit (e.g., MCH).",

  "kidney function": "How well kidneys filter blood (often assessed with creatinine/eGFR).",
  "liver function":
    "How well the liver processes blood; often assessed with enzymes and bilirubin.",
  electrolytes: "Salts/minerals in blood such as sodium, potassium, and chloride.",
};

/** Longest phrases first so regex alternation matches “Free T4” before “T4”. */
export const LAB_GLOSSARY_KEY_LONGEST_FIRST = Object.keys(LAB_GLOSSARY).sort(
  (a, b) => b.length - a.length
);

export const LAB_GLOSSARY_TIP_BY_LOWER = new Map(
  Object.entries(LAB_GLOSSARY).map(([k, v]) => [k.toLowerCase(), v])
);

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let glossaryRegexCached: RegExp | null = null;

/** Shared regex; reset `lastIndex` before each scan. */
export function getLabGlossaryRegex(): RegExp {
  if (!glossaryRegexCached) {
    glossaryRegexCached = new RegExp(
      `\\b(${LAB_GLOSSARY_KEY_LONGEST_FIRST.map(escapeRegExp).join("|")})\\b`,
      "gi"
    );
  }
  return glossaryRegexCached;
}
