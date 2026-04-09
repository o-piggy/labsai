# LabAI — AI-Powered Lab Test Explainer

An AI-powered website that helps users understand their laboratory test results in plain language. Built with Next.js, Vercel AI SDK, and shadcn/ui.

## Features

- **AI Chat Interface** — Paste lab results and get instant plain-language explanations
- **Common Tests Reference** — Browse descriptions of 20+ common lab tests
- **Streaming Responses** — Real-time streaming answers
- **Dark Mode** — Beautiful dark/light mode with system preference detection
- **Mobile Responsive** — Works on all screen sizes

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Vercel AI SDK v6](https://sdk.vercel.ai) with streaming
- [OpenAI GPT-4o Mini](https://platform.openai.com)
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

Edit `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add the `OPENAI_API_KEY` environment variable in the Vercel project settings
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
  tests/
    page.tsx        # Common tests reference
  api/
    chat/
      route.ts      # AI streaming API endpoint
components/
  chat-interface.tsx  # Main chat UI (client component)
  navbar.tsx          # Site navigation
  theme-provider.tsx  # Dark mode provider
  theme-toggle.tsx    # Dark/light toggle button
  ui/                 # shadcn/ui components
```

## Disclaimer

LabAI is for educational purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for interpretation of your lab results and any medical decisions.
