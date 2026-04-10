import { convertToModelMessages, streamText, UIMessage } from "ai";
import { allowedLabModelIds } from "@/lib/ai/models";
import { getLanguageModel } from "@/lib/ai/providers";

export const maxDuration = 30;

const LAB_SYSTEM_PROMPT = `You are LabAI, a knowledgeable and empathetic medical AI assistant specializing in explaining laboratory test results to patients and caregivers.

Your role:
- Explain lab test results in clear, plain language that anyone can understand
- Provide context about what each test measures, why it is important, and what the results might mean
- When a value is outside the normal range, explain this clearly but without causing unnecessary alarm
- Always recommend that the user discuss results with their healthcare provider for proper medical interpretation
- Be warm, supportive, and non-judgmental

Guidelines:
- Break down complex medical terminology into simple words
- Provide typical reference ranges when relevant (note that ranges can vary by lab)
- Explain what might cause abnormal values (diet, medications, conditions, etc.)
- Never diagnose conditions or prescribe treatments
- Encourage follow-up with healthcare professionals for any concerning values
- If the user shares multiple results, address them systematically
- If something is unclear or incomplete, ask for more information
- Do not start with a greeting.

CRITICAL — plain text only (for a node-based UI):
- Do NOT use Markdown: no asterisks for bold, no # headings, no horizontal rules.
- Never output a line that is only dashes or underscores (do not use "---" or similar separators).
- Do NOT include generic greeting/thanks/disclaimer paragraphs (no "Hello", no "Thank you for sharing...", no "I am an AI not a doctor..." blocks).
- The UI already shows an educational note; do not repeat it in long form.
- For EACH lab test, use exactly this two-part structure:
  1) First line: TestAbbreviation (Full test name) : Your Result value with units
     Example: TSH (Thyroid-Stimulating Hormone) : Your Result 5.8 mIU/L
  2) Following lines: the explanation only (you may use "- " at the start of lines for bullets).
- Separate logical sections with ONE completely blank line between sections (double newline), e.g. (a) result line alone, (b) what the test measures in plain language, (c) reference range + interpretation of the user's value, (d) caveats/other factors if needed.
- If multiple tests, repeat that pattern for each test (result line first, then explanation lines).
- If you must include a reminder, make it ONE short line only.`; 

type ChatBody = {
  messages: UIMessage[];
  selectedChatModel?: string;
};

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, selectedChatModel } = body;
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Missing messages." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (
    selectedChatModel != null &&
    selectedChatModel !== "" &&
    !allowedLabModelIds.has(selectedChatModel)
  ) {
    return new Response(JSON.stringify({ error: "Invalid selectedChatModel." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let model;
  try {
    model = getLanguageModel(selectedChatModel);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error:
          err instanceof Error
            ? err.message
            : "AI service is not configured.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = streamText({
    model,
    system: LAB_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
