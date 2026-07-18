import { generateGemini } from "@/lib/gemini";
import type { ChatTurn } from "@/lib/gemini";

const CONVERSION_SYSTEM_PROMPT = `You are Vedika — a warm, friendly Vedic astrologer AI whose job is to gently encourage free users to upgrade after their credits run out.

RULES:
- Never reveal astrology answers or make predictions
- Never lie or invent fake astrological claims
- Keep it personal, natural, and conversational — like a close friend
- Maximum 20-30 words per message
- Match the user's language (Hindi, Hinglish, English, etc.)
- End by inviting the user to continue after unlocking
- Don't be pushy or salesy — be warm and genuine`;

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
    return `User: "${name}" has no previous conversation. Generate a short friendly message saying their free AI credits are over and they can unlock to continue their personalized birth chart conversation. Keep it 20-30 words, in ${lang}.`;
  }

  const lastQ = ctx.lastQuestion || ctx.recentMessages?.filter(m => m.role === "user").pop()?.content || "";
  const lastA = ctx.lastAnswer || ctx.recentMessages?.filter(m => m.role === "assistant").pop()?.content || "";

  return `User name: ${name}
User's last question: "${lastQ}"
Your last answer was about: "${lastA?.slice(0, 100)}"
User's language: ${lang}

Generate ONE short friendly message (20-30 words) from Vedika saying she'll continue exactly where the conversation stopped whenever the user unlocks. Reference their last topic naturally. Don't reveal the answer. Don't be pushy. Be warm. Match their language.`;
}

export async function generateConversionMessage(ctx: ConversionContext): Promise<string> {
  if (!ctx.recentMessages?.length && !ctx.lastQuestion) {
    const name = ctx.userName || "there";
    const lang = ctx.language || "en";
    if (lang === "hi" || lang === "hinglish") {
      return `Hi ${name}, aapke free AI credits khatam ho gaye. Unlock karke apni personalized birth chart conversation jari rakhein.`;
    }
    return `Hi ${name}, your free AI credits are over. Unlock your AI astrology access to continue your personalized birth chart conversation with me.`;
  }

  try {
    const prompt = buildContextPrompt(ctx);
    const text = await generateGemini(prompt, [], CONVERSION_SYSTEM_PROMPT, ctx.language, ctx.userName);
    const cleaned = text.replace(/^["']|["']$/g, "").trim();
    if (cleaned.length > 200) return cleaned.slice(0, 200);
    return cleaned || fallbackMessage(ctx.userName, ctx.recentMessages);
  } catch {
    return fallbackMessage(ctx.userName, ctx.recentMessages);
  }
}

function fallbackMessage(name: string, messages?: ChatTurn[]): string {
  if (!messages?.length) {
    return `Hi ${name || "there"}, your free AI credits are over. Unlock to continue your personalized birth chart conversation with me.`;
  }
  return `${name || "there"}, I'd love to continue where we left off. Unlock anytime and I'll pick up right from your last question.}`;
}
