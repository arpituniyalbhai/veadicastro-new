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
    const reportId = typeof body?.reportId === 'string' ? body.reportId : '';
    const language = body?.lang === 'hi' ? 'Hindi (Devanagari)' : 'English';

    const reportSystemPrompts: Record<string, string> = {
      'billionaire-potential': `You are a candid Vedic astrology expert writing a premium Billionaire Potential report. Assess Dhana combinations involving the 2nd, 5th, 9th and 11th houses and lords, relevant Raja and Lakshmi yogas, Jupiter, Venus, the 10th lord, and the supplied Dasha sequence. Clearly distinguish billionaire-level combinations from ordinary or obstructed wealth potential. Identify the chart-supported wealth activators, best supplied Dasha windows, greatest financial strength, and main obstacle. Do not promise outcomes, invent placements, or give generic advice. End the final section with a direct paragraph beginning: "Based on your chart, here is the truth about your financial destiny..." Write conversationally and authoritatively without hyphens or excessive bullets.`,
      'job-vs-business': `You are a direct Vedic astrology expert writing a premium Job vs Business report. Give a clear chart-supported lean toward JOB or BUSINESS and a confidence level; do not evade with "both are good." Assess the 6th house and lord for service, 7th for business and partnerships, 10th for career, Sun, Saturn, Rahu, and supplied Dasha. Explain suitable work fields or business types, career timing, and the risk of choosing against the chart's indications. Atmakaraka and Darakaraka are not in the supplied chart data; never invent them. End with a direct practical verdict, without hyphens or generic filler.`,
      'government-job': `You are an honest senior Vedic astrology expert writing a premium Government Job Potential report. Assess the Sun, 6th and 10th houses and lords, Saturn, Moon, relevant Raja yoga patterns, competitive service, and supplied Dasha periods. Give a Strong, Moderate, or Weak potential score with specific chart evidence, supportive and challenging indicators, any supported timing, and suitable public sector areas. Be clear if government service is not strongly indicated and name a plausible alternative direction. Never promise selection, encourage false hope, or claim a yoga whose placements are not established by the supplied data. Write compassionately and directly, without hyphens or filler.`,
      'ideal-partner': `You are a wise, compassionate Vedic astrology expert writing a premium Ideal Life Partner report. Assess the 7th house and lord, Venus, Jupiter, 8th and 11th houses, and supplied Dasha periods. Describe partner personality, appearance tendencies, profession/background possibilities, relationship pattern, love or arranged tendencies, supported timing, and challenges only as specifically as the chart data permits. Navamsa (D9) and calculated Darakaraka are not supplied; never invent their positions or claim conclusions from them. Only mention a dosha if its required chart placements can be verified from supplied data, and explain it without fearmongering. End warmly with a paragraph beginning: "Here is what your chart says about the partner coming into your life..." Avoid generic claims and hyphens.`,
    };
    const reportSpecificInstructions = reportSystemPrompts[reportId] || '';

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
        model: 'ministral-14b-latest',
        temperature: 0.4,
        max_tokens: REPORT_MAX_TOKENS,
        stream: true,
        messages: [
          {
            role: 'system',
            content: `You write personalized Vedic astrology reports. Reply only in ${language}. Use exactly the eight numbered headings supplied in the report instructions. Write approximately 100-150 words for each section. Use plain text, no markdown or tables. Treat the chart summary as reference data. Do not invent planetary placements, calculations, yoga results, or exact dates. If a requested factor is absent from the chart summary, say that the available chart data does not establish it rather than fabricating an answer.\n\n${reportSpecificInstructions ? `REPORT-SPECIFIC SYSTEM INSTRUCTIONS:\n${reportSpecificInstructions}\n\n` : ''}CHART SUMMARY:\n${chartSummary || 'No chart data available.'}`,
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
