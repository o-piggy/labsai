import { gateway } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModelV3 } from "@ai-sdk/provider";

import {
  allowedLabModelIds,
  DEFAULT_LAB_CHAT_MODEL_ID,
} from "@/lib/ai/models";

/**
 * Use Vercel AI Gateway when explicitly configured, or on Vercel when no BYOK keys
 * are present (OIDC can authenticate the gateway — see Vercel AI Gateway docs).
 * When GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY is set, prefer direct APIs so
 * env vars on Vercel are actually used instead of being ignored in favor of gateway.
 */
function useAiGateway(): boolean {
  if (process.env.USE_AI_GATEWAY === "false") return false;
  if (process.env.USE_AI_GATEWAY === "true") return true;
  if (process.env.AI_GATEWAY_API_KEY) return true;
  const hasByok =
    !!process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    !!process.env.OPENAI_API_KEY;
  if (hasByok) return false;
  if (process.env.VERCEL === "1") return true;
  return false;
}

function normalizeModelId(requested?: string): string {
  if (requested && allowedLabModelIds.has(requested)) return requested;
  const fromEnv = process.env.LAB_DEFAULT_MODEL;
  if (fromEnv && allowedLabModelIds.has(fromEnv)) return fromEnv;
  return DEFAULT_LAB_CHAT_MODEL_ID;
}

function splitGatewayId(id: string): { vendor: string; model: string } {
  const slash = id.indexOf("/");
  if (slash <= 0) throw new Error(`Invalid model id: ${id}`);
  return {
    vendor: id.slice(0, slash),
    model: id.slice(slash + 1),
  };
}

function getDirectLanguageModel(gatewayStyleId: string): LanguageModelV3 {
  const { vendor, model } = splitGatewayId(gatewayStyleId);

  if (vendor === "google") {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Direct Google models require GOOGLE_GENERATIVE_AI_API_KEY (or use AI Gateway)."
      );
    }
    const google = createGoogleGenerativeAI({ apiKey });
    return google(model);
  }

  if (vendor === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Direct OpenAI models require OPENAI_API_KEY (or use AI Gateway)."
      );
    }
    const openai = createOpenAI({ apiKey });
    return openai(model);
  }

  throw new Error(
    `Unsupported direct provider "${vendor}". Use google/* or openai/* IDs, or enable AI Gateway.`
  );
}

/**
 * Resolve a chat language model — mirrors the pattern in vercel/chatbot (`getLanguageModel`).
 */
export function getLanguageModel(modelId?: string): LanguageModelV3 {
  const id = normalizeModelId(modelId);

  if (useAiGateway()) {
    // For local dev, AI Gateway needs either:
    // - VERCEL_OIDC_TOKEN (recommended: via `vercel env pull .env.local`)
    // - AI_GATEWAY_API_KEY (manual)
    // On Vercel deployments, OIDC is handled automatically.
    const hasGatewayAuth =
      !!process.env.AI_GATEWAY_API_KEY || !!process.env.VERCEL_OIDC_TOKEN;
    if (!hasGatewayAuth && process.env.VERCEL !== "1") {
      throw new Error(
        "AI Gateway is enabled but no auth token was found. Run `vercel env pull .env.local` to get VERCEL_OIDC_TOKEN, or set AI_GATEWAY_API_KEY."
      );
    }
    return gateway.languageModel(id);
  }

  return getDirectLanguageModel(id);
}
