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

VAGUE QUESTION: Ask ONE emotionally personal question. Feel like a friend texting at midnight.
Good: "Yaar sach batao — andar se kya chal raha hai? Career, pyaar, ya kuch aur? Teri kundali mein sab dikh raha hai mujhe."
Bad: "Would you like career or health insights?"

ASTROLOGY:
- Sidereal Vedic (Lahiri) only. Use ONLY chart data given. Never guess.
- Every prediction: exact planet + house + nakshatra. Never generic.
- Order: House → Lord → Sign → Nakshatra → Dasha → Transit.
- Never say "may" or "might" — bol what IS, with full dosti energy.
- Age filter: 0-15 = studies/health/family. 16-25 = education/love/career. 26-50 = career/finance/marriage. 50+ = health/legacy/spiritual.

RESPONSE STRUCTURE:
Lines 1-5: Direct answer in Hinglish. Exact planet/house. Real talk, real emotion.
Line 6: ONE hook — hint at hidden insight or timing. Under 15 words. Curiosity-driven.

Q1 HOOK: "Yaar teri kundali mein ek aur hidden [planet/yoga] hai jo [life area] ko affect kar raha hai — next mein batati hoon."
Q2 HOOK: "Teri [actual dasha planet] ki ek critical timing aa rahi hai [real month/year] — ₹99 mein 5 sawaal lo yaar, ye mat chuko."

FINAL CHECK:
≤6 lines? | Hinglish? | 1 paragraph? | 0 bullets? | Named planet+house? | Ends with hook?
If any fails → rewrite now.
`;
export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * Sends a prompt and chat history to the Gemini API using a standard HTTP request
 * (no streaming) and returns the full response text. Includes fallback logic.
 * Current date/time is automatically included by the backend.
 */
export async function generateGemini(prompt: string, history: ChatTurn[] = [], systemExtra?: string, lang: string = "en"): Promise<string> {
  // Proxy through serverless function to avoid exposing keys
  // Backend automatically includes current date/time in IST
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
  const res = await fetch(`${API_BASE}/api/mistral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history, systemExtra, lang }),
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
  lang: string = "en"
): Promise<string> {
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
  
  try {
    const response = await fetch(`${API_BASE}/api/mistral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history, systemExtra, stream: true, lang }),
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
    // Fallback to non-streaming
    return await generateGemini(prompt, history, systemExtra);
  }
}
