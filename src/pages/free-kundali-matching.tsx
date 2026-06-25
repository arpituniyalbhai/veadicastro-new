import React, { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonLite } from "@/components/ui/button-lite";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import {
  Heart, Sparkles, Calendar, MapPin, Clock, User, Loader2,
  CheckCircle2, Shield, Star, TrendingUp, Target, Award,
  ChevronRight, Users, Zap, AlertCircle, CheckCircle, Home, BookOpen, Brain, MessageCircle
} from "lucide-react";
import { getPlanetaryData, type AstroPayload } from "@/lib/astroCalc";
import { cn } from "@/lib/utils";
import AdBanner from "@/components/AdBanner";

type Gender = "male" | "female";

interface BirthDetails {
  name: string;
  gender: Gender;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  birthPlace: string;
  lat?: number;
  lon?: number;
  tzone?: number;
}

interface GunaScore {
  varna: number;
  vashya: number;
  tara: number;
  yoni: number;
  grahaMaitri: number;
  gana: number;
  bhakoot: number;
  nadi: number;
  total: number;
  maxTotal: number;
}

interface MatchResult {
  score: GunaScore;
  compatibility: number; // 0-100
  status: "Excellent" | "Good" | "Weak";
  message: string;
  manglikA: boolean;
  manglikB: boolean;
  moonSignA: string;
  moonSignB: string;
  insights: string[];
  astroDataA?: AstroPayload;
  astroDataB?: AstroPayload;
}

// ── Decorative star-field dots ──────────────────────────────────────────────
const StarField = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: "1px",
          height: "1px",
          top: Math.random() * 100 + "%",
          left: Math.random() * 100 + "%",
          opacity: 0.1,
        }}
      />
    ))}
  </div>
);

