// Empty export preserves existing imports without sending an extra system prompt.
export const VAANI_SYSTEM_PROMPT = "";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  isOutOfCredits?: boolean;
};
type ApiKeySlot = "primary" | "secondary";

/**
 * Sends a prompt and chat history to the Gemini API using a standard HTTP request
 * (no streaming) and returns the full response text. Includes fallback logic.
 * Current date/time is automatically included by the backend.
 */
export async function generateGemini(prompt: string, history: ChatTurn[] = [], systemExtra?: string, lang: string = "en", userName?: string, apiKeySlot: ApiKeySlot = "primary", model?: string): Promise<string> {
  // Proxy through serverless function to avoid exposing keys
  // Backend automatically includes current date/time in IST
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
  const res = await fetch(`${API_BASE}/api/mistral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history, systemExtra, lang, userName, apiKeySlot, model }),
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
  apiKeySlot: ApiKeySlot = "primary",
  model?: string
): Promise<string> {
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
  
  try {
    const response = await fetch(`${API_BASE}/api/mistral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history, systemExtra, stream: true, lang, userName, apiKeySlot, model }),
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
    return await generateGemini(prompt, history, systemExtra, lang, userName, apiKeySlot, model);
  }
}
