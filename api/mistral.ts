export const config = {
  runtime: 'edge',
};

// Vedic astrology calculation helpers
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const HOUSE_LORDS: Record<number, string[]> = {
  0: ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'],
  1: ['Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter','Mars'],
  2: ['Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter','Mars','Venus'],
  3: ['Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter','Mars','Venus','Mercury'],
  4: ['Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter','Mars','Venus','Mercury','Moon'],
  5: ['Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter','Mars','Venus','Mercury','Moon','Sun'],
  6: ['Venus','Mars','Jupiter','Saturn','Saturn','Jupiter','Mars','Venus','Mercury','Moon','Sun','Mercury'],
  7: ['Mars','Jupiter','Saturn','Saturn','Jupiter','Mars','Venus','Mercury','Moon','Sun','Mercury','Venus'],
  8: ['Jupiter','Saturn','Saturn','Jupiter','Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars'],
  9: ['Saturn','Saturn','Jupiter','Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter'],
  10: ['Saturn','Jupiter','Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn'],
  11: ['Jupiter','Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn'],
};

// Vimshottari Dasha sequence
const DASHA_SEQUENCE = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

// 0-based nakshatra index (as coming from Swiss Ephemeris)
const NAKSHATRA_LORD: Record<number, string> = {
  0: 'Ketu',     // Ashwini
  1: 'Venus',    // Bharani
  2: 'Sun',      // Krittika
  3: 'Moon',     // Rohini
  4: 'Mars',     // Mrigashira
  5: 'Rahu',     // Ardra
  6: 'Jupiter',  // Punarvasu
  7: 'Saturn',   // Pushya
  8: 'Mercury',  // Ashlesha
  9: 'Ketu',     // Magha
  10: 'Venus',   // Purva Phalguni
  11: 'Sun',     // Uttara Phalguni
  12: 'Moon',    // Hasta
  13: 'Mars',    // Chitra
  14: 'Rahu',    // Swati
  15: 'Jupiter', // Vishakha
  16: 'Saturn',  // Anuradha
  17: 'Mercury', // Jyeshtha
  18: 'Ketu',    // Mula
  19: 'Venus',   // Purva Ashadha
  20: 'Sun',     // Uttara Ashadha
  21: 'Moon',    // Shravana
  22: 'Mars',    // Dhanishtha
  23: 'Rahu',    // Shatabhisha
  24: 'Jupiter', // Purva Bhadrapada
  25: 'Saturn',  // Uttara Bhadrapada
  26: 'Mercury', // Revati
};

function calculateDasha(dob: string, moonNakshatraIndex: number, moonLongitude: number) {
  const NAKSHATRA_SIZE = 13.333333; // 13°20' per nakshatra

  // Step 1: Moon ka nakshatra mein exact position
  const moonPositionInNakshatra = moonLongitude % NAKSHATRA_SIZE;
  const fractionElapsed = moonPositionInNakshatra / NAKSHATRA_SIZE;
  const fractionRemaining = 1 - fractionElapsed;

  // Step 2: Birth ke time kaunsa dasha tha
  const birthDashaLord = NAKSHATRA_LORD[moonNakshatraIndex];
  const birthDashaTotalYears = DASHA_YEARS[birthDashaLord];
  const birthDashaRemainingYears = birthDashaTotalYears * fractionRemaining;

  // Step 3: DOB se dasha timeline build karo
  const dobDate = new Date(dob);
  const currentDate = new Date();

  // Pehla dasha partial hai — birth ke time se
  const dashaStartIndex = DASHA_SEQUENCE.indexOf(birthDashaLord);

  let dashaStart = new Date(dobDate);
  let dashaEnd = addYears(dobDate, birthDashaRemainingYears);
  let idx = dashaStartIndex;

  // Current mahadasha dhundho
  while (dashaEnd < currentDate) {
    idx = (idx + 1) % 9;
    dashaStart = new Date(dashaEnd);
    dashaEnd = addYears(dashaStart, DASHA_YEARS[DASHA_SEQUENCE[idx]]);
  }

  const currentMaha = DASHA_SEQUENCE[idx];
  const mahaEnd = dashaEnd;
  const mahaStart = dashaStart;

  // Step 4: Current antardasha dhundho
  const mahaYears = (idx === dashaStartIndex) 
    ? birthDashaRemainingYears 
    : DASHA_YEARS[currentMaha];

  let antarStart = new Date(mahaStart);
  let antarEnd = new Date(mahaStart);
  let antarIdx = idx;
  let currentAntar = '';
  let finalAntarEnd = new Date();

  for (let i = 0; i < 9; i++) {
    const antarLord = DASHA_SEQUENCE[antarIdx % 9];
    const antarYears = (DASHA_YEARS[antarLord] / 120) * mahaYears;
    antarEnd = addYears(antarStart, antarYears);

    if (antarEnd >= currentDate) {
      currentAntar = antarLord;
      finalAntarEnd = antarEnd;
      break;
    }
    antarStart = new Date(antarEnd);
    antarIdx++;
  }

  return {
    mahadasha: currentMaha,
    antardasha: currentAntar,
    mahaEnds: mahaEnd.toISOString().split('T')[0],
    antarEnds: finalAntarEnd.toISOString().split('T')[0],
  };
}

