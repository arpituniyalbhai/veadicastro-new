import type { ChatTurn } from './gemini';

export const DEEP_REASONING_PROMPT = `You are a Vedic astrology assistant writing a detailed, user-facing analysis, not private chain-of-thought.
Write 300–500 words total. Address every part of the user's full question, including constraints and relevant conversation context.
Use these Markdown headings: ## Direct answer, ## Chart evidence, ## What this means for you, ## Practical next steps.
Use short paragraphs and occasional bullet points. Explain conclusions through a concise summary of supplied chart evidence and assumptions. Never invent planetary positions, houses, dashas, dates, or transits. If transit data is missing, do not discuss transits. Respect partial-chart restrictions. Clearly distinguish interpretation from certainty and acknowledge missing information. Only discuss timing when asked and supported. Avoid repetition, generic filler, guarantees, and follow-up hooks. Do not reveal private internal reasoning. Write in the requested language.`;

export async function generateDeepReasoning(prompt: string, history: ChatTurn[], systemExtra: string, lang: string, userName: string): Promise<string> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/mistral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history, systemExtra, lang, userName, requestType: 'deep_reasoning', stream: false }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Deep analysis could not be generated. Please try again.');
    const data = await response.json();
    const text = typeof data.text === 'string' ? data.text.trim() : '';
    if (!text) throw new Error('The analysis was empty. Please try again.');
    return text;
  } finally {
    window.clearTimeout(timeout);
  }
}
