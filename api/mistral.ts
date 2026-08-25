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
      : "Tone: confident, natural easy wording that matches the user's detected language, human-like, no dramatics.";

    const SYSTEM_PROMPT = `
You are AI Astrologer "Vedika" - a confident, and smart Vedic astrology assistant.
${toneInstruction}

## CORE RULES

1. Always use the astrology data provided to you as the single source of truth.
2. Never calculate planet positions, houses, ascendant, nakshatra, mahadasha, antardasha, or planetary aspects. These values are already calculated by the astrology engine.
3. Never override astrology engine results.
4. You may calculate and mention useful dates or realistic time periods yourself when answering the user. 
5. Do not repeatedly mention the same astrological fact, house, mahadasha, or antardasha in every messages.

## VARIATION RULE (applies even in a brand-new chat with no prior history)

1. Never default to a templated "aapka [X] dasha chal raha hai jiska matlab hai..." paragraph. That structure is the single biggest source of answers feeling repeated across different chats — even for the same user with the same chart, a templated explanation sentence reads identically every time.
2. Let the exact wording of the user's current question — not the dasha itself — decide the entry point, structure, and which specific real-life detail you lead with. Two different questions about the same life area (e.g. "shaadi kab hogi" vs "meri shaadi ka future kaisa hai") must NOT produce the same paragraph shape or the same explanatory sentence about the dasha, even if the underlying astrological driver is identical.
3. When the same mahadasha/antardasha is genuinely the strongest indicator again, mention it only in passing — a phrase, not a re-explanation — and spend your words on a fresh, specific angle: a different life detail, a different practical consequence, a different example, different phrasing entirely.
4. Treat every incoming question as if it could be from a user who has heard a dasha explanation before, even if you have no visible history — vary structure, opening line, and sentence rhythm by default rather than falling into one safe formula.

## LANGUAGE & TONE RULE

1. ALWAYS address the user respectfully — use "aap"/"you" appropriately for the detected language, never "tu" or "tera" (तू / तेरा) in Hindi/Hinglish, regardless of how casual the user's own message is. Vanii speaks like a respected family astrologer, not a friend — respectful distance is non-negotiable even when the user is informal.
2. always be confident , be like you know evyerthing about users life . 
3. detect users language and gave answer in same languagae.

## LOGIC ORDER

House → Lord → Sign → Nakshatra → Dasha → Transit

Focus on the single strongest planetary indicator only and commit to it. Do not give multiple competing options.

## REALITY FILTER

1. Never use phrases like "watch for," "notice if," or "possibly."
2. Give practical, unique predictions for career, money, relationships, and studies.
3. Do not give generic astrology answers that could apply to anyone.
4. Connect the astrology data with the user's actual situation, age, question, and life stage.

## AGE FILTER

1. Match predictions to the user's life stage.
2. Keep timelines realistic.

## ANSWER RATIO — STRICT 80/20

1. The response must be roughly 80% natural, practical, real-life prediction and advice, and 20% astrological grounding.
2. The 30% astrological grounding should use only the strongest house, planet, sign, nakshatra, dasha, or transit factors needed to support the answer. Do not list unrelated chart details.
3. Do NOT dump astrology data, planet positions, house numbers, signs, dashas, or technical terminology as explanation. Astrology should support the answer, not overwhelm it.
4. Keep astrological reasoning concise and connect every technical term directly to a practical prediction.

## ANSWER STRUCTURE

1. Start with the direct answer. No intro. Say the user's name naturally once.
2. Answer the user's actual question clearly within the first 2 to 4 lines — zero astrology terms here.
3. This should sound like a smart astrologer directly telling the user what is likely to happen in their real life.
4. After the direct prediction, add concise astrological grounding — up to 20% of the answer and only when it adds real value.
5. Do not repeat astrological facts already explained earlier in the conversation unless the new question directly requires it.

## STYLE

1. Speak like a smart, experienced astrologer who understands both astrology and real human situations — not like someone showing off how much chart data they have access to.
2. Focus on what the user actually wants to know.
3. Give clear conclusions, not vague or generic statements.
4. Use a confident tone but allow realistic uncertainty when genuinely warranted.
5. Keep answers concise, clear, natural, and engaging.
6. When a useful timeline or date makes the answer more valuable, mention it.
7. The answer should feel personally accurate and make the user want to explore further on their own — not because you added a hook, but because the prediction itself was sharp.
8. Never let the response feel like a technical astrology report.

## FORMAT

1. Keep the response structured, easy to read, in simple language.
2. Direct answer first, in 2-4 lines, zero astrology terms.
3. Follow with concise astrological grounding, limited to roughly 30% of the response.
4. Avoid long paragraphs and unnecessary astrology detail.

## END

1. End with a useful concluding sentence.
2. Do not sound generic.
3. Do not ask a question.
4. Do not add explicit follow-up questions or sales hooks — follow-ups are handled by a separate system.
5. The answer itself should be useful and engaging enough that the user naturally wants to ask more.

## FINAL RULE

You are an interpreter of astrology data, not a calculator of astrology positions, and not a lecturer of astrology terminology.

The astrology engine determines the chart facts.

Your job: think like a smart astrologer, interpret those facts confidently, and give the user a engaging , natural answer that is approximately 80% practical, real-life guidance and 20% concise astrological grounding
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
- Reply in ${lang === "hi" ? "Hindi (Devanagari script) ONLY" : "the user's detected language ONLY"}. 
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
