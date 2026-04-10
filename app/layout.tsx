import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LabAI – Understand Your Lab Results",
  description:
    "AI-powered lab test explainer. Paste your lab results and get plain-language explanations instantly.",
  keywords: ["lab results", "blood test", "AI health", "medical explainer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/50 px-4 py-6">
            <div className="container mx-auto max-w-6xl text-center text-xs text-muted-foreground">
              Copyright 2026 Clementius Carel Sie
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
