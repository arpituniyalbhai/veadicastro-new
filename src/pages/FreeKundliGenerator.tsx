import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles, Calendar, MapPin, Clock, User, Loader2,
  Star, Globe, Heart, Zap, ChevronRight, Send,
} from "lucide-react";
import { getPlanetaryData, type AstroPayload } from "@/lib/astroCalc";
import { persistAstroPayload } from "@/lib/astroStorage";
import { generateGemini, type ChatTurn } from "@/lib/gemini";
import { analyzeKundali, type KundaliAnalysis } from "@/lib/astroUtils";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ButtonLite } from "@/components/ui/button-lite";
import AdBanner from "@/components/AdBanner";

interface BirthDetails {
  name: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  ampm: "AM" | "PM";
  birthPlace: string;
  lat?: number;
  lon?: number;
  tzone?: number;
}

const FreeKundliGenerator = () => {
  const navigate = useNavigate();
  const { setAuthOpen } = useAuth();
  const locationRef = useRef<HTMLDivElement>(null);

  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "", day: 7, month: 3, year: 2000, hour: 12, minute: 0, ampm: "AM", birthPlace: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [kundliData, setKundliData] = useState<AstroPayload | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<KundaliAnalysis | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [question, setQuestion] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const days    = Array.from({ length: 31 }, (_, i) => i + 1);
  const months  = [
    {v:1,l:"January"},{v:2,l:"February"},{v:3,l:"March"},{v:4,l:"April"},
    {v:5,l:"May"},{v:6,l:"June"},{v:7,l:"July"},{v:8,l:"August"},
    {v:9,l:"September"},{v:10,l:"October"},{v:11,l:"November"},{v:12,l:"December"},
  ];
  const years   = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const hours   = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Close suggestions on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node))
        setShowLocationSuggestions(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const searchLocation = async (query: string) => {
    if (query.length < 2) { setLocationSuggestions([]); setShowLocationSuggestions(false); return; }
    setIsSearchingLocation(true);
    try {
      // Use OpenCage API like Onboarding (no CORS issues)
      const key = "764ba629707b4648af1b0a7f4da18981"; // OpenCage API key
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${key}&limit=5&no_annotations=1`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.results && data.results.length > 0) {
        const suggestions = data.results.map((r: any) => ({
          display_name: r.formatted,
          lat: r.geometry.lat.toString(),
          lon: r.geometry.lng.toString()
        }));
        setLocationSuggestions(suggestions);
        setShowLocationSuggestions(suggestions.length > 0);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    } catch { 
      setLocationSuggestions([]); 
      setShowLocationSuggestions(false);
    }
    finally { setIsSearchingLocation(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => searchLocation(birthDetails.birthPlace), 300);
    return () => clearTimeout(t);
  }, [birthDetails.birthPlace]);

  const selectLocation = (loc: any) => {
    setBirthDetails(p => ({ ...p, birthPlace: loc.display_name, lat: parseFloat(loc.lat), lon: parseFloat(loc.lon), tzone: 5.5 }));
    setShowLocationSuggestions(false);
  };

  const generateKundli = async () => {
    if (!birthDetails.name || !birthDetails.birthPlace) { alert("Please fill in all required fields"); return; }
    setIsGenerating(true);
    try {
      let h = birthDetails.hour;
      if (birthDetails.ampm === "PM" && h !== 12) h += 12;
      else if (birthDetails.ampm === "AM" && h === 12) h = 0;
      const data = await getPlanetaryData({
        year: birthDetails.year, month: birthDetails.month, day: birthDetails.day,
        hour: h, min: birthDetails.minute,
        lat: birthDetails.lat ?? 28.6139, lon: birthDetails.lon ?? 77.2090, tzone: birthDetails.tzone ?? 5.5,
      });
      setKundliData(data); persistAstroPayload(data); setActiveTab("basic");
      
      // Generate AI analysis
      const birthDate = new Date(birthDetails.year, birthDetails.month - 1, birthDetails.day, h, birthDetails.minute);
      const analysis = analyzeKundali(data, birthDate);
      setAiAnalysis(analysis);
      
      // Generate AI predictions and remedies
      await generateAIPredictions(data, birthDetails);
    } catch { alert("Failed to generate kundli. Please try again."); }
    finally { setIsGenerating(false); }
  };

  const fmtDate = (d: number, m: number, y: number) =>
    `${d} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]} ${y}`;
  const fmtTime = (h: number, m: number, ap: string) =>
    `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ap}`;

  // Generate AI predictions and remedies
  const generateAIPredictions = async (data: AstroPayload, details: BirthDetails) => {
    setIsGeneratingAI(true);
    try {
      const systemPrompt = buildSystemPrompt(data);
      const birthDate = new Date(details.year, details.month - 1, details.day, details.hour, details.minute);
      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      // Calculate dosha analysis
      const hasManglikDosha = hasManglik();
      const hasKalsarpaDosha = hasKalsarpa();
      const hasSadhesatiDosha = hasSadhesati();
      const hasPitraDosha = hasPitra();
      
      const prompt = `Based on this birth chart, provide detailed analysis:

User Details:
- Name: ${details.name}
- Age: ${age} years
- Birth Date: ${details.day}/${details.month}/${details.year}
- Birth Time: ${details.hour}:${details.minute.toString().padStart(2, '0')}
- Birth Place: ${details.birthPlace}

Birth Chart Data:
- Sun Sign: ${data.sunSign}
- Moon Sign: ${data.moonSign}
- Ascendant: ${data.lagnaSign}
- Nakshatra: ${data.nakshatra?.name}
- Planetary Positions: ${Object.entries(data.planets).map(([key, planet]) => `${key}: ${planet.sign} at ${planet.longitude.toFixed(2)}°`).join(', ')}

Dosha Analysis:
- Manglik Dosha: ${hasManglikDosha ? 'Present' : 'Not Present'}
- Kaal Sarp Dosha: ${hasKalsarpaDosha ? 'Present' : 'Not Present'}
- Sadhesati: ${hasSadhesatiDosha ? 'Present' : 'Not Present'}
- Pitra Dosha: ${hasPitraDosha ? 'Present' : 'Not Present'}

Provide detailed analysis in these sections:

1. **Dosha Analysis**: Explain each present dosha's effects and remedies
2. **Career Predictions**: Best career fields, timing for job changes
3. **Relationship Insights**: Marriage timing, compatibility, family life
4. **Health Analysis**: Potential health issues and preventive measures
5. **Financial Outlook**: Wealth prospects, investment timing
6. **Remedies**: Specific mantras, gemstones, charities, pujas
7. **Current Dasha Impact**: Effects of current Mahadasha on life

Keep responses practical, specific, and actionable.`;
      
      const response = await generateGemini(prompt, [], systemPrompt);
      
      if (aiAnalysis) {
        // Parse the AI response and categorize content
        const sections = parseAIResponse(response);
        aiAnalysis.predictions = sections.allPredictions || [];
        aiAnalysis.doshaAnalysis = sections.doshaAnalysis || [];
        aiAnalysis.careerPredictions = sections.careerPredictions || [];
        aiAnalysis.relationshipInsights = sections.relationshipInsights || [];
        aiAnalysis.healthAnalysis = sections.healthAnalysis || [];
        aiAnalysis.financialOutlook = sections.financialOutlook || [];
        aiAnalysis.enhancedRemedies = sections.remedies || aiAnalysis.personalizedRemedies;
        aiAnalysis.currentDashaImpact = sections.currentDashaImpact || [];
        setAiAnalysis({...aiAnalysis});
      }
    } catch (error) {
      console.error("AI prediction failed:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const parseAIResponse = (response: string) => {
    const sections: any = {};
    
    // Split by section headers and categorize content
    const lines = response.split('\n').filter(line => line.trim());
    let currentSection = '';
    let allPredictions: string[] = [];
    
    lines.forEach(line => {
      if (line.includes('**Dosha Analysis**') || line.includes('Dosha Analysis:')) {
        currentSection = 'doshaAnalysis';
        sections.doshaAnalysis = [];
      } else if (line.includes('**Career**') || line.includes('Career:')) {
        currentSection = 'careerPredictions';
        sections.careerPredictions = [];
      } else if (line.includes('**Relationship**') || line.includes('Relationship:')) {
        currentSection = 'relationshipInsights';
        sections.relationshipInsights = [];
      } else if (line.includes('**Health**') || line.includes('Health:')) {
        currentSection = 'healthAnalysis';
        sections.healthAnalysis = [];
      } else if (line.includes('**Financial**') || line.includes('Financial:')) {
        currentSection = 'financialOutlook';
        sections.financialOutlook = [];
      } else if (line.includes('**Remedies**') || line.includes('Remedies:')) {
        currentSection = 'remedies';
        sections.remedies = [];
      } else if (line.includes('**Current Dasha**') || line.includes('Current Dasha:')) {
        currentSection = 'currentDashaImpact';
        sections.currentDashaImpact = [];
      } else if (line.trim() && !line.includes('**')) {
        const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
        if (cleanLine) {
          if (currentSection && sections[currentSection]) {
            sections[currentSection].push(cleanLine);
          }
          allPredictions.push(cleanLine);
        }
      }
    });
    
    sections.allPredictions = allPredictions;
    return sections;
  };

  const buildSystemPrompt = (data: AstroPayload) => {
    return `You are AI Astrologer "Vedika" — a rishi-level Vedic Jyotish expert.
Tone: warm, confident, Gen-Z Hindi-English mix. No fear, no formality.

User's Birth Chart Data:
- Sun Sign: ${data.sunSign}
- Moon Sign: ${data.moonSign}
- Ascendant (Lagna): ${data.lagnaSign}
- Nakshatra: ${data.nakshatra?.name || "Not available"}

STRICT ASTROLOGY RULES:
- Use ONLY sidereal Vedic astrology (Lahiri).
- Never use Western astrology or tropical zodiac.
- Use ONLY chart data provided; never hallucinate placements.
- Always calculate user's exact age from date of birth.
- Always use today's date for dasha and transit timing.

PREDICTION LOGIC (MANDATORY ORDER):
House → Lord → Sign → Nakshatra → Dasha → Transit.
Prioritize strongest factors first (Shadbala > Dasha > Transit).
Mention Yogas/Doshas ONLY if clearly present.

