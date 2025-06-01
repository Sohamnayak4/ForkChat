import { Groq } from "groq-sdk";

if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_GROQ_API_KEY environment variable");
}

export const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function streamCompletion(messages: Message[]) {
  const completion = await groq.chat.completions.create({
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    model: "llama-3.3-70b-versatile",
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion;
}
