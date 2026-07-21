import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Clock, Loader2, Sparkles, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPlanetaryData } from "@/lib/astroCalc";

interface BirthDetails {
  dob: string;
  time: string;
  place: string;
  lat?: number;
  lng?: number;
  tzone?: number;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const RASHI_NAMES: Record<string, { hindi: string; symbol: string }> = {
  "Aries": { hindi: "मेष (Mesh)", symbol: "♈" },
  "Taurus": { hindi: "वृषभ (Vrishabh)", symbol: "♉" },
  "Gemini": { hindi: "मिथुन (Mithun)", symbol: "♊" },
  "Cancer": { hindi: "कर्क (Kark)", symbol: "♋" },
  "Leo": { hindi: "सिंह (Simha)", symbol: "♌" },
  "Virgo": { hindi: "कन्या (Kanya)", symbol: "♍" },
  "Libra": { hindi: "तुला (Tula)", symbol: "♎" },
  "Scorpio": { hindi: "वृश्चिक (Vrishchik)", symbol: "♏" },
  "Sagittarius": { hindi: "धनु (Dhanu)", symbol: "♐" },
  "Capricorn": { hindi: "मकर (Makar)", symbol: "♑" },
  "Aquarius": { hindi: "कुंभ (Kumbh)", symbol: "♒" },
  "Pisces": { hindi: "मीन (Meen)", symbol: "♓" },
};

const TIMEZONES = [
  { label: "UTC -12:00 (Baker Island)", value: -12 },
  { label: "UTC -11:00 (American Samoa)", value: -11 },
  { label: "UTC -10:00 (Hawaii)", value: -10 },
  { label: "UTC -9:00 (Alaska)", value: -9 },
  { label: "UTC -8:00 (Los Angeles, Vancouver)", value: -8 },
  { label: "UTC -7:00 (Denver, Phoenix)", value: -7 },
  { label: "UTC -6:00 (Chicago, Mexico City)", value: -6 },
  { label: "UTC -5:00 (New York, Toronto)", value: -5 },
  { label: "UTC -4:00 (Santiago, Halifax)", value: -4 },
  { label: "UTC -3:00 (Buenos Aires, Sao Paulo)", value: -3 },
  { label: "UTC -2:00 (Fernando de Noronha)", value: -2 },
  { label: "UTC -1:00 (Azores)", value: -1 },
  { label: "UTC +0:00 (London, Lisbon, Accra)", value: 0 },
  { label: "UTC +1:00 (Paris, Berlin, Rome)", value: 1 },
  { label: "UTC +2:00 (Athens, Cairo, Jerusalem)", value: 2 },
  { label: "UTC +3:00 (Moscow, Nairobi, Baghdad)", value: 3 },
  { label: "UTC +3:30 (Tehran)", value: 3.5 },
  { label: "UTC +4:00 (Dubai, Baku)", value: 4 },
  { label: "UTC +4:30 (Kabul)", value: 4.5 },
  { label: "UTC +5:00 (Karachi, Tashkent)", value: 5 },
  { label: "UTC +5:30 (India, Sri Lanka)", value: 5.5 },
  { label: "UTC +5:45 (Kathmandu)", value: 5.75 },
  { label: "UTC +6:00 (Dhaka, Almaty)", value: 6 },
  { label: "UTC +6:30 (Yangon)", value: 6.5 },
  { label: "UTC +7:00 (Bangkok, Jakarta)", value: 7 },
  { label: "UTC +8:00 (Singapore, Beijing, Perth)", value: 8 },
  { label: "UTC +9:00 (Tokyo, Seoul)", value: 9 },
  { label: "UTC +9:30 (Adelaide, Darwin)", value: 9.5 },
  { label: "UTC +10:00 (Sydney, Brisbane)", value: 10 },
  { label: "UTC +11:00 (Solomon Islands)", value: 11 },
  { label: "UTC +12:00 (Auckland, Fiji)", value: 12 },
  { label: "UTC +13:00 (Samoa, Tonga)", value: 13 },
  { label: "UTC +14:00 (Line Islands)", value: 14 },
];

const RASHI_TRAITS: Record<string, string[]> = {
  "Aries": ["Courageous", "Confident", "Impulsive", "Leader"],
  "Taurus": ["Patient", "Reliable", "Determined", "Practical"],
  "Gemini": ["Adaptable", "Curious", "Communicative", "Quick-witted"],
  "Cancer": ["Nurturing", "Intuitive", "Emotional", "Protective"],
  "Leo": ["Generous", "Creative", "Dramatic", "Passionate"],
  "Virgo": ["Analytical", "Detail-oriented", "Helpful", "Practical"],
  "Libra": ["Diplomatic", "Charming", "Fair-minded", "Social"],
  "Scorpio": ["Resourceful", "Brave", "Passionate", "Determined"],
  "Sagittarius": ["Optimistic", "Adventurous", "Honest", "Independent"],
  "Capricorn": ["Disciplined", "Responsible", "Ambitious", "Patient"],
  "Aquarius": ["Innovative", "Humanitarian", "Independent", "Intellectual"],
  "Pisces": ["Compassionate", "Artistic", "Intuitive", "Gentle"],
};

const RASHI_ELEMENTS: Record<string, string> = {
  "Aries": "Fire", "Taurus": "Earth", "Gemini": "Air", "Cancer": "Water",
  "Leo": "Fire", "Virgo": "Earth", "Libra": "Air", "Scorpio": "Water",
  "Sagittarius": "Fire", "Capricorn": "Earth", "Aquarius": "Air", "Pisces": "Water",
};

const RASHI_LORDS: Record<string, string> = {
  "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
  "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
  "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter",
};

interface RashiResult {
  moonRashi: string;
  sunRashi: string;
  lagnaRashi: string;
  nakshatra: string;
  nakshatraPada: number;
  mahadasha: string;
  antardasha: string;
}

const RashiCalculatorByDateOfBirth = () => {
  const navigate = useNavigate();
  const { setAuthOpen } = useAuth();

  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    dob: "",
    time: "",
    place: "",
    tzone: -new Date().getTimezoneOffset() / 60,
  });

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<RashiResult | null>(null);
  const [error, setError] = useState("");
  const placeBoxRef = useRef<HTMLDivElement>(null);

  const searchLocation = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const key = "91ab8792290d414b92590c9d4cc0793c";
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${key}&limit=5&no_annotations=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const suggestions = data.results.map((r: any) => ({
          display_name: r.formatted,
          lat: r.geometry.lat.toString(),
          lon: r.geometry.lng.toString(),
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
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectLocation = (place: LocationSuggestion) => {
    setBirthDetails(prev => ({
      ...prev,
      place: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    }));
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!placeBoxRef.current) return;
      if (!placeBoxRef.current.contains(e.target as Node)) setShowLocationSuggestions(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleGenerate = async () => {
    if (!birthDetails.dob || !birthDetails.time || !birthDetails.place || !birthDetails.lat || !birthDetails.lng) {
      setError("Please fill in all required fields");
      return;
    }

    setError("");
    setIsGenerating(true);
    setResult(null);

    try {
      const [y, m, d] = birthDetails.dob.split('-').map(Number);
      const [hh, mm] = birthDetails.time.split(':').map(Number);
      const tzone = birthDetails.tzone ?? (-new Date().getTimezoneOffset() / 60);

      const astroData = await getPlanetaryData({
        day: d,
        month: m,
        year: y,
        hour: hh,
        min: mm,
        lat: birthDetails.lat,
        lon: birthDetails.lng,
        tzone,
      });

      setResult({
        moonRashi: astroData.moonSign || "Unknown",
        sunRashi: astroData.sunSign || "Unknown",
        lagnaRashi: astroData.lagnaSign,
        nakshatra: astroData.nakshatra?.name || "Unknown",
        nakshatraPada: astroData.nakshatra?.pada || 1,
        mahadasha: astroData.dasha.mahadasha,
        antardasha: astroData.dasha.antardasha,
      });
    } catch (err) {
      console.error("Error calculating Rashi:", err);
      setError("Failed to calculate Rashi. Please check your details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
    setBirthDetails({ dob: "", time: "", place: "" });
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case "Fire": return "from-orange-500/20 to-red-500/20 border-orange-500/30";
      case "Earth": return "from-green-500/20 to-emerald-500/20 border-green-500/30";
      case "Air": return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case "Water": return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
      default: return "from-pink-500/20 to-purple-500/20 border-pink-500/30";
    }
  };

  return (
    <>
      <Helmet>
        <title>Rashi Calculator by Date of Birth (Free & 100% Accurate)</title>
        <meta name="description" content="Free Rashi calculator by date of birth. Instantly find your Vedic moon sign (Chandra Rashi), sun sign, lagna, nakshatra, and dasha based on exact birth details using Swiss Ephemeris." />
        <meta name="keywords" content="rashi calculator, rashi by date of birth, moon sign calculator, vedic astrology rashi, chandra rashi, find my rashi, janam rashi, zodiac sign calculator, vedic astrology" />
        <link rel="canonical" href="https://veadicastro.in/rashi-calculator-by-date-of-birth" />
        <meta property="og:title" content="Rashi Calculator by Date of Birth — Find Your Vedic Moon Sign" />
        <meta property="og:description" content="Free Rashi calculator by date of birth. Instantly find your Vedic moon sign, sun sign, lagna, nakshatra using Swiss Ephemeris." />
        <meta property="og:url" content="https://veadicastro.in/rashi-calculator-by-date-of-birth" />
        <meta property="article:published_time" content="2026-07-21T00:00:00+05:30" />
        <meta property="article:modified_time" content="2026-07-21T00:00:00+05:30" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veadicastro.in" },
              { "@type": "ListItem", "position": 2, "name": "Rashi Calculator by Date of Birth", "item": "https://veadicastro.in/rashi-calculator-by-date-of-birth" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Rashi Calculator by Date of Birth",
            "url": "https://veadicastro.in/rashi-calculator-by-date-of-birth",
            "applicationCategory": "Astrology Application",
            "operatingSystem": "All",
            "browserRequirements": "JavaScript",
            "description": "Free Rashi calculator by date of birth. Instantly find your Vedic moon sign (Chandra Rashi), sun sign, lagna, nakshatra, and dasha based on exact birth details using Swiss Ephemeris.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is my Rashi by date of birth?",
                "acceptedAnswer": { "@type": "Answer", "text": "Your Rashi by date of birth is the specific constellation sector where the Moon was positioned at your time of birth. It is determined by running your birth day, exact time, and geographic location through a sidereal calendar engine, which converts your calendar birth date into precise cosmic coordinates." }
              },
              {
                "@type": "Question",
                "name": "How can I know my Rashi?",
                "acceptedAnswer": { "@type": "Answer", "text": "You can know your Rashi by using an online astronomical calculation tool like the one on Veadicastro. You simply need to input your complete birth statistics including day, month, year, exact minute of birth, and birth town into the interface to receive an instant, calculated output based on historical ephemeris tables." }
              },
              {
                "@type": "Question",
                "name": "Can I find my Rashi without birth time?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can find your Rashi without an exact birth time if the Moon did not cross a sign boundary line on that specific calendar day. If the Moon remained safely within a single sign for the entire 24-hour period, a default time entry like 12:00 PM will still yield a correct result." }
              },
              {
                "@type": "Question",
                "name": "Is Rashi different from zodiac sign?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, Rashi is fundamentally different from a standard western zodiac sign. A Rashi tracks the physical position of the Moon against fixed constellations using the sidereal zodiac, while western zodiac signs track the position of the Sun relative to Earth's seasonal equinoxes using the tropical system." }
              },
              {
                "@type": "Question",
                "name": "Which Rashi is lucky?",
                "acceptedAnswer": { "@type": "Answer", "text": "No single Rashi is inherently luckier than another in traditional Indian astrology. Every individual sign carries its own distinct set of psychological strengths, structural challenges, elements, and planetary governors. True harmony depends on how an individual utilizes their natural mental inclinations in daily life choices." }
              },
              {
                "@type": "Question",
                "name": "How accurate is a Rashi calculator?",
                "acceptedAnswer": { "@type": "Answer", "text": "An online Rashi calculator is highly accurate provided it utilizes a verified digital ephemeris engine and the user inputs exact birth data. The mathematical calculations match observable astronomical realities, though accuracy can be compromised if the birth time or timezone offset is guessed incorrectly." }
              },
              {
                "@type": "Question",
                "name": "Can my Rashi change?",
                "acceptedAnswer": { "@type": "Answer", "text": "Your birth Rashi is a fixed astronomical fact that never changes throughout your entire life. It represents a permanent snapshot of the eastern sky at the exact moment you were born. It remains your permanent cosmic signature for all traditional naming practices and lifecycle celebrations." }
              },
              {
                "@type": "Question",
                "name": "What is Janma Rashi?",
                "acceptedAnswer": { "@type": "Answer", "text": "Janma Rashi is the formal Sanskrit term for your birth Moon sign. Janma translates directly to birth, and Rashi means sign or stellar cluster. Therefore, it specifically defines the exact constellation house where the Moon was traveling when an individual was born into the physical world." }
              },
              {
                "@type": "Question",
                "name": "Does birth place matter?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, your birth place matters because it establishes the precise geographic longitude and latitude needed to convert standard clock time into true astronomical time. Without a specific location, the software engine cannot calculate the exact timezone offset required to read planetary tables accurately." }
              },
              {
                "@type": "Question",
                "name": "Why is Moon sign important?",
                "acceptedAnswer": { "@type": "Answer", "text": "The Moon sign is considered the most important factor in traditional Indian astrology because it rules over the human mind, memory, reactions, and emotions. Since your internal mental state dictates how you perceive reality and make choices, the Moon is treated as the key to your psychology." }
              },
              {
                "@type": "Question",
                "name": "Can two people have the same Rashi?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, two people can easily share the same Rashi if they were born within the same two and a quarter day window. Because the Moon moves relatively slowly through each 30-degree sector, everyone born globally during that specific transit block will share the same baseline lunar placement." }
              },
              {
                "@type": "Question",
                "name": "Which Rashi is best?",
                "acceptedAnswer": { "@type": "Answer", "text": "There is no best Rashi within the mathematical framework of Vedic science. Each sign represents a necessary component of the universal zodiacal wheel. Every placement possesses unique virtues and structural flaws, making all twelve signs equally valuable components of human psychological diversity." }
              },
              {
                "@type": "Question",
                "name": "What is the difference between Lagna and Rashi?",
                "acceptedAnswer": { "@type": "Answer", "text": "Lagna refers to the ascending sign rising on the eastern horizon at your exact minute of birth, representing your outer body and physical reality. Rashi refers specifically to the position of the Moon, representing your inner mind, emotional processing system, and psychological framework." }
              },
              {
                "@type": "Question",
                "name": "Is this calculator free?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, the Rashi Calculator by Date of Birth provided on Veadicastro is a completely free online utility. Users can access the platform at any time, input their personal birth data safely, and view their calculated sidereal Moon sign results instantly without any financial obligations." }
              },
              {
                "@type": "Question",
                "name": "Can I calculate Rashi online?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can easily calculate your Rashi online by using digitized web utilities that have integrated traditional astronomical ephemeris databases. These tools automate the complex manual calculations previously performed by mathematicians using manual printed almanacs called Panchangs." }
              },
              {
                "@type": "Question",
                "name": "What are the twelve Rashis?",
                "acceptedAnswer": { "@type": "Answer", "text": "The twelve traditional Rashis in sequential order are Mesha, Vrishabha, Mithuna, Karka, Simha, Kanya, Tula, Vrishchika, Dhanu, Makara, Kumbha, and Meena. They correspond directly to Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces respectively." }
              },
              {
                "@type": "Question",
                "name": "How is Rashi calculated in Vedic astrology?",
                "acceptedAnswer": { "@type": "Answer", "text": "In Vedic astrology, Rashi is calculated by determining the absolute celestial longitude of the Moon at birth, subtracting the specific precession correction value known as Ayanamsha, and identifying which 30-degree sector of the fixed sidereal zodiac matches those remaining mathematical degrees." }
              },
              {
                "@type": "Question",
                "name": "Which planet rules my Rashi?",
                "acceptedAnswer": { "@type": "Answer", "text": "The planet ruling your Rashi depends on your specific moon placement: Mars rules Mesha and Vrishchika; Venus rules Vrishabha and Tula; Mercury rules Mithuna and Kanya; the Moon rules Karka; the Sun rules Simha; Jupiter rules Dhanu and Meena; and Saturn rules Makara and Kumbha." }
              },
              {
                "@type": "Question",
                "name": "What if I do not know my birth time?",
                "acceptedAnswer": { "@type": "Answer", "text": "If you do not know your exact birth time, you can try entering a default value of 12:00 PM noon. If the Moon did not cross a sign boundary line on that day, the calculated result will be correct. However, verification against family records is recommended for borderline days." }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden">
        <div className="pointer-events-none fixed top-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full bg-pink-600/5 blur-[80px]" />
        <div className="pointer-events-none fixed bottom-[-200px] left-[-200px] w-[350px] h-[350px] rounded-full bg-purple-800/5 blur-[80px]" />

        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
              <img src="/optimized/logo.webp" alt="Veadicastro" className="w-9 h-9 rounded-full" loading="eager" />
              <span className="text-lg font-bold tracking-wide">Veadicastro</span>
            </button>
            <button onClick={() => setAuthOpen(true)} className="text-sm text-white px-4 py-2 rounded-full font-medium transition-all" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>
                Try AI Astrologer
              </button>
          </div>
        </header>

        <section className="relative py-14 text-center px-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
            Free Vedic Rashi Calculator
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-none mb-4">
            Rashi Calculator by Date of Birth
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mt-4">
            Instantly find your Vedic Moon sign (Rashi), Sun sign, Lagna, Nakshatra, and current Dasha period — powered by Swiss Ephemeris for 100% accurate calculations.
          </p>
        </section>

        <div className="max-w-4xl mx-auto px-4 pb-12">
          {!result && (
            <Card className="bg-card/40 backdrop-blur border border-white/10 rounded-3xl p-8">
              <h2 className="font-bold text-2xl text-center mb-8">
                Enter Your Birth Details
              </h2>

              <div className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <div>
                  <Label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-pink-400" /> Date of Birth *
                  </Label>
                  <Input
                    type="date"
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11"
                    value={birthDetails.dob}
                    onChange={e => setBirthDetails(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-pink-400" /> Time of Birth *
                  </Label>
                  <Input
                    type="time"
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11"
                    value={birthDetails.time}
                    onChange={e => setBirthDetails(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                <div className="relative" ref={placeBoxRef}>
                  <Label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-pink-400" /> Place of Birth *
                  </Label>
                  <div className="relative">
                    <Input
                      className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11 pl-10"
                      placeholder="Search your birth city..."
                      value={birthDetails.place}
                      onChange={e => {
                        const value = e.target.value;
                        setBirthDetails(prev => ({ ...prev, place: value }));
                        searchLocation(value);
                      }}
                      onFocus={() => locationSuggestions.length && setShowLocationSuggestions(true)}
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    {isSearchingLocation && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-pink-400" />}
                  </div>
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/90 backdrop-blur-lg">
                      {locationSuggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          className="px-4 py-3 hover:bg-pink-900/30 cursor-pointer text-sm text-white/80 border-b border-white/5 last:border-0 transition-colors"
                          onClick={() => selectLocation(suggestion)}
                        >
                          <MapPin className="inline w-3 h-3 text-pink-400 mr-2" />
                          {suggestion.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-pink-400" /> Timezone
                  </Label>
                  <Select
                    value={String(birthDetails.tzone ?? (-new Date().getTimezoneOffset() / 60))}
                    onValueChange={val => setBirthDetails(prev => ({ ...prev, tzone: parseFloat(val) }))}
                  >
                    <SelectTrigger className="bg-white/5 border border-white/10 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border border-white/10 max-h-60">
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={String(tz.value)} className="text-white focus:bg-pink-900/30 focus:text-white">
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/40 mt-1">Auto-detected from your device. Change if different from birth location.</p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!birthDetails.dob || !birthDetails.time || !birthDetails.place || !birthDetails.lat || !birthDetails.lng || isGenerating}
                  className="w-full h-12 rounded-full text-white font-semibold transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calculating Your Rashi...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate My Rashi
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              {/* Moon Rashi - Primary */}
              <Card className="bg-card/40 backdrop-blur border border-white/10 rounded-3xl p-8 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-pink-400 mb-2">Your Rashi (Moon Sign)</p>
                <div className="text-6xl mb-2">{RASHI_NAMES[result.moonRashi]?.symbol || "?"}</div>
                <h2 className="text-4xl font-black mb-1">{result.moonRashi}</h2>
                <p className="text-xl text-white/60">{RASHI_NAMES[result.moonRashi]?.hindi || result.moonRashi}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${getElementColor(RASHI_ELEMENTS[result.moonRashi])} border`}>
                    Element: {RASHI_ELEMENTS[result.moonRashi]}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    Lord: {RASHI_LORDS[result.moonRashi]}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {RASHI_TRAITS[result.moonRashi]?.map(trait => (
                    <span key={trait} className="text-xs px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300">
                      {trait}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Other Rashis Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-card/40 backdrop-blur border border-white/10 rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Sun Sign (Surya Rashi)</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{RASHI_NAMES[result.sunRashi]?.symbol || "?"}</span>
                    <div>
                      <p className="text-xl font-bold">{result.sunRashi}</p>
                      <p className="text-sm text-white/50">{RASHI_NAMES[result.sunRashi]?.hindi || ""}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card/40 backdrop-blur border border-white/10 rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Lagna (Ascendant)</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{RASHI_NAMES[result.lagnaRashi]?.symbol || "?"}</span>
                    <div>
                      <p className="text-xl font-bold">{result.lagnaRashi}</p>
                      <p className="text-sm text-white/50">{RASHI_NAMES[result.lagnaRashi]?.hindi || ""}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Nakshatra & Dasha */}
              <Card className="bg-card/40 backdrop-blur border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4">Nakshatra & Dasha</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Nakshatra</p>
                    <p className="text-lg font-bold mt-1">{result.nakshatra}</p>
                    <p className="text-sm text-white/50">Pada {result.nakshatraPada}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Current Dasha</p>
                    <p className="text-lg font-bold mt-1">{result.mahadasha}</p>
                    <p className="text-sm text-white/50">Antardasha: {result.antardasha}</p>
                  </div>
                </div>
              </Card>

              <Button
                onClick={handleReset}
                className="w-full h-12 rounded-full text-white font-semibold transition-all text-sm"
                style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}
              >
                Calculate Another Rashi
              </Button>
            </div>
          )}

          {/* SEO Article */}
          <div className="max-w-4xl mx-auto px-4 pb-16 mt-12">
            <article className="prose prose-invert prose-lg max-w-none text-white/80 leading-relaxed space-y-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_strong]:text-white">
              <h2>Rashi Calculator by Date of Birth</h2>
              <p>
                Discovering your Rashi is the foundational step in understanding your personal astrology profile according to time-tested Indian traditions. Many people search for a reliable way to identify their lunar placement to align with cultural customs, naming rituals, and daily calendars. This comprehensive guide explains the exact mechanism behind the Rashi Calculator by Date of Birth on <a href="/" className="text-pink-400 underline hover:text-pink-300">Veadicastro</a> and provides a deep dive into the stellar mechanics of ancient sky mapping. For those who want a broader overview of how planetary positions shape destiny, our <a href="/astrology-by-date-of-birth" className="text-pink-400 underline hover:text-pink-300">Astrology by Date of Birth</a> guide offers an excellent starting point. You can also explore how modern technology enhances tradition through our <a href="/free-ai-astrologer-chat" className="text-pink-400 underline hover:text-pink-300">Free AI Astrologer Chat</a>.
              </p>

              <h2>Understanding the Core of Vedic Astrology</h2>
              <p>
                Vedic astrology, also known as Jyotish, is a centuries-old system of astronomy and celestial interpretation originating from the Indian subcontinent. Unlike contemporary western systems, it relies heavily on the sidereal zodiac, which tracks the actual, observable positions of constellations in the night sky. Within this framework, your mental blueprint, emotional nature, and subconscious tendencies are anchored entirely to the position of the Moon at the exact moment of your birth.
              </p>
              <p>
                When you use an Indian zodiac calculator, you are looking for a highly specific astronomical calculation. The sky is viewed as a complete 360-degree circle, neatly divided into twelve equal zones of 30 degrees each. Each zone constitutes a Rashi. The accurate tracking of the Moon through these twelve segments forms the basis of personalized calculation in the Vedic tradition. To see how these calculations translate into a full birth chart, try the <a href="/free-kundli-generator" className="text-pink-400 underline hover:text-pink-300">Free Kundli Generator</a> or read about <a href="/blog/how-ai-is-transforming-vedic-astrology" className="text-pink-400 underline hover:text-pink-300">How AI is Transforming Vedic Astrology</a>.
              </p>

              <h2>What is a Rashi</h2>
              <p>
                The Sanskrit word Rashi literally translates to a sign, collection, or heap of stars. In the context of astronomical calculations, a Rashi represents one of the twelve fundamental sectors of the sidereal zodiac. Each sector is named after the prominent constellation residing within its boundaries. Your specific Janma Rashi, or birth sign, refers to the exact stellar sector where the Moon was transiting when you took your first breath.
              </p>
              <p>
                In Indian households, knowing your Rashi is essential for several cultural practices. It influences the selection of auspicious syllables for naming a newborn child, determines planetary periods, and dictates how an individual interacts with the community calendar. It acts as the cosmic address of your emotional and psychological self. Understanding your Rashi also helps you navigate relationship dynamics — you can check <a href="/free-kundali-matching" className="text-pink-400 underline hover:text-pink-300">Free Kundali Matching</a> for marriage compatibility or explore <a href="/love-astrology-by-date-of-birth" className="text-pink-400 underline hover:text-pink-300">Love Astrology by Date of Birth</a> for deeper romantic insights.
              </p>

              <h2>What is a Moon Sign</h2>
              <p>
                The term Moon sign is the modern, universal English equivalent of the traditional Sanskrit term Janma Rashi. While your outer personality might be shaped by various planetary configurations, the Moon sign rules over your internal landscape. It governs your deep-seated habits, instinctual reactions, memory, processing of emotions, and overall mental peace.
              </p>
              <p>
                The Moon is the fastest-moving celestial body utilized in traditional calculations. It spends roughly two and a quarter days in each cosmic sector, completing a full journey through all twelve signs in approximately 27.3 days. Because of this rapid movement, finding your precise Moon sign requires a calculator that references highly accurate astronomical ephemeris data rather than a generic monthly calendar. For more targeted predictions based on your signs, visit <a href="/ai-marriage-prediction-by-date-of-birth" className="text-pink-400 underline hover:text-pink-300">AI Marriage Prediction by Date of Birth</a> or <a href="/ai-career-prediction-by-date-of-birth" className="text-pink-400 underline hover:text-pink-300">AI Career Prediction by Date of Birth</a>.
              </p>

              <h2>Difference Between Rashi and Zodiac Sign</h2>
              <p>
                People frequently confuse the traditional Indian Rashi with the broader Western concept of a zodiac sign. The primary difference lies in the astronomical baseline and the celestial body given top priority. Western astrology focuses on the Sun and uses a tropical baseline tied to the changing of seasons. Vedic astrology prioritizes the Moon and uses a sidereal baseline tied to fixed star positions.
              </p>
              <p>
                Because the Earth experiences a slow axial wobble known as the precession of the equinoxes, the tropical and sidereal zodiacs have drifted apart over centuries by roughly 24 degrees. This means that if you check your sign using a western calendar, it will likely differ from your true Vedic calculation. A dedicated Vedic Rashi calculator ensures you are getting the correct sidereal placement based on actual stellar alignments. To understand the nuances better, read our comparison of <a href="/blog/vedic-vs-western-astrology" className="text-pink-400 underline hover:text-pink-300">Vedic vs Western Astrology</a> or check the accuracy of AI-driven readings at <a href="/blog/is-ai-astrology-accurate" className="text-pink-400 underline hover:text-pink-300">Is AI Astrology Accurate</a>.
              </p>

              <h3>Comparison Summary Matrix</h3>
              <p>
                Summary: The fundamental variance between these systems is that a Rashi tracks the physical position of the Moon against fixed constellations, whereas western zodiac signs track the Sun relative to seasonal points on Earth. For those interested in alternative platforms, see how we compare with <a href="/hi-astro-alternative" className="text-pink-400 underline hover:text-pink-300">HiAstro Alternative</a> and <a href="/astrosage-alternative" className="text-pink-400 underline hover:text-pink-300">AstroSage Alternative</a>.
              </p>

              <h2>How the Calculator Works</h2>
              <p>
                The online Rashi Calculator by Date of Birth on Veadicastro eliminates manual mathematical errors by digitizing traditional astronomical algorithms. The backend system utilizes a highly accurate digital ephemeris, which is a mathematical table specifying the exact positions of celestial bodies in the sky over time. The software processes your specific birth details to determine the precise degree coordinates of the Moon.
              </p>
              <p>
                Once the exact longitudinal position of the Moon is established, the calculator applies the Ayanamsha correction. The Ayanamsha is the precise angular distance between the tropical and sidereal zodiacs. By subtracting this value from the tropical position, the tool determines the true sidereal coordinate and identifies which of the twelve 30-degree sectors the Moon occupied at that moment. For a deeper look at planetary positions, explore <a href="/ai-kundli-analysis" className="text-pink-400 underline hover:text-pink-300">AI Kundli Analysis</a> or get a comprehensive <a href="/ai-astrology-prediction" className="text-pink-400 underline hover:text-pink-300">AI Astrology Prediction</a>.
              </p>

              <h2>How to Use This Tool</h2>
              <p>
                Finding your lunar placement through Veadicastro is straightforward. To ensure the highest possible accuracy from the automated software script, follow these sequential steps:
              </p>
              <p>
                Locate the input fields on the calculator interface page. Select your exact day, month, and year of birth from the dropdown menus. Input your exact birth time down to the minute, specifying AM or PM correctly. Type your precise town, city, or district of birth to establish geographical coordinates. Click the calculate button to process the astronomical values. The screen will immediately refresh to display your verified Janma Rashi along with its traditional Sanskrit name, English counterpart, and ruling planetary lord.
              </p>
              <p>
                Once you know your Rashi, you can explore related tools like <a href="/today-horoscope" className="text-pink-400 underline hover:text-pink-300">Today Horoscope</a>, <a href="/lucky-colour-for-today" className="text-pink-400 underline hover:text-pink-300">Lucky Colour for Today</a>, or the <a href="/angel-number-calculator" className="text-pink-400 underline hover:text-pink-300">Angel Number Calculator</a> to enhance your daily spiritual practice.
              </p>

              <h2>Benefits of Knowing Your Rashi</h2>
              <p>
                Discovering your true lunar sign unlocks a deeper understanding of your psychological makeup. It provides immediate clarity on why you respond to stress, joy, and relationships in specific ways. Because the mind is ruled by the Moon in traditional systems, identifying this placement allows you to recognize your natural behavioral patterns and cognitive biases.
              </p>
              <p>
                Additionally, knowing your sign helps you participate accurately in family traditions and regional cultural events. When visiting temples or participating in traditional ceremonies, priests often ask for your Janma Rashi to perform personalized prayers. It also allows you to follow the monthly lunar transitions through the transit calendar with greater personal context. For spiritual products aligned with your Rashi, visit our <a href="/astrology-store" className="text-pink-400 underline hover:text-pink-300">Astrology Store</a> or check out the <a href="/dhan-yog-bracelet" className="text-pink-400 underline hover:text-pink-300">Dhan Yog Bracelet</a> for prosperity.
              </p>

              <h2>Twelve Rashis Explained</h2>
              <p>
                Every individual falls into one of twelve specific categories based on the lunar position at birth. Each sector carries unique elemental properties, energetic polarities, and planetary influences that shape the internal disposition of the native.
              </p>

              <h3>Mesha (Aries)</h3>
              <p>
                Mesha is the initial sector of the zodiac, characterized by a fiery element and governed by the planet Mars. Individuals with this placement often exhibit a high degree of innate initiative, courage, and an independent spirit. The mind tends to process information rapidly, favoring direct action over prolonged contemplation.
              </p>

              <h3>Vrishabha (Taurus)</h3>
              <p>
                Vrishabha is an earthly sector ruled by the planet Venus. This placement grounds the emotional nature, instilling a deep desire for stability, material comfort, and aesthetic harmony. The mind moves at a measured, deliberate pace, prizing reliability, patience, and perseverance above all else.
              </p>

              <h3>Mithuna (Gemini)</h3>
              <p>
                Mithuna is an airy, dual sector governed entirely by Mercury. This alignment produces an intellectually curious internal landscape. The mind seeks constant stimulation through communication, learning, and social interaction, often displaying significant adaptability alongside a tendency toward restlessness.
              </p>

              <h3>Karka (Cancer)</h3>
              <p>
                Karka is a watery, cardinal sector ruled by the Moon itself, making this a highly potent and sensitive alignment. It emphasizes deep emotional depth, strong intuitive faculties, and natural protective instincts. The internal state is highly responsive to the surrounding environment and the feelings of others.
              </p>

              <h3>Simha (Leo)</h3>
              <p>
                Simha is a fiery, fixed sector under the direct governance of the Sun. It bestows an innate sense of dignity, self-expression, and leadership within the internal psyche. Individuals often process life through a lens of personal honor, seeking to protect, guide, and illuminate their immediate social circles.
              </p>

              <h3>Kanya (Virgo)</h3>
              <p>
                Kanya is an earthly sector ruled by Mercury, focusing the mental energy toward analytical precision, organization, and practical service. The mind is inherently detail-oriented, seeking to refine systems, solve complex problems, and maintain high standards of order in daily life.
              </p>

              <h3>Tula (Libra)</h3>
              <p>
                Tula is an airy sector governed by Venus, symbolized by the balancing scales. This configuration produces an internal drive toward interpersonal harmony, justice, and diplomatic resolution. The mind constantly weighs options to find equilibrium, valuing partnership and artistic presentation.
              </p>

              <h3>Vrishchika (Scorpio)</h3>
              <p>
                Vrishchika is a watery sector ruled traditionally by Mars. It creates an exceptionally resilient, intense, and private internal nature. The psyche is naturally drawn to uncovering hidden truths, navigating complex emotional transformations, and maintaining strong psychological boundaries.
              </p>

              <h3>Dhanu (Sagittarius)</h3>
              <p>
                Dhanu is a fiery sector under the expansive stewardship of Jupiter. This placement fosters an optimistic, philosophical, and truth-seeking mental disposition. The mind naturally gravitates toward higher learning, ethics, exploration, and the broader conceptual patterns of existence.
              </p>

              <h3>Makara (Capricorn)</h3>
              <p>
                Makara is an earthly sector ruled by Saturn, symbolizing structured execution, duty, and endurance. The emotional nature is disciplined, patient, and highly focused on long-term achievements. The mind approaches life with a realistic perspective, valuing structure, order, and societal responsibility.
              </p>

              <h3>Kumbha (Aquarius)</h3>
              <p>
                Kumbha is an airy sector governed by Saturn, directing mental focus toward collective systems, innovation, and humanitarian concepts. The internal nature is often unconventional, intellectual, and deeply interested in societal welfare, structural progress, and large social networks.
              </p>

              <h3>Meena (Pisces)</h3>
              <p>
                Meena is the final watery sector ruled by Jupiter, representing the culmination of the zodiacal journey. It creates an introspective, highly imaginative, and deeply empathetic psychological profile. The mind is naturally receptive to abstract concepts, artistic expressions, and universal connection.
              </p>

              <h3>Comprehensive Rashi Reference Matrix</h3>
              <p>
                Summary: Each of the twelve signs combines a unique planetary ruler and physical element to shape the basic operating system of an individual's subconscious mind and instinctive reactions. For yearly predictions based on your Rashi, read the <a href="/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" className="text-pink-400 underline hover:text-pink-300">Yearly Horoscope 2026</a> or check the <a href="/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis" className="text-pink-400 underline hover:text-pink-300">Rahu Ketu Transit 2026</a> predictions for your sign.
              </p>

              <h2>How Rashi Is Calculated</h2>
              <p>
                The mathematical computation of a Rashi involves mapping the exact path of the Moon across the 360-degree celestial band. The computation relies entirely on astronomical parameters to translate real-world physical locations into astrological coordinates. It requires isolating the precise longitude of the Moon at a specific moment in time and cross-referencing it with the standard 12-tier grid of the sidereal zodiac.
              </p>
              <p>
                Because planets do not stand still, automated software must calculate the exact motion parameters. The math counts the total elapsed days from a standard cosmic epoch to determine the basic positions, then refines those positions based on the exact hour and geographic position on Earth. This step is critical because timezone differences modify the universal time coordinate used to read the astronomical tables. You can also learn about <a href="/blog/ai-astrology-prediction-for-2026" className="text-pink-400 underline hover:text-pink-300">AI Astrology Predictions for 2026</a> and explore how <a href="/blog/ai-jyotish-vedic-astrology" className="text-pink-400 underline hover:text-pink-300">AI Jyotish Vedic Astrology</a> is revolutionizing traditional calculations.
              </p>

              <h3>Role of Birth Date</h3>
              <p>
                Your birth date sets the primary historical anchor for the calculation. It allows the computational script to identify the specific day in human history to access the correct page of the ephemeris. Since the Moon takes roughly 54 hours to pass through a single 30-degree Rashi, knowing the date provides a broad astronomical window that narrow downs the options to one or two potential signs.
              </p>
              <p>
                For individuals born when the Moon is firmly settled in the middle degrees of a constellation, the calendar date alone is often sufficient to pinpoint the correct sign. The planetary coordinates will remain safely within that specific sign's boundary lines for the entire 24-hour calendar duration, meaning minor time variances will not alter the final result.
              </p>

              <h3>Role of Birth Time</h3>
              <p>
                While the calendar date gives a general baseline, your precise birth time provides definitive accuracy. The Moon travels roughly 13 degrees across the sky every single day, moving at a speed of approximately 0.5 degrees per hour. If the Moon happens to change signs on the day you were born, an incorrect birth time will cause the calculator to output the wrong sign entirely.
              </p>
              <p>
                For example, if the Moon transitions from Mesha to Vrishabha at exactly 2:30 PM on your birth date, someone born at 11:00 AM will have a Mesha Rashi, while someone born at 4:00 PM will have a Vrishabha Rashi. Inputting an accurate birth time ensures that the calculator captures these critical borderline shifts perfectly.
              </p>

              <h3>Role of Birth Place</h3>
              <p>
                The geographic location of your birth is necessary to calculate the true local mathematical time from standard clock time. Clock time is an artificial human construct designed to keep uniform time zones across vast distances, whereas astronomical calculations depend on local solar time based on your exact longitude and latitude degrees.
              </p>
              <p>
                Entering the correct birth place allows the software backend to determine the correct offset from Greenwich Mean Time (GMT) or Coordinated Universal Time (UTC). This geographical calibration ensures that the absolute moment of your birth is synchronized correctly with global ephemeris data, preventing errors caused by boundary timezones.
              </p>

              <h3>Data Input Priority Model</h3>
              <p>
                Summary: While the calendar date establishes the baseline celestial map, providing an accurate birth time and location ensures absolute precision when the Moon sits near critical boundary lines. For further exploration, try the <a href="/horoscope-by-date-of-birth" className="text-pink-400 underline hover:text-pink-300">Horoscope by Date of Birth</a> tool or get personalized guidance from <a href="/ai-pandit" className="text-pink-400 underline hover:text-pink-300">AI Pandit</a>.
              </p>

              <h2>Can Two People Have the Same Rashi</h2>
              <p>
                It is common for millions of individuals worldwide to share the exact same Rashi. Because the Moon lingers in a single zodiacal sector for roughly two and a quarter days, every single individual born globally during that specific 54-hour window will share the same lunar sign. This shared placement represents a broad emotional and psychological common ground.
              </p>
              <p>
                While sharing a sign indicates similar baseline mental habits and emotional processing styles, it does not mean those two individuals will have identical lives or personalities. Other highly sensitive astrological components, such as the exact degree of the rising sign (Lagna) and the placements of the remaining seven planets, move at completely different speeds and create highly customized individual profiles. For relationship-specific insights, check <a href="/ai-future-spouse-prediction" className="text-pink-400 underline hover:text-pink-300">AI Future Spouse Prediction</a> or <a href="/compatibility" className="text-pink-400 underline hover:text-pink-300">Compatibility</a> analysis.
              </p>

              <h2>Common Mistakes People Make</h2>
              <p>
                The most frequent error individuals commit when trying to find their lunar placement is applying their western zodiac parameters directly to Indian calculations. Western horoscopes printed in popular media are calculated using the Sun's position via the tropical calendar system. Assuming your sun sign is your Rashi leads to incorrect tracking and irrelevant data analysis.
              </p>
              <p>
                Another prevalent mistake is ignoring daylight saving time corrections or guessing birth times blindly. Guessing your time of birth when it occurred near a celestial transition boundary can lead to an incorrect sign reading. Always double-check historical birth certificates or official hospital records to ensure the data entered into the digital engine is verified and precise. Read about <a href="/blog/ai-astrologer-vs-human-astrologer" className="text-pink-400 underline hover:text-pink-300">AI Astrologer vs Human Astrologer</a> to understand how technology ensures accuracy, or check <a href="/blog/ai-astrology-real-or-fake" className="text-pink-400 underline hover:text-pink-300">Is AI Astrology Real or Fake</a> for an honest assessment.
              </p>

              <h2>Frequently Asked Questions</h2>

              <h3>What is my Rashi by date of birth?</h3>
              <p>
                Your Rashi by date of birth is the specific constellation sector where the Moon was positioned at your time of birth. It is determined by running your birth day, exact time, and geographic location through a sidereal calendar engine, which converts your calendar birth date into precise cosmic coordinates.
              </p>

              <h3>How can I know my Rashi?</h3>
              <p>
                You can know your Rashi by using an online astronomical calculation tool like the one on Veadicastro. You simply need to input your complete birth statistics including day, month, year, exact minute of birth, and birth town into the interface to receive an instant, calculated output based on historical ephemeris tables.
              </p>

              <h3>Can I find my Rashi without birth time?</h3>
              <p>
                Yes, you can find your Rashi without an exact birth time if the Moon did not cross a sign boundary line on that specific calendar day. If the Moon remained safely within a single sign for the entire 24-hour period, a default time entry like 12:00 PM will still yield a correct result.
              </p>

              <h3>Is Rashi different from zodiac sign?</h3>
              <p>
                Yes, Rashi is fundamentally different from a standard western zodiac sign. A Rashi tracks the physical position of the Moon against fixed constellations using the sidereal zodiac, while western zodiac signs track the position of the Sun relative to Earth's seasonal equinoxes using the tropical system.
              </p>

              <h3>Which Rashi is lucky?</h3>
              <p>
                No single Rashi is inherently luckier than another in traditional Indian astrology. Every individual sign carries its own distinct set of psychological strengths, structural challenges, elements, and planetary governors. True harmony depends on how an individual utilizes their natural mental inclinations in daily life choices.
              </p>

              <h3>How accurate is a Rashi calculator?</h3>
              <p>
                An online Rashi calculator is highly accurate provided it utilizes a verified digital ephemeris engine and the user inputs exact birth data. The mathematical calculations match observable astronomical realities, though accuracy can be compromised if the birth time or timezone offset is guessed incorrectly.
              </p>

              <h3>Can my Rashi change?</h3>
              <p>
                Your birth Rashi is a fixed astronomical fact that never changes throughout your entire life. It represents a permanent snapshot of the eastern sky at the exact moment you were born. It remains your permanent cosmic signature for all traditional naming practices and lifecycle celebrations.
              </p>

              <h3>What is Janma Rashi?</h3>
              <p>
                Janma Rashi is the formal Sanskrit term for your birth Moon sign. Janma translates directly to birth, and Rashi means sign or stellar cluster. Therefore, it specifically defines the exact constellation house where the Moon was traveling when an individual was born into the physical world.
              </p>

              <h3>Does birth place matter?</h3>
              <p>
                Yes, your birth place matters because it establishes the precise geographic longitude and latitude needed to convert standard clock time into true astronomical time. Without a specific location, the software engine cannot calculate the exact timezone offset required to read planetary tables accurately.
              </p>

              <h3>Why is Moon sign important?</h3>
              <p>
                The Moon sign is considered the most important factor in traditional Indian astrology because it rules over the human mind, memory, reactions, and emotions. Since your internal mental state dictates how you perceive reality and make choices, the Moon is treated as the key to your psychology.
              </p>

              <h3>Can two people have the same Rashi?</h3>
              <p>
                Yes, two people can easily share the same Rashi if they were born within the same two and a quarter day window. Because the Moon moves relatively slowly through each 30-degree sector, everyone born globally during that specific transit block will share the same baseline lunar placement.
              </p>

              <h3>Which Rashi is best?</h3>
              <p>
                There is no best Rashi within the mathematical framework of Vedic science. Each sign represents a necessary component of the universal zodiacal wheel. Every placement possesses unique virtues and structural flaws, making all twelve signs equally valuable components of human psychological diversity.
              </p>

              <h3>What is the difference between Lagna and Rashi?</h3>
              <p>
                Lagna refers to the ascending sign rising on the eastern horizon at your exact minute of birth, representing your outer body and physical reality. Rashi refers specifically to the position of the Moon, representing your inner mind, emotional processing system, and psychological framework.
              </p>

              <h3>Is this calculator free?</h3>
              <p>
                Yes, the Rashi Calculator by Date of Birth provided on Veadicastro is a completely free online utility. Users can access the platform at any time, input their personal birth data safely, and view their calculated sidereal Moon sign results instantly without any financial obligations.
              </p>

              <h3>Can I calculate Rashi online?</h3>
              <p>
                Yes, you can easily calculate your Rashi online by using digitized web utilities that have integrated traditional astronomical ephemeris databases. These tools automate the complex manual calculations previously performed by mathematicians using manual printed almanacs called Panchangs.
              </p>

              <h3>What are the twelve Rashis?</h3>
              <p>
                The twelve traditional Rashis in sequential order are Mesha, Vrishabha, Mithuna, Karka, Simha, Kanya, Tula, Vrishchika, Dhanu, Makara, Kumbha, and Meena. They correspond directly to Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces respectively.
              </p>

              <h3>How is Rashi calculated in Vedic astrology?</h3>
              <p>
                In Vedic astrology, Rashi is calculated by determining the absolute celestial longitude of the Moon at birth, subtracting the specific precession correction value known as Ayanamsha, and identifying which 30-degree sector of the fixed sidereal zodiac matches those remaining mathematical degrees.
              </p>

              <h3>Which planet rules my Rashi?</h3>
              <p>
                The planet ruling your Rashi depends on your specific moon placement: Mars rules Mesha and Vrishchika; Venus rules Vrishabha and Tula; Mercury rules Mithuna and Kanya; the Moon rules Karka; the Sun rules Simha; Jupiter rules Dhanu and Meena; and Saturn rules Makara and Kumbha.
              </p>

              <h3>What if I do not know my birth time?</h3>
              <p>
                If you do not know your exact birth time, you can try entering a default value of 12:00 PM noon. If the Moon did not cross a sign boundary line on that day, the calculated result will be correct. However, verification against family records is recommended for borderline days.
              </p>

              <h3>Is this based on Vedic astrology?</h3>
              <p>
                Yes, this calculation engine is built entirely on the foundational principles of traditional Indian Vedic astrology. It utilizes the fixed sidereal zodiac model and applies standard historical Ayanamsha corrections to deliver results that align with ancient classical texts and naming customs.
              </p>

              <h2>Conclusion</h2>
              <p>
                Identifying your correct Janma Rashi is an essential step for anyone seeking to engage with traditional Indian cosmic frameworks. By shifting the focus from the solar calendar to the real-time movement of the Moon, the sidereal system provides a clear look at your inner personality and mental tendencies. Using an advanced digital tool ensures that your calculations remain grounded in real, observable astronomical math.
              </p>
              <p>
                Ready to discover your true Vedic Moon sign without guessing? Head over to the custom utility fields on Veadicastro right now, input your verified birth statistics into our secure engine, and calculate your official Rashi instantly. Continue your journey by exploring the <a href="/blog/vedika-ai-astrologer-india" className="text-pink-400 underline hover:text-pink-300">Vedika AI Astrologer</a>, reading about <a href="/blog/the-great-astrology-scam" className="text-pink-400 underline hover:text-pink-300">The Great Astrology Scam</a>, or checking <a href="/blog/manglik-dosha-myths-vs-reality" className="text-pink-400 underline hover:text-pink-300">Manglik Dosha Myths vs Reality</a>. For daily guidance, don't miss our <a href="/blog/free-ai-astrology-chat-india" className="text-pink-400 underline hover:text-pink-300">Free AI Astrology Chat India</a> service and the <a href="/free-5-minutes-astrology-ai" className="text-pink-400 underline hover:text-pink-300">Free 5 Minutes Astrology AI</a> quick reading tool.
              </p>
            </article>
          </div>
        </div>
      </div>
    </>
  );
};

export default RashiCalculatorByDateOfBirth;
