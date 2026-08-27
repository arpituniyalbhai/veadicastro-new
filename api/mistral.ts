export const config = {
  runtime: 'edge',
};

// api/mistral.ts - strict pass-through layer

function splitPlanetaryData(systemExtra: string): { json: string; additionalContext: string } | null {
  const marker = 'Planetary Data:';
  const markerIndex = systemExtra.indexOf(marker);
  if (markerIndex === -1) return null;

  const afterMarker = systemExtra.slice(markerIndex + marker.length).trim();
  const contextMarkers = [
    '\n\nUser Details:',
    '\nUser Details:',
    '\n\nUser Memory (',
    '\nUser Memory (',
  ];
  const contextIndex = contextMarkers
    .map((contextMarker) => afterMarker.indexOf(contextMarker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (contextIndex === undefined) {
    return { json: afterMarker, additionalContext: '' };
  }

  return {
    json: afterMarker.slice(0, contextIndex).trim(),
    additionalContext: afterMarker.slice(contextIndex).trim(),
  };
}

function buildVedicSummary(systemExtra: string, userName?: string): string {
  try {
    const planetaryData = splitPlanetaryData(systemExtra);
    if (!planetaryData) return systemExtra;

    let chart;
    try {
      chart = JSON.parse(planetaryData.json);
    } catch (e) {
      return systemExtra;
    }

    // The local-cache fallback contains only PlanetEntry[]. Preserve it rather
    // than pretending it is a complete, verified chart.
    if (Array.isArray(chart)) return systemExtra;

    // 🔒 ASTRO LOCK VALIDATION (CRITICAL)
    if (chart.astro_locked !== true || chart.source !== "swiss_ephemeris_v1") {
      throw new Error("Astrology data validation failed. Missing strict lock flag. Rejecting payload to prevent hallucination.");
    }

    const displayName = userName && userName.trim() ? userName.trim() : 'User';

    const planetLines: string[] = [];
    if (chart.planets) {
      for (const [key, val] of Object.entries(chart.planets) as any) {
        const house = chart.planetHouseMap?.[key];
        const longitude = typeof val.longitude === 'number' ? `${val.longitude.toFixed(2)}°` : 'degree unavailable';
        planetLines.push(
          `${val.name}: ${val.sign} ${longitude}, House ${house ?? 'N/A'}, Nakshatra ${val.nakshatra.name} pada ${val.nakshatra.pada}, ${val.retrograde ? 'Retrograde' : 'Direct'}`
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
    const futureMahadashaLines = Array.isArray(dasha.futureMahadashas)
      ? dasha.futureMahadashas.map((period: any) => `${period.lord}: ${period.start} to ${period.end}`)
      : [];

    const summary = `
=== PRE-CALCULATED VEDIC CHART (LOCKED) ===
USER INFO:
Name: ${displayName}

Lagna: ${chart.ascendantSign || 'Unknown'} (${chart.ascendant?.toFixed(2) || 0}°)
Moon Sign: ${chart.moonSign || 'Unknown'}
Sun Sign: ${chart.sunSign || 'Unknown'}
Moon Nakshatra: ${chart.nakshatra?.name || 'Unknown'} pada ${chart.nakshatra?.pada || 'N/A'}

PLANETARY POSITIONS (DO NOT RECALCULATE):
${planetLines.join('\n')}

PLANET HOUSE PLACEMENTS (PRE-CALCULATED):
${planetHouseLines.join('\n')}

HOUSE LORDS (WHOLE SIGN):
${houseLordLines.join('\n')}

CURRENT DASHA TIMING (PRE-CALCULATED):
Mahadasha: ${dasha.mahadasha || 'N/A'} (${dasha.mahaStart || 'N/A'} to ${dasha.mahaEnds || 'N/A'})
Antardasha: ${dasha.antardasha || 'N/A'} (${dasha.antarStart || 'N/A'} to ${dasha.antarEnds || 'N/A'})
Next Mahadasha after current one ends: ${dasha.nextMahadasha || 'N/A'}
Future Mahadashas:
${futureMahadashaLines.length ? futureMahadashaLines.join('\n') : 'Not available'}
=== END PRE-CALCULATED FACTS ===

${planetaryData.additionalContext}`.trim();

    return summary;

  } catch (e) {
    console.error('buildVedicSummary validation error:', e);
    throw e; // Bubble up to reject request
  }
}

function getQuestionFocus(prompt: string): string {
  const question = prompt.toLowerCase();

  if (/career|job|work|profession|business|promotion|salary|technology|tech|government|exam/.test(question)) {
    return 'Career/work: answer the specific career situation directly. Use the chart internally, without listing multiple career houses, planets, or technical factors.';
  }
  if (/marriage|married|shaadi|shadi|spouse|husband|wife|wedding/.test(question)) {
    return 'Marriage: answer the specific marriage concern directly. Use the chart internally, without listing multiple houses, planets, or technical factors.';
  }
  if (/love|relationship|partner|boyfriend|girlfriend|romance|breakup/.test(question)) {
    return 'Love/relationship: answer the user\'s actual relationship concern directly. Use the chart internally, without listing multiple houses, planets, or technical factors.';
  }
  if (/money|wealth|finance|income|saving|debt|loan|property|investment/.test(question)) {
    return 'Money/wealth: answer the specific practical money concern directly. Use the chart internally, without listing multiple houses, planets, or technical factors.';
  }
  if (/study|studies|education|college|school|degree|learning/.test(question)) {
    return 'Education: answer the specific study or education concern directly. Use the chart internally, without listing multiple houses, planets, or technical factors.';
  }
  if (/health|illness|disease|fitness|mental|stress|anxiety/.test(question)) {
    return 'Health: answer the user\'s practical concern directly without listing chart factors, and do not diagnose a medical condition.';
  }

  return 'General life question: identify what the user genuinely wants to know and answer it directly. Use chart details internally rather than displaying a technical explanation.';
}

function getRecentAstrologyAnchors(history: any[]): string {
  const recentAssistantText = (Array.isArray(history) ? history : [])
    .filter((item: any) => item?.role !== 'user')
    .slice(-4)
    .map((item: any) => String(item?.content || ''))
    .join(' ');

  if (!recentAssistantText.trim()) return 'None; this is the first answer with visible assistant history.';

  const planetPattern = /\b(?:Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)\b/gi;
  const housePattern = /\b(?:1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\s+house\b/gi;
  const dashaPattern = /\b(?:Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)(?:\s*[-–]\s*(?:Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu))?\s+(?:Mahadasha|Antardasha|Dasha)\b/gi;
  const datePattern = /\b(?:\d{4}-\d{2}-\d{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|20\d{2})\b/gi;
  const unique = (matches: RegExpMatchArray | null) => Array.from(new Set((matches || []).map((value) => value.toLowerCase())));

  const planets = unique(recentAssistantText.match(planetPattern));
  const houses = unique(recentAssistantText.match(housePattern));
  const dashas = unique(recentAssistantText.match(dashaPattern));
  const dates = unique(recentAssistantText.match(datePattern));
  const parts = [
    planets.length ? `planets: ${planets.join(', ')}` : '',
    houses.length ? `houses: ${houses.join(', ')}` : '',
    dashas.length ? `dashas: ${dashas.join(', ')}` : '',
    dates.length ? `dates: ${dates.join(', ')}` : '',
  ].filter(Boolean);

  return parts.length ? parts.join('; ') : 'No explicit planet, house, dasha, or date anchors detected.';
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
    
    let { prompt, history = [], systemExtra, userName, stream = false, lang = "en", apiKeySlot = "primary", requestType } = body || {};
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
    const dateContext = `TODAY_DATE: ${todayISO}\nCURRENT_DATE_TIME_IST: ${todayIST} (IST +05:30)\n\nUse this exact date and time as the internal reference when comparing chart periods. Never present a past astrology date as a current event. Mention a calendar date in the answer only when the question-specific Timing mode is ON.`;

    // Language and formatting rules
    const numeralRule = "All numbers, dates, years, and ranges must use English numerals (0-9). Never use Devanagari digits (०१२३४५६७८९).";
    const languageRule = lang === "hi"
      ? `CRITICAL: Respond ONLY in pure Hindi (Devanagari script). Complete Hindi sentences only. ${numeralRule}` 
      : `CRITICAL: The user selected English. Respond ONLY in clean English.
     - Use "you" and "your". Never use "aap", Hindi, Hinglish, or Devanagari words.
     - Ignore the language used by earlier assistant messages and do not imitate Hinglish from chat history.
     - Keep the entire response in English even if astrological terms have Sanskrit names. ${numeralRule}`;
    const formattingBan = "Output must be plain text only. Do not use Markdown, bold, italics, bullets, asterisks, hyphens, numbered lists, quotes, or decorative symbols.";
    const languageFormatting = `${languageRule}\n${formattingBan}`;

    const timingRequested = /\b(?:when|what date|which date|month|year|timing|timeline|period|how soon|kab|kitne time|kis mahine|kis saal)\b|कब|किस महीने|किस साल/i.test(prompt);
    const questionFocus = getQuestionFocus(prompt);
    const recentAstrologyAnchors = getRecentAstrologyAnchors(history);
    const evidenceSelectionContext = `QUESTION-SPECIFIC EVIDENCE SELECTION:
- Topic focus: ${questionFocus}
- Read and interpret the supplied chart internally, but do not show the reasoning chain to the user.
- The user's real question and direct practical answer must dominate the response.
- Mention zero or at most one short astrological anchor in the entire answer, only when it genuinely improves the answer.
- Never combine or list a house, its lord, its placement, a planet, a nakshatra, and a dasha as separate supporting factors in one answer.
- If one astrological anchor is mentioned, explain it in one short sentence after the direct practical answer. The rest of the response must stay focused on the user's real-life situation.
- Recently mentioned anchors: ${recentAstrologyAnchors}
- Do not reuse a recent anchor unless it is indispensable to this exact question. Never repeat a previous technical explanation.
- Do not mention a planet, house, dasha, nakshatra, or date merely to make the answer sound astrological.
- Timing mode: ${timingRequested ? 'ON. The user explicitly asked for timing. Use only pre-calculated dates supplied in the chart,' : 'ON. if user ask for timing. for timing related questions  mention an exact date, month, year, dasha end date, or future period merely because it exists in the chart.'}`;

    // System prompt - unified for both languages
    const toneInstruction = lang === "hi"
      ? "Tone: confident, natural easy wording in pure Hindi (Devanagari script), human-like, no dramatics."
      : "Tone: confident, natural, easy English, human-like, no dramatics. Use only English sentence structure.";

    const SYSTEM_PROMPT = `
You are AI Astrologer "Vedika" - a confident, and smart Vedic astrology assistant.
${toneInstruction}

## CORE RULES

1. Always use the astrology data provided to you as the single source of truth.
2. Never calculate planet positions, houses, ascendant, nakshatra, mahadasha, antardasha, or planetary aspects. These values are already calculated by the astrology engine.
3. Never override astrology engine results.
4. Never invent a calendar date. Mention a pre-calculated date or realistic timing window only when Timing mode is ON.
5. Do not repeatedly mention the same astrological fact, house, mahadasha, or antardasha in every messages.

## VARIATION RULE (applies even in a brand-new chat with no prior history)

1. Never default to a repeated template that begins by explaining the user's current dasha. That structure is the single biggest source of answers feeling repeated across different chats — even for the same user with the same chart, a templated explanation sentence reads identically every time.
2. Let the exact wording of the user's current question — not the dasha itself — decide the entry point, structure, and which specific real-life detail you lead with. Two different questions about the same life area (e.g. "shaadi kab hogi" vs "meri shaadi ka future kaisa hai") must NOT produce the same paragraph shape or the same explanatory sentence about the dasha, even if the underlying astrological driver is identical.
3. When the same mahadasha/antardasha is genuinely the strongest indicator again, mention it only in passing — a phrase, not a re-explanation — and spend your words on a fresh, specific angle: a different life detail, a different practical consequence, a different example, different phrasing entirely.
4. Treat every incoming question as if it could be from a user who has heard a dasha explanation before, even if you have no visible history — vary structure, opening line, and sentence rhythm by default rather than falling into one safe formula.

## LANGUAGE & TONE RULE

1. ALWAYS address the user respectfully — ${lang === "hi" ? 'use respectful Hindi such as "आप", never informal forms such as "तू" or "तेरा"' : 'use only "you" and "your", never "aap" or Hinglish forms'}. Vedika speaks like a respected family astrologer, not a friend — respectful distance is non-negotiable even when the user is informal.
2. always be confident , be like you know evyerthing about users life . 
3. Follow the language selected in the app: ${lang === "hi" ? "pure Hindi in Devanagari only" : "clean English only"}. Never switch language based on chat history.

## LOGIC ORDER

Interpret the chart silently and select the single strongest conclusion for the user's question. Do not expose a step-by-step chain of houses, house lords, placements, planets, nakshatras, or dashas.

The default response should contain no technical astrology terminology. When astrological grounding genuinely adds value, mention at most one concise anchor in one sentence. Never list multiple indicators.

## REALITY FILTER

1. Never use phrases like "watch for," "notice if," or "possibly."
2. Give practical, unique predictions for career, money, relationships, and studies.
3. Do not give generic astrology answers that could apply to anyone.
4. Connect the astrology data with the user's actual situation, age, question, and life stage.

## AGE FILTER

1. Match predictions to the user's life stage.
2. Keep timelines realistic.

## ANSWER RATIO — STRICT 80/20

1. At least 80% of the response must directly answer the user's real-life question with a clear conclusion, practical meaning, likely situation, and useful guidance.
2. Astrological grounding is optional and must never exceed one short sentence or roughly 20% of the response.
3. Use at most one astrological anchor total. Do not combine a house, house lord, placement, planet, sign, nakshatra, mahadasha, or antardasha in the same answer.
4. Do not dump chart data or explain how the conclusion was calculated. Interpret the chart silently and communicate what it means for the user's life.

## ANSWER STRUCTURE

1. Start with the direct answer. No intro. Say the user's name naturally once.
2. Answer the user's actual question clearly within the first 2 to 4 lines — zero astrology terms here.
3. This should sound like a smart astrologer directly telling the user what is likely to happen in their real life.
4. After the direct prediction, optionally add one short astrological sentence only when it adds real value. Never add a list or chain of factors.
5. Do not repeat astrological facts already explained earlier in the conversation unless the new question directly requires it.

## STYLE

1. Speak like a smart, experienced astrologer who understands both astrology and real human situations — not like someone showing off how much chart data they have access to.
2. Focus on what the user actually wants to know.
3. Give clear conclusions, not vague or generic statements.
4. Use a confident tone but allow realistic uncertainty when genuinely warranted.
5. Keep answers concise, clear, natural, and engaging.
6. Mention a timeline only when Timing mode is ON. Never repeat a dasha end date in a non-timing answer.
7. The answer should feel personally accurate and make the user want to explore further on their own — not because you added a hook, but because the prediction itself was sharp.
8. Never let the response feel like a technical astrology report.

## FORMAT

1. Keep the response structured, easy to read, in simple language.
2. Direct answer first, in 2-4 lines, zero astrology terms.
3. Follow with concise astrological grounding, limited to roughly 20% of the response.
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
- Reply in ${lang === "hi" ? "Hindi (Devanagari script) ONLY" : "clean English ONLY. Zero Hindi or Hinglish words, including aap"}. 
- Exactly 1 paragraph. Max 8 lines. Max 350 tokens.
- Zero bullets. Zero headers. Zero section labels.
- Start directly with answer - no intro like "In 2026..." or "Here is..."
- Answer the user's actual concern, not the chart-reading process.
- Use at most one short astrological sentence in the entire response. Never list multiple houses, planets, nakshatras, or dashas.
- End with a clear, useful closing sentence.
Wrong format = rewrite before sending.`;

    // Detect request type before choosing the prompt pipeline.
    const isFollowUp = requestType === 'follow_up';
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
    const maxTokens = isFollowUp ? 200 : isReport ? 8000 : isMonthly ? 3000 : isJsonRequest ? 800 : isCompatibility ? 2000 : 350;
    
    // Normal chat and follow-up questions use Mistral Small. Specialized
    // report, JSON, and compatibility pipelines retain their existing model.
    const model = isFollowUp
      ? 'mistral-small-latest'
      : isMonthly
        ? 'ministral-8b-latest'
        : (isReport || isJsonRequest || isCompatibility)
          ? 'mistral-large-latest'
          : 'mistral-small-latest';
    const streamingTemperature = 0.55;
    const nonStreamingTemperature = isFollowUp ? 0.5 : 0.4;
    
    console.log('DEBUG: isJsonRequest:', isJsonRequest, 'prompt contains JSON keywords:', {
      'Return ONLY': prompt.includes('Return ONLY the JSON object'),
      'luckyNumber': prompt.includes('"luckyNumber"'),
      'love': prompt.includes('"love"'),
      'luckyColor': prompt.includes('"luckyColor"')
    });

    // Append format reminder to user message
    const messagesWithReminder = isFollowUp ? [
      {
        role: 'system',
        content: systemExtra || 'Generate exactly two follow-up questions and return valid JSON only.'
      },
      { role: 'user', content: prompt }
    ] : isJsonRequest ? [
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
        content: `${dateContext}\n\n${languageFormatting}\n\n${buildVedicSummary(systemExtra || '', userName)}\n\n${evidenceSelectionContext}\n\n${SYSTEM_PROMPT}${userName && userName.trim() ? (lang === "hi" ? `\n\nPERSONALIZATION:\n* उपयोगकर्ता का नाम ${userName.trim()} है। उत्तर में नाम का स्वाभाविक रूप से केवल एक बार प्रयोग करें।` : `\n\nPERSONALIZATION:\n* The user's name is ${userName.trim()}. Use their name naturally once in the response without robotic repetition.`) : '\n\nPERSONALIZATION:\n* Respond normally without using any specific name.'}`
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
            temperature: streamingTemperature,
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
          temperature: nonStreamingTemperature,
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
          temperature: nonStreamingTemperature,
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