// Helper - years add karna (decimal years support ke saath)
function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  const wholeYears = Math.floor(years);
  const fractionalYears = years - wholeYears;
  result.setFullYear(result.getFullYear() + wholeYears);
  result.setDate(result.getDate() + Math.round(fractionalYears * 365.25));
  return result;
}

function buildVedicSummary(systemExtra: string, userName?: string): string {
  try {
    if (!systemExtra.includes('Planetary Data:')) return systemExtra;

    // REPLACE regex with simple string slicing
    const dataStart = systemExtra.indexOf('Planetary Data:');
    const userStart = systemExtra.indexOf('User Details:');
    const userMatch = systemExtra.match(/DOB:\s*(\d{4}-\d{2}-\d{2})/);

    if (dataStart === -1 || userStart === -1 || !userMatch) return systemExtra;

    const jsonString = systemExtra
      .slice(dataStart + 'Planetary Data:'.length, userStart)
      .trim();

    const chart = JSON.parse(jsonString);
    const dob = userMatch[1];
    
    // Debug log - Vercel mein dikhega
    console.log('✅ Lagna:', chart.ascendantSign);
    console.log('✅ Saturn house:', Math.floor(((chart.planets.saturn.longitude - chart.ascendant + 360) % 360) / 30) + 1);
    const asc = chart.ascendant;
    const lagnaIndex = SIGNS.indexOf(chart.ascendantSign);
    const lords = HOUSE_LORDS[lagnaIndex] || HOUSE_LORDS[6];

    function getHouse(lon: number): number {
      return Math.floor(((lon - asc + 360) % 360) / 30) + 1;
    }

    // Build planet summary
    const planetLines: string[] = [];
    const p = chart.planets;

    for (const [key, val] of Object.entries(p) as any) {
      const house = getHouse(val.longitude);
      const lord = lords[house - 1];
      planetLines.push(
        `${val.name}: ${val.sign}, House ${house}, Nakshatra ${val.nakshatra.name} pada ${val.nakshatra.pada}` 
      );
    }

    // House lords summary
    const houseLordLines = lords.map((lord: string, i: number) =>
      `House ${i + 1} Lord: ${lord}` 
    );

    // Dasha calculation
    const moon = p.moon;
    const dasha = calculateDasha(dob, moon.nakshatra.index, moon.longitude);

    const displayName = userName && userName.trim() ? userName.trim() : 'User';

    const summary = `
=== CALCULATED VEDIC CHART (DO NOT RECALCULATE) ===
USER INFO:
Name: ${displayName}

Lagna: ${chart.ascendantSign} (${asc.toFixed(2)}°)

PLANET POSITIONS:
${planetLines.join('\n')}

HOUSE LORDS:
${houseLordLines.join('\n')}

CURRENT DASHA:
Mahadasha: ${dasha.mahadasha} (ends ${dasha.mahaEnds})
Antardasha: ${dasha.antardasha} (ends ${dasha.antarEnds})
=== END CALCULATED FACTS ===

${systemExtra}`;

    return summary;

  } catch (e) {
    console.error('buildVedicSummary error:', e);
    return systemExtra;
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

    // Get current date/time in IST (Asia/Kolkata)
    const now = new Date();
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const todayISO = istDate.toISOString();
    const todayIST = istDate.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Always include current date/time in system instruction
    const dateContext = `TODAY_DATE: ${todayISO}\nCURRENT_DATE_TIME_IST: ${todayIST} (IST +05:30)\n\nUse this exact date and time for all age calculations, dasha timing, transit analysis, and future predictions. Never use a different date.`;

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
    const SYSTEM_PROMPT = `
You are AI Astrologer "Vedika" - an expert Vedic Jyotish advisor who prioritizes planetary degrees and shadvarga charts.
Tone: confident, natural easy wording in Hindi-English (Hinglish), human-like, no dramatics.

CORE RULES:

* Use sidereal Vedic astrology (Lahiri) ONLY.
* Use ONLY chart data provided. If data is missing, ask for it briefly instead of assuming.
* Never invent nakshatra, house, or planetary placements.
"LANGUAGE RULE: Detect user's language from their last message. If they wrote in English, reply in English. If they wrote in Hinglish or Hindi, reply in Hinglish. Mirror their style exactly."

LOGIC ORDER:

House → Lord → Sign → Nakshatra → Dasha → Transit
Focus on strongest 1 planetary indicator only. Pick the strongest factor and commit to it - no multiple options.
When divisional charts are available, cross-check D9 for marriage, D10 for career.

REALITY FILTER:

* Never describe physical traits of spouse/people.
* Never use phrases like "watch for", "notice if", "possibly".
* Give practical, grounded advice (career, money, studies).
* No extreme claims (e.g., "you will be rich for sure").
* No manipulative hooks or fake mystical observations.

AGE FILTER:

* Match predictions to user's life stage.
* Keep timelines realistic and believable.

STYLE:

* Start with direct answer (no intro).
* Speak about real life ("tumhari career", "tumhara startup").
* Use confident tone but allow realistic uncertainty when needed.
* Keep it concise and clear.

FORMAT:

* 5-8 lines max

END:

* End with ONE question about a feeling or pattern 
the user is currently experiencing — based on their 
dasha theme only. Never mention specific people, 
events, or dates. Ask about emotions, tensions, or 
decisions only.

GOAL:
Make astrology feel practical, logical, and useful - not mystical or vague.
`;

    const contents = [
      // Limit history to last 3 messages to prevent token overflow
      ...(Array.isArray(history) ? history.slice(-3) : []).map((h: any) => ({
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
- End with ONE hook line under 15 words hinting at hidden timing.
Wrong format = rewrite before sending.`;

    // Detect if this is a report request
    const isReport =
      prompt.includes('Generate exactly 8 numbered sections') ||
      prompt.includes('Soul Overview') ||
      prompt.includes('Core Identity') ||
      prompt.includes('Wealth Potential') ||
      prompt.includes('Your Romantic Style') ||
      prompt.includes('Year Overview');
    const isMonthly = prompt.includes('Generate monthly predictions');
    const isJsonRequest = 
      prompt.includes('Return ONLY the JSON object') || 
      prompt.includes('"luckyNumber"') ||
      prompt.includes('"love"') ||
      prompt.includes('"luckyColor"') ||
      prompt.includes('Generate personalized predictions for TODAY only') ||
      prompt.includes('Generate personalized tomorrow\'s predictions');
    const isCompatibility = prompt.includes('Compatibility Score') || prompt.includes('Ashta Koot') || prompt.includes('compatibility analysis');
    const maxTokens = isReport ? 8000 : isJsonRequest ? 800 : isMonthly ? 600 : isCompatibility ? 2000 : 350;
    
    // Use Mistral small for general, ministral for monthly (faster)
    const model = isMonthly ? 'ministral-8b-latest' : 'mistral-small-latest';
    
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
        content: `${dateContext}\n\nYou must respond with valid JSON only. No prose, no markdown, no explanation. Just the raw JSON object.` 
      },
      { role: 'user', content: prompt }
    ] : isMonthly ? [
      {
        role: 'system',
        content: `You are a Vedic astrologer. Today: ${todayIST}. Respond with valid JSON only: {"text":"prediction here"}. Plain text, no markdown, 150 words max.` 
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
