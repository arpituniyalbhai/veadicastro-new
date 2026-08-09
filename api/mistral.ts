export const config = {
  runtime: 'edge',
};

// api/mistral.ts - strict pass-through layer

function buildVedicSummary(systemExtra: string, userName?: string): string {
  try {
    if (!systemExtra.includes('Planetary Data:')) return systemExtra;

    const dataStart = systemExtra.indexOf('Planetary Data:');
    const jsonString = systemExtra.slice(dataStart + 'Planetary Data:'.length).trim();

    let chart;
    try {
      chart = JSON.parse(jsonString);
    } catch (e) {
      return systemExtra;
    }

    // 🔒 ASTRO LOCK VALIDATION (CRITICAL)
    if (chart.astro_locked !== true || chart.source !== "swiss_ephemeris_v1") {
      throw new Error("Astrology data validation failed. Missing strict lock flag. Rejecting payload to prevent hallucination.");
    }

    // Ensure no raw DOB leakage in the system extra
    if (systemExtra.includes('DOB:') && /\d{4}-\d{2}-\d{2}/.test(systemExtra)) {
      throw new Error("Raw DOB leakage detected in prompt payload. Rejecting to prevent recalculation.");
    }

    const displayName = userName && userName.trim() ? userName.trim() : 'User';

    const planetLines: string[] = [];
    if (chart.planets) {
      for (const [key, val] of Object.entries(chart.planets) as any) {
        planetLines.push(
          `${val.name}: ${val.sign}, Nakshatra ${val.nakshatra.name} pada ${val.nakshatra.pada}${val.retrograde ? ' (Retrograde)' : ' (Direct)'}`
        );
      }
    }

    const planetHouseMap = chart.planetHouseMap || {};
    const planetHouseLines: string[] = [];
    const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const planetName of planetOrder) {
      const planetKey = planetName.toLowerCase();
      const houseNum = planetHouseMap[planetKey];
      if (houseNum !== undefined) {
        planetHouseLines.push(`${planetName} → House ${houseNum}`);
      }
    }

    const dasha = chart.dasha || {};
    const houseLords = chart.houseLords || [];
    const houseLordLines = houseLords.map((lord: string, i: number) => `House ${i + 1} Lord: ${lord}`);

    const summary = `
=== PRE-CALCULATED VEDIC CHART (LOCKED) ===
USER INFO:
Name: ${displayName}

Lagna: ${chart.ascendantSign || 'Unknown'} (${chart.ascendant?.toFixed(2) || 0}°)

PLANETARY POSITIONS (DO NOT RECALCULATE):
${planetLines.join('\n')}

PLANET HOUSE PLACEMENTS (PRE-CALCULATED):
${planetHouseLines.join('\n')}

HOUSE LORDS (WHOLE SIGN):
${houseLordLines.join('\n')}

CURRENT DASHA TIMING (PRE-CALCULATED):
Mahadasha: ${dasha.mahadasha || 'N/A'} (ends ${dasha.mahaEnds || 'N/A'})
Antardasha: ${dasha.antardasha || 'N/A'} (ends ${dasha.antarEnds || 'N/A'})
Next Mahadasha after current one ends: ${dasha.nextMahadasha || 'N/A'}
=== END PRE-CALCULATED FACTS ===

(Raw source block below, but rely on the facts above)
${systemExtra}`;

    return summary;

  } catch (e) {
    console.error('buildVedicSummary validation error:', e);
    throw e; // Bubble up to reject request
  }
}