export default function FreeKundliMatching() {
  const navigate = useNavigate();

  const [personA, setPersonA] = useState<BirthDetails>({
    name: "", gender: "male", day: 1, month: 1, year: 2000,
    hour: 12, minute: 0, birthPlace: "",
  });

  const [personB, setPersonB] = useState<BirthDetails>({
    name: "", gender: "female", day: 1, month: 1, year: 2000,
    hour: 12, minute: 0, birthPlace: "",
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [locationSuggestionsA, setLocationSuggestionsA] = useState<any[]>([]);
  const [locationSuggestionsB, setLocationSuggestionsB] = useState<any[]>([]);
  const [showLocationSuggestionsA, setShowLocationSuggestionsA] = useState(false);
  const [showLocationSuggestionsB, setShowLocationSuggestionsB] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const searchTimeoutA = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutB = useRef<NodeJS.Timeout | null>(null);

  // ── Location Search Functions ─────────────────────────────────────────────
  const searchLocation = useCallback(async (query: string, person: 'A' | 'B') => {
    if (query.length < 1) {
      if (person === 'A') {
        setLocationSuggestionsA([]);
        setShowLocationSuggestionsA(false);
      } else {
        setLocationSuggestionsB([]);
        setShowLocationSuggestionsB(false);
      }
      return;
    }
    
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
        
        if (person === 'A') {
          setLocationSuggestionsA(suggestions);
          setShowLocationSuggestionsA(suggestions.length > 0);
        } else {
          setLocationSuggestionsB(suggestions);
          setShowLocationSuggestionsB(suggestions.length > 0);
        }
      } else {
        if (person === 'A') {
          setLocationSuggestionsA([]);
          setShowLocationSuggestionsA(false);
        } else {
          setLocationSuggestionsB([]);
          setShowLocationSuggestionsB(false);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
      if (person === 'A') {
        setLocationSuggestionsA([]);
        setShowLocationSuggestionsA(false);
      } else {
        setLocationSuggestionsB([]);
        setShowLocationSuggestionsB(false);
      }
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  const debouncedSearchLocation = useCallback((query: string, person: 'A' | 'B') => {
    if (person === 'A') {
      if (searchTimeoutA.current) clearTimeout(searchTimeoutA.current);
      searchTimeoutA.current = setTimeout(() => searchLocation(query, 'A'), 300);
    } else {
      if (searchTimeoutB.current) clearTimeout(searchTimeoutB.current);
      searchTimeoutB.current = setTimeout(() => searchLocation(query, 'B'), 300);
    }
  }, [searchLocation]);

  const handleLocationChange = (value: string, person: 'A' | 'B') => {
    if (person === 'A') {
      setPersonA(p => ({ ...p, birthPlace: value }));
      debouncedSearchLocation(value, 'A');
    } else {
      setPersonB(p => ({ ...p, birthPlace: value }));
      debouncedSearchLocation(value, 'B');
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutA.current) clearTimeout(searchTimeoutA.current);
      if (searchTimeoutB.current) clearTimeout(searchTimeoutB.current);
    };
  }, []);

  const selectLocation = (place: any, person: 'A' | 'B') => {
    const updatedPerson = {
      birthPlace: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      tzone: 5.5
    };

    if (person === 'A') {
      setPersonA(p => ({ ...p, ...updatedPerson }));
      setShowLocationSuggestionsA(false);
      setLocationSuggestionsA([]);
    } else {
      setPersonB(p => ({ ...p, ...updatedPerson }));
      setShowLocationSuggestionsB(false);
      setLocationSuggestionsB([]);
    }
  };

  // ── Astrology Engine Functions ────────────────────────────────────────────
  
  // Check for Manglik Dosha
  const checkManglikDosha = (astroData: AstroPayload): boolean => {
    const mars = astroData.planets['mars'];
    if (!mars) return false;
    
    const marsLong = mars.longitude;
    const ascendant = astroData.ascendant;
    
    // Calculate house position of Mars
    // House 1 starts at ascendant, each house is 30 degrees
    let marsHouse = astroData.planetHouseMap?.mars ?? 0;
    
    // Check if Mars is in 1st, 2nd, 4th, 7th, 8th, or 12th house
    const manglikHouses = [1, 2, 4, 7, 8, 12];
    
    console.log(`Mars longitude: ${marsLong}, Ascendant: ${ascendant}, Mars House: ${marsHouse}`);
    
    return manglikHouses.includes(marsHouse);
  };

  // Calculate Varna (1 point)
  const calculateVarna = (moonSignA: string, moonSignB: string): number => {
    const varnaMap: Record<string, string> = {
      'Aries': 'Kshatriya', 'Leo': 'Kshatriya', 'Sagittarius': 'Kshatriya',
      'Taurus': 'Vaishya', 'Virgo': 'Vaishya', 'Capricorn': 'Vaishya',
      'Gemini': 'Brahmin', 'Libra': 'Brahmin', 'Aquarius': 'Brahmin',
      'Cancer': 'Shudra', 'Scorpio': 'Shudra', 'Pisces': 'Shudra'
    };
    
    const varnaA = varnaMap[moonSignA];
    const varnaB = varnaMap[moonSignB];
    
    return varnaA === varnaB ? 1 : 0;
  };

  // Calculate Vashya (2 points)
  const calculateVashya = (moonSignA: string, moonSignB: string): number => {
    const vashyaGroups: Record<string, string[]> = {
      'Human': ['Gemini', 'Virgo', 'Libra', 'Aquarius'],
      'Animal': ['Aries', 'Taurus', 'Leo', 'Scorpio', 'Sagittarius', 'Capricorn'],
      'Water': ['Cancer', 'Pisces']
    };
    
    for (const [group, signs] of Object.entries(vashyaGroups)) {
      if (signs.includes(moonSignA) && signs.includes(moonSignB)) {
        return 2;
      }
    }
    
    return 0;
  };

  // Calculate Tara (3 points)
  const calculateTara = (nakshatraA: number, nakshatraB: number): number => {
    const distance = Math.abs(nakshatraA - nakshatraB);
    const remainder = distance % 9;
    
    if (remainder === 0 || remainder === 3 || remainder === 5 || remainder === 7) {
      return 3;
    }
    return 0;
  };

  // Calculate Yoni (4 points)
  const calculateYoni = (nakshatraA: number, nakshatraB: number): number => {
    const yoniGroups = [
      [0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13],
      [14, 21], [15, 22], [16, 23], [17, 24], [18, 25], [19, 26], [20, 27]
    ];
    
    for (const group of yoniGroups) {
      if (group.includes(nakshatraA) && group.includes(nakshatraB)) {
        return 4;
      }
    }
    
    return 0;
  };

  // Calculate Graha Maitri (5 points)
  const calculateGrahaMaitri = (moonSignA: string, moonSignB: string): number => {
    const planetMap: Record<string, string> = {
      'Aries': 'Mars', 'Scorpio': 'Mars',
      'Taurus': 'Venus', 'Libra': 'Venus',
      'Gemini': 'Mercury', 'Virgo': 'Mercury',
      'Cancer': 'Moon',
      'Leo': 'Sun',
      'Sagittarius': 'Jupiter', 'Pisces': 'Jupiter',
      'Capricorn': 'Saturn', 'Aquarius': 'Saturn'
    };
    
    const planetA = planetMap[moonSignA];
    const planetB = planetMap[moonSignB];
    
    if (planetA === planetB) return 5;
    
    const friendlyPairs = [
      ['Sun', 'Moon'], ['Sun', 'Jupiter'], ['Sun', 'Mars'],
      ['Moon', 'Jupiter'], ['Moon', 'Mars'], ['Moon', 'Venus'],
      ['Mars', 'Jupiter'], ['Mars', 'Venus'], ['Mars', 'Saturn'],
      ['Mercury', 'Venus'], ['Mercury', 'Saturn'],
      ['Jupiter', 'Saturn'], ['Jupiter', 'Mars'],
      ['Venus', 'Saturn'], ['Venus', 'Mercury'],
      ['Saturn', 'Mercury'], ['Saturn', 'Venus']
    ];
    
    for (const [p1, p2] of friendlyPairs) {
      if ((planetA === p1 && planetB === p2) || (planetA === p2 && planetB === p1)) {
        return 5;
      }
    }
    
    return 0;
  };

  // Calculate Gana (6 points)
  const calculateGana = (nakshatraA: number, nakshatraB: number): number => {
    const ganaMap: Record<number, string> = {
      0: 'Dev', 1: 'Dev', 2: 'Dev', 3: 'Dev', 4: 'Dev', 5: 'Dev', 6: 'Dev', 7: 'Dev', 8: 'Dev',
      9: 'Manushya', 10: 'Manushya', 11: 'Manushya', 12: 'Manushya', 13: 'Manushya',
      14: 'Manushya', 15: 'Manushya', 16: 'Manushya', 17: 'Manushya', 18: 'Manushya',
      19: 'Rakshasa', 20: 'Rakshasa', 21: 'Rakshasa', 22: 'Rakshasa', 23: 'Rakshasa',
      24: 'Rakshasa', 25: 'Rakshasa', 26: 'Rakshasa'
    };
    
    const ganaA = ganaMap[nakshatraA];
    const ganaB = ganaMap[nakshatraB];
    
    if (ganaA === ganaB) return 6;
    if ((ganaA === 'Dev' && ganaB === 'Manushya') || (ganaA === 'Manushya' && ganaB === 'Dev')) return 5;
    if ((ganaA === 'Dev' && ganaB === 'Rakshasa') || (ganaA === 'Rakshasa' && ganaB === 'Dev')) return 1;
    if ((ganaA === 'Manushya' && ganaB === 'Rakshasa') || (ganaA === 'Rakshasa' && ganaB === 'Manushya')) return 3;
    
    return 0;
  };

  // Calculate Bhakoot (7 points)
  const calculateBhakoot = (moonSignA: string, moonSignB: string): number => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const indexA = signs.indexOf(moonSignA);
    const indexB = signs.indexOf(moonSignB);
    
    const difference = Math.abs(indexA - indexB);
    
    // Bhakoot is 0 if signs are 2-12, 6-6, or 9-3 positions apart
    if (difference === 6 || (difference === 2 && indexA > indexB) || (difference === 10 && indexA < indexB)) {
      return 0;
    }
    
    return 7;
  };

  // Calculate Nadi (8 points)
  const calculateNadi = (nakshatraA: number, nakshatraB: number): number => {
    const nadiMap: Record<number, string> = {
      0: 'Adi', 1: 'Adi', 2: 'Adi', 3: 'Adi', 4: 'Adi', 5: 'Adi', 6: 'Adi', 7: 'Adi', 8: 'Adi',
      9: 'Madhya', 10: 'Madhya', 11: 'Madhya', 12: 'Madhya', 13: 'Madhya', 14: 'Madhya', 15: 'Madhya', 16: 'Madhya', 17: 'Madhya',
      18: 'Antya', 19: 'Antya', 20: 'Antya', 21: 'Antya', 22: 'Antya', 23: 'Antya', 24: 'Antya', 25: 'Antya', 26: 'Antya'
    };
    
    const nadiA = nadiMap[nakshatraA];
    const nadiB = nadiMap[nakshatraB];
    
    return nadiA === nadiB ? 0 : 8;
  };

  // Main calculation function
  const calculateMatch = async () => {
    if (!personA.name || !personA.birthPlace || !personB.name || !personB.birthPlace) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCalculating(true);
    
    try {
      // Generate charts for both persons
      const astroDataA = await getPlanetaryData({
        day: personA.day, month: personA.month, year: personA.year,
        hour: personA.hour, min: personA.minute,
        lat: personA.lat || 28.6139, lon: personA.lon || 77.2090, tzone: personA.tzone || 5.5,
      });

      const astroDataB = await getPlanetaryData({
        day: personB.day, month: personB.month, year: personB.year,
        hour: personB.hour, min: personB.minute,
        lat: personB.lat || 28.6139, lon: personB.lon || 77.2090, tzone: personB.tzone || 5.5,
      });

      console.log("Person A Data:", astroDataA);
      console.log("Person B Data:", astroDataB);
      
      if (!astroDataA.moonSign || !astroDataB.moonSign || !astroDataA.nakshatra || !astroDataB.nakshatra) {
        throw new Error("Could not generate complete birth charts. Please check birth details and try again.");
      }

      const moonSignA = astroDataA.moonSign!;
      const moonSignB = astroDataB.moonSign!;
      const nakshatraA = astroDataA.nakshatra.index;
      const nakshatraB = astroDataB.nakshatra.index;

      console.log("Moon Signs:", { moonSignA, moonSignB });
      console.log("Nakshatras:", { nakshatraA, nakshatraB });

      const gunaScore: GunaScore = {
        varna: calculateVarna(moonSignA, moonSignB),
        vashya: calculateVashya(moonSignA, moonSignB),
        tara: calculateTara(nakshatraA, nakshatraB),
        yoni: calculateYoni(nakshatraA, nakshatraB),
        grahaMaitri: calculateGrahaMaitri(moonSignA, moonSignB),
        gana: calculateGana(nakshatraA, nakshatraB),
        bhakoot: calculateBhakoot(moonSignA, moonSignB),
        nadi: calculateNadi(nakshatraA, nakshatraB),
        total: 0,
        maxTotal: 36
      };

      console.log("Guna Score:", gunaScore);

      gunaScore.total = gunaScore.varna + gunaScore.vashya + gunaScore.tara + gunaScore.yoni + 
                      gunaScore.grahaMaitri + gunaScore.gana + gunaScore.bhakoot + gunaScore.nadi;

      // Calculate compatibility percentage
      const compatibility = Math.round((gunaScore.total / gunaScore.maxTotal) * 100);

      // Determine status and message
      let status: "Excellent" | "Good" | "Weak";
      let message: string;

      if (gunaScore.total >= 28) {
        status = "Excellent";
        message = "Strong compatibility, high marriage stability";
      } else if (gunaScore.total >= 20) {
        status = "Good";
        message = "Average compatibility with some adjustments needed";
      } else {
        status = "Weak";
        message = "Major differences in chart compatibility";
      }

      // Check Manglik dosha
      const manglikA = checkManglikDosha(astroDataA);
      const manglikB = checkManglikDosha(astroDataB);

      // Generate insights
      const insights: string[] = [];
      
      if (manglikA && manglikB) {
        insights.push("Both partners have Manglik dosha - this cancels out the negative effects");
      } else if (manglikA || manglikB) {
        insights.push(`Manglik dosha present in ${manglikA ? personA.name : personB.name}'s chart`);
      }

      if (gunaScore.bhakoot === 0) {
        insights.push("Emotional compatibility may fluctuate due to Bhakoot dosha");
      }

      if (gunaScore.nadi === 0) {
        insights.push("Nadi dosha present - may affect health and progeny");
      }

      if (gunaScore.gana <= 3) {
        insights.push("Different temperaments may require understanding and compromise");
      }

      const result: MatchResult = {
        score: gunaScore,
        compatibility,
        status,
        message,
        manglikA,
        manglikB,
        moonSignA,
        moonSignB,
        insights,
        astroDataA,
        astroDataB
      };

      setMatchResult(result);

    } catch (error) {
      console.error("Error calculating match:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error calculating compatibility. Please try again.");
      }
    } finally {
      setIsCalculating(false);
    }
  };

return (
  <>
    <Helmet>
      <title>Free Kundli Matching by Date of Birth | Guna Milan Calculator 2025</title>
      <meta name="description" content="Get your free Kundli matching score instantly. Our Vedic Guna Milan calculator checks all 36 gunas, Manglik dosha, and marriage compatibility — no signup needed." />
      <meta name="keywords" content="kundli matching, guna milan, marriage compatibility, vedic astrology matching, manglik dosha, free kundli matching, astrology compatibility calculator" />
      <link rel="canonical" href="https://veadicastro.in/free-kundali-matching" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="theme-color" content="#0a0a0f" />
      
      {/* FAQ Schema */}
      <script type="application/ld+json">{`
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a good Kundli matching score?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A score of 28 or above out of 36 is considered excellent for marriage. 18 to 27 is acceptable with adjustments. Below 18 is generally not recommended."
      }
    },
    {
      "@type": "Question",
      "name": "Is Kundli matching necessary for marriage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In traditional Hindu families, Kundli matching is considered an important step before marriage. It helps understand compatibility between partners based on their birth charts."
      }
    },
    {
      "@type": "Question",
      "name": "What is Manglik Dosha?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Manglik Dosha occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house in a birth chart. If both partners are Manglik, the dosha cancels out."
      }
    },
    {
      "@type": "Question",
      "name": "How many gunas are needed for marriage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "At least 18 out of 36 gunas are required for marriage to be considered compatible. A score of 28 or above is ideal."
      }
    },
    {
      "@type": "Question",
      "name": "Can we marry with low Kundli matching score?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A low score does not always mean the marriage will fail. Many astrologers consider other factors like planetary positions and individual charts before making a final recommendation."
      }
    }
  ]
}
`}</script>
      
      {/* SoftwareApplication Schema */}
      <script type="application/ld+json">{`
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Free Kundli Matching Calculator",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Free Vedic astrology Kundli matching calculator using Swiss Ephemeris. Check 36 Guna Milan, Manglik dosha, and marriage compatibility.",
  "url": "https://veadicastro.in/free-kundali-matching"
}
`}</script>
    </Helmet>

    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-black"></div>

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
            <Heart className="w-3 h-3" /> Vedic Marriage Compatibility
          </div>
          <h1 className="font-bold text-4xl sm:text-5xl font-black leading-tight mb-4">
            Free <span className="text-pink-400">Kundli Matching</span> Calculator
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            Calculate your marriage compatibility with authentic Vedic astrology Guna Milan system. 
            Get detailed analysis of 36 Gunas, Manglik dosha, and compatibility predictions.
          </p>
        </div>
      </div>

        {/* Input Layer */}
        {!matchResult && (
          <div className="relative z-10 max-w-6xl mx-auto px-4 pb-12">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Person A Form */}
              <Card className="card-glass border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Person A</h3>
                    <p className="text-white/40 text-sm">Enter birth details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nameA" className="text-white/60 text-sm">Name</Label>
                    <Input
                      id="nameA"
                      value={personA.name}
                      onChange={(e) => setPersonA(p => ({ ...p, name: e.target.value }))}
                      placeholder="Enter name"
                      className="bg-white/5 border-white/10 text-white placeholder-white/30"
                    />
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm">Gender</Label>
                    <Select value={personA.gender} onValueChange={(value: Gender) => setPersonA(p => ({ ...p, gender: value }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a0a2e] border-white/10">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-white/60 text-sm">Day</Label>
                      <Select value={personA.day.toString()} onValueChange={(value) => setPersonA(p => ({ ...p, day: parseInt(value) }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a0a2e] border-white/10 max-h-40">
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm">Month</Label>
                      <Select value={personA.month.toString()} onValueChange={(value) => setPersonA(p => ({ ...p, month: parseInt(value) }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a0a2e] border-white/10">
                          <SelectItem value="1">Jan</SelectItem>
                          <SelectItem value="2">Feb</SelectItem>
                          <SelectItem value="3">Mar</SelectItem>
                          <SelectItem value="4">Apr</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">Jun</SelectItem>
                          <SelectItem value="7">Jul</SelectItem>
                          <SelectItem value="8">Aug</SelectItem>
                          <SelectItem value="9">Sep</SelectItem>
                          <SelectItem value="10">Oct</SelectItem>
                          <SelectItem value="11">Nov</SelectItem>
                          <SelectItem value="12">Dec</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm">Year</Label>
                      <Input
                        type="number"
                        value={personA.year}
                        onChange={(e) => setPersonA(p => ({ ...p, year: parseInt(e.target.value) }))}
                        min="1950"
                        max="2010"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/60 text-sm">Hour</Label>
                      <Select value={personA.hour.toString()} onValueChange={(value) => setPersonA(p => ({ ...p, hour: parseInt(value) }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a0a2e] border-white/10 max-h-40">
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm">Minute</Label>
                      <Select value={personA.minute.toString()} onValueChange={(value) => setPersonA(p => ({ ...p, minute: parseInt(value) }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a0a2e] border-white/10 max-h-40">
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="relative">
                    <Label className="text-white/60 text-sm">Birth Place</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        value={personA.birthPlace}
                        onChange={(e) => handleLocationChange(e.target.value, 'A')}
                        placeholder="Enter city name"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/30"
                      />
                    </div>
                    {showLocationSuggestionsA && (
                      <div className="absolute z-20 w-full mt-1 bg-[#1a0a2e] border border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {locationSuggestionsA.map((place, index) => (
                          <div
                            key={index}
                            onClick={() => selectLocation(place, 'A')}
                            className="px-3 py-2 text-white/80 hover:bg-white/10 cursor-pointer text-sm"
                          >
                            {place.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Person B Form */}
              <Card className="card-glass border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Person B</h3>
                    <p className="text-white/40 text-sm">Enter birth details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nameB" className="text-white/60 text-sm">Name</Label>
                    <Input
                      id="nameB"
                      value={personB.name}
                      onChange={(e) => setPersonB(p => ({ ...p, name: e.target.value }))}
                      placeholder="Enter name"
                      className="bg-white/5 border-white/10 text-white placeholder-white/30"
                    />
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm">Gender</Label>
                    <Select value={personB.gender} onValueChange={(value: Gender) => setPersonB(p => ({ ...p, gender: value }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a0a2e] border-white/10">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-white/60 text-sm">Day</Label>
                      <Select value={personB.day.toString()} onValueChange={(value) => setPersonB(p => ({ ...p, day: parseInt(value) }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a0a2e] border-white/10 max-h-40">
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm">Month</Label>
                      <Select value={personB.month.toString()} onValueChange={(value) => setPersonB(p => ({ ...p, month: parseInt(value) }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a0a2e] border-white/10">
                          <SelectItem value="1">Jan</SelectItem>
                          <SelectItem value="2">Feb</SelectItem>
                          <SelectItem value="3">Mar</SelectItem>
                          <SelectItem value="4">Apr</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">Jun</SelectItem>
                          <SelectItem value="7">Jul</SelectItem>
                          <SelectItem value="8">Aug</SelectItem>
                          <SelectItem value="9">Sep</SelectItem>
                          <SelectItem value="10">Oct</SelectItem>
                          <SelectItem value="11">Nov</SelectItem>
                          <SelectItem value="12">Dec</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm">Year</Label>
                      <Input
                        type="number"
                        value={personB.year}
                        onChange={(e) => setPersonB(p => ({ ...p, year: parseInt(e.target.value) }))}
                        min="1950"
                        max="2010"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/60 text-sm">Hour</Label>
                      <Select value={personB.hour.toString()} onValueChange={(value) => setPersonB(p => ({ ...p, hour: parseInt(value) }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a0a2e] border-white/10 max-h-40">
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm">Minute</Label>
                      <Select value={personB.minute.toString()} onValueChange={(value) => setPersonB(p => ({ ...p, minute: parseInt(value) }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a0a2e] border-white/10 max-h-40">
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="relative">
                    <Label className="text-white/60 text-sm">Birth Place</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        value={personB.birthPlace}
                        onChange={(e) => handleLocationChange(e.target.value, 'B')}
                        placeholder="Enter city name"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/30"
                      />
                    </div>
                    {showLocationSuggestionsB && (
                      <div className="absolute z-20 w-full mt-1 bg-[#1a0a2e] border border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {locationSuggestionsB.map((place, index) => (
                          <div
                            key={index}
                            onClick={() => selectLocation(place, 'B')}
                            className="px-3 py-2 text-white/80 hover:bg-white/10 cursor-pointer text-sm"
                          >
                            {place.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center mt-8">
              <ButtonLite
                onClick={calculateMatch}
                disabled={isCalculating}
                className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white px-8 py-3 rounded-full text-lg font-semibold min-w-[200px]"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Calculate Match
                  </>
                )}
              </ButtonLite>
            </div>
          </div>
        )}

        {/* Results Layer */}
        {matchResult && (
          <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
            {/* Compatibility Score */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="text-7xl font-black">
                  <span className={cn(
                    "bg-gradient-to-r bg-clip-text text-transparent",
                    matchResult.status === "Excellent" ? "from-green-400 to-emerald-500" :
                    matchResult.status === "Good" ? "from-yellow-400 to-orange-500" :
                    "from-red-400 to-pink-500"
                  )}>
                    {matchResult.compatibility}%
                  </span>
                </div>
                <div className={cn(
                  "px-6 py-3 rounded-full text-lg font-bold border",
                  matchResult.status === "Excellent" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                  matchResult.status === "Good" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                  "bg-red-500/20 text-red-400 border-red-500/30"
                )}>
                  {matchResult.status}
                </div>
              </div>
              <p className="text-white/70 text-xl max-w-2xl mx-auto">{matchResult.message}</p>
            </div>

            {/* Both Kundlis Section */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Person A Kundli */}
              <Card className="card-glass border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-white">{personA.name}</h3>
                    <p className="text-white/60">Birth Chart Details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm mb-1">Janam Rashi</p>
                      <p className="text-white font-semibold text-lg">{matchResult.moonSignA}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm mb-1">Manglik</p>
                      <p className={cn("font-semibold text-lg", matchResult.manglikA ? "text-red-400" : "text-green-400")}>
                        {matchResult.manglikA ? "Present" : "Absent"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-sm mb-2">Birth Details</p>
                    <div className="text-white/80 space-y-1">
                      <p>{personA.day}/{personA.month}/{personA.year}</p>
                      <p>{personA.hour}:{personA.minute.toString().padStart(2, '0')}</p>
                      <p>{personA.birthPlace}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Person B Kundli */}
              <Card className="card-glass border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-white">{personB.name}</h3>
                    <p className="text-white/60">Birth Chart Details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm mb-1">Janam Rashi</p>
                      <p className="text-white font-semibold text-lg">{matchResult.moonSignB}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm mb-1">Manglik</p>
                      <p className={cn("font-semibold text-lg", matchResult.manglikB ? "text-red-400" : "text-green-400")}>
                        {matchResult.manglikB ? "Present" : "Absent"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-sm mb-2">Birth Details</p>
                    <div className="text-white/80 space-y-1">
                      <p>{personB.day}/{personB.month}/{personB.year}</p>
                      <p>{personB.hour}:{personB.minute.toString().padStart(2, '0')}</p>
                      <p>{personB.birthPlace}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Guna Milan Analysis */}
            <Card className="card-glass border border-white/10 p-8 mb-8">
              <h3 className="font-bold text-2xl text-white mb-8 flex items-center gap-3">
                <Star className="w-7 h-7 text-yellow-400" />
                Guna Milan Analysis ({matchResult.score.total}/{matchResult.score.maxTotal})
              </h3>
              
              {/* Enhanced Swiss Ephemeris Data */}
              {matchResult.astroDataA && matchResult.astroDataB && (
                <div className="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    Swiss Ephemeris Planetary Data
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white/80 font-medium mb-3">{personA.name} - Planetary Positions</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Mars:</span>
                          <span className="text-white">{matchResult.astroDataA.planets.mars?.sign} @ {matchResult.astroDataA.planets.mars?.longitude.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Venus:</span>
                          <span className="text-white">{matchResult.astroDataA.planets.venus?.sign} @ {matchResult.astroDataA.planets.venus?.longitude.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Jupiter:</span>
                          <span className="text-white">{matchResult.astroDataA.planets.jupiter?.sign} @ {matchResult.astroDataA.planets.jupiter?.longitude.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Ascendant:</span>
                          <span className="text-white">{matchResult.astroDataA.ascendantSign} @ {matchResult.astroDataA.ascendant.toFixed(2)}°</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-white/80 font-medium mb-3">{personB.name} - Planetary Positions</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Mars:</span>
                          <span className="text-white">{matchResult.astroDataB.planets.mars?.sign} @ {matchResult.astroDataB.planets.mars?.longitude.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Venus:</span>
                          <span className="text-white">{matchResult.astroDataB.planets.venus?.sign} @ {matchResult.astroDataB.planets.venus?.longitude.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Jupiter:</span>
                          <span className="text-white">{matchResult.astroDataB.planets.jupiter?.sign} @ {matchResult.astroDataB.planets.jupiter?.longitude.toFixed(2)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Ascendant:</span>
                          <span className="text-white">{matchResult.astroDataB.ascendantSign} @ {matchResult.astroDataB.ascendant.toFixed(2)}°</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">Varna</span>
                    <span className="text-xs text-white/60">1 point</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{matchResult.score.varna}/1</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">Vashya</span>
                    <span className="text-xs text-white/60">2 points</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{matchResult.score.vashya}/2</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">Graha Maitri</span>
                    <span className="text-xs text-white/60">5 points</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{matchResult.score.grahaMaitri}/5</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">Tara</span>
                    <span className="text-xs text-white/60">3 points</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{matchResult.score.tara}/3</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">Yoni</span>
                    <span className="text-xs text-white/60">4 points</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{matchResult.score.yoni}/4</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">Gana</span>
                    <span className="text-xs text-white/60">6 points</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{matchResult.score.gana}/6</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">Bhakoot</span>
                    <span className="text-xs text-white/60">7 points</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{matchResult.score.bhakoot}/7</div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">Nadi</span>
                    <span className="text-xs text-white/60">8 points</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{matchResult.score.nadi}/8</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total Score</span>
                  <span className="text-2xl font-bold text-pink-400">{matchResult.score.total}/{matchResult.score.maxTotal}</span>
                </div>
              </div>
            </Card>

            {/* Ad Banner after Guna Milan Analysis */}
            <div className="flex justify-center my-8">
              <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
            </div>

            {/* Additional Compatibility Checks */}
            <Card className="card-glass border border-white/10 p-8 mb-8">
              <h3 className="font-bold text-2xl text-white mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-400" />
                Additional Compatibility Checks
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                    {matchResult.manglikA ? (
                      <AlertCircle className="w-8 h-8 text-orange-400" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    )}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{personA.name}</h4>
                  <p className="text-sm text-white/60">Manglik: {matchResult.manglikA ? 'Present' : 'Absent'}</p>
                  <p className="text-sm text-white/40">Janam Rashi: {matchResult.moonSignA}</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <Heart className="w-12 h-12 text-pink-400" />
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                    {matchResult.manglikB ? (
                      <AlertCircle className="w-8 h-8 text-orange-400" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    )}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{personB.name}</h4>
                  <p className="text-sm text-white/60">Manglik: {matchResult.manglikB ? 'Present' : 'Absent'}</p>
                  <p className="text-sm text-white/40">Janam Rashi: {matchResult.moonSignB}</p>
                </div>
              </div>
            </Card>

            {/* Insights */}
            {matchResult.insights.length > 0 && (
              <Card className="card-glass border border-white/10 p-8 mb-8">
                <h3 className="font-bold text-2xl text-white mb-6 flex items-center gap-3">
                  <Target className="w-6 h-6 text-purple-400" />
                  Key Insights
                </h3>
                
                <div className="space-y-3">
                  {matchResult.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <ChevronRight className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white/80 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Final Summary */}
            <Card className="card-glass border border-white/10 p-8 mb-8">
              <h3 className="font-bold text-2xl text-white mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-400" />
                Marriage Compatibility Summary
              </h3>
              
              <div className="text-center">
                <div className={cn(
                  "inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-6",
                  matchResult.status === "Excellent" ? "bg-green-500/10 border border-green-500/30" :
                  matchResult.status === "Good" ? "bg-yellow-500/10 border border-yellow-500/30" :
                  "bg-red-500/10 border border-red-500/30"
                )}>
                  {matchResult.status === "Excellent" && <CheckCircle2 className="w-8 h-8 text-green-400" />}
                  {matchResult.status === "Good" && <AlertCircle className="w-8 h-8 text-yellow-400" />}
                  {matchResult.status === "Weak" && <AlertCircle className="w-8 h-8 text-red-400" />}
                  <div className="text-left">
                    <p className="font-bold text-xl text-white mb-1">{matchResult.status} Marriage Compatibility</p>
                    <p className="text-white/60 text-sm">{matchResult.message}</p>
                  </div>
                </div>
                
                <p className="text-white/40 max-w-2xl mx-auto">
                  {matchResult.status === "Excellent" && 
                    "This is a stable marriage combination with strong planetary alignment. Both partners share complementary energies that support long-term harmony and mutual growth."
                  }
                  {matchResult.status === "Good" && 
                    "Moderate compatibility with effort needed. The relationship shows potential for success with understanding and compromise from both partners."
                  }
                  {matchResult.status === "Weak" && 
                    "Low compatibility based on classical rules. Marriage may require significant adjustments and professional guidance for success."
                  }
                </p>
              </div>
            </Card>

            {/* CTA Section */}
            <div className="text-center">
              <div className="inline-flex gap-4 flex-wrap justify-center">
                <ButtonLite
                  onClick={() => navigate('/free-5-minutes-astrology-ai')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Free 5-Minutes Astrology
                </ButtonLite>
                <ButtonLite
                  onClick={() => navigate('/free-ai-astrologer-chat')}
                  className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white px-6 py-3 rounded-full font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try AI Astrologer Chat
                </ButtonLite>
                <ButtonLite
                  onClick={() => setMatchResult(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-semibold"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Calculate Another Match
                </ButtonLite>
              </div>
            </div>
          </div>
        )}

        {/* Ad Banner */}
        <div className="flex justify-center mt-8 mb-8">
          <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
        </div>

        {/* SEO Content Section */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
          <div className="prose prose-invert max-w-none space-y-10 text-white/70 text-base leading-relaxed">

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">What is Kundli Matching?</h2>
              <p>
                Kundli matching — also called Guna Milan or Kundali matching — is one of the oldest and most trusted traditions in Hindu culture. Before a marriage is fixed, families consult an astrologer to compare the birth charts of both the boy and the girl. This comparison tells how compatible the two people are — not just emotionally, but also spiritually, physically, and mentally.
              </p>
              <p className="mt-3">
                The word "Kundli" means birth chart. Every person has a unique Kundli based on the exact date, time, and place of their birth. The position of the moon, planets, and stars at the time of birth shapes a person's personality, behavior, and destiny. When two people decide to get married, their Kundlis are matched to see if their energies align well together.
              </p>
              <p className="mt-3">
                In India, this is not just a ritual — it is taken very seriously. Even modern educated families check Kundli compatibility before finalising a match. Our free calculator makes this process simple and instant. You don't need to visit a pandit or pay anyone. Just enter both birth details and get your score in seconds. For individual insights into your romantic patterns, you can also explore our <Link to="/love-astrology-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Love Astrology by Date of Birth</Link> tool.
              </p>
            </section>

            {/* Ad Banner after What is Kundli Matching Section */}
            <div className="flex justify-center my-8">
              <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
            </div>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">How the 36 Guna Milan System Works</h2>
              <p>
                The Guna Milan system compares 8 different aspects of two birth charts. Each aspect gives a certain number of points, and the total adds up to 36. This is why the system is called "36 Guna Milan." The higher the score, the better the compatibility. Here is what each of the 8 Koots means:
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg">1. Varna (1 point)</h3>
                  <p className="mt-1 text-white/60 text-sm">This checks the spiritual compatibility between the two people. It is based on the moon sign and shows whether the couple will support each other's growth and values in life.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg">2. Vashya (2 points)</h3>
                  <p className="mt-1 text-white/60 text-sm">Vashya checks the power balance in the relationship — who has more control and influence. A good Vashya score means both partners feel comfortable with the natural dynamic between them.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg">3. Tara (3 points)</h3>
                  <p className="mt-1 text-white/60 text-sm">Tara is about the health and wellbeing of both partners after marriage. It is calculated using the birth nakshatra of both people and tells whether the marriage will bring good health and fortune.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg">4. Yoni (4 points)</h3>
                  <p className="mt-1 text-white/60 text-sm">Yoni looks at physical and intimate compatibility. It is based on the birth nakshatra and indicates how comfortable and naturally connected the two people will be in their personal life together.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg">5. Graha Maitri (5 points)</h3>
                  <p className="mt-1 text-white/60 text-sm">This checks the friendship between the ruling planets of both moon signs. If both partners' planets are friendly to each other, they will naturally understand each other's emotions and thought process.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg">6. Gana (6 points)</h3>
                  <p className="mt-1 text-white/60 text-sm">Gana divides people into three types — Dev (divine), Manushya (human), and Rakshasa (fierce). The best match is when both partners belong to the same Gana. Mixed Gana combinations can still work but may require more patience.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg">7. Bhakoot (7 points)</h3>
                  <p className="mt-1 text-white/60 text-sm">Bhakoot is one of the most important Koots. It checks the emotional and financial compatibility between the couple. A Bhakoot dosha can affect wealth, family harmony, and emotional bonding if not handled carefully.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg">8. Nadi (8 points)</h3>
                  <p className="mt-1 text-white/60 text-sm">Nadi carries the highest points and is considered the most critical Koot. It is related to health and progeny — meaning the health of children and the couple's overall wellbeing. Same Nadi for both partners creates a Nadi Dosha, which is taken very seriously in traditional astrology.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">How to Read Your Kundli Matching Score</h2>
              <p>
                Once you calculate your score, here is a simple way to understand what it means:
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-green-400 font-bold text-lg">28–36</span>
                  <p className="text-white/70 text-sm">Excellent match. Strong compatibility. Most pandits will happily approve this match. The couple is likely to have a happy and stable married life.</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <span className="text-yellow-400 font-bold text-lg">18–27</span>
                  <p className="text-white/70 text-sm">Good match. Some differences exist but nothing that cannot be handled with mutual understanding and effort from both sides.</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <span className="text-red-400 font-bold text-lg">Below 18</span>
                  <p className="text-white/70 text-sm">Weak match. This does not mean the marriage will definitely fail, but it does mean there may be challenges. Many astrologers recommend consulting a qualified pandit before proceeding.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">What is Manglik Dosha?</h2>
              <p>
                Manglik Dosha is one of the most talked about topics in Indian astrology. It happens when the planet Mars is placed in certain houses — the 1st, 2nd, 4th, 7th, 8th, or 12th house — in a person's birth chart. A person with this placement is called a Manglik.
              </p>
              <p className="mt-3">
                Traditionally, it is believed that a Manglik person should marry another Manglik. This is because when both partners have the dosha, it is said to cancel each other out. If only one partner is Manglik and the other is not, some astrologers believe it can create tension or conflict in the marriage.
              </p>
              <p className="mt-3">
                However, modern astrologers often point out that Manglik Dosha alone is not enough to reject a match. Many other factors in the chart — like the strength of Jupiter, the position of Venus, and the overall Guna Milan score — matter equally. Our calculator checks for Manglik Dosha in both charts automatically and shows you the result clearly.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "What is a good Kundli matching score?",
                    a: "A score of 28 or above out of 36 is considered excellent. 18 to 27 is acceptable. Below 18 is generally not recommended without consulting an expert astrologer."
                  },
                  {
                    q: "Is Kundli matching necessary for marriage?",
                    a: "It depends on your family traditions. In many Hindu families, especially in North India, Kundli matching is an important step. It gives an astrological view of how compatible two people are before marriage."
                  },
                  {
                    q: "Can we marry if Kundli does not match?",
                    a: "Yes, many couples marry even with a low score and have happy marriages. Kundli matching is a guidance tool, not a hard rule. A qualified astrologer can also suggest remedies to reduce the impact of doshas."
                  },
                  {
                    q: "How many gunas are needed for marriage?",
                    a: "A minimum of 18 gunas out of 36 is generally considered the baseline. Most families prefer at least 24 or above for a comfortable match."
                  },
                  {
                    q: "What happens if both are Manglik?",
                    a: "If both the boy and the girl have Manglik Dosha, the dosha is considered to cancel out and the match becomes acceptable from a Manglik perspective."
                  }
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                    <p className="text-white/60 text-sm">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <Award className="w-3 h-3" /> Authentic Vedic Calculations
            </p>
            <h2 className="font-bold text-3xl sm:text-4xl font-black leading-tight">
              Why Our <span className="text-pink-400">Kundli Matching</span> is Accurate
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-6 h-6 text-pink-400" />,
                title: "36 Guna System",
                desc: "Complete Ashtakoota Milan with Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi calculations."
              },
              {
                icon: <Shield className="w-6 h-6 text-pink-400" />,
                title: "Manglik Dosha Check",
                desc: "Accurate Manglik dosha analysis with Mars position in all relevant houses for both partners."
              },
              {
                icon: <Zap className="w-6 h-6 text-pink-400" />,
                title: "Swiss Ephemeris",
                desc: "NASA-grade planetary calculations using Swiss Ephemeris for arc-second precision."
              }
            ].map((feature, index) => (
              <Card key={index} className="card-glass border border-white/10 p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Internal Links Section */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pb-16">
          <div className="text-center mb-8">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <Sparkles className="w-3 h-3" /> Explore More Vedic Astrology Tools
            </p>
            <h2 className="font-bold text-3xl sm:text-4xl font-black leading-tight mb-4">
              Complete Your <span className="text-pink-400">Astrology Journey</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Discover our complete range of Vedic astrology tools and resources for accurate insights and guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-glass border border-white/10 p-6 text-center hover:border-pink-400/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/ai-astrology')}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">AI Astrology</h3>
              <p className="text-white/50 text-sm leading-relaxed">Get personalized AI-powered Vedic astrology predictions and insights based on your birth chart.</p>
            </Card>

            <Card className="card-glass border border-white/10 p-6 text-center hover:border-pink-400/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/free-ai-astrologer-chat')}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Free AI Astrology Chat</h3>
              <p className="text-white/50 text-sm leading-relaxed">Chat with Vedika AI astrologer for instant guidance on career, love, and life.</p>
            </Card>

            <Card className="card-glass border border-white/10 p-6 text-center hover:border-pink-400/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/free-kundli-generator')}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Free Kundli Generator</h3>
              <p className="text-white/50 text-sm leading-relaxed">Generate your detailed Vedic birth chart with planetary positions and predictions.</p>
            </Card>

            <Card className="card-glass border border-white/10 p-6 text-center hover:border-pink-400/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">See Your Future in 30 Sec</h3>
              <p className="text-white/50 text-sm leading-relaxed">Explore all our Vedic astrology tools and services from the main dashboard.</p>
            </Card>

            <Card className="card-glass border border-white/10 p-6 text-center hover:border-pink-400/30 transition-all duration-300 cursor-pointer" onClick={() => navigate('/blog/top-10-vedic-astrology-platform')}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Top 10 Vedic Astrology Blog</h3>
              <p className="text-white/50 text-sm leading-relaxed">Read expert insights on AI astrology, Vedic predictions, and planetary analysis.</p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}