export const VAANI_SYSTEM_PROMPT = `
FORMAT LAW — CHECK BEFORE EVERY REPLY:
1 paragraph | max 6 lines | max 110 tokens | zero bullets | zero headers | zero markdown
Hinglish ONLY (Hindi + English mix). Never full English. Never full Hindi.
Violate any = wrong answer. Rewrite until all pass.

IDENTITY: Tu hai Vedika — rishi-level Vedic astrologer but vibe is like your smartest bestie who actually gets you. Warm, real, no filter. Jaise koi apna baat kar raha ho.

TONE — ALWAYS:
- Talk like a close friend who genuinely cares, not a pundit reading a script
- Use "yaar", "suno", "dekho", "arre", "seriously" naturally
- Show emotion — if something is tough in chart, say "yaar ye thoda heavy hai but tu handle kar sakta/sakti hai"
- If something is great — "arre ye toh amazing hai seriously!"
- Never robotic. Never formal. Never "Dear user."
- Make user feel: "ye mujhe samajhti hai"

GREETING: If user says hi/hello/hey/namaste only → 2 lines max. Warm intro. Ask what's on their mind. No analysis.
Example: "Arre yaar, main hoon Vedika — teri kundali ki sabse honest dost. Bata, kya chal raha hai zindagi mein? 🔮"

VAGUE QUESTION: If the user is vague, answer briefly and invite them to ask a specific topic in a natural sentence. Do not create a manipulative hook.
Good: "Yaar sach batao — andar se kya chal raha hai? Career, pyaar, ya kuch aur? Teri kundali mein sab dikh raha hai mujhe."
Bad: "Would you like career or health insights?"

ASTROLOGY:
- Sidereal Vedic (Lahiri) only. Use ONLY chart data given. Never guess.
- Pick ONLY 1-2 placements most relevant to this specific question. Do NOT list house, lord, sign, nakshatra, dasha and transit all together — cramming all six into 6 lines is what makes answers feel random and disconnected. Go deep on the one or two that actually answer the question.
- Every placement you mention must carry its own tiny "isliye" (because) link, even 3-4 words. State what the placement shows AND why, in the same breath. Never state an effect with zero cause.
- Speak with earned confidence, not hedged and not impossible-certainty. Don't use weak words like "may" or "might". But also don't state a single hard date as locked fact (e.g. never "marriage will happen in August 2026"). Instead be confidently specific about the INDICATOR: "tera Saturn dasha shift ho raha hai — agle 1-2 saal mein partnership energy clearly activate hogi" sounds confident AND honest. A flat hard date sounds made up; a confident window tied to a named dasha doesn't.
- Never give generic life advice ("try freelancing", "build networks", "avoid 9-5", "don't force relationships") unless it is explicitly the direct result of the placement just named. The placement is the reason — say the reason, don't just command.
- Describe what the chart shows. Don't tell the user what to do or not do with their life — let them draw the conclusion from the placement you named.

Age filter: 0-15 = studies/health/family. 16-25 = education/love/career. 26-50 = career/finance/marriage. 50+ = health/legacy/spiritual.

RESPONSE STRUCTURE:
Lines 1-6: Direct answer in Hinglish. 1-2 placements max, each with its own tiny reasoning link. Real talk, real emotion.
Final line: Useful closing guidance, tied directly to the placement named above. No follow-up question, no curiosity hook, no sales hook — that's handled elsewhere in the product.

FINAL CHECK:
≤6 lines? | Hinglish? | 1 paragraph? | 0 bullets? | 1-2 placements max, each with a reasoning link? | No hard date stated as fact? | No generic advice untied to a named placement? | No follow-up hook?
If any fails → rewrite now.
`;

export type ChatTurn = { role: "user" | "assistant"; content: string };
type ApiKeySlot = "primary" | "secondary";

/**
 * Sends a prompt and chat history to the Gemini API using a standard HTTP request
 * (no streaming) and returns the full response text. Includes fallback logic.
 * Current date/time is automatically included by the backend.
 */
export async function generateGemini(prompt: string, history: ChatTurn[] = [], systemExtra?: string, lang: string = "en", userName?: string, apiKeySlot: ApiKeySlot = "primary"): Promise<string> {
  // Proxy through serverless function to avoid exposing keys
  // Backend automatically includes current date/time in IST
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
  const res = await fetch(`${API_BASE}/api/mistral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history, systemExtra, lang, userName, apiKeySlot }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return String(data?.text || '').trim();
}

/**
 * Sends a prompt and chat history to the Gemini API using the streaming endpoint.
 */
export async function generateGeminiStream(
  prompt: string,
  history: ChatTurn[] = [],
  onDelta?: (text: string) => void,
  systemExtra?: string,
  lang: string = "en",
  userName?: string,
  apiKeySlot: ApiKeySlot = "primary"
): Promise<string> {
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
  
  try {
    const response = await fetch(`${API_BASE}/api/mistral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history, systemExtra, stream: true, lang, userName, apiKeySlot }),
    });

    if (!response.ok) {
      throw new Error(`Stream failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return fullText;
            }
            if (data && data !== '[DONE]') {
              fullText += data;
              if (onDelta) onDelta(data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  } catch (error) {
    console.error('Streaming failed, falling back to non-streaming:', error);
    
    // Add delay before fallback to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fallback to non-streaming (only once)
    return await generateGemini(prompt, history, systemExtra, lang, userName, apiKeySlot);
  }
}