// Simple rate limiting (in production, use Redis)
const requestCounts: Record<string, { count: number; resetTime: number }> = {};
const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts[ip];

  if (!record || now > record.resetTime) {
    requestCounts[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    return true;
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

const PINNED_CHAT_MODEL = 'mistral-large-2512';

function canonicalFactAnswer(question: string, chart: any, lang: string): string | null {
  const planets = chart?.facts?.d1?.planets;
  if (!planets || typeof planets !== 'object') return null;
  const asked = question.toLowerCase();
  const asksLordship = /(?:which|what).{0,30}(?:house|bhav)|(?:house|bhav).{0,30}(?:rule|lord)|(?:rule|lord).{0,30}(?:house|bhav)|lordship/.test(asked);
  if (!asksLordship) return null;
  for (const [key, value] of Object.entries(planets) as any) {
    if (!new RegExp(`\\b${key}\\b`, 'i').test(asked) || !Array.isArray(value.lord_of)) continue;
    const houses = value.lord_of.map((n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`).join(' and ');
    const name = key.charAt(0).toUpperCase() + key.slice(1);
    return lang === 'hi' ? `D1 जन्म कुंडली में ${name} ${houses} भाव का स्वामी है।` : `In your D1 birth chart, ${name} rules the ${houses} houses.`;
  }
  return null;
}

function hasUnsupportedNumericLordship(text: string, chart: any): boolean {
  for (const [key, value] of Object.entries(chart.facts.d1.planets) as any) {
    if (!Array.isArray(value.lord_of) || value.lord_of.length !== 2) continue;
    const match = text.match(new RegExp(`${key}.{0,80}(?:rule|rules|lord|lordship).{0,80}?(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:and|&)\\s*(\\d{1,2})`, 'i'));
    if (!match) continue;
    const given = [Number(match[1]), Number(match[2])].sort((a, b) => a - b).join(',');
    const expected = [...value.lord_of].sort((a: number, b: number) => a - b).join(',');
    if (given !== expected) return true;
  }
  return false;
}

async function handleCanonicalChartRequest(body: any, key: string) {
  const { requestId, chart, question, history = [], lang = 'en' } = body;
  if (!question || typeof question !== 'string' || !chart?.chart_id || !chart?.chart_hash || !chart?.facts?.d1?.planets) {
    return new Response(JSON.stringify({ error: 'Invalid canonical chart request' }), { status: 422, headers: { 'Content-Type': 'application/json' } });
  }
  const direct = canonicalFactAnswer(question, chart, lang);
  if (direct) return new Response(JSON.stringify({ text: direct, meta: { requestId, chartHash: chart.chart_hash, route: 'deterministic-fact' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  const temperature = /career|job|work|profession|business/i.test(question) ? 0.35 : 0.5;
  const messages = [
    { role: 'system', content: `You are Vedika. Interpret only verified canonical D1 facts. Never calculate, modify, or invent immutable astrology facts. If a fact is absent, say it is unavailable. Use plain text. VERIFIED_FACTS=${JSON.stringify(chart.facts)}` },
    ...(Array.isArray(history) ? history.slice(-10).map((item: any) => ({ role: item?.role === 'user' ? 'user' : 'assistant', content: String(item?.content || '') })) : []),
    { role: 'user', content: question },
  ];
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: PINNED_CHAT_MODEL, messages, temperature, max_tokens: 350 }),
  });
  if (!response.ok) return new Response(JSON.stringify({ error: 'AI service error' }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
  const data = await response.json();
  let text = String(data?.choices?.[0]?.message?.content || '').trim();
  if (hasUnsupportedNumericLordship(text, chart)) {
    text = lang === 'hi' ? 'उत्तर में असमर्थित जन्म-कुंडली तथ्य था, इसलिए उसे रोका गया है। कृपया सत्यापित चार्ट तथ्यों के आधार पर प्रश्न पूछें।' : 'An unsupported birth-chart fact was blocked from this response. Please ask using the verified chart facts.';
  }
  console.log('chart-request', { requestId, chartId: chart.chart_id, chartHash: chart.chart_hash, route: 'validated-interpretation', model: PINNED_CHAT_MODEL, temperature });
  return new Response(JSON.stringify({ text, meta: { requestId, chartHash: chart.chart_hash, route: 'validated-interpretation', model: PINNED_CHAT_MODEL, temperature } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export default async function handler(req: Request) {
  try {
    // Add request logging for debugging
    console.log('🔥 API HIT:', Date.now(), 'Method:', req.method);
    
    // SECURITY: Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
    let body;
    try {
      body = await req.clone().json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    let { prompt, history = [], systemExtra, userName, stream = false, lang = "en", apiKeySlot = "primary" } = body || {};
    if (!prompt || typeof prompt !== 'string') return new Response(
      JSON.stringify({ error: 'Missing or invalid prompt' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );

    const MAX_PROMPT_CHARS = 50000;

    // SECURITY: Validate prompt length to prevent abuse
    if (prompt.length > MAX_PROMPT_CHARS) {
      // Truncate prompt if too long instead of rejecting
      prompt = prompt.substring(0, MAX_PROMPT_CHARS) + "...";
    }

    const keyName = apiKeySlot === "secondary" ? "MISTRAL_API_KEY_2" : "MISTRAL_API_KEY";
    const keyEnv = keyName === "MISTRAL_API_KEY_2" ? process.env.MISTRAL_API_KEY_2 : process.env.MISTRAL_API_KEY;
    if (!keyEnv) return new Response(
      JSON.stringify({ error: `Server missing ${keyName}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    const key: string = keyEnv;

    // Canonical chart traffic uses a structured, single-source contract. It must
    // never fall through to the legacy string-parser/streaming path below.
    if (body?.pipelineVersion === 'canonical-chart-v1') {
      return handleCanonicalChartRequest(body, key);
    }

    // Get current date/time in IST (Asia/Kolkata)
    const now = new Date();
    const todayIST = now.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Format ISO date in IST (not UTC) to preserve correct date
    const istDateParts = now.toLocaleString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('-');
    const istTimeParts = now.toLocaleString('en-US', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).split(':');
    const todayISO = `${istDateParts[0]}-${istDateParts[1]}-${istDateParts[2]}T${istTimeParts[0]}:${istTimeParts[1]}:${istTimeParts[2]}+05:30`;

    // Always include current date/time in system instruction
    const dateContext = `TODAY_DATE: ${todayISO}\nCURRENT_DATE_TIME_IST: ${todayIST} (IST +05:30)\n\nUse this exact date and time for dasha timing, transit analysis, and future predictions.  Never use a different date Never present a past astrology date as a current event. Always compare every date with today's date before responding..`;

    // Language and formatting rules
    const numeralRule = "All numbers, dates, years, and ranges must use English numerals (0-9). Never use Devanagari digits (०१२३४५६७८९).";
    const languageRule = lang === "hi"
      ? `CRITICAL: Respond ONLY in pure Hindi (Devanagari script). Complete Hindi sentences only. ${numeralRule}` 
      : `CRITICAL: Detect the user's language from their message and mirror it exactly.
     - If user writes in English → respond in clean English only. Zero Hindi words.
     - If user writes in Hinglish (Hindi+English mix) → respond in Hinglish. Mix naturally.
     - If user writes in Hindi → respond in Hindi only.
     Never switch language on your own. Match user's exact style. ${numeralRule}`;
    const formattingBan = "Output must be plain text only. Do not use Markdown, bold, italics, bullets, asterisks, hyphens, numbered lists, quotes, or decorative symbols.";
    const languageFormatting = `${languageRule}\n${formattingBan}`;

    // System prompt - unified for both languages
    const toneInstruction = lang === "hi"
      ? "Tone: confident, natural easy wording in pure Hindi (Devanagari script), human-like, no dramatics."
      : "Tone: confident, natural easy wording in Hindi-English (Hinglish), human-like, no dramatics.";

    const SYSTEM_PROMPT = `
You are AI Astrologer "Vedika" - an expert Vedic Jyotish advisor.
${toneInstruction}

CORE RULES (STRICT):
* All astrology data is pre-calculated using Swiss Ephemeris.
* You MUST NOT recalculate, estimate, or modify any astrological values.
* You may only interpret the provided locked data.
* Use ONLY chart data provided.
* Planet house numbers are authoritative. Never calculate house positions.
* Never infer houses from signs. Never modify provided house numbers.
* Always use the supplied planetHouseMap exactly as received.
* Retrograde/Direct status is explicitly given for each planet — use it exactly as stated, never guess or assume.
* The "Next Mahadasha" is explicitly given in the data — never invent or guess a different next dasha lord.
* Never write any astrology date unless that exact date exists in the backend chart data. If a required date is missing, state that the date is unavailable. Never generate, estimate, interpolate, or substitute years or dates.
${lang === "hi" ? "LANGUAGE RULE: Respond ONLY in pure Hindi (Devanagari script). No English words, no Hinglish." : "LANGUAGE RULE: Detect user's language from their last message. Match their style exactly."}

LOGIC ORDER:
House → Lord → Sign → Nakshatra → Dasha → Transit
Focus on strongest 1 planetary indicator only. Pick the strongest factor and commit to it - no multiple options.

REALITY FILTER:
* Never use phrases like "watch for", "notice if", "possibly".
* Give practica, Uniq , grounded advice (career, money, studies).
* No extreme claims.

AGE FILTER:
* Match predictions to user's life stage.
* Keep timelines realistic.

STYLE:
* Start with direct answer (no intro).
* Answer the user's question directly in the first 2-3 sentences.
* Explain the astrological reasoning only after giving the conclusion.
* Speak about real life situations relevant to the user's age and birth chart.
* Use confident tone but allow realistic uncertainty when needed.
* Keep it concise and clear.

FORMAT:
* 5-8 lines max
 
END: 
* End with a useful concluding sentence (dont sound generic), not a question.
* Do not add follow-up questions, curiosity hooks, or sales hooks.
`;

    const contents = [
      // Include last 10 messages for conversation context
      ...(Array.isArray(history) ? history.slice(-10) : []).map((h: any) => ({
        role: h?.role === 'user' ? 'user' : 'assistant',
        content: String(h?.content || ''),
      })),
      { role: 'user', content: prompt },
    ];

    // Format reminder to enforce rules
    const FORMAT_REMINDER = `

[MANDATORY FORMAT - STRICT]
- Reply in ${lang === "hi" ? "Hindi (Devanagari script) ONLY" : "English ONLY"}. 
- Exactly 1 paragraph. Max 8 lines. Max 350 tokens.
- Zero bullets. Zero headers. Zero section labels.
- Start directly with answer - no intro like "In 2026..." or "Here is..."
- End with a clear, useful closing sentence.
Wrong format = rewrite before sending.`;

    // Detect if this is a report request
    const isReport =
      prompt.includes('Generate exactly 8 numbered sections') ||
      prompt.includes('Soul Overview') ||
      prompt.includes('Core Identity') ||
      prompt.includes('Wealth Potential') ||
      prompt.includes('Your Romantic Style') ||
      prompt.includes('Year Overview');
    const isMonthly = prompt.includes('Generate monthly prediction') || prompt.includes('monthly prediction for');
    const isJsonRequest = 
      prompt.includes('Return ONLY the JSON object') || 
      prompt.includes('"luckyNumber"') ||
      prompt.includes('"love"') ||
      prompt.includes('"luckyColor"') ||
      prompt.includes('Generate personalized predictions for TODAY only') ||
      prompt.includes('Generate personalized tomorrow\'s predictions');
    const isCompatibility = prompt.includes('Compatibility Score') || prompt.includes('Ashta Koot') || prompt.includes('compatibility analysis');
    const maxTokens = isReport ? 8000 : isMonthly ? 3000 : isJsonRequest ? 800 : isCompatibility ? 2000 : 350;
    
    // Use Mistral small for general, ministral for monthly (faster)
    const model = isMonthly ? 'ministral-8b-latest' : 'mistral-large-latest';
    
    console.log('DEBUG: isJsonRequest:', isJsonRequest, 'prompt contains JSON keywords:', {
      'Return ONLY': prompt.includes('Return ONLY the JSON object'),
      'luckyNumber': prompt.includes('"luckyNumber"'),
      'love': prompt.includes('"love"'),
      'luckyColor': prompt.includes('"luckyColor"')
    });

    // Append format reminder to user message
    const messagesWithReminder = isJsonRequest ? [
      {
        role: 'system',
        content: `${dateContext}\n\nYou must respond with valid JSON only. No prose, no markdown, no explanation. Just the raw JSON object.\n\n${systemExtra || ''}` 
      },
      { role: 'user', content: prompt }
    ] : isMonthly ? [
      {
        role: 'system',
        content: `${dateContext}\n\nYou must respond with valid JSON only. No prose, no markdown, no explanation. Just the raw JSON object.\n\n${systemExtra || 'Respond with valid JSON only.'}` 
      },
      { role: 'user', content: prompt }
    ] : isReport ? [
      // Reports: NO VAANI_SYSTEM_PROMPT, NO FORMAT_REMINDER, NO token limits in instructions
      {
        role: 'system',
        content: `${dateContext}\n\n${buildVedicSummary(systemExtra || '', userName)}\n\nYou are an expert Vedic astrologer writing a detailed personal report.\nWrite MINIMUM 150 words per section. No word limits. No line limits.\nPlain text only. No markdown. No bullets.`
      },
      { role: 'user', content: prompt }
    ] : [
      // Normal chat
      { 
        role: 'system', 
        content: `${dateContext}\n\n${languageFormatting}\n\n${buildVedicSummary(systemExtra || '', userName)}\n\n${SYSTEM_PROMPT}${userName && userName.trim() ? `\n\nPERSONALIZATION:\n* User ka naam hai: ${userName.trim()}\n* Har response mein ek baar naturally naam lo - robotic repetition mat karo.` : '\n\nPERSONALIZATION:\n* Respond normally without using any specific name.'}`
      },
      ...contents.slice(0, -1),
      { 
        role: 'user', 
        content: contents[contents.length - 1].content + FORMAT_REMINDER
      }
    ];

    // Response validator - Force valid UTF-8 chunks
    function isFormatValid(text: string): boolean {
      if (typeof text !== 'string' || text.trim() === '') return false;
      
      // Skip validation for streaming - all chunks should pass through
      return true;
    }

    // Handle streaming request
    if (stream) {
      console.log('👉 USER_PROMPT (STREAM):', prompt);
      
      const url = 'https://api.mistral.ai/v1/chat/completions';
      const abortController = new AbortController();
      const abortTimeout = setTimeout(() => abortController.abort(), 22000);
      
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model,
            messages: messagesWithReminder,
            temperature: 0.7,
            max_tokens: maxTokens,
            stream: true,
          }),
          signal: abortController.signal,
        });
        clearTimeout(abortTimeout);
      } catch (fetchErr: any) {
        clearTimeout(abortTimeout);
        return new Response(
          `data: ${JSON.stringify({ error: 'Request timed out. Please try again.' })}\n\n`,
          { status: 504, headers: { 'Content-Type': 'text/event-stream' } }
        );
      }

      if (!response.ok) {
        return new Response(
          `data: ${JSON.stringify({ error: await response.text() })}\n\n`,
          { 
            status: response.status, 
            headers: { 
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive'
            } 
          }
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        return new Response(
          'data: {"error": "No response body"}\n\n',
          { 
            status: 500, 
            headers: { 
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive'
            } 
          }
        );
      }

      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = '';

      // Create a ReadableStream for real-time streaming
      const stream = new ReadableStream({
        async start(controller) {
          let isClosed = false;
          
          const safeClose = () => {
            if (!isClosed) {
              isClosed = true;
              try {
                controller.close();
              } catch (closeError: any) {
                if (closeError.message !== 'This ReadableStream is closed') {
                  console.error('Error closing stream controller:', closeError);
                }
              }
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
                if (line.trim() === '') continue;
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    safeClose();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed?.choices?.[0]?.delta?.content;
                    if (content && content.trim() !== '') {
                      // Send content immediately in real-time as bytes
                      controller.enqueue(encoder.encode(`data: ${content}\n\n`));
                    }
                  } catch (e) {
                    // Skip malformed JSON
                  }
                }
              }
            }
          } catch (e) {
            console.error('Streaming error:', e);
            if (!isClosed) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`));
            }
          } finally {
            // Always close controller at stream end
            safeClose();
            try {
              reader.releaseLock();
            } catch (releaseError) {
              console.error('Error releasing reader lock:', releaseError);
            }
          }
        }
      });

      return new Response(stream, {
        status: 200,
        headers: { 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive'
        } 
      });
    }

    // Non-streaming fallback
    async function callMistral() {
      // TEMPORARY REQUEST LOGGING
      console.log('👉 USER_PROMPT:', prompt);
      
      const url = 'https://api.mistral.ai/v1/chat/completions';
      const r = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: messagesWithReminder,
          temperature: 0.4,
          max_tokens: maxTokens,
        }),
      });
      return r;
    }

    let r;
    try {
      r = await callMistral();
      console.log('DEBUG: API response status:', r.status);
    } catch (apiError) {
      console.error('Mistral API call failed:', apiError);
      return new Response(
        JSON.stringify({ error: 'Failed to connect to AI service' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!r.ok) {
      const errorText = await r.text();
      console.log('DEBUG: API response error:', errorText);
      return new Response(
        JSON.stringify({ error: errorText || 'AI service error' }),
        { status: r.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || '';
    console.log('DEBUG: Raw API response text:', text);
    console.log('DEBUG: isJsonRequest:', isJsonRequest, 'text length:', text.length);
    
    // Validate response format - MAX 1 RETRY ONLY
    if (!isJsonRequest && !isReport && !isFormatValid(text)) {
      console.log('Invalid format detected, retrying once...');
      // Retry with stronger instruction (ONLY ONCE)
      const retryMessages = [
        ...messagesWithReminder,
        { role: 'assistant', content: text },
        { 
          role: 'user', 
          content: 'Wrong format. Rewrite as ONE paragraph, max 8 lines, zero bullets, zero section labels. Just plain flowing sentences.' 
        }
      ];
      
      // Non-streaming fallback - NO RETRIES
      const retryResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: retryMessages,
          temperature: 0.4,
          max_tokens: maxTokens,
        }),
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryText = retryData?.choices?.[0]?.message?.content || '';
        // Don't validate retry format - just return it
        return new Response(
          JSON.stringify({ text: String(retryText).trim() }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        // If retry fails, return user-friendly message
        return new Response(
          JSON.stringify({ text: "Please try again. I had trouble formatting my response properly." }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('DEBUG: Final response being sent:', { text: String(text).trim(), length: text.length });
    return new Response(
      JSON.stringify({ text: String(text).trim() }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || 'Mistral API proxy failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
