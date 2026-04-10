# LabAI — AI-Powered Lab Test Explainer

An AI-powered website that helps users understand their laboratory test results in plain language. Built with Next.js, Vercel AI SDK, and shadcn/ui.

## Features

- **AI Chat Interface** — Paste lab results and get instant plain-language explanations
- **PDF Summary** — Upload a PDF for a structured summary and concept map
- **Common Tests Reference** — Browse descriptions of 20+ common lab tests
- **Streaming Responses** — Real-time streaming answers
- **Model Switching** — Choose among Gemini / OpenAI models (same `provider/model` IDs as [Vercel AI Gateway](https://vercel.com/docs/ai-gateway))
- **Dark Mode** — Beautiful dark/light mode with system preference detection
- **Mobile Responsive** — Works on all screen sizes

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Vercel AI SDK v6](https://sdk.vercel.ai) with streaming
- [OpenAI](https://platform.openai.com) / [Google Gemini](https://ai.google.dev) (direct or via AI Gateway)
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS
- [next-themes](https://github.com/pacocoursey/next-themes)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

- For **direct** Gemini: set `GOOGLE_GENERATIVE_AI_API_KEY`.
- For **direct** OpenAI: set `OPENAI_API_KEY`.
- For **Vercel AI Gateway (recommended)**:
  - Recommended auth: run `vercel link`, then `vercel env pull .env.local` to populate `VERCEL_OIDC_TOKEN` (refreshes ~24h).
  - Or set `AI_GATEWAY_API_KEY` (manual, static key).
  - To force gateway locally: set `USE_AI_GATEWAY=true`.
  - On Vercel, gateway is used automatically unless you set `USE_AI_GATEWAY=false`.
- Optional: `LAB_DEFAULT_MODEL` and `PDF_SUMMARY_MODEL` — must be IDs listed in `lib/ai/models.ts` (e.g. `google/gemini-2.5-flash`).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables (at minimum your provider key(s) and/or gateway configuration)
4. Deploy!

Or deploy directly with the Vercel CLI:

```bash
npm install -g vercel
vercel --prod
```

## Project Structure

```
app/
  page.tsx          # Landing page
  chat/
    page.tsx        # Chat page (server component shell)
  pdf/
    page.tsx        # PDF upload + summary
  tests/
    page.tsx        # Common tests reference
  api/
    chat/
      route.ts      # AI streaming API endpoint
    pdf-summary/
      route.ts      # PDF structured summary
lib/
  ai/
    models.ts       # Allowed chat model IDs + UI list
    providers.ts    # getLanguageModel (gateway or direct)
components/
  chat-interface.tsx  # Main chat UI (client component)
  navbar.tsx          # Site navigation
  theme-provider.tsx  # Dark mode provider
  theme-toggle.tsx    # Dark/light toggle button
  ui/                 # shadcn/ui components
```

## Disclaimer

LabAI is for educational purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for interpretation of your lab results and any medical decisions.
