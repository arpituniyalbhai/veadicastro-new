export const config = {
  runtime: 'edge',
  maxDuration: 120,
};

const REPORT_MAX_TOKENS = 3200;
const UPSTREAM_TIMEOUT_MS = 90_000;

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.slice(0, 20_000) : '';
    const chartSummary = typeof body?.chartSummary === 'string' ? body.chartSummary.slice(0, 12_000) : '';
    const language = body?.lang === 'hi' ? 'Hindi (Devanagari)' : 'English';

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing report prompt' }), { status: 422 });
    }

    const key = process.env.MISTRAL_API_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Server missing MISTRAL_API_KEY' }), { status: 500 });
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), UPSTREAM_TIMEOUT_MS);
    const upstream = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        temperature: 0.4,
        max_tokens: REPORT_MAX_TOKENS,
        stream: true,
        messages: [
          {
            role: 'system',
            content: `You write personalized Vedic astrology reports. Reply only in ${language}. Use exactly the eight numbered headings requested by the user. Write 100-150 words for each section. Use plain text, no markdown or tables. Treat the chart summary as reference data; do not recalculate planetary positions or invent exact dates.\n\nCHART SUMMARY:\n${chartSummary || 'No chart data available.'}`,
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: abortController.signal,
    });

    if (!upstream.ok || !upstream.body) {
      clearTimeout(timeout);
      const detail = await upstream.text();
      return new Response(JSON.stringify({ error: detail || 'AI service error' }), { status: upstream.status || 502 });
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        let closed = false;
        const close = () => {
          if (!closed) {
            closed = true;
            controller.close();
          }
        };
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode(sse({ done: true })));
                close();
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const text = parsed?.choices?.[0]?.delta?.content;
                if (typeof text === 'string' && text) controller.enqueue(encoder.encode(sse({ text })));
              } catch {
                // Ignore malformed upstream SSE fragments.
              }
            }
          }
          controller.enqueue(encoder.encode(sse({ done: true })));
        } catch (error: any) {
          const message = error?.name === 'AbortError'
            ? 'Report generation took too long. Please try again.'
            : 'Report generation was interrupted. Please try again.';
          controller.enqueue(encoder.encode(sse({ error: message })));
        } finally {
          clearTimeout(timeout);
          try { reader.releaseLock(); } catch {}
          close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    const message = error?.name === 'AbortError'
      ? 'Report generation took too long. Please try again.'
      : 'Unable to start report generation.';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
