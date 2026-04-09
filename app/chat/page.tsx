import { Metadata } from "next";
import { ChatInterface } from "@/components/chat-interface";

export const metadata: Metadata = {
  title: "Analyze Results – LabAI",
  description: "Paste your lab results and get instant AI-powered explanations.",
};

export default function ChatPage() {
  return <ChatInterface />;
}
