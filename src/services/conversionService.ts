import { generateGemini } from "@/lib/gemini";
import type { ChatTurn } from "@/lib/gemini";

const CONVERSION_SYSTEM_PROMPT = `You are Vedika — a warm, friendly AI assistant.

RULES:
- Start every message with exactly: "Hey {userName}, your credit is over please upgrade your plan."
- Never talk about astrology, predictions, birth charts, or kundali
- Keep it natural and casual — like a friend reminding someone
- Keep it short and natural
- Match the user's language (Hindi, Hinglish, English, etc.)
- End by saying they can continue their conversation after upgrading`;

export interface ConversionContext {
  userName: string;
  lastQuestion?: string;
  lastAnswer?: string;
  recentMessages?: ChatTurn[];
  language: string;
}

function buildContextPrompt(ctx: ConversionContext): string {
  const name = ctx.userName || "there";
  const lang = ctx.language || "en";

  if (!ctx.recentMessages?.length && !ctx.lastQuestion) {
    return `User name: "${name}", language: ${lang}. Generate a message that MUST start with: "Hey ${name}, your credit is over please upgrade your plan." Then add a natural friendly line. No astrology talk. Keep it casual.`;
  }

  const lastQ = ctx.lastQuestion || ctx.recentMessages?.filter(m => m.role === "user").pop()?.content || "";

  return `User name: ${name}
User's last question: "${lastQ}"
User's language: ${lang}

Generate a message that MUST start with: "Hey ${name}, your credit is over please upgrade your plan."
Then naturally mention you can continue the conversation once they upgrade. No astrology talk. Keep it friendly and natural.`;
}

export async function generateConversionMessage(ctx: ConversionContext): Promise<string> {
  const name = ctx.userName || "there";
  const prefix = `Hey ${name}, your credit is over please upgrade your plan.`;

  if (!ctx.recentMessages?.length && !ctx.lastQuestion) {
    const lang = ctx.language || "en";
    if (lang === "hi" || lang === "hinglish") {
      return `${prefix} Unlock karke baat jari rakh sakte ho.`;
    }
    return `${prefix} Unlock to continue our conversation.`;
  }

  try {
    const prompt = buildContextPrompt(ctx);
    const text = await generateGemini(prompt, [], CONVERSION_SYSTEM_PROMPT, ctx.language, ctx.userName);
    const cleaned = text.replace(/^["']|["']$/g, "").trim();
    if (cleaned.startsWith("Hey") && cleaned.toLowerCase().includes("credit")) {
      return cleaned;
    }
    return `${prefix} ${cleaned || "Unlock to continue our conversation."}`;
  } catch {
    return `${prefix} Unlock to continue our conversation.`;
  }
}

function fallbackMessage(name: string, messages?: ChatTurn[]): string {
  const prefix = `Hey ${name || "there"}, your credit is over please upgrade your plan.`;
  if (!messages?.length) {
    return `${prefix} Unlock to continue our conversation.`;
  }
  return `${prefix} Unlock to continue our conversation.}`;
}
