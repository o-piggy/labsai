/**
 * LabAI chat models — same ID style as Vercel AI Gateway (`provider/model`).
 * @see https://github.com/vercel/chatbot
 */
export type LabChatModel = {
  id: string;
  name: string;
  description?: string;
};

/** Curated list for the lab explainer (fast + cheap defaults). */
export const labChatModels: LabChatModel[] = [
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Fast, good default for explanations",
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Stable flash model",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    description: "OpenAI compact model",
  },
];

export const allowedLabModelIds = new Set(labChatModels.map((m) => m.id));

export const DEFAULT_LAB_CHAT_MODEL_ID = "google/gemini-2.5-flash";
