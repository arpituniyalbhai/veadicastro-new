import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Calendar, MapPin, Clock, User, Loader2, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlanetaryData } from "@/lib/astroCalc";

interface BirthDetails {
  name: string;
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

const AstrologyByDateOfBirth = () => {
  const navigate = useNavigate();
  
  // Form state
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    dob: "",
    time: "",
    place: ""
  });
  
  // Location search state
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const placeBoxRef = useRef<HTMLDivElement>(null);
  
  // Screen state
  const [showQuestionScreen, setShowQuestionScreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [planetaryData, setPlanetaryData] = useState<any>(null);
  
  // Spam prevention - check if user already asked
  const [hasAsked, setHasAsked] = useState(false);

  useEffect(() => {
    const hasAskedBefore = localStorage.getItem("astrology_by_dob_asked");
    if (hasAskedBefore === "true") {
      setHasAsked(true);
    }
  }, []);

  // OpenCage API for location search
  const searchLocation = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const key = "91ab8792290d414b92590c9d4cc0793c"; // OpenCage API key
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
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectLocation = (place: LocationSuggestion) => {
    setBirthDetails(prev => ({
      ...prev,
      place: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon)
    }));
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!placeBoxRef.current) return;
      if (!placeBoxRef.current.contains(e.target as Node)) setShowLocationSuggestions(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleContinue = async () => {
    if (!birthDetails.name || !birthDetails.dob || !birthDetails.time || !birthDetails.place || !birthDetails.lat || !birthDetails.lng) {
      alert("Please fill in all required fields");
      return;
    }

    if (hasAsked) {
      alert("You have already used this feature. Each user can ask only one question.");
      return;
    }

    setIsGenerating(true);
    try {
      // Calculate planetary positions using Swiss ephemeris
      const [y, m, d] = birthDetails.dob.split('-').map((n: string) => parseInt(n, 10));
      const [hh, mm] = birthDetails.time.split(':').map((n: string) => parseInt(n, 10));
      const tzone = birthDetails.tzone || (-new Date().getTimezoneOffset() / 60);
      
      const astroData = await getPlanetaryData({
        day: d,
        month: m,
        year: y,
        hour: hh,
        min: mm,
        lat: birthDetails.lat,
        lon: birthDetails.lng,
        tzone: tzone,
      });
      
      setPlanetaryData(astroData);
      setShowQuestionScreen(true);
    } catch (error) {
      console.error("Error calculating planetary positions:", error);
      alert("Failed to calculate planetary positions. Please check your details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrediction = async () => {
    if (!userQuestion.trim()) {
      alert("Please enter your question");
      return;
    }

    setIsGenerating(true);
    try {
      // Build prompt with planetary data
      const prompt = `Generate a 200-400 word personalized Vedic astrology prediction based on the user's question.

User Question: ${userQuestion}
Name: ${birthDetails.name}

Planetary Data:
Lagna: ${planetaryData.lagnaSign}
Sun Sign: ${planetaryData.sunSign}
Moon Sign: ${planetaryData.moonSign}
Nakshatra: ${planetaryData.nakshatra?.name}
Mahadasha: ${planetaryData.dasha?.mahadasha}
Antardasha: ${planetaryData.dasha?.antardasha}

Instructions:
1. Address the user by their name
2. Provide a detailed answer to their specific question
3. Use the planetary data to give personalized insights
4. Mix 2-3 Hindi words naturally (shubh, karma, dasha, grah)
5. End with a powerful personal message
6. NO disclaimers, NO "as an AI"
7. Keep it between 200-400 words
8. Make it practical and actionable`;

      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          systemExtra: JSON.stringify(planetaryData),
          userName: birthDetails.name,
          stream: false,
          lang: "en",
          apiKeySlot: "secondary",
          model: "ministral-8b-latest"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const predictionText = data.text || data.response;
      
      setPrediction(predictionText);
      
      // Mark user as having asked
      localStorage.setItem("astrology_by_dob_asked", "true");
      setHasAsked(true);
    } catch (error) {
      console.error("Error generating prediction:", error);
      alert("Error generating prediction. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setUserQuestion("");
    setShowQuestionScreen(false);
    setBirthDetails({
      name: "",
      dob: "",
      time: "",
      place: ""
    });
  };

  return (
    <>
      <Helmet>
        <title>Free Astrology by Date of Birth – AI 2026 Vedic Predictions</title>
        <meta name="description" content="Free astrology by date of birth – get your personalized 2026 Vedic predictions based on your exact birth details. AI-powered birth chart analysis with answers for love, career, wealth & more." />
        <meta name="keywords" content="astrology by date of birth, free vedic astrology, AI astrology reading, birth chart analysis, personalized horoscope, vedic predictions, 2026 astrology predictions, janam kundali" />
        <link rel="canonical" href="https://veadicastro.in/astrology-by-date-of-birth" />
        <meta property="og:title" content="Free Astrology by Date of Birth – AI 2026 Vedic Predictions" />
        <meta property="og:description" content="Free astrology by date of birth – get your personalized 2026 Vedic predictions based on your exact birth details. AI-powered birth chart analysis with answers for love, career, wealth & more." />
        <meta property="og:url" content="https://veadicastro.in/astrology-by-date-of-birth" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How accurate is astrology by date of birth?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It is highly accurate when you provide the correct date, time, and location. The planetary calculations follow exact astronomical mathematical models."
                }
              },
              {
                "@type": "Question",
                "name": "Can I get a reading if I only know my birth date and not the time?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can get a general reading based on your sun sign or moon sign, but adding the exact time makes the predictions far more personalized and accurate."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between Vedic astrology and Western astrology?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Vedic astrology uses the sidereal zodiac, which looks at the actual current positions of constellations, while Western astrology uses the tropical fixed zodiac."
                }
              },
              {
                "@type": "Question",
                "name": "How does Veadicastro protect my personal data?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We value your privacy highly. Your birth details and personal questions are encrypted and never shared with any third party vendors."
                }
              },
              {
                "@type": "Question",
                "name": "Can astrology predict the exact day I will get a job?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Astrology shows the peak periods of opportunity and high probability. It tells you when the doors will open, but your action and effort are still required to walk through them."
                }
              },
              {
                "@type": "Question",
                "name": "What is a Dasha in my astrology report?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A Dasha is a planetary time period system unique to Vedic astrology. It shows which planet is actively controlling the major events of your life during a specific timeframe."
                }
              },
              {
                "@type": "Question",
                "name": "Are the remedies suggested in the report expensive?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, Veadicastro focuses on simple, practical remedies like wearing certain colors, helping the needy, or listening to specific sounds to balance your energies."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I check my birth chart report?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Checking your major report once a year or whenever you face a major life decision, career change, or relationship shift is ideal."
                }
              },
              {
                "@type": "Question",
                "name": "Why does my location of birth matter so much?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Different parts of the world see the sky from different angles at the same moment. Your birth location helps calculate the exact horizon line or rising sign."
                }
              },
              {
                "@type": "Question",
                "name": "Can astrology by date of birth help me choose a business partner?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, by comparing the birth charts of both individuals, astrology can determine if your financial and professional energies match well."
                }
              },
              {
                "@type": "Question",
                "name": "What does my Nakshatra mean?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your Nakshatra is the specific lunar mansion the moon was passing through when you were born. It defines your core instincts and emotional personality."
                }
              },
              {
                "@type": "Question",
                "name": "Can a bad birth chart prediction be changed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Astrology is a guide, not a fixed fate. It alerts you to upcoming challenges so you can change your choices, behavior, and attitude to create a better outcome."
                }
              },
              {
                "@type": "Question",
                "name": "Does Veadicastro work for people living outside India?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our platform works globally. The system automatically adjusts for time zones and coordinates across the Americas, Europe, Asia, and Australia."
                }
              },
              {
                "@type": "Question",
                "name": "What is the seventh house in astrology?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The seventh house is the main area of your birth chart that governs marriage, serious romantic commitments, and long term business partnerships."
                }
              },
              {
                "@type": "Question",
                "name": "How does the AI ensure the readings feel authentic?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our AI does not generate random text. It calculates true planetary data through astronomical formulas and translates the traditional rules of Vedic astrology into easy English."
                }
              },
              {
                "@type": "Question",
                "name": "Can astrology help me understand my health risks?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, certain houses like the sixth house indicate physical vulnerabilities. Your report helps you understand when to prioritize rest and healthy habits."
                }
              },
              {
                "@type": "Question",
                "name": "What should I do if my lucky color changes in different reports?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your life has different planetary periods. A color might be lucky for your overall life, while another color might be best for a specific year during a specific planet rule."
                }
              },
              {
                "@type": "Question",
                "name": "Can I ask questions about my family members using my chart?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your chart can give general insights about your parents or children, but for detailed answers about their lives, it is best to use their specific birth dates."
                }
              },
              {
                "@type": "Question",
                "name": "Is Sade Sati included in the report?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, the report tracks the position of Saturn relative to your moon sign to let you know if you are going through the Sade Sati period and how to manage it."
                }
              },
              {
                "@type": "Question",
                "name": "What makes a planet weak or strong in my chart?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A planet strength depends on the zodiac sign it sits in, the house it occupies, and its distance in degrees from other friendly or enemy planets."
                }
              },
              {
                "@type": "Question",
                "name": "How fast will I get my report after entering my details?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Because our platform uses advanced AI and the Swiss Ephemeris calculation engine, your personalized report is generated almost instantly."
                }
              },
              {
                "@type": "Question",
                "name": "Can astrology tell me if I will settle in a foreign country permanently?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, specific combinations involving the fourth, ninth, and twelfth houses indicate whether travel will be temporary or result in permanent foreign residency."
                }
              },
              {
                "@type": "Question",
                "name": "Why is the rising sign or ascendant so important?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The rising sign defines your outer personality, physical body, and how you view the world. It sets the structure for all the other twelve houses in your chart."
                }
              },
              {
                "@type": "Question",
                "name": "Can young students benefit from astrology by date of birth?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely, it helps young students understand their natural learning styles and memory strengths so they do not waste time struggling in fields that mismatch their nature."
                }
              },
              {
                "@type": "Question",
                "name": "What if I do not believe in astrology?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can still use Veadicastro as a self reflection tool. Many people use it simply to gain a new perspective on their habits, strengths, and life goals."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden">
        {/* ambient glow blobs */}
        <div className="pointer-events-none fixed top-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full bg-pink-600/5 blur-[80px]" />
        <div className="pointer-events-none fixed bottom-[-200px] left-[-200px] w-[350px] h-[350px] rounded-full bg-purple-800/5 blur-[80px]" />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
              <img src="/optimized/logo.webp" alt="Veadicastro Vedic astrology AI platform logo" className="w-9 h-9 rounded-full" loading="eager" />
              <span className="text-lg font-bold tracking-wide">Veadicastro</span>
            </button>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/free-ai-astrologer-chat")} className="text-sm text-white px-4 py-2 rounded-full font-medium transition-all" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>
                Try AI Astrologer
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-14 text-center px-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
            🔮 Free AI Vedic Astrology Reading
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-none mb-4">
            Free Astrology by Date of Birth
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mt-4">
            Get your personalized 2026 Vedic predictions based on your exact birth details — free. Enter your birth date, time & place, ask any question, and receive AI-powered insights for love, career, wealth & more.
          </p>
        </section>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          {!showQuestionScreen && !prediction && (
            /* Birth Details Form */
            <Card className="bg-card/40 backdrop-blur border border-white/10 rounded-3xl p-8">
              <h2 className="font-bold text-2xl text-center mb-8">
                Enter Your Birth Details
              </h2>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <Label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-pink-400" /> Name *
                  </Label>
                  <Input 
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11"
                    placeholder="Enter your full name"
                    value={birthDetails.name}
                    onChange={e => setBirthDetails(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Date of Birth */}
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

                {/* Time of Birth */}
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

                {/* Birth Place */}
                <div className="relative" ref={placeBoxRef}>
                  <Label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-pink-400" /> Place of Birth *
                  </Label>
                  <div className="relative">
                    <Input 
                      className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11 pl-10"
                      placeholder="Search your birth city…"
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

                {/* Continue Button */}
                <Button
                  onClick={handleContinue}
                  disabled={!birthDetails.name || !birthDetails.dob || !birthDetails.time || !birthDetails.place || !birthDetails.lat || !birthDetails.lng || isGenerating}
                  className="w-full h-12 rounded-full text-white font-semibold transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calculating Planetary Positions...
                    </>
                  ) : (
                    "Continue to Ask Question"
                  )}
                </Button>

                {hasAsked && (
                  <p className="text-center text-sm text-yellow-400 mt-4">
                    ⚠️ You have already used this feature. Each user can ask only one question.
                  </p>
                )}
              </div>
            </Card>
          )}

          {showQuestionScreen && !prediction && (
            /* Question Input Screen */
            <Card className="bg-card/40 backdrop-blur border border-white/10 rounded-3xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">
                  Ask Your Question
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
                <p className="text-white/60 text-lg mt-4 max-w-md mx-auto">
                  Your birth chart has been calculated. Now ask any astrology question and get your personalized prediction.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-white/70 text-sm font-medium mb-2 block">
                    Your Question *
                  </Label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl p-4 min-h-[120px] resize-none"
                    placeholder="Ask anything about your life, career, love, health, or future..."
                    value={userQuestion}
                    onChange={e => setUserQuestion(e.target.value)}
                  />
                </div>

                <Button
                  onClick={generatePrediction}
                  disabled={!userQuestion.trim() || isGenerating}
                  className="w-full h-12 rounded-full text-white font-semibold transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Your Prediction...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Get My Prediction
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowQuestionScreen(false)}
                  variant="outline"
                  className="w-full h-12 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all text-sm"
                >
                  Back
                </Button>
              </div>
            </Card>
          )}

          {prediction && (
            /* Prediction Result Screen */
            <Card className="bg-card/40 backdrop-blur border border-white/10 rounded-3xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
                  <Send className="w-8 h-8 text-pink-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Your Personalized Prediction
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 mb-8">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {prediction}
                </p>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleReset}
                  className="h-12 rounded-full text-white font-semibold transition-all text-sm px-8"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}
                >
                  Start New Reading
                </Button>
              </div>
            </Card>
          )}

          {/* Article Section */}
          <div className="max-w-4xl mx-auto px-4 pb-16">
            <article className="text-white">
              {/* What Is Astrology by Date of Birth */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-white">What Is Astrology by Date of Birth?</h2>
                <div className="space-y-4 text-white/80 leading-relaxed">
                  <p>Astrology by date of birth is a ancient science that connects the positions of stars and planets at the exact moment you were born to your life journey. Many people think astrology is just about reading daily horoscopes in newspapers. However, true Vedic astrology is much deeper and highly personalized. When you look at your life through the lens of your birth details, you unlock a blueprint that is unique only to you.</p>
                  <p>Every person enters this world under a specific cosmic map. The positions of the sun, moon, and other planets at that exact second shape your personality, strengths, weaknesses, and future opportunities. By analyzing your birth date, an astrologer can see which planets favor you and which ones might bring challenges. It helps you understand why you behave the way you do and what path will bring you the most success.</p>
                  <p>At Veadicastro, we bring this ancient wisdom right to your screen. Whether you live in New York, London, Delhi, Sydney, or Toronto, the universe speaks the same language. Astrology by date of birth transcends geographical boundaries, offering accurate insights tailored to your exact coordinates on Earth. It acts as a cosmic roadmap, helping you navigate life with more confidence and clarity no matter where you are located.</p>
                </div>
              </section>

              {/* What Can You Ask */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-white">What Can You Ask?</h2>
                <p className="text-white/80 mb-6">Your birth details hold the answers to almost every major life question. Here are the areas where astrology by date of birth can give you deep clarity:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Love</h3>
                    <p className="text-white/70 text-sm">Are you wondering when you will meet your soulmate? Or why your current relationship feels distant? Astrology looks at your seventh house and Venus to predict your love life, compatibility, and relationship harmony.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Career</h3>
                    <p className="text-white/70 text-sm">Choosing the right career path can be tough. By analyzing your tenth house, we can tell you whether a corporate job, a creative field, or an independent path will bring you the highest growth and satisfaction.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Marriage</h3>
                    <p className="text-white/70 text-sm">Marriage is a big milestone. Discover when you are likely to get married, what your future partner will be like, and how to resolve delayed marriage issues or compatibility problems.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Finance</h3>
                    <p className="text-white/70 text-sm">Money worries can keep you up at night. Learn about your wealth potential, the best times to invest, and periods where you should save money to avoid financial losses.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Health</h3>
                    <p className="text-white/70 text-sm">Your birth chart can highlight potential physical vulnerabilities. Find out which times require extra care for your physical well-being and how to maintain high energy levels throughout the year.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Education</h3>
                    <p className="text-white/70 text-sm">Students can get guidance on the best fields of study. Find out if you will excel in science, arts, commerce, or technical fields based on the planetary positions in your educational houses.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Children</h3>
                    <p className="text-white/70 text-sm">Family planning is an important phase of life. Get insights into the planetary promises regarding children, the timing of expanding your family, and your relationship with your future kids.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Foreign Travel</h3>
                    <p className="text-white/70 text-sm">Do you dream of moving abroad or studying in another country? Your chart shows if you have strong planetary combinations for foreign travel, permanent residency, or international business success.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="font-semibold text-pink-400 mb-2">Business</h3>
                    <p className="text-white/70 text-sm">Starting a business involves risks. Discover if you have the entrepreneur mindset in your chart, what industries will bring you profit, and the most auspicious dates to launch your venture.</p>
                  </div>
                </div>
              </section>

              {/* How Our AI Generates Your Astrology Report */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-white">How Our AI Generates Your Astrology Report</h2>
                <p className="text-white/80 mb-6">We blend ancient Vedic wisdom with modern technology to give you fast, accurate, and deeply personalized insights. Here is the step by step process of how Veadicastro creates your report:</p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-pink-400 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Birth Chart</h3>
                      <p className="text-white/70 text-sm">The process starts when you enter your birth date, exact time, and birth place. This raw data is essential to calculate the precise state of the sky at your moment of birth.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-pink-400 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Swiss Ephemeris</h3>
                      <p className="text-white/70 text-sm">We feed your details into the Swiss Ephemeris, which is the gold standard calculation engine used by professional astronomers and astrologers worldwide. This ensures zero errors in tracking planetary movements.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-pink-400 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Planet Positions</h3>
                      <p className="text-white/70 text-sm">The system calculates the exact degrees, houses, signs, and constellations for all major celestial bodies based on your specific global location.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-pink-400 font-semibold text-sm">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">AI Analysis</h3>
                      <p className="text-white/70 text-sm">Finally, our advanced AI trained on thousands of authentic Vedic texts analyzes these planetary positions. It processes the complex data instantly to deliver an easy to read, deeply accurate report just for you.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* What Is Included in Your Astrology Report */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-white">What Is Included in Your Astrology Report?</h2>
                <p className="text-white/80 mb-6">When you use Veadicastro, you do not just get a generic summary. You get a comprehensive breakdown of your cosmic identity. Your report includes:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm"><strong className="text-white">Personalized Answer:</strong> A direct and clear answer to the specific question you asked about your life.</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm"><strong className="text-white">Birth Chart Analysis:</strong> A detailed look at your main birth chart, known as the Lagna chart, showing which planets rule your life.</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm"><strong className="text-white">Planetary Influence:</strong> An explanation of how current transits and planetary strengths are affecting your mindset and environment.</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm"><strong className="text-white">Dasha:</strong> A breakdown of your planetary time periods, telling you which planet is leading your life right now and for how long.</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm"><strong className="text-white">Nakshatra:</strong> Insights into your birth star, which reveals your deepest emotional nature, behavioral traits, and hidden talents.</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm"><strong className="text-white">Lucky Number:</strong> The specific numbers that carry positive vibrations for you, useful for choosing dates, tokens, or important choices.</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm"><strong className="text-white">Lucky Color:</strong> The colors that align with your dominant beneficial planets to help boost your confidence and daily luck.</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-sm"><strong className="text-white">Remedies:</strong> Simple, practical everyday solutions like chanting, specific charity acts, or color therapy to reduce the negative impact of challenging planets.</span>
                  </div>
                </div>
              </section>

              {/* Why Birth Time Matters */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-white">Why Birth Time Matters</h2>
                <div className="space-y-4 text-white/80 leading-relaxed">
                  <p>Many people ask if they can get an accurate astrology report using only their birth date. While the date gives a general overview, the exact time of birth is the secret ingredient for true accuracy.</p>
                  <p>The earth rotates constantly, which means the rising sign or ascendant changes roughly every two hours. Even a difference of four minutes can shift the degree of your chart houses or alter your moon chart calculations. If you do not know your exact time, your chart might place a planet in the house of career instead of the house of loss, leading to incorrect predictions. Knowing your precise birth time, along with the location, allows us to pinpoint your exact planetary blueprint and offer solutions that truly work for your specific life situations.</p>
                </div>
              </section>

              {/* Frequently Asked Questions */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-white">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">How accurate is astrology by date of birth?</h3>
                      <p className="text-white/70 text-sm">It is highly accurate when you provide the correct date, time, and location. The planetary calculations follow exact astronomical mathematical models.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Can I get a reading if I only know my birth date and not the time?</h3>
                      <p className="text-white/70 text-sm">Yes, you can get a general reading based on your sun sign or moon sign, but adding the exact time makes the predictions far more personalized and accurate.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">What is the difference between Vedic astrology and Western astrology?</h3>
                      <p className="text-white/70 text-sm">Vedic astrology uses the sidereal zodiac, which looks at the actual current positions of constellations, while Western astrology uses the tropical fixed zodiac.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">How does Veadicastro protect my personal data?</h3>
                      <p className="text-white/70 text-sm">We value your privacy highly. Your birth details and personal questions are encrypted and never shared with any third party vendors.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Can astrology predict the exact day I will get a job?</h3>
                      <p className="text-white/70 text-sm">Astrology shows the peak periods of opportunity and high probability. It tells you when the doors will open, but your action and effort are still required to walk through them.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">What is a Dasha in my astrology report?</h3>
                      <p className="text-white/70 text-sm">A Dasha is a planetary time period system unique to Vedic astrology. It shows which planet is actively controlling the major events of your life during a specific timeframe.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Are the remedies suggested in the report expensive?</h3>
                      <p className="text-white/70 text-sm">No, Veadicastro focuses on simple, practical remedies like wearing certain colors, helping the needy, or listening to specific sounds to balance your energies.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">How often should I check my birth chart report?</h3>
                      <p className="text-white/70 text-sm">Checking your major report once a year or whenever you face a major life decision, career change, or relationship shift is ideal.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Why does my location of birth matter so much?</h3>
                      <p className="text-white/70 text-sm">Different parts of the world see the sky from different angles at the same moment. Your birth location helps calculate the exact horizon line or rising sign.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Can astrology by date of birth help me choose a business partner?</h3>
                      <p className="text-white/70 text-sm">Yes, by comparing the birth charts of both individuals, astrology can determine if your financial and professional energies match well.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">What does my Nakshatra mean?</h3>
                      <p className="text-white/70 text-sm">Your Nakshatra is the specific lunar mansion the moon was passing through when you were born. It defines your core instincts and emotional personality.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Can a bad birth chart prediction be changed?</h3>
                      <p className="text-white/70 text-sm">Astrology is a guide, not a fixed fate. It alerts you to upcoming challenges so you can change your choices, behavior, and attitude to create a better outcome.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Does Veadicastro work for people living outside India?</h3>
                      <p className="text-white/70 text-sm">Yes, our platform works globally. The system automatically adjusts for time zones and coordinates across the Americas, Europe, Asia, and Australia.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">What is the seventh house in astrology?</h3>
                      <p className="text-white/70 text-sm">The seventh house is the main area of your birth chart that governs marriage, serious romantic commitments, and long term business partnerships.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">How does the AI ensure the readings feel authentic?</h3>
                      <p className="text-white/70 text-sm">Our AI does not generate random text. It calculates true planetary data through astronomical formulas and translates the traditional rules of Vedic astrology into easy English.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Can astrology help me understand my health risks?</h3>
                      <p className="text-white/70 text-sm">Yes, certain houses like the sixth house indicate physical vulnerabilities. Your report helps you understand when to prioritize rest and healthy habits.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">What should I do if my lucky color changes in different reports?</h3>
                      <p className="text-white/70 text-sm">Your life has different planetary periods. A color might be lucky for your overall life, while another color might be best for a specific year during a specific planet rule.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Can I ask questions about my family members using my chart?</h3>
                      <p className="text-white/70 text-sm">Your chart can give general insights about your parents or children, but for detailed answers about their lives, it is best to use their specific birth dates.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Is Sade Sati included in the report?</h3>
                      <p className="text-white/70 text-sm">Yes, the report tracks the position of Saturn relative to your moon sign to let you know if you are going through the Sade Sati period and how to manage it.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">What makes a planet weak or strong in my chart?</h3>
                      <p className="text-white/70 text-sm">A planet strength depends on the zodiac sign it sits in, the house it occupies, and its distance in degrees from other friendly or enemy planets.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">How fast will I get my report after entering my details?</h3>
                      <p className="text-white/70 text-sm">Because our platform uses advanced AI and the Swiss Ephemeris calculation engine, your personalized report is generated almost instantly.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Can astrology tell me if I will settle in a foreign country permanently?</h3>
                      <p className="text-white/70 text-sm">Yes, specific combinations involving the fourth, ninth, and twelfth houses indicate whether travel will be temporary or result in permanent foreign residency.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Why is the rising sign or ascendant so important?</h3>
                      <p className="text-white/70 text-sm">The rising sign defines your outer personality, physical body, and how you view the world. It sets the structure for all the other twelve houses in your chart.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">Can young students benefit from astrology by date of birth?</h3>
                      <p className="text-white/70 text-sm">Absolutely, it helps young students understand their natural learning styles and memory strengths so they do not waste time struggling in fields that mismatch their nature.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2">What if I do not believe in astrology?</h3>
                      <p className="text-white/70 text-sm">You can still use Veadicastro as a self reflection tool. Many people use it simply to gain a new perspective on their habits, strengths, and life goals.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contextual Links Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-white">Explore More</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <a href="/ai-astrology-prediction" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">AI Astrology Prediction</h3>
                    <p className="text-white/60 text-xs">Get accurate AI-powered predictions</p>
                  </a>
                  <a href="/horoscope-by-date-of-birth" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Horoscope by Date of Birth</h3>
                    <p className="text-white/60 text-xs">Personalized daily horoscope</p>
                  </a>
                  <a href="/free-ai-astrologer-chat" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Free AI Astrologer Chat</h3>
                    <p className="text-white/60 text-xs">Chat with AI astrologer</p>
                  </a>
                  <a href="/free-5-minutes-astrology-ai" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">5 Minutes Astrology</h3>
                    <p className="text-white/60 text-xs">Quick astrology reading</p>
                  </a>
                  <a href="/ai-career-prediction-by-date-of-birth" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Career Prediction</h3>
                    <p className="text-white/60 text-xs">Career guidance by birth date</p>
                  </a>
                  <a href="/ai-marriage-prediction-by-date-of-birth" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Marriage Prediction</h3>
                    <p className="text-white/60 text-xs">Marriage timing analysis</p>
                  </a>
                  <a href="/love-astrology-by-date-of-birth" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Love Astrology</h3>
                    <p className="text-white/60 text-xs">Relationship insights</p>
                  </a>
                  <a href="/ai-future-spouse-prediction" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Future Spouse Prediction</h3>
                    <p className="text-white/60 text-xs">Know your future partner</p>
                  </a>
                  <a href="/free-kundli-generator" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Free Kundli Generator</h3>
                    <p className="text-white/60 text-xs">Generate your birth chart</p>
                  </a>
                  <a href="/free-kundali-matching" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Kundli Matching</h3>
                    <p className="text-white/60 text-xs">Compatibility check</p>
                  </a>
                  <a href="/today-horoscope" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Today Horoscope</h3>
                    <p className="text-white/60 text-xs">Daily zodiac predictions</p>
                  </a>
                  <a href="/angel-number-calculator" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Angel Number Calculator</h3>
                    <p className="text-white/60 text-xs">Decode angel numbers</p>
                  </a>
                  <a href="/lucky-colour-for-today" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Lucky Colour Today</h3>
                    <p className="text-white/60 text-xs">Your lucky color</p>
                  </a>
                  <a href="/ai-kundli-analysis" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">AI Kundli Analysis</h3>
                    <p className="text-white/60 text-xs">Deep birth chart analysis</p>
                  </a>
                  <a href="/ai-pandit" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">AI Pandit</h3>
                    <p className="text-white/60 text-xs">AI-powered priest guidance</p>
                  </a>
                  <a href="/talk-to-astrologer" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Talk to Astrologer</h3>
                    <p className="text-white/60 text-xs">Consult with experts</p>
                  </a>
                  <a href="/about" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">About Us</h3>
                    <p className="text-white/60 text-xs">Learn about Veadicastro</p>
                  </a>
                  <a href="/about-founder" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">About Founder</h3>
                    <p className="text-white/60 text-xs">Meet the founder</p>
                  </a>
                  <a href="/mission" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Our Mission</h3>
                    <p className="text-white/60 text-xs">Our vision and goals</p>
                  </a>
                  <a href="/how-it-works" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">How It Works</h3>
                    <p className="text-white/60 text-xs">Understand our process</p>
                  </a>
                  <a href="/contact" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Contact Us</h3>
                    <p className="text-white/60 text-xs">Get in touch</p>
                  </a>
                  <a href="/blog" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Blog</h3>
                    <p className="text-white/60 text-xs">Astrology articles</p>
                  </a>
                  <a href="/ai-astrology" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">AI Astrology</h3>
                    <p className="text-white/60 text-xs">AI-powered astrology</p>
                  </a>
                  <a href="/" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-semibold text-pink-400 mb-1">Home</h3>
                    <p className="text-white/60 text-xs">Back to homepage</p>
                  </a>
                </div>
              </section>
            </article>
          </div>
        </div>
      </div>
    </>
  );
};

export default AstrologyByDateOfBirth;