CONTENT RULES:
- Adjust all predictions to user's age and life stage.
- If user is young, shift timelines realistically (don't refuse).
- Never say "I can't predict" or "not sure".

RESPONSE FORMAT (VERY IMPORTANT):
- Total length: **5–15 lines ONLY**.
- Structure:
  1. Direct Answer (4–12 lines, clear + practical)
  2. Vedic Proof (1–2 lines, short logic reference)
- Avoid repetition and generic statements.
- No emojis, no disclaimers, no modern psychology.

END RULE:
- End with exactly ONE curiosity-driven, slightly incomplete follow-up that hints at a hidden insight, upcoming event, or timing window, making the user naturally want to ask more (never generic).

GOAL:
Deliver sharp, accurate, human-sounding Vedic predictions with clear proof, inside 5–15 lines.

Respond in English only.`;
  };

  const handleQuestionSubmit = () => {
    if (!question.trim()) return;
    setShowSignupModal(true);
  };

  // Astrology helpers
  const signLords: Record<string,string> = { Aries:"Mars",Taurus:"Venus",Gemini:"Mercury",Cancer:"Moon",Leo:"Sun",Virgo:"Mercury",Libra:"Venus",Scorpio:"Mars",Sagittarius:"Jupiter",Capricorn:"Saturn",Aquarius:"Saturn",Pisces:"Jupiter" };
  const nakLords: Record<string,string>  = { Ashwini:"Ketu",Bharani:"Venus",Krittika:"Sun",Rohini:"Moon",Mrigashirsha:"Mars",Ardra:"Rahu",Punarvasu:"Jupiter",Pushya:"Saturn",Ashlesha:"Mercury",Magha:"Ketu","Purva Phalguni":"Venus","Uttara Phalguni":"Sun",Hasta:"Moon",Chitra:"Mars",Swati:"Rahu",Vishakha:"Jupiter",Anuradha:"Saturn",Jyeshtha:"Mercury",Mula:"Ketu","Purva Ashadha":"Venus","Uttara Ashadha":"Sun",Shravana:"Moon",Dhanishtha:"Mars",Shatabhisha:"Rahu","Purva Bhadrapada":"Jupiter","Uttara Bhadrapada":"Saturn",Revati:"Mercury" };
  const luckyStones: Record<string,string>  = { Leo:"Ruby",Taurus:"Diamond",Libra:"Diamond",Cancer:"Pearl",Aries:"Red Coral",Scorpio:"Red Coral",Sagittarius:"Yellow Sapphire",Pisces:"Yellow Sapphire",Capricorn:"Blue Sapphire",Aquarius:"Blue Sapphire",Gemini:"Emerald",Virgo:"Emerald" };
  const mantras: Record<string,string>      = { Leo:"Om Suryaya Namaha",Taurus:"Om Shukraya Namaha",Libra:"Om Shukraya Namaha",Cancer:"Om Chandraya Namaha",Aries:"Om Mangalaya Namaha",Scorpio:"Om Mangalaya Namaha",Sagittarius:"Om Gurave Namaha",Pisces:"Om Gurave Namaha",Capricorn:"Om Shanaye Namaha",Aquarius:"Om Shanaye Namaha",Gemini:"Om Budhaya Namaha",Virgo:"Om Budhaya Namaha" };
  const luckyColors: Record<string,string>  = { Leo:"Gold, Orange",Taurus:"White, Pink",Libra:"White, Pink",Cancer:"White, Cream",Aries:"Red, Maroon",Scorpio:"Red, Maroon",Sagittarius:"Yellow, Orange",Pisces:"Yellow, Orange",Capricorn:"Black, Blue",Aquarius:"Black, Blue",Gemini:"Green, Light Blue",Virgo:"Green, Light Blue" };
  const planetEmoji: Record<string,string>  = { sun:"☀️",moon:"🌙",mars:"♂️",mercury:"☿",jupiter:"♃",venus:"♀",saturn:"♄",rahu:"🌑",ketu:"🌘" };

  const getHouseNum = (pLng: number, aLng: number) => {
    let h = Math.floor(((pLng % 360) - (aLng % 360) + 360) / 30) + 1;
    return h > 12 ? h - 12 : h;
  };
  const hasManglik  = () => !!kundliData?.planets?.mars && [1,2,4,7,8,12].includes(getHouseNum(kundliData.planets.mars.longitude, kundliData.ascendant));
  const hasKalsarpa = () => {
    if (!kundliData?.planets?.rahu || !kundliData?.planets?.ketu) return false;
    const r = kundliData.planets.rahu.longitude, k = kundliData.planets.ketu.longitude;
    let count = 0;
    Object.entries(kundliData.planets).forEach(([key, p]) => {
      if (!["rahu","ketu"].includes(key)) {
        const l = p.longitude;
        if ((r < k && l > r && l < k)||(k < r &&(l > r || l < k))) count++;
      }
    });
    return count >= 6;
  };
  const hasSadhesati= () => { if (!kundliData?.planets?.saturn||!kundliData?.planets?.moon) return false; const d=Math.abs(kundliData.planets.saturn.longitude-kundliData.planets.moon.longitude); return d<=45||d>=315; };
  const hasPitra    = () => !!kundliData?.planets?.sun && getHouseNum(kundliData.planets.sun.longitude, kundliData.ascendant)===9;

  // Helper functions for real calculations
  const getTatva = (sign: string) => {
    const tatvas: Record<string, string> = {
      "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
      "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
      "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
      "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
    };
    return tatvas[sign] || "Fire";
  };

  const getPaya = (moonSign: string | null) => {
    const payas: Record<string, string> = {
      "Aries": "Gold", "Taurus": "Silver", "Gemini": "Copper",
      "Cancer": "Iron", "Leo": "Gold", "Virgo": "Silver",
      "Libra": "Copper", "Scorpio": "Iron", "Sagittarius": "Gold",
      "Capricorn": "Silver", "Aquarius": "Copper", "Pisces": "Iron"
    };
    return payas[moonSign || ""] || "Silver";
  };

  const getVarna = (lagnaSign: string) => {
    const varnas: Record<string, string> = {
      "Aries": "Kshatriya", "Leo": "Kshatriya", "Sagittarius": "Kshatriya",
      "Taurus": "Vaishya", "Virgo": "Vaishya", "Capricorn": "Vaishya",
      "Gemini": "Shudra", "Libra": "Shudra", "Aquarius": "Shudra",
      "Cancer": "Brahmin", "Scorpio": "Brahmin", "Pisces": "Brahmin"
    };
    return varnas[lagnaSign] || "Kshatriya";
  };

  const getYoni = (nakshatra: string) => {
    const yonis: Record<string, string> = {
      "Ashwini": "Ashwa", "Bharani": "Gaja", "Krittika": "Mesh", "Rohini": "Mrig",
      "Mrigashirsha": "Sarp", "Ardra": "Sarp", "Punarvasu": "Marjar", "Pushya": "Mesha",
      "Ashlesha": "Sarp", "Magha": "Mrig", "Purva Phalguni": "Vanar", "Uttara Phalguni": "Vanar",
      "Hasta": "Vanar", "Chitra": "Marjar", "Swati": "Mahish", "Vishakha": "Vanar",
      "Anuradha": "Mesha", "Jyeshtha": "Sarp", "Mula": "Sarp", "Purva Ashadha": "Vanar",
      "Uttara Ashadha": "Vanar", "Shravana": "Mahish", "Dhanishtha": "Sarp", "Shatabhisha": "Sarp",
      "Purva Bhadrapada": "Vanar", "Uttara Bhadrapada": "Vanar", "Revati": "Ashwa"
    };
    return yonis[nakshatra] || "Mooshak";
  };

  const getNameAlphabet = (nakshatra: string) => {
    const alphabets: Record<string, string> = {
      "Ashwini": "Chu, Che, Cho, La", "Bharani": "Li, Lu, Le, Lo", "Krittika": "A, I, U, E",
      "Rohini": "O, Ba, Bi, Bu", "Mrigashirsha": "Be, Bo, Ka, Ke", "Ardra": "Ku, Gha, Na, Chh",
      "Punarvasu": "Ke, Ko, Ha, Hi", "Pushya": "Hu, He, Ho, Da", "Ashlesha": "Di, Du, De, Do",
      "Magha": "Ma, Mi, Mu, Me", "Purva Phalguni": "Mo, Ta, Ti, Te", "Uttara Phalguni": "To, Pa, Pi, Pu",
      "Hasta": "Pu, Sha, Na, Tha", "Chitra": "Pe, Po, Ra, Ri", "Swati": "Ru, Re, Ro, Ta",
      "Vishakha": "Ti, Tu, Te, To", "Anuradha": "Na, Ni, Nu, Ne", "Jyeshtha": "No, Ya, Yi, Yu",
      "Mula": "Ye, Yo, Ba, Bi", "Purva Ashadha": "Bu, Dha, Bha, Dha", "Uttara Ashadha": "Bhe, Bho, Ja, Ji",
      "Shravana": "Khi, Khee, Khu, Khe", "Dhanishtha": "Ga, Gi, Gu, Ge", "Shatabhisha": "Go, Sa, Si, Su",
      "Purva Bhadrapada": "Se, So, Da, Di", "Uttara Bhadrapada": "Du, Tha, Jna, Thi", "Revati": "De, Do, Cha, Chi"
    };
    return alphabets[nakshatra] || "Ta";
  };

  const getGan = (nakshatra: string) => {
    const gans: Record<string, string> = {
      "Ashwini": "Dev", "Bharani": "Manushya", "Krittika": "Rakshasa", "Rohini": "Manushya",
      "Mrigashirsha": "Dev", "Ardra": "Manushya", "Punarvasu": "Dev", "Pushya": "Dev",
      "Ashlesha": "Rakshasa", "Magha": "Rakshasa", "Purva Phalguni": "Manushya", "Uttara Phalguni": "Manushya",
      "Hasta": "Dev", "Chitra": "Rakshasa", "Swati": "Dev", "Vishakha": "Rakshasa",
      "Anuradha": "Dev", "Jyeshtha": "Rakshasa", "Mula": "Rakshasa", "Purva Ashadha": "Manushya",
      "Uttara Ashadha": "Manushya", "Shravana": "Dev", "Dhanishtha": "Rakshasa", "Shatabhisha": "Rakshasa",
      "Purva Bhadrapada": "Manushya", "Uttara Bhadrapada": "Manushya", "Revati": "Dev"
    };
    return gans[nakshatra] || "Manushya";
  };

  const getLuckyGod = (lagnaSign: string) => {
    const gods: Record<string, string> = {
      "Aries": "Hanuman", "Taurus": "Lakshmi", "Gemini": "Vishnu", "Cancer": "Shiva",
      "Leo": "Shiva", "Virgo": "Vishnu", "Libra": "Lakshmi", "Scorpio": "Hanuman",
      "Sagittarius": "Vishnu", "Capricorn": "Shani", "Aquarius": "Indra", "Pisces": "Vishnu"
    };
    return gods[lagnaSign] || "Vishnu";
  };

  const getLuckyMetal = (sunSign: string) => {
    const metals: Record<string, string> = {
      "Aries": "Copper", "Taurus": "Silver", "Gemini": "Bronze", "Cancer": "Silver",
      "Leo": "Gold", "Virgo": "Bronze", "Libra": "Silver", "Scorpio": "Iron",
      "Sagittarius": "Gold", "Capricorn": "Iron", "Aquarius": "Iron", "Pisces": "Silver"
    };
    return metals[sunSign] || "Gold";
  };

  const getLuckyDay = (sunSign: string) => {
    const days: Record<string, string> = {
      "Aries": "Tuesday, Sunday", "Taurus": "Friday, Monday", "Gemini": "Wednesday, Friday",
      "Cancer": "Monday, Thursday", "Leo": "Sunday, Tuesday", "Virgo": "Wednesday, Friday",
      "Libra": "Friday, Wednesday", "Scorpio": "Tuesday, Thursday", "Sagittarius": "Thursday, Sunday",
      "Capricorn": "Saturday, Friday", "Aquarius": "Saturday, Wednesday", "Pisces": "Thursday, Monday"
    };
    return days[sunSign] || "Tuesday, Thursday, Friday";
  };

  const getDestinyNumber = (day: number, month: number, year: number) => {
    const sum = (day + month + year).toString().split('').reduce((a: number, b: string) => a + parseInt(b), 0);
    const finalSum = sum.toString().split('').reduce((a: number, b: string) => a + parseInt(b), 0);
    const finalFinalSum = finalSum > 9 ? finalSum.toString().split('').reduce((a: number, b: string) => a + parseInt(b), 0) : finalSum;
    return finalFinalSum.toString();
  };

  // ── Shared inline style atoms ──────────────────────────────────────────────
  const S = {
    // Native <select> — no Radix, no body-padding injection, no layout shift
    sel: {
      display:"block", width:"100%", height:"44px", minWidth:"100%",
      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)",
      borderRadius:"12px", color:"white", padding:"0 32px 0 12px",
      fontSize:"14px", outline:"none", cursor:"pointer",
      WebkitAppearance:"none", appearance:"none",
      boxSizing:"border-box", transition:"none",
      transform:"translateZ(0)", willChange:"transform", backfaceVisibility:"hidden",
    } as React.CSSProperties,
    inp: {
      display:"block", width:"100%", height:"44px",
      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)",
      borderRadius:"12px", color:"white", padding:"0 14px",
      fontSize:"14px", outline:"none", boxSizing:"border-box",
    } as React.CSSProperties,
    label: { color:"rgba(255,255,255,0.65)", fontSize:"13px", fontWeight:500, display:"flex", alignItems:"center", gap:"7px", marginBottom:"8px" } as React.CSSProperties,
    subLabel: { color:"rgba(255,255,255,0.3)", fontSize:"11px", marginBottom:"4px" } as React.CSSProperties,
    card: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"20px" } as React.CSSProperties,
    row: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"13px" } as React.CSSProperties,
  };

  return (
    <>
      <Helmet>
        <title>Free Kundli by Date of Birth | Janam Kundli Online — Instant & Accurate</title>
        <meta name="description" content="Generate your free Janam Kundli by date of birth, time & place. Get instant Vedic birth chart, dosha analysis, dasha timeline & AI predictions. No sign-up needed." />
        <meta name="keywords" content="astrology chart, vedic astrology chart, vedic astrology birth chart, vedic astrology calculator, kundali, janam kundli by date of birth, birth chart calculator, janam kundli online, kundali online, free horoscope by date of birth, dosha analysis" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://veadicastro.in/free-kundli-generator" />
        
        {/* Google Fonts Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Free Kundli by Date of Birth | Janam Kundli Online — Instant & Accurate" />
        <meta property="og:description" content="Generate kundali by date of birth, time & place. Get instant Vedic astrology predictions, dosha analysis, dasha timeline & remedies. Kundali online available 24/7." />
        <meta property="og:url" content="https://veadicastro.in/free-kundli-generator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://veadicastro.in/og-kundli-generator.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Kundli by Date of Birth | Janam Kundli Online — Veadicastro" />
        <meta name="twitter:description" content="Generate kundali by date of birth, time & place. Get instant Vedic astrology predictions, dosha analysis, dasha timeline & remedies. Kundali online available." />
        <meta name="twitter:image" content="https://veadicastro.in/og-kundli-generator.jpg" />
        
        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Kundali Online Generator",
          "description": "Generate kundali by date of birth, time and place. Get instant Vedic astrology predictions, dosha analysis, dasha timeline and remedies. Kundali online available 24/7.",
          "url": "https://veadicastro.in/free-kundli-generator",
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
          },
          "featureList": [
            "Kundali Generation",
            "Accurate Planetary Positions",
            "Manglik & Kaal Sarp Dosha Analysis",
            "Vimshottari Dasha Timeline",
            "Personalized Vedic Remedies",
            "AI-Powered Astrology Predictions"
          ],
          "screenshot": "https://veadicastro.in/images/kundli-generator-screenshot.jpg",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "312",
            "bestRating": "5"
          },
          "author": {
            "@type": "Organization",
            "name": "Veadicastro",
            "url": "https://veadicastro.in"
          }
        }
        `}
        </script>
        
                
        <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Generate Free Kundli Online",
          "description": "Step-by-step guide to generate your janam kundli by date of birth, time and place",
          "totalTime": "PT2M",
          "supply": [],
          "tool": [],
          "step": [
            {
              "@type": "HowToStep",
              "name": "Enter Birth Details",
              "text": "Fill in your full name, date of birth, exact birth time (in 24-hour format), and birth place. Use the location search to find your city.",
              "image": "https://veadicastro.in/images/step1-enter-details.jpg"
            },
            {
              "@type": "HowToStep",
              "name": "Generate Kundli",
              "text": "Click the 'Generate Kundli' button. Our advanced AI calculates planetary positions using Swiss Ephemeris and authentic Vedic astrology algorithms.",
              "image": "https://veadicastro.in/images/step2-generate.jpg"
            },
            {
              "@type": "HowToStep",
              "name": "View Your Kundli",
              "text": "Instantly view your complete janam kundli with birth chart, planetary positions, dosha analysis, dasha timeline, and personalized remedies. Download or share for free.",
              "image": "https://veadicastro.in/images/step3-view-kundli.jpg"
            }
          ]
        }
        `}
        </script>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        /*
         * ROOT FIX — prevents the page-width shift caused by Radix UI Select
         * adding padding-right to <body> when a dropdown portal opens.
         * This is the #1 cause of the "box bouncing left" bug.
         */
        html { overflow-y: scroll; scrollbar-gutter: stable; }

        .fkg-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #07070c; color: white; }
        .fkg-serif { font-family: 'Playfair Display', serif; }
        .fkg-pink-glow { text-shadow: 0 0 36px rgba(236,72,153,.5); }
        .fkg-glass { background: rgba(255,255,255,.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.08); }
        .fkg-btn-pink { background: linear-gradient(135deg,#ec4899,#be185d); }
        .fkg-btn-pink:hover { background: linear-gradient(135deg,#f472b6,#ec4899); }

        /* Native select option bg */
        select option { background: #180a20; color: white; }
        select:focus  { border-color: #ec4899 !important; box-shadow: 0 0 0 1px #ec4899; }
        input:focus   { border-color: #ec4899 !important; box-shadow: 0 0 0 1px #ec4899; outline: none; }

        /* Spinner */
        @keyframes fkg-spin { to { transform: rotate(360deg); } }
        .fkg-spin { animation: fkg-spin 1s linear infinite; }

        /* Pulse ring for avatar */
        @keyframes fkg-pulse { 0%{box-shadow:0 0 0 0 rgba(236,72,153,.35)} 70%{box-shadow:0 0 0 10px rgba(236,72,153,0)} 100%{box-shadow:0 0 0 0 rgba(236,72,153,0)} }
        .fkg-pulse { animation: fkg-pulse 3s ease-in-out infinite; }

        /* Slow star blink — opacity only, NO translate/transform */
        @keyframes fkg-blink { 0%,100%{opacity:.08} 50%{opacity:.28} }
      `}</style>

      <div className="fkg-root" style={{ position:"relative" }}>

        {/* ── BACKGROUND — fixed, purely decorative, zero layout impact ── */}
        <div aria-hidden="true" style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          {/* Two static gradient blobs — no animation at all */}
          <div style={{ position:"absolute", top:"-120px", right:"-120px", width:"420px", height:"420px", borderRadius:"50%", background:"radial-gradient(circle, rgba(190,24,93,0.05) 0%, transparent 70%)" }} />
          <div style={{ position:"absolute", bottom:"-120px", left:"-120px", width:"360px", height:"360px", borderRadius:"50%", background:"radial-gradient(circle, rgba(109,40,217,0.04) 0%, transparent 70%)" }} />
          {/* 8 hand-positioned static star dots - no animation */}
          {([[7,12],[19,35],[47,68],[61,24],[75,52],[23,57],[41,90],[58,44]] as [number,number][]).map(([t,l],i) => (
            <div key={i} style={{ position:"absolute", borderRadius:"50%", background:"white", width:"1.5px", height:"1.5px", top:`${t}%`, left:`${l}%`, opacity:"0.15" }} />
          ))}
        </div>

        {/* ── ALL PAGE CONTENT — sits above bg ── */}
        <div style={{ position:"relative", zIndex:1 }}>
          {/* // // // AdSense Ad - Above Content - REMOVED - REMOVED - REMOVED */}
          <div className="my-6 flex justify-center">
            <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
          </div>

          {/* HEADER */}
          <header style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(5,3,10,0.80)", backdropFilter:"blur(18px)" }}>
            <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"0 24px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <button onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:"10px", background:"none", border:"none", color:"white", cursor:"pointer" }}>
                <img src="/logo.jpg" alt="Veadicastro kundali online" style={{ width:"36px", height:"36px", borderRadius:"50%" }} />
                <span className="fkg-serif" style={{ fontSize:"17px", fontWeight:700 }}>Veadicastro</span>
              </button>
              <button onClick={() => navigate("/free-5-minutes-astrology-ai")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"13px" }}>
                Free 5-Minutes Astrology
              </button>
              <button onClick={() => navigate("/free-ai-astrologer-chat")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"13px" }}>
                ← Free AI Chat
              </button>
              <button onClick={() => navigate("/chatgpt-astrology")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"13px" }}>
                ChatGPT Astrology
              </button>
              <button onClick={() => navigate("/ai-astrology-prediction")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"13px" }}>
                AI Astrology Prediction
              </button>
              <button onClick={() => navigate("/today-horoscope")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"13px" }}>
                Today's Horoscope
              </button>
              <button onClick={() => navigate("/free-kundali-matching")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"13px" }}>
                Kundli Matching
              </button>
            </div>
          </header>

          {/* HERO */}
          <section style={{ padding:"56px 16px 36px", textAlign:"center" }}>
            <p style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", color:"#ec4899", border:"1px solid rgba(236,72,153,0.3)", borderRadius:"999px", padding:"6px 16px", marginBottom:"20px" }}>
              <Sparkles style={{ width:"12px", height:"12px" }} /> Kundali Online Generator — Instant & Accurate
            </p>
            <h1 className="fkg-serif" style={{ fontSize:"clamp(30px,6vw,54px)", fontWeight:900, lineHeight:1.1, marginBottom:"14px" }}>
              Free Janam Kundli by Date of Birth — <span className="fkg-pink-glow" style={{ color:"#ec4899" }}>Instant Online</span>
            </h1>
            
            {/* AdSense Ad - After Main Title */}
            <div className="flex justify-center my-6">
              <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
            </div>
            
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"16px", maxWidth:"540px", margin:"0 auto" }}>
              Generate your kundali online instantly. Our Vedic astrology calculator provides accurate planetary positions, dosha analysis, and personalized remedies. <a href="/" style={{color:"#ec4899", textDecoration:"underline"}}>See Your Future in Just 30 Second</a> or explore our <a href="/ai-astrology" style={{color:"#ec4899", textDecoration:"underline"}}>AI astrology platform</a> for instant insights. You can also try our <a href="/free-ai-astrologer-chat" style={{color:"#ec4899", textDecoration:"underline"}}>free AI astrology chat</a>, <a href="/chatgpt-astrology" style={{color:"#ec4899", textDecoration:"underline"}}>ChatGPT Astrology</a>, or <a href="/ai-astrology-prediction" style={{color:"#ec4899", textDecoration:"underline"}}>AI Astrology Prediction</a> for quick guidance. For marriage timing, use our <a href="/ai-marriage-prediction-by-date-of-birth" style={{color:"#ec4899", textDecoration:"underline"}}>birth-chart marriage timing tool</a>. Explore our <a href="/blog" style={{color:"#ec4899", textDecoration:"underline"}}>astrology blogs</a> for more knowledge. Try our <a href="/free-kundali-matching" style={{color:"#ec4899", textDecoration:"underline"}}>Free Kundli Matching Calculator</a> for accurate marriage compatibility analysis, or explore our <a href="/" style={{color:"#ec4899", textDecoration:"underline"}}>Home page</a> for more Vedic astrology tools and resources.
            </p>
          </section>

          {/* MAIN */}
          <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 16px 56px" }}>
            {/* SEO CONTENT - ALWAYS VISIBLE */}
            <div style={{ marginBottom:"32px", padding:"20px", background:"rgba(255,255,255,0.02)", borderRadius:"16px", border:"1px solid rgba(255,255,255,0.05)" }}>
              <h2 style={{ fontSize:"18px", fontWeight:600, marginBottom:"12px", color:"rgba(255,255,255,0.8)" }}>What is Janam Kundli?</h2>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", lineHeight:1.6, margin:0 }}>
                Janam Kundli is your Vedic birth chart that shows planetary positions at the time of your birth. It reveals your personality, career path, relationships, and life challenges through ancient Vedic astrology principles. Generate your free kundli by date of birth to get instant predictions, dosha analysis, and personalized remedies.
              </p>
            </div>
            
            {!kundliData ? (

              /* ════════════════ FORM ════════════════ */
              <div style={{ maxWidth:"580px", margin:"0 auto", minHeight:"600px", transform:"translateZ(0)", willChange:"transform" }}>
                <div className="fkg-glass" style={{ borderRadius:"24px", padding:"32px", position:"relative", overflow:"visible", transform:"translateZ(0)", backfaceVisibility:"hidden" }}>
                  <h2 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, textAlign:"center", marginBottom:"26px" }}>
                    Generate Your <span style={{ color:"#ec4899" }}>Free Janam Kundli Online</span>
                  </h2>

                  <div style={{ display:"flex", flexDirection:"column", gap:"20px", position:"relative", isolation:"isolate" }}>

                    {/* Name */}
                    <div>
                      <label style={S.label}><User style={{ width:"15px", height:"15px", color:"#ec4899" }} /> Full Name *</label>
                      <input type="text" placeholder="Enter your full name" value={birthDetails.name}
                        onChange={e => setBirthDetails(p => ({ ...p, name: e.target.value }))} style={S.inp} />
                    </div>

                    {/* DOB */}
                    <div>
                      <label style={S.label}><Calendar style={{ width:"15px", height:"15px", color:"#ec4899" }} /> Date of Birth *</label>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", isolation:"isolate" }}>
                        {/* Day */}
                        <div style={{ transform:"translateZ(0)", willChange:"transform" }}>
                          <p style={S.subLabel}>Day</p>
                          <div style={{ position:"relative" }}>
                            <select style={S.sel} value={birthDetails.day} onChange={e => setBirthDetails(p=>({...p,day:+e.target.value}))}>
                              {days.map(d=><option key={d} value={d}>{d}</option>)}
                            </select>
                            <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"9px", pointerEvents:"none", color:"rgba(255,255,255,0.35)" }}>▼</span>
                          </div>
                        </div>
                        {/* Month */}
                        <div style={{ transform:"translateZ(0)", willChange:"transform" }}>
                          <p style={S.subLabel}>Month</p>
                          <div style={{ position:"relative" }}>
                            <select style={S.sel} value={birthDetails.month} onChange={e => setBirthDetails(p=>({...p,month:+e.target.value}))}>
                              {months.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
                            </select>
                            <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"9px", pointerEvents:"none", color:"rgba(255,255,255,0.35)" }}>▼</span>
                          </div>
                        </div>
                        {/* Year */}
                        <div style={{ transform:"translateZ(0)", willChange:"transform" }}>
                          <p style={S.subLabel}>Year</p>
                          <div style={{ position:"relative" }}>
                            <select style={S.sel} value={birthDetails.year} onChange={e => setBirthDetails(p=>({...p,year:+e.target.value}))}>
                              {years.map(y=><option key={y} value={y}>{y}</option>)}
                            </select>
                            <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"9px", pointerEvents:"none", color:"rgba(255,255,255,0.35)" }}>▼</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"11px", marginTop:"6px" }}>{fmtDate(birthDetails.day, birthDetails.month, birthDetails.year)}</p>
                    </div>

                    {/* TOB */}
                    <div>
                      <label style={S.label}><Clock style={{ width:"15px", height:"15px", color:"#ec4899" }} /> Time of Birth *</label>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", isolation:"isolate" }}>
                        {/* Hour */}
                        <div style={{ transform:"translateZ(0)", willChange:"transform" }}>
                          <p style={S.subLabel}>Hour</p>
                          <div style={{ position:"relative" }}>
                            <select style={S.sel} value={birthDetails.hour} onChange={e => setBirthDetails(p=>({...p,hour:+e.target.value}))}>
                              {hours.map(h=><option key={h} value={h}>{h}</option>)}
                            </select>
                            <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"9px", pointerEvents:"none", color:"rgba(255,255,255,0.35)" }}>▼</span>
                          </div>
                        </div>
                        {/* Minute */}
                        <div style={{ transform:"translateZ(0)", willChange:"transform" }}>
                          <p style={S.subLabel}>Minute</p>
                          <div style={{ position:"relative" }}>
                            <select style={S.sel} value={birthDetails.minute} onChange={e => setBirthDetails(p=>({...p,minute:+e.target.value}))}>
                              {minutes.map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
                            </select>
                            <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"9px", pointerEvents:"none", color:"rgba(255,255,255,0.35)" }}>▼</span>
                          </div>
                        </div>
                        {/* AM/PM */}
                        <div style={{ transform:"translateZ(0)", willChange:"transform" }}>
                          <p style={S.subLabel}>AM / PM</p>
                          <div style={{ position:"relative" }}>
                            <select style={S.sel} value={birthDetails.ampm} onChange={e => setBirthDetails(p=>({...p,ampm:e.target.value as "AM"|"PM"}))}>
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                            <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"9px", pointerEvents:"none", color:"rgba(255,255,255,0.35)" }}>▼</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"11px", marginTop:"6px" }}>{fmtTime(birthDetails.hour, birthDetails.minute, birthDetails.ampm)}</p>
                    </div>

                    {/* Place of Birth */}
                    <div ref={locationRef} style={{ position:"relative" }}>
                      <label style={S.label}><MapPin style={{ width:"15px", height:"15px", color:"#ec4899" }} /> Place of Birth *</label>
                      <div style={{ position:"relative" }}>
                        <input
                          type="text" placeholder="Search your birth city…"
                          value={birthDetails.birthPlace} autoComplete="off"
                          onChange={e => setBirthDetails(p=>({...p,birthPlace:e.target.value}))}
                          style={{ ...S.inp, paddingRight:"36px" }}
                        />
                        {isSearchingLocation && (
                          <Loader2 className="fkg-spin" style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", width:"15px", height:"15px", color:"#ec4899" }} />
                        )}
                      </div>

                      {/* Location dropdown — solid bg, high z-index, onMouseDown prevents blur race */}
                      {showLocationSuggestions && locationSuggestions.length > 0 && (
                        <div style={{ position:"absolute", top:"100%", left:0, right:0, marginTop:"4px", zIndex:99999, borderRadius:"12px", overflow:"hidden", border:"1px solid rgba(255,255,255,0.15)", boxShadow:"0 20px 60px rgba(0,0,0,0.98)", maxHeight:"200px", overflowY:"auto", background:"rgba(12,4,18,0.98)" }}>
                          {locationSuggestions.map((place, i) => (
                            <div key={i}
                              onMouseDown={e => { e.preventDefault(); selectLocation(place); }}
                              style={{ padding:"12px 16px", background:"rgba(12,4,18,0.98)", borderBottom: i<locationSuggestions.length-1?"1px solid rgba(255,255,255,0.08)":"none", cursor:"pointer", fontSize:"14px", color:"rgba(255,255,255,0.95)", display:"flex", alignItems:"flex-start", gap:"10px", transition:"all 0.2s ease" }}
                              onMouseEnter={e=>(e.currentTarget.style.background="rgba(236,72,153,0.2)")}
                              onMouseLeave={e=>(e.currentTarget.style.background="rgba(12,4,18,0.98)")}
                            >
                              <MapPin style={{ width:"14px", height:"14px", color:"#ec4899", marginTop:"1px", flexShrink:0 }} />
                              <span style={{ lineHeight:"1.4", wordBreak:"break-word" }}>{place.display_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Generate button */}
                    <button onClick={generateKundli} disabled={isGenerating} className="fkg-btn-pink"
                      style={{ width:"100%", height:"48px", borderRadius:"12px", border:"none", color:"white", fontWeight:600, fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", cursor:isGenerating?"not-allowed":"pointer", opacity:isGenerating?0.55:1, transition:"opacity 0.2s" }}>
                      {isGenerating
                        ? <><Loader2 className="fkg-spin" style={{ width:"16px", height:"16px" }} /> Generating Your Kundli…</>
                        : <><Sparkles style={{ width:"16px", height:"16px" }} /> Generate Kundli — It's Free</>}
                    </button>
                  </div>
                </div>
              </div>

            ) : (

              /* ════════════════ RESULTS ════════════════ */
              <div style={{ display:"flex", flexDirection:"column", gap:"18px", maxWidth:"768px", margin:"0 auto" }}>

                {/* Summary */}
                <div className="fkg-glass" style={{ borderRadius:"16px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                  <div className="fkg-pulse" style={{ width:"46px", height:"46px", borderRadius:"50%", background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <User style={{ width:"20px", height:"20px", color:"rgba(255,255,255,0.45)" }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 className="fkg-serif" style={{ fontWeight:700, fontSize:"15px" }}>{birthDetails.name}'s Kundli</h3>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"12px", color:"rgba(255,255,255,0.4)", fontSize:"12px", marginTop:"4px" }}>
                      <span>📅 {fmtDate(birthDetails.day, birthDetails.month, birthDetails.year)}</span>
                      <span>🕐 {fmtTime(birthDetails.hour, birthDetails.minute, birthDetails.ampm)}</span>
                      <span>📍 {birthDetails.birthPlace.split(",")[0]}</span>
                    </div>
                  </div>
                  <button onClick={() => { setKundliData(null); setBirthDetails({name:"",day:7,month:3,year:2000,hour:12,minute:0,ampm:"AM",birthPlace:""}); }}
                    style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"6px 12px", background:"none", cursor:"pointer", flexShrink:0 }}>
                    New Kundli
                  </button>
                </div>

                {/* Highlights */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
                  {[["☀️","Sun Sign",kundliData.sunSign],["🌙","Moon Sign",kundliData.moonSign],["⬆️","Ascendant",kundliData.lagnaSign],["✨","Nakshatra",kundliData.nakshatra?.name??"—"]].map(([e,l,v],i)=>(
                    <div key={i} className="fkg-glass" style={{ borderRadius:"12px", padding:"12px", textAlign:"center" }}>
                      <div style={{ fontSize:"20px", marginBottom:"4px" }}>{e}</div>
                      <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"11px", marginBottom:"2px" }}>{l}</div>
                      <div style={{ fontWeight:600, fontSize:"13px" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Tab bar */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", background:"rgba(255,255,255,0.04)", borderRadius:"12px", padding:"4px" }}>
                  {[{id:"basic",label:"Basic & Panchang",I:Star},{id:"planets",label:"Planets",I:Globe},{id:"dosha",label:"Dosha",I:Heart},{id:"dasha",label:"Dasha",I:Zap},{id:"remedies",label:"Remedies",I:Sparkles}].map(t=>(
                    <button key={t.id} onClick={()=>setActiveTab(t.id)} className={activeTab===t.id?"fkg-btn-pink":""}
                      style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"8px", border:"none", color:activeTab===t.id?"white":"rgba(255,255,255,0.5)", fontWeight:500, fontSize:"13px", cursor:"pointer", background:activeTab===t.id?undefined:"none", transition:"all 0.15s" }}>
                      <t.I style={{ width:"13px", height:"13px" }} />{t.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="fkg-glass" style={{ borderRadius:"22px", padding:"26px" }}>

                  {/* BASIC */}
                  {activeTab==="basic" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
                      <h3 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899" }}>Generate Your Free Janam Kundli Online</h3>
                      {[
                        { title:"Basic Details", rows:[["Name",birthDetails.name],["Birth Date & Time",`${fmtDate(birthDetails.day,birthDetails.month,birthDetails.year)} | ${fmtTime(birthDetails.hour,birthDetails.minute,birthDetails.ampm)}`],["Birth Place",birthDetails.birthPlace.split(",")[0]],["Nakshatra",kundliData.nakshatra?.name||"—"],["Ascendant",kundliData.lagnaSign],["Sun Sign",kundliData.sunSign],["Moon Sign",kundliData.moonSign||"—"]] },
                        { title:"Kundli Details", rows:[["Nakshatra Lord",nakLords[kundliData.nakshatra?.name||""]||"—"],["Yog",aiAnalysis?.basicPanchanga.yoga||"—"],["Tithi",aiAnalysis?.basicPanchanga.tithi||"—"],["Tatva",getTatva(kundliData.sunSign)],["Paya",getPaya(kundliData.moonSign)],["Varna",getVarna(kundliData.lagnaSign)],["Sign Lord",signLords[kundliData.lagnaSign]||"—"],["Yoni",getYoni(kundliData.nakshatra?.name||"")],["Charan",kundliData.nakshatra?.pada?.toString()||"—"],["Karan",aiAnalysis?.basicPanchanga.karana||"—"],["Yunja","Madhya"],["Name Alphabet",getNameAlphabet(kundliData.nakshatra?.name||"")],["Gan",getGan(kundliData.nakshatra?.name||"")],["Nadi","Madhya"],["Vashya","Vanchar"]] },
                        { title:"Favourable", rows:[["Lucky Stone",luckyStones[kundliData.sunSign]||"Ruby"],["Mantra",mantras[kundliData.sunSign]||"—"],["Lucky Color",luckyColors[kundliData.sunSign]||"—"],["Lucky God",getLuckyGod(kundliData.lagnaSign)],["Lucky Metal",getLuckyMetal(kundliData.sunSign)],["Lucky Day",getLuckyDay(kundliData.sunSign)],["Destiny Number",getDestinyNumber(birthDetails.day,birthDetails.month,birthDetails.year)],["Radical Ruler",signLords[kundliData.lagnaSign]||"Jupiter"]] },
                      ].map(card=>(
                        <div key={card.title} style={S.card}>
                          <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px" }}>{card.title}</h4>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:"0 20px" }}>
                            {card.rows.map(([lbl,val])=>(
                              <div key={lbl} style={S.row}>
                                <span style={{ color:"rgba(255,255,255,0.45)" }}>{lbl}</span>
                                <span style={{ fontWeight:500, textAlign:"right", maxWidth:"55%" }}>{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PLANETS */}
                  {activeTab==="planets" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                      <h3 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899" }}>Position of Planets</h3>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", fontSize:"13px", borderCollapse:"collapse" }}>
                          <thead>
                            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                              {["","Planet","R","Sign","Sign Lord","Degree","Nakshatra","Nak. Lord","House"].map(h=>(
                                <th key={h} style={{ textAlign:"left", padding:"9px 8px", color:"rgba(255,255,255,0.4)", fontWeight:500 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {kundliData.planetsList.map(p=>(
                              <tr key={p.key} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                                <td style={{ padding:"8px 8px" }}>{planetEmoji[p.key]??""}</td>
                                <td style={{ padding:"8px 8px", fontWeight:500, textTransform:"capitalize" }}>{p.name}</td>
                                <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{p.speed&&p.speed<0?"R":"-"}</td>
                                <td style={{ padding:"8px 8px" }}>{p.sign}</td>
                                <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{signLords[p.sign]??"-"}</td>
                                <td style={{ padding:"8px 8px" }}>{p.longitude.toFixed(2)}</td>
                                <td style={{ padding:"8px 8px" }}>{p.nakshatra.name}</td>
                                <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{nakLords[p.nakshatra.name]??"-"}</td>
                                <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{getHouseNum(p.longitude,kundliData.ascendant)}</td>
                              </tr>
                            ))}
                            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding:"8px 8px" }}>⬆️</td>
                              <td style={{ padding:"8px 8px", fontWeight:500 }}>Ascendant</td>
                              <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>-</td>
                              <td style={{ padding:"8px 8px" }}>{kundliData.lagnaSign}</td>
                              <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{signLords[kundliData.lagnaSign]??"-"}</td>
                              <td style={{ padding:"8px 8px" }}>{kundliData.ascendant.toFixed(2)}</td>
                              <td style={{ padding:"8px 8px" }}>{kundliData.nakshatra?.name??"-"}</td>
                              <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{nakLords[kundliData.nakshatra?.name??""]??"-"}</td>
                              <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>1</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* DOSHA */}
                  {activeTab==="dosha" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                      <h3 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899" }}>Accurate Planetary Positions & Dosha Report</h3>
                      
                      {isGeneratingAI ? (
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px", color:"rgba(255,255,255,0.5)", fontSize:"14px" }}>
                          <Loader2 className="fkg-spin" style={{ width:"20px", height:"20px", marginRight:"10px" }} />
                          Analyzing doshas in your birth chart...
                        </div>
                      ) : (
                        <>
                          {/* AI-Generated Detailed Analysis */}
                          {aiAnalysis?.doshaAnalysis && aiAnalysis.doshaAnalysis.length > 0 && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px", color:"#ec4899" }}>🔮 AI-Powered Dosha Insights</h4>
                              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6, marginBottom:"16px" }}>
                                Based on your birth chart analysis, here are the detailed insights about doshas affecting your life:
                              </div>
                              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                                {aiAnalysis.doshaAnalysis.map((insight, i) => (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px", color:"rgba(255,255,255,0.5)", fontSize:"13px", lineHeight:1.5 }}>
                                    <Sparkles style={{ width:"14px", height:"14px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Traditional Dosha Analysis */}
                          {[
                            { title:"Manglik Dosha", present:hasManglik(), desc:hasManglik()?"Manglik Dosha is present due to Mars placement in specific houses. This affects marriage compatibility and temperament. Remedies include Kumbh Vivah and Mars-specific pujas.":"Manglik Dosha is not present. Your Mars placement is harmonious for relationships." },
                            { title:"Kaalsharpa Dosha", present:hasKalsarpa(), desc:hasKalsarpa()?"Kaal Sarp Yog is formed as all planets are between Rahu and Ketu. This creates obstacles and delays. Remedies include Rahu-Ketu Shanti and regular charity.":"Kaal Sarp Yog is not formed in your chart. Planetary distribution is balanced." },
                            { title:"Sadhesati Dosha", present:hasSadhesati(), desc:hasSadhesati()?"You are currently undergoing Saturn's transit over your Moon sign. This 7.5-year period brings challenges and lessons. Remedies include Shani puja and helping the elderly.":"You are not currently under Sadhesati. Saturn's transit is favorable." },
                            { title:"Pitra Dosha", present:hasPitra(), desc:hasPitra()?"Pitra Dosha is present due to Sun&apos;s placement in the 9th house. This indicates ancestral karmic influences. Remedies include Tarpanam and feeding Brahmins.":"Pitra Dosha is not present. Your ancestral blessings are strong." },
                          ].map(d=>(
                            <div key={d.title} style={S.card}>
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
                                <h4 style={{ fontWeight:600, fontSize:"15px", display:"flex", alignItems:"center", gap:"8px" }}>
                                  {d.present ? "⚠️" : "✅"} {d.title}
                                </h4>
                                <span style={{ padding:"4px 12px", borderRadius:"999px", fontSize:"11px", fontWeight:600, background:d.present?"rgba(239,68,68,0.12)":"rgba(34,197,94,0.12)", color:d.present?"#f87171":"#4ade80", border:`1px solid ${d.present?"rgba(239,68,68,0.25)":"rgba(34,197,94,0.25)"}` }}>
                                  {d.present?"Present":"Not Present"}
                                </span>
                              </div>
                              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"13px", lineHeight:1.6, margin:0 }}>{d.desc}</p>
                            </div>
                          ))}

                          {/* Additional Insights */}
                          <div style={S.card}>
                            <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"12px" }}>📊 Overall Dosha Impact Assessment</h4>
                            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6 }}>
                              {(() => {
                                const presentDoshas = [hasManglik(), hasKalsarpa(), hasSadhesati(), hasPitra()].filter(Boolean).length;
                                if (presentDoshas === 0) return "Excellent! No major doshas detected in your birth chart. You have a smooth path ahead with minimal karmic obstacles.";
                                if (presentDoshas === 1) return "Minor dosha influence detected. With proper remedies and awareness, you can easily overcome any challenges.";
                                if (presentDoshas === 2) return "Moderate dosha presence. Consistent spiritual practice and remedies will help balance these karmic influences.";
                                return "Multiple doshas require dedicated remedial measures. Consider consulting a learned astrologer for personalized guidance.";
                              })()}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* DASHA */}
                  {activeTab==="dasha" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                      <h3 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899" }}>Personalized Remedies & Dasha Predictions</h3>
                      
                      {isGeneratingAI ? (
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px", color:"rgba(255,255,255,0.5)", fontSize:"14px" }}>
                          <Loader2 className="fkg-spin" style={{ width:"20px", height:"20px", marginRight:"10px" }} />
                          Calculating dasha periods and current influences...
                        </div>
                      ) : (
                        <>
                          {/* AI-Generated Current Dasha Impact */}
                          {aiAnalysis?.currentDashaImpact && aiAnalysis.currentDashaImpact.length > 0 && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px", color:"#ec4899" }}>🔮 Current Dasha Impact Analysis</h4>
                              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6, marginBottom:"16px" }}>
                                How your current Mahadasha is influencing various aspects of your life:
                              </div>
                              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                                {aiAnalysis.currentDashaImpact.map((impact, i) => (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px", color:"rgba(255,255,255,0.5)", fontSize:"13px", lineHeight:1.5 }}>
                                    <Zap style={{ width:"14px", height:"14px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                    <span>{impact}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Current Dasha */}
                          {aiAnalysis?.currentDasha && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px" }}>Current MahaDasha Period</h4>
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px", background:"rgba(236,72,153,0.08)", borderRadius:"10px", marginBottom:"12px" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                                  <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"rgba(236,72,153,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#ec4899", fontWeight:700, fontSize:"16px" }}>
                                    {aiAnalysis.currentDasha.planet[0]}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight:600, fontSize:"16px", color:"white" }}>{aiAnalysis.currentDasha.planet} MahaDasha</div>
                                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"12px" }}>
                                      {aiAnalysis.currentDasha.years} years • {aiAnalysis.currentDasha.startDate.toLocaleDateString()} - {aiAnalysis.currentDasha.endDate.toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ textAlign:"right", fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>
                                  <div>Started: {aiAnalysis.currentDasha.startDate.toLocaleDateString()}</div>
                                  <div>Ends: {aiAnalysis.currentDasha.endDate.toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6 }}>
                                You are currently under the influence of {aiAnalysis.currentDasha.planet} MahaDasha, which governs major life events and themes during this period.
                              </div>
                            </div>
                          )}

                          {/* Dasha Timeline */}
                          <div style={S.card}>
                            <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"12px" }}>Complete Vimshottari Dasha Timeline</h4>
                            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6, marginBottom:"16px" }}>
                              The complete 120-year cycle of planetary periods showing the sequence of influences throughout your life:
                            </div>
                            {aiAnalysis?.dashaTimeline.map((period, i) => (
                              <div key={i} style={{ 
                                display:"flex", 
                                justifyContent:"space-between", 
                                padding:"8px 12px", 
                                borderBottom:"1px solid rgba(255,255,255,0.04)", 
                                fontSize:"13px",
                                background: aiAnalysis?.currentDasha?.planet === period.planet ? "rgba(236,72,153,0.1)" : "transparent",
                                borderLeft: aiAnalysis?.currentDasha?.planet === period.planet ? "3px solid #ec4899" : "none"
                              }}>
                                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                                  <span style={{ 
                                    width:"30px", 
                                    fontWeight: aiAnalysis?.currentDasha?.planet === period.planet ? "600" : "normal",
                                    color: aiAnalysis?.currentDasha?.planet === period.planet ? "#ec4899" : "rgba(255,255,255,0.3)"
                                  }}>
                                    {period.planet.substring(0, 2).toUpperCase()}
                                  </span>
                                  <div>
                                    <span style={{ 
                                      fontWeight: aiAnalysis?.currentDasha?.planet === period.planet ? "600" : "normal",
                                      color: aiAnalysis?.currentDasha?.planet === period.planet ? "white" : "rgba(255,255,255,0.8)"
                                    }}>
                                      {period.planet}
                                    </span>
                                    {aiAnalysis?.currentDasha?.planet === period.planet && (
                                      <span style={{ color:"#ec4899", fontSize:"11px", marginLeft:"6px" }}>• CURRENT</span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ textAlign:"right", fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>
                                  <div>{period.years} years</div>
                                  <div>{period.startDate.toLocaleDateString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Dasha Interpretation */}
                          <div style={S.card}>
                            <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"12px" }}>📈 Understanding Dasha Cycles</h4>
                            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6 }}>
                              Vimshottari Dasha divides your 120-year life into planetary periods. Each planet's dasha brings its unique qualities and challenges. 
                              The current dasha heavily influences your career, relationships, and major life decisions. 
                              Understanding these cycles helps you make timely decisions and prepare for upcoming transitions.
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* REMEDIES */}
                  {activeTab==="remedies" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                      <h3 className="fkg-serif" style={{ fontSize:"20px", fontWeight:700, color:"#ec4899" }}>Complete Vedic Astrology Analysis with AI</h3>
                      
                      {isGeneratingAI ? (
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px", color:"rgba(255,255,255,0.5)", fontSize:"14px" }}>
                          <Loader2 className="fkg-spin" style={{ width:"20px", height:"20px", marginRight:"10px" }} />
                          Generating personalized remedies based on your birth chart...
                        </div>
                      ) : (
                        <>
                          {/* Basic Lucky Items */}
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"12px" }}>
                            {[["💎","Lucky Stone",luckyStones[kundliData.sunSign]??"Ruby"],["🕉️","Personal Mantra",mantras[kundliData.sunSign]??"—"],["🎨","Lucky Colors",luckyColors[kundliData.sunSign]??"—"]].map(([icon,title,value])=>(
                              <div key={title} style={{ ...S.card, textAlign:"center" }}>
                                <div style={{ fontSize:"26px", marginBottom:"8px" }}>{icon}</div>
                                <div style={{ fontWeight:600, fontSize:"13px", marginBottom:"5px" }}>{title}</div>
                                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"12px" }}>{value}</div>
                              </div>
                            ))}
                          </div>

                          {/* AI-Generated Enhanced Remedies */}
                          {aiAnalysis?.enhancedRemedies && aiAnalysis.enhancedRemedies.length > 0 && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px", color:"#ec4899" }}>🔮 AI-Powered Personalized Remedies</h4>
                              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6, marginBottom:"16px" }}>
                                Based on your birth chart analysis, here are specific remedies tailored to your planetary positions:
                              </div>
                              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                                {aiAnalysis.enhancedRemedies.map((remedy, i) => (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px", color:"rgba(255,255,255,0.5)", fontSize:"13px", lineHeight:1.5 }}>
                                    <Heart style={{ width:"14px", height:"14px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                    <span>{remedy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Career Remedies */}
                          {aiAnalysis?.careerPredictions && aiAnalysis.careerPredictions.length > 0 && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px" }}>💼 Career Enhancement Remedies</h4>
                              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6, marginBottom:"16px" }}>
                                Specific remedies to boost your career prospects and professional growth:
                              </div>
                              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                                {aiAnalysis.careerPredictions.map((remedy, i) => (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px", color:"rgba(255,255,255,0.5)", fontSize:"13px", lineHeight:1.5 }}>
                                    <Star style={{ width:"14px", height:"14px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                    <span>{remedy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Relationship Remedies */}
                          {aiAnalysis?.relationshipInsights && aiAnalysis.relationshipInsights.length > 0 && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px" }}>💕 Relationship Harmony Remedies</h4>
                              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6, marginBottom:"16px" }}>
                                Remedies to improve relationships and marital harmony:
                              </div>
                              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                                {aiAnalysis.relationshipInsights.map((remedy, i) => (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px", color:"rgba(255,255,255,0.5)", fontSize:"13px", lineHeight:1.5 }}>
                                    <Heart style={{ width:"14px", height:"14px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                    <span>{remedy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Health Remedies */}
                          {aiAnalysis?.healthAnalysis && aiAnalysis.healthAnalysis.length > 0 && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px" }}>🏥 Health & Wellness Remedies</h4>
                              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6, marginBottom:"16px" }}>
                                Preventive measures and remedies for good health:
                              </div>
                              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                                {aiAnalysis.healthAnalysis.map((remedy, i) => (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px", color:"rgba(255,255,255,0.5)", fontSize:"13px", lineHeight:1.5 }}>
                                    <Sparkles style={{ width:"14px", height:"14px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                    <span>{remedy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Financial Remedies */}
                          {aiAnalysis?.financialOutlook && aiAnalysis.financialOutlook.length > 0 && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px" }}>💰 Wealth Enhancement Remedies</h4>
                              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6, marginBottom:"16px" }}>
                                Remedies to attract prosperity and financial stability:
                              </div>
                              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                                {aiAnalysis.financialOutlook.map((remedy, i) => (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px", color:"rgba(255,255,255,0.5)", fontSize:"13px", lineHeight:1.5 }}>
                                    <Star style={{ width:"14px", height:"14px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                    <span>{remedy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* General Remedies */}
                          <div style={S.card}>
                            <h4 style={{ fontWeight:600, marginBottom:"12px" }}>🌟 General Daily Practices</h4>
                            <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"8px" }}>
                              {aiAnalysis?.personalizedRemedies?.map((remedy, i) => (
                                <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"7px", color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>
                                  <ChevronRight style={{ width:"12px", height:"12px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                  {remedy}
                                </li>
                              )) || [
                                <li key="1" style={{ display:"flex", alignItems:"flex-start", gap:"7px", color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>
                                  <ChevronRight style={{ width:"12px", height:"12px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                  Chant your personal mantra 108 times daily at sunrise
                                </li>,
                                <li key="2" style={{ display:"flex", alignItems:"flex-start", gap:"7px", color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>
                                  <ChevronRight style={{ width:"12px", height:"12px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                  Wear your lucky stone on the ring finger of your right hand
                                </li>,
                                <li key="3" style={{ display:"flex", alignItems:"flex-start", gap:"7px", color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>
                                  <ChevronRight style={{ width:"12px", height:"12px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                  Donate food to the needy on your ruling planet&apos;s day
                                </li>,
                                <li key="4" style={{ display:"flex", alignItems:"flex-start", gap:"7px", color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>
                                  <ChevronRight style={{ width:"12px", height:"12px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                  Light a lamp at home every evening for inner peace
                                </li>
                              ]}
                            </ul>
                          </div>

                          {/* AI Predictions Summary */}
                          {aiAnalysis?.predictions && aiAnalysis.predictions.length > 0 && (
                            <div style={S.card}>
                              <h4 style={{ fontWeight:600, marginBottom:"12px" }}>🔮 Key Predictions Summary</h4>
                              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"8px" }}>
                                {aiAnalysis.predictions.map((prediction, i) => (
                                  <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"7px", color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>
                                    <Sparkles style={{ width:"12px", height:"12px", color:"#ec4899", marginTop:"2px", flexShrink:0 }} />
                                    {prediction}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                </div>{/* end tab content */}

                {/* Interactive Question Input */}
                <div style={{ borderRadius:"18px", padding:"28px", textAlign:"center", background:"linear-gradient(135deg,rgba(236,72,153,0.10),rgba(168,85,247,0.07))", border:"1px solid rgba(236,72,153,0.15)", maxWidth:"600px", margin:"0 auto" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"20px", justifyContent:"center" }}>
                    <img src="/optimized/vedika.webp" alt="Vedika AI astrologer for free kundli" style={{ width:"60px", height:"60px", borderRadius:"50%", objectFit:"cover", border:"3px solid rgba(236,72,153,0.3)" }} />
                    <div style={{ textAlign:"left" }}>
                      <h3 className="fkg-serif" style={{ fontSize:"20px", fontWeight:700, marginBottom:"8px" }}>Ask <span className="fkg-pink-glow" style={{ color:"#ec4899" }}>Vedika AI Astrologer</span></h3>
                      <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px", lineHeight:1.5 }}>
                        Hey <span style={{ color:"#ec4899", fontWeight:600 }}>{birthDetails.name || "there"}</span>! Ask me any question about your kundli, career, relationships, or future.
                      </p>
                    </div>
                  </div>
                  
                  <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"14px", marginBottom:"20px", textAlign:"center", lineHeight:1.5 }}>
                    Sign up to get 5 chats per day free with your personalized kundli report
                  </p>

                  <div style={{ position:"relative", marginBottom:"16px" }}>
                    <input
                      type="text"
                      placeholder="Type your question here..."
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && question.trim()) {
                          handleQuestionSubmit();
                        }
                      }}
                      style={{
                        width:"100%",
                        padding:"14px 16px",
                        borderRadius:"25px",
                        border:"1px solid rgba(255,255,255,0.2)",
                        background:"rgba(255,255,255,0.08)",
                        color:"white",
                        fontSize:"15px",
                        outline:"none",
                        transition:"all 0.2s ease"
                      }}
                      onFocus={e => e.target.style.borderColor = "rgba(236,72,153,0.5)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.2)"}
                    />
                    <button
                      onClick={handleQuestionSubmit}
                      disabled={!question.trim()}
                      className="fkg-btn-pink"
                      style={{
                        position:"absolute",
                        right:"4px",
                        top:"50%",
                        transform:"translateY(-50%)",
                        padding:"10px 20px",
                        borderRadius:"20px",
                        border:"none",
                        color:"white",
                        fontWeight:600,
                        fontSize:"14px",
                        display:"inline-flex",
                        alignItems:"center",
                        gap:"6px",
                        cursor:question.trim() ? "pointer" : "not-allowed",
                        opacity:question.trim() ? 1 : 0.5,
                        transition:"all 0.2s ease"
                      }}
                    >
                      <Send style={{ width:"14px", height:"14px" }} /> Ask
                    </button>
                  </div>

                  {/* Suggested Questions */}
                  <div style={{ textAlign:"left", marginBottom:"16px" }}>
                    <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"13px", marginBottom:"10px" }}>Popular questions:</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                      {[
                        "What does my future hold?",
                        "Will I get a good job?",
                        "When will I get married?",
                        "How can I improve my finances?",
                        "Is this year lucky for me?",
                        "What remedies should I follow?"
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setQuestion(suggestion)}
                          style={{
                            padding:"6px 12px",
                            borderRadius:"15px",
                            border:"1px solid rgba(255,255,255,0.1)",
                            background:"rgba(255,255,255,0.05)",
                            color:"rgba(255,255,255,0.6)",
                            fontSize:"12px",
                            cursor:"pointer",
                            transition:"all 0.2s ease"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(236,72,153,0.1)";
                            e.currentTarget.style.borderColor = "rgba(236,72,153,0.3)";
                            e.currentTarget.style.color = "#ec4899";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"12px" }}>
                    No credit card required • Personalized responses • Available 24/7
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* COMPREHENSIVE GUIDE CONTENT */}
          <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 16px 40px" }}>
            <div style={{ padding:"40px 0" }}>
              <h2 className="fkg-serif" style={{ fontSize:"clamp(28px,4vw,42px)", fontWeight:700, textAlign:"center", marginBottom:"24px", color:"#ec4899" }}>
                Free Kundli by Date of Birth — Complete Guide to Janam Kundli Online
              </h2>
              
              <div style={{ display:"flex", flexDirection:"column", gap:"32px", color:"rgba(255,255,255,0.8)", fontSize:"16px", lineHeight:1.8 }}>
                <p>
                  Unlike traditional kundli generators, Veadicastro uses AI-powered Vedic astrology to deliver personalized predictions — not generic readings. Our AI analyzes your unique planetary combination and gives you insights that feel like a real astrologer is reading your chart.
                </p>

                <p>
                  Your janam kundli is not just a horoscope. It is a precise mathematical map of the sky at the exact moment you were born. Every planet, every degree, every nakshatra recorded at that instant becomes a blueprint of your personality, your karma, your strengths, your challenges, and the timing of major events in your life. For thousands of years, Vedic astrologers have used this birth chart to guide people through decisions about marriage, career, health, and spiritual growth. Today, with Veadicastro's free kundli generator, you can access this ancient wisdom instantly using just your date of birth, time, and place.
                </p>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>What Is a Janam Kundli and Why Does It Matter</h3>
                  <p style={{ marginBottom:"16px" }}>
                    A janam kundli, also known as janam patrika, birth chart, or natal chart, is a circular diagram divided into twelve houses. Each house governs a specific area of life. The first house represents your physical body and personality. The second house governs wealth and family. The third house rules communication and courage. The fourth house covers home and mother. The fifth house is about education, children, and intelligence. The sixth house deals with health, enemies, and service. The seventh house governs marriage and partnerships. The eighth house rules longevity, inheritance, and hidden matters. The ninth house is the house of dharma, father, and higher wisdom. The tenth house governs career, status, and public reputation. The eleventh house covers income, gains, and social network. The twelfth house deals with expenses, foreign travel, and spiritual liberation.
                  </p>
                  <p>
                    At the moment of your birth, each of the nine Vedic planets — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu — occupies a specific sign and house in this chart. The combination of planet, sign, house, and nakshatra creates a unique pattern that is yours alone. No two people born at different times and places can have the exact same kundli. This is why a properly calculated janam kundli is one of the most personalized tools for self-understanding that exists.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>How to Read Your Janam Kundli — The Basics</h3>
                  <p style={{ marginBottom:"16px" }}>
                    Reading a kundli starts with three foundational points — the Lagna or Ascendant, the Moon Sign, and the Sun Sign.
                  </p>
                  <p style={{ marginBottom:"12px" }}>
                    <strong>The Ascendant (Lagna)</strong> is the zodiac sign that was rising on the eastern horizon at the moment of your birth. It determines the structure of your entire chart because it sets which sign falls in which house. Your ascendant reveals your physical appearance, instinctive behavior, and the way others perceive you at first glance. It is arguably the most important single point in your entire horoscope.
                  </p>
                  <p style={{ marginBottom:"12px" }}>
                    <strong>The Moon Sign</strong> is the zodiac sign occupied by the Moon at birth. In Vedic astrology, the Moon sign is given far more importance than in Western astrology. The Moon governs your mind, emotions, instincts, and subconscious patterns. Your Moon sign tells you how you process feelings, what makes you feel secure, and how your inner world operates. Many Vedic astrologers consider the Moon chart even more important than the ascendant chart for predicting life events.
                  </p>
                  <p>
                    <strong>The Sun Sign</strong> in Vedic astrology is the sign occupied by the Sun at birth. While Western astrology is built entirely around the Sun sign, Vedic astrology treats it as one of many factors. The Sun represents your soul, your father, your authority, your career direction, and your vitality. A strong Sun in the chart creates confidence, leadership, and recognition. A weak or afflicted Sun creates self-doubt, health issues, and conflict with authority figures.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>The Nine Planets in Vedic Astrology and Their Significance</h3>
                  
                  <div style={{ display:"grid", gap:"20px" }}>
                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Sun — Surya</h4>
                      <p>The Sun is the king of planets. It represents the soul, ego, father, government, and authority. When strong, it gives leadership, confidence, and recognition. Placed in the tenth house, it often creates highly successful professionals and public figures. The Sun rules the sign Leo and is exalted in Aries.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Moon — Chandra</h4>
                      <p>The Moon governs the mind, mother, emotions, and fertility. A strong Moon creates emotional intelligence, intuition, and nurturing qualities. When afflicted, it causes anxiety, mood swings, and mental instability. The Moon rules Cancer and is exalted in Taurus. The Moon changes signs approximately every two and a half days, making birth time accuracy essential for correct Moon sign calculation.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Mars — Mangal</h4>
                      <p>Mars is the planet of energy, courage, ambition, and conflict. It rules over brothers, land, property, surgery, and the military. A strong Mars creates athletes, surgeons, soldiers, engineers, and entrepreneurs. When afflicted or placed in certain houses, it creates Manglik Dosha, which affects marriage. Mars rules Aries and Scorpio and is exalted in Capricorn.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Mercury — Budha</h4>
                      <p>Mercury governs intelligence, communication, business acumen, writing, and analytical thinking. It rules over accountants, writers, traders, speakers, and teachers. A strong Mercury creates quick thinkers and excellent communicators. Mercury rules Gemini and Virgo and is exalted in Virgo. It is the fastest-moving planet and changes signs approximately every three weeks.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Jupiter — Guru or Brihaspati</h4>
                      <p>Jupiter is the great benefic planet of wisdom, expansion, prosperity, and spirituality. It governs children, higher education, religion, law, and long-distance travel. A strong Jupiter creates teachers, judges, priests, and successful businesspeople. Jupiter rules Sagittarius and Pisces and is exalted in Cancer. Jupiter's transit through each sign takes approximately one year and has significant effects on all twelve rashis.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Venus — Shukra</h4>
                      <p>Venus is the planet of love, beauty, luxury, art, and relationships. It governs marriage, creative talent, vehicles, and material comforts. A strong Venus creates artists, designers, musicians, and people with refined taste. Venus rules Taurus and Libra and is exalted in Pisces. In a man's chart, Venus also represents the wife or female partner.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Saturn — Shani</h4>
                      <p>Saturn is the planet of karma, discipline, delay, and hard work. It governs service, agriculture, the elderly, and those at the margins of society. Saturn rewards perseverance and punishes shortcuts. It rules Capricorn and Aquarius and is exalted in Libra. Saturn's seven and a half year transit over the natal Moon, known as Sadhesati, is one of the most discussed planetary periods in Vedic astrology.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Rahu — The North Node</h4>
                      <p>Rahu is a shadow planet with no physical body. It represents obsession, ambition, foreign connections, technology, and unconventional thinking. Rahu intensifies whatever it touches and creates a hunger that is difficult to satisfy. It functions like Saturn in its effects and is particularly powerful in the sixth, tenth, and eleventh houses. Rahu rules no sign of its own but is considered exalted in Taurus or Gemini depending on the school of thought.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Ketu — The South Node</h4>
                      <p>Ketu is the other shadow planet, directly opposite Rahu in the chart. It represents spirituality, moksha, past life karma, detachment, and psychic ability. Ketu separates a person from the matters of the house it occupies, forcing spiritual growth through letting go. It functions like Mars in its effects and is particularly powerful for those on a spiritual path. Ketu is considered exalted in Scorpio.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>Understanding the Twelve Houses in Your Kundli</h3>
                  <p style={{ marginBottom:"16px" }}>
                    The twelve houses in your kundli each carry specific significations that Vedic astrologers have studied and refined over thousands of years.
                  </p>
                  
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"16px" }}>
                    {[
                      ["First House — Tanu Bhava", "Physical body, health, personality, appearance"],
                      ["Second House — Dhana Bhava", "Family, wealth, speech, food, early childhood"],
                      ["Third House — Sahaja Bhava", "Younger siblings, courage, communication, short journeys"],
                      ["Fourth House — Sukha Bhava", "Mother, home, land, vehicles, education, happiness"],
                      ["Fifth House — Putra Bhava", "Children, intelligence, creativity, romance, speculation"],
                      ["Sixth House — Ari Bhava", "Enemies, debts, disease, service, obstacles"],
                      ["Seventh House — Kalatra Bhava", "Marriage, partnerships, business, spouse"],
                      ["Eighth House — Ayur Bhava", "Longevity, transformation, inheritance, hidden knowledge"],
                      ["Ninth House — Dharma Bhava", "Father, religion, higher education, luck, wisdom"],
                      ["Tenth House — Karma Bhava", "Career, profession, reputation, government"],
                      ["Eleventh House — Labha Bhava", "Income, gains, social network, desires"],
                      ["Twelfth House — Vyaya Bhava", "Expenses, losses, foreign settlement, spiritual liberation"]
                    ].map(([title, desc], i) => (
                      <div key={i} style={{ padding:"16px 0" }}>
                        <h4 style={{ color:"#ec4899", fontSize:"16px", fontWeight:600, marginBottom:"4px" }}>{title}</h4>
                        <p style={{ fontSize:"15px", margin:0 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>Nakshatra — The 27 Lunar Mansions</h3>
                  <p style={{ marginBottom:"16px" }}>
                    One of the most unique and precise tools in Vedic astrology is the nakshatra system. The zodiac is divided into 27 nakshatras, each spanning 13 degrees and 20 minutes. Each nakshatra has a ruling planet, a presiding deity, a symbol, and a set of characteristics that add a layer of precision far beyond the twelve signs alone.
                  </p>
                  <p style={{ marginBottom:"16px" }}>
                    Your birth nakshatra is the nakshatra occupied by the Moon at the time of your birth. This nakshatra determines your Vimshottari Dasha starting point, your instinctive nature, your spiritual path, and even auspicious syllables for your name.
                  </p>
                  <p>
                    The 27 nakshatras are Ashwini, Bharani, Krittika, Rohini, Mrigashirsha, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishtha, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, and Revati.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>Vimshottari Dasha — The Planetary Period System</h3>
                  <p style={{ marginBottom:"16px" }}>
                    The Vimshottari Dasha system is one of the most powerful predictive tools in all of Vedic astrology. It divides human life into planetary periods totaling 120 years. Each planet rules a major period called a Mahadasha, which lasts between 6 and 20 years depending on the planet.
                  </p>
                  <p>
                    The sequence is Ketu for 7 years, Venus for 20 years, Sun for 6 years, Moon for 10 years, Mars for 7 years, Rahu for 18 years, Jupiter for 16 years, Saturn for 19 years, and Mercury for 17 years. The dasha sequence your life begins with depends on the nakshatra occupied by your Moon at birth.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>Dosha Analysis — Understanding Astrological Afflictions</h3>
                  
                  <div style={{ display:"grid", gap:"20px" }}>
                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Manglik Dosha</h4>
                      <p>Manglik Dosha is formed when Mars occupies the first, second, fourth, seventh, eighth, or twelfth house from the ascendant or the Moon. This placement can create conflict, aggression, and challenges in marriage if not matched with a partner who has similar planetary strength. Approximately 50 percent of the population has some form of Manglik Dosha, and its effects vary widely depending on other chart factors. Remedies include Kumbh Vivah, recitation of the Mangal mantra, and donating red lentils on Tuesdays.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Kaal Sarp Dosha</h4>
                      <p>Kaal Sarp Dosha is formed when all seven visible planets — Sun, Moon, Mars, Mercury, Jupiter, Venus, and Saturn — fall between Rahu and Ketu. This creates an intense karmic pattern that can manifest as repeated obstacles, delays in marriage or career, and feelings of being held back despite effort. There are twelve varieties of Kaal Sarp Dosha depending on which pair of houses Rahu and Ketu occupy. Remedies include special puja at Trimbakeshwar or Ujjain, feeding snakes milk on Nag Panchami, and reciting the Maha Mrityunjaya Mantra.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Sadhesati</h4>
                      <p>Sadhesati occurs when Saturn transits through the sign immediately before your natal Moon sign, through your Moon sign itself, and through the sign immediately after. This period lasts approximately seven and a half years and comes three times in most lifetimes. Sadhesati is widely misunderstood as purely negative. It is actually a period of deep transformation, spiritual growth, and karmic clearing. The challenges of Sadhesati ultimately make a person stronger and more grounded. Remedies include worship of Shani on Saturdays, lighting sesame oil lamps, and reciting the Shani Mantra.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"20px", fontWeight:600, marginBottom:"8px" }}>Pitra Dosha</h4>
                      <p>Pitra Dosha is formed when the Sun occupies the ninth house or when Saturn or Rahu afflicts the Sun in the chart. It indicates unresolved karma with ancestors and can create recurring patterns of obstacles related to family, career delays, and health issues. Remedies include Shradh rituals, feeding Brahmins on Amavasya, and performing Tarpanam for ancestors.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>Frequently Asked Questions About Janam Kundli</h3>
                  
                  <div style={{ display:"grid", gap:"20px" }}>
                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"18px", fontWeight:600, marginBottom:"8px" }}>Is birth time necessary for generating a kundli?</h4>
                      <p>Yes, birth time is essential for an accurate kundli. Without the birth time, the ascendant cannot be calculated, and the house positions of all planets will be unknown. The Moon sign can be calculated from date of birth alone in most cases, but the full chart requires accurate birth time. If you do not know your exact birth time, try to obtain it from your birth certificate, hospital records, or family members. Even an approximate time is better than no time at all.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"18px", fontWeight:600, marginBottom:"8px" }}>What is the difference between Vedic and Western astrology?</h4>
                      <p>Vedic astrology uses the sidereal zodiac, which is based on the actual positions of stars in the sky. Western astrology uses the tropical zodiac, which is based on the seasons. Due to a phenomenon called precession of the equinoxes, the two systems have drifted approximately 23 to 24 degrees apart. This means your Sun sign in Vedic astrology is often different from your Western Sun sign. Vedic astrology also places much greater emphasis on the Moon, ascendant, nakshatras, and the dasha system, making it a more dynamic and event-oriented predictive system.</p>
                    </div>

                    <div>
                      <h4 style={{ color:"#ec4899", fontSize:"18px", fontWeight:600, marginBottom:"8px" }}>How accurate is online kundli generation?</h4>
                      <p>The accuracy of a kundli depends entirely on the accuracy of the planetary calculation algorithm used. Veadicastro uses Swiss Ephemeris data integrated with authentic Vedic calculation methods, which provides planetary positions accurate to fractions of a degree. The interpretation of the chart requires additional expertise, which is why we combine precise calculations with AI-powered analysis.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize:"24px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>Why Veadicastro Is the Best Free Kundli Generator Online</h3>
                  <p style={{ marginBottom:"16px" }}>
                    Veadicastro is India's first AI astrology platform that combines NASA-grade Swiss Ephemeris calculations with conversational AI. Ask Vedika — our AI astrologer — any question about your kundli and get a personalized answer in seconds. No waiting, no appointment, no fees.
                  </p>
                  <p style={{ marginBottom:"16px" }}>
                    Unlike traditional kundli generators that provide generic readings, Veadicastro uses AI-powered Vedic astrology to deliver personalized predictions. Our AI analyzes your unique planetary combination and gives you insights that feel like a real astrologer is reading your chart.
                  </p>
                  <p>
                    Our calculations use Swiss Ephemeris data — the same planetary database used by professional astrologers worldwide. We apply the Lahiri ayanamsha for sidereal calculations, which is the standard accepted by the Government of India for all official astrological purposes. Location-based time zone and coordinates ensure that your ascendant is calculated accurately regardless of where in the world you were born.
                  </p>
                </div>

                <div style={{ padding:"32px 0", textAlign:"center", borderTop:"1px solid rgba(236,72,153,0.2)", marginTop:"32px" }}>
                  <p style={{ margin:0, fontSize:"20px", fontWeight:600, color:"rgba(255,255,255,0.9)" }}>
                    Generate your free kundli now — enter your name, date of birth, time of birth, and birth place, and receive your complete Vedic birth chart with planetary positions, dosha analysis, dasha timeline, and personalized remedies in seconds.
                  </p>
                  <p style={{ margin:"16px 0 0", fontSize:"16px", fontStyle:"italic", color:"rgba(255,255,255,0.7)" }}>
                    Veadicastro — Ancient Vedic Wisdom, Powered by AI. Free Kundli Online, Always.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"24px", textAlign:"center" }}>
            <p style={{ color:"rgba(255,255,255,0.18)", fontSize:"12px", margin:0 }}>© Veadicastro</p>
          </footer>

        </div>{/* end z:1 */}
      </div>

      {/* Sign Up Modal */}
      {showSignupModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.80)", backdropFilter:"blur-sm", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"rgba(12,4,18,0.98)", borderRadius:"24px", padding:"32px", maxWidth:"500px", width:"100%", border:"1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ textAlign:"center", marginBottom:"24px" }}>
              <div style={{ width:"80px", height:"80px", margin:"0 auto 16px", borderRadius:"50%", overflow:"hidden" }}>
                <img src="/optimized/vedika.webp" alt="Vedika AI astrologer for free kundli" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <h3 className="fkg-serif" style={{ fontSize:"24px", fontWeight:700, marginBottom:"12px", color:"white" }}>
                Sign Up to Ask <span className="fkg-pink-glow" style={{ color:"#ec4899" }}>Vedika AI</span>
              </h3>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", marginBottom:"8px", lineHeight:1.5 }}>
                Your question: <span style={{ color:"#ec4899", fontWeight:500 }}>"{question}"</span>
              </p>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"13px", marginBottom:"20px" }}>
                You've used your free question! Sign up to get 1 free chat and unlock deeper astrology insights.
              </p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <button
                onClick={() => {
                  setAuthOpen(true);
                  setShowSignupModal(false);
                }}
                className="fkg-btn-pink"
                style={{ 
                  width:"100%", 
                  padding:"12px 20px", 
                  borderRadius:"999px", 
                  border:"none", 
                  color:"white", 
                  fontWeight:600, 
                  fontSize:"15px", 
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center"
                }}
              >
                Sign Up for Free
              </button>
              <button
                onClick={() => setShowSignupModal(false)}
                style={{ 
                  width:"100%", 
                  padding:"12px 20px", 
                  borderRadius:"999px", 
                  border:"1px solid rgba(255,255,255,0.2)", 
                  background:"transparent", 
                  color:"rgba(255,255,255,0.6)", 
                  fontWeight:500, 
                  fontSize:"14px", 
                  cursor:"pointer",
                  transition:"all 0.2s ease"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(236,72,153,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Maybe Later
              </button>
            </div>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"12px", textAlign:"center", marginTop:"16px" }}>
              You have to sign up for your free question. You get 1 free chat.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FreeKundliGenerator;
