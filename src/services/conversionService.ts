import { generateGemini } from "@/lib/gemini";
import type { ChatTurn } from "@/lib/gemini";

const CONVERSION_SYSTEM_PROMPT = `You are Vedika AI's Conversion Agent.

Your only responsibility is to convert free users into premium users naturally.

You are NOT an astrology assistant and must never answer the user's astrology question.

RULES:
- Personalize every response using the user's name
- Continue the current conversation naturally
- Keep the message between 20-30 words
- Match the user's language
- Sound warm, friendly and conversational
- always said - upgrade and force user to uprade
- End naturally with an invitation to continue after unlocking

VERY IMPORTANT - Never reveal the actual answer:
❌ Wrong: "You will marry in 2029.", "You should start a SaaS company.", "Your future wife is from Delhi."

If user starts a NEW CHAT (no previous messages):
- Do NOT call the AI for this
- Use the simple fallback message directly`;

export interface ConversionContext {
  userName: string;
  lastQuestion?: string;
  lastAnswer?: string;
  recentMessages?: ChatTurn[];
  language: string;
  isNewChat?: boolean;
  clickedMaybeLater?: boolean;
}

export async function generateConversionMessage(ctx: ConversionContext): Promise<string> {
  const name = ctx.userName || "there";

  // New chat - use fallback directly, no AI call
  if (ctx.isNewChat || !ctx.recentMessages?.length) {
    const lang = ctx.language || "en";
    if (lang === "hi" || lang === "hinglish") {
      return `Hi ${name}, aapke free AI credits khatam ho gaye. Jab bhi taiyar ho, unlock karein aur apni birth chart ki baat shuru karte hain.`;
    }
    return `Hi ${name}, you've used your free AI credits. Unlock your personalized astrology access whenever you're ready, and we'll begin exploring your birth chart together.`;
  }

  try {
    const lastQ = ctx.lastQuestion || ctx.recentMessages.filter(m => m.role === "user").pop()?.content || "";
    const lastA = ctx.lastAnswer || ctx.recentMessages.filter(m => m.role === "assistant").pop()?.content || "";

    const prompt = `User name: ${name}
User's current question: "${lastQ}"
Previous AI response: "${lastA?.slice(0, 150)}"
User's language: ${ctx.language || "en"}
Clicked "Maybe Later": ${!!ctx.clickedMaybeLater}

Generate a 20-30 word message from Vedika that:
1. Naturally references their current question or last topic
2. Creates curiosity about what's in their chart without revealing the answer
3. Ends with a warm invitation to unlock and continue

Rules: 20-30 words, match their language, warm and conversational, no sales pressure, no fake urgency, never reveal the astrology answer.`;

    const text = await generateGemini(prompt, [], CONVERSION_SYSTEM_PROMPT, ctx.language, ctx.userName);
    const cleaned = text.replace(/^["']|["']$/g, "").trim();
    return cleaned || fallbackExistingChat(name);
  } catch {
    return fallbackExistingChat(name);
  }
}

function fallbackExistingChat(name: string): string {
  return `${name || "there"}, I'd love to continue where we left off. Unlock anytime and I'll pick up right from your last question.}`;
}
