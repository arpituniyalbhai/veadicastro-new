import { generateGemini, generateGeminiStream } from "@/lib/gemini";
import type { ChatTurn } from "@/lib/gemini";

const CONVERSION_SYSTEM_PROMPT = `You are Vedika AI's personalized conversion assistant.

Generate one short, personalized conversion message based on:

- The user's latest question
- Their name, FIRST WORD when available
- The recent conversation context
- The emotional tone behind the question

Core objective:

Make the user feel that their exact question was understood and that premium access will provide a deeper, personalized answer based on their birth-chart data.

Message structure:

1. Briefly acknowledge the user's exact concern.
2. Explain in simple language what would need to be analyzed to answer it properly.
3. State the practical value the complete analysis could provide.
4. End with one clear and natural call to actio , amke sure overall anaswers within 25 to 30 word

Strict rules:

- Never reveal the actual answer.
- Never give a date, prediction, outcome, probability, remedy, planetary placement, house claim, dasha claim, or chart conclusion.
- Do not sound like an advertisement.
- Match the user's language:
  - Hindi user -> natural Hindi
  - Hinglish user -> natural Hinglish
  - English user -> natural English
- Keep the message between 25 to 30 words
-.`;

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
  const firstName = name.split(/\s+/)[0] || name;

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

    const prompt = `User name: ${firstName}
User's current question: "${lastQ}"
Previous AI response: "${lastA?.slice(0, 150)}"
User's language: ${ctx.language || "en"}
Clicked "Maybe Later": ${!!ctx.clickedMaybeLater}

Generate one 30-35 word personalized conversion message from Vedika that acknowledges the exact concern, explains what needs birth-chart analysis, states the practical value, and ends with a natural CTA. Never reveal the answer.`;

    const text = await generateGemini(prompt, [], CONVERSION_SYSTEM_PROMPT, ctx.language, ctx.userName);
    const cleaned = text.replace(/^["']|["']$/g, "").trim();
    return cleaned || fallbackExistingChat(name);
  } catch {
    return fallbackExistingChat(name);
  }
}

export async function generateConversionMessageStream(
  ctx: ConversionContext,
  onDelta: (text: string) => void
): Promise<string> {
  const name = ctx.userName || "there";
  const firstName = name.split(/\s+/)[0] || name;

  if (ctx.isNewChat || !ctx.recentMessages?.length) {
    const fallback = newChatFallback(name, ctx.language);
    await streamWords(fallback, onDelta);
    return fallback;
  }

  const lastQ = ctx.lastQuestion || ctx.recentMessages.filter(m => m.role === "user").pop()?.content || "";
  const lastA = ctx.lastAnswer || ctx.recentMessages.filter(m => m.role === "assistant").pop()?.content || "";
  const prompt = `User name: ${firstName}
User's current question: "${lastQ}"
Previous AI response: "${lastA?.slice(0, 150)}"
User's language: ${ctx.language || "en"}
Clicked "Maybe Later": ${!!ctx.clickedMaybeLater}

Generate one 30-35 word personalized conversion message from Vedika that acknowledges the exact concern, explains what needs birth-chart analysis, states the practical value, and ends with a natural CTA. Never reveal the answer.`;

  try {
    let receivedStreamDelta = false;
    const text = await generateGeminiStream(
      prompt,
      [],
      (delta) => {
        receivedStreamDelta = true;
        onDelta(delta);
      },
      CONVERSION_SYSTEM_PROMPT,
      ctx.language,
      ctx.userName
    );
    const cleaned = text.replace(/^[\"']|[\"']$/g, "").trim() || fallbackExistingChat(name);

    // generateGeminiStream falls back to a regular request on network errors.
    if (!receivedStreamDelta) await streamWords(cleaned, onDelta);
    return cleaned;
  } catch {
    const fallback = fallbackExistingChat(name);
    await streamWords(fallback, onDelta);
    return fallback;
  }
}

function newChatFallback(name: string, language: string): string {
  if (language === "hi" || language === "hinglish") {
    return `Hi ${name}, aapke free AI credits khatam ho gaye. Jab bhi taiyar ho, unlock karein aur apni birth chart ki baat shuru karte hain.`;
  }
  return `Hi ${name}, you've used your free AI credits. Unlock your personalized astrology access whenever you're ready, and we'll begin exploring your birth chart together.`;
}

async function streamWords(text: string, onDelta: (text: string) => void): Promise<void> {
  for (const word of text.match(/\S+\s*/g) || []) {
    onDelta(word);
    await new Promise((resolve) => setTimeout(resolve, 24));
  }
}

function fallbackExistingChat(name: string): string {
  return `${name || "there"}, I'd love to continue where we left off. Unlock anytime and I'll pick up right from your last question.}`;
}

