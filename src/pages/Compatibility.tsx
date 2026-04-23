import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Users, Briefcase, Star, Home, Calendar, MapPin, Clock, Search, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getPlanetaryData } from "@/lib/astroCalc";
import { generateGemini } from "@/lib/gemini";
import { usePlan } from "@/context/PlanContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type MatchType = "marriage" | "love" | "siblings" | "parent" | "business";

interface MatchOption {
  id: MatchType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface PersonData {
  name: string;
  dob: string;
  time: string;
  place: string;
  lat?: number;
  lng?: number;
  tzone?: number;
}

interface PlaceSuggestion {
  label: string;
  lat: number;
  lng: number;
  tzone?: number;
}

const Compatibility = () => {
  const navigate = useNavigate();
  const { compatibilityCredits, deductCompatibilityCredit } = usePlan();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [secondPerson, setSecondPerson] = useState<PersonData>({
    name: "",
    dob: "",
    time: "",
    place: ""
  });
  const [selectedMatchType, setSelectedMatchType] = useState<MatchType | null>(null);
  const [loading, setLoading] = useState(false);

  // State for place search
  const [placeQuery, setPlaceQuery] = useState(secondPerson.place);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const placeBoxRef = useRef<HTMLDivElement>(null);

  // Get user data from localStorage
  const getUserData = (): PersonData => {
    try {
      const userData = JSON.parse(localStorage.getItem("onboarding_details") || "{}");
      return {
        name: "You",
        dob: userData.dob || "",
        time: userData.time || "",
        place: userData.place || "",
        lat: userData.lat,
        lng: userData.lng,
        tzone: userData.tzone
      };
    } catch {
      return {
        name: "You",
        dob: "",
        time: "",
        place: ""
      };
    }
  };

  const userData = getUserData();

  const matchOptions: MatchOption[] = [
    {
      id: "marriage",
      label: "Marriage (Kundali Matching)",
      icon: <Heart className="w-6 h-6" />,
      description: "Check marriage compatibility and long-term partnership potential , just do kudnali milan and tell user how many gun is matching from 36",
      color: "bg-pink-500/20 border-pink-500/50 text-pink-300"
    },
    {
      id: "love",
      label: "Love / Crush",
      icon: <Star className="w-6 h-6" />,
      description: "Explore romantic compatibility and relationship harmony",
      color: "bg-purple-500/20 border-purple-500/50 text-purple-300"
    },
    {
      id: "siblings",
      label: "Brother / Sister",
      icon: <Home className="w-6 h-6" />,
      description: "Understand sibling relationships and family dynamics",
      color: "bg-secondary/20 border-secondary/50 text-secondary-foreground"
    },
    {
      id: "parent",
      label: "Parent / Child",
      icon: <Home className="w-6 h-6" />,
      description: "Analyze parent-child compatibility and relationship dynamics",
      color: "bg-green-500/20 border-green-500/50 text-green-300"
    },
    {
      id: "business",
      label: "Business",
      icon: <Briefcase className="w-6 h-6" />,
      description: "Evaluate professional partnership and business compatibility",
      color: "bg-orange-500/20 border-orange-500/50 text-orange-300"
    }
  ];

  // Debounced OpenCage autocomplete
  useEffect(() => {
    const controller = new AbortController();
    const q = placeQuery.trim();
    if (q.length < 2) {
      setPlaceSuggestions([]);
      setPlaceOpen(false);
      return;
    }
    setPlaceLoading(true);
    const id = setTimeout(async () => {
      try {
        const key = "e6856ce2163d420dbae7d5adb0a104ec"; // OpenCage API key
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(q)}&key=${key}&limit=6&no_annotations=0`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        const items = (data?.results || []).map((r: any) => ({
          label: r.formatted as string,
          lat: r.geometry?.lat as number,
          lng: r.geometry?.lng as number,
          tzone: typeof r?.annotations?.timezone?.offset_sec === 'number' ? r.annotations.timezone.offset_sec/3600 : undefined,
        }));
        setPlaceSuggestions(items);
        setPlaceOpen(true);
      } catch (_) {
        // ignore
      } finally {
        setPlaceLoading(false);
      }
    }, 350);
    return () => { clearTimeout(id); controller.abort(); };
  }, [placeQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!placeBoxRef.current) return;
      if (!placeBoxRef.current.contains(e.target as Node)) setPlaceOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handlePlaceSelect = (suggestion: PlaceSuggestion) => {
    setSecondPerson(prev => ({
      ...prev,
      place: suggestion.label,
      lat: suggestion.lat,
      lng: suggestion.lng,
      tzone: suggestion.tzone
    }));
    setPlaceQuery(suggestion.label);
    setSelectedPlace(suggestion);
    setPlaceOpen(false);
  };

  const calculateSecondPersonPlanets = async () => {
    if (!secondPerson.dob || !secondPerson.time || !secondPerson.lat || !secondPerson.lng) {
      return null;
    }

    try {
      const [y, m, d] = secondPerson.dob.split('-').map((n: string) => parseInt(n, 10));
      const [hh, mm] = secondPerson.time.split(':').map((n: string) => parseInt(n, 10));
      const tzone = secondPerson.tzone || (-new Date().getTimezoneOffset() / 60);
      
      const payload = await getPlanetaryData({
        day: d,
        month: m,
        year: y,
        hour: hh,
        min: mm,
        lat: secondPerson.lat,
        lon: secondPerson.lng,
        tzone: tzone,
      });
      
      return payload;
    } catch (error) {
      console.error("Error calculating second person planets:", error);
      return null;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && secondPerson.name && secondPerson.dob && secondPerson.time && secondPerson.place) {
      setLoading(true);
      try {
        // Calculate second person's planetary positions
        const planetsData = await calculateSecondPersonPlanets();
        
        if (!planetsData) {
          alert("Failed to calculate planetary positions. Please check your details.");
          setLoading(false);
          return;
        }

        // Store second person data with planetary data
        const completeData = {
          ...secondPerson,
          planets: planetsData
        };
        localStorage.setItem("compatibility_second_person", JSON.stringify(completeData));
        
        setCurrentStep(2);
      } catch (error) {
        console.error("Error in compatibility calculation:", error);
        alert("An error occurred while calculating compatibility. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProceed = async () => {
    if (selectedMatchType) {
      setLoading(true);
      try {
        // Check compatibility credits before proceeding
        if (compatibilityCredits <= 0) {
          setShowCreditModal(true);
          return;
        }

        // Deduct one compatibility credit
        const creditDeducted = await deductCompatibilityCredit();
        if (!creditDeducted) {
          alert("Unable to deduct compatibility credit. Please try again or contact support.");
          return;
        }

        // Get stored data
        const storedData = JSON.parse(localStorage.getItem("compatibility_second_person") || "{}");
        
        // Navigate to result page with all data
        navigate(`/compatibility/result?type=${selectedMatchType}`);
      } catch (error) {
        console.error("Error proceeding to results:", error);
        alert("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const isStep1Valid = secondPerson.name && secondPerson.dob && secondPerson.time && secondPerson.place;
  const isStep2Valid = selectedMatchType !== null;

  // Step 1: Enter all second person details
  if (currentStep === 1) {
    return (
      <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-10">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold">Compatibility Analysis</h1>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">{compatibilityCredits} Credits</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* User Card */}
            <Card className="p-6 bg-card/40 backdrop-blur border border-white/10 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-secondary/20 border border-border/60">
                  <img 
                    src="/optimized/reviews.webp" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                First Person (You)
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">{userData.dob || "Not set"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Time of Birth</div>
                    <div className="font-medium">{userData.time || "Not set"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Place of Birth</div>
                    <div className="font-medium">{userData.place || "Not set"}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Second Person Input */}
            <Card className="p-6 bg-card/40 backdrop-blur border border-white/10 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-secondary/20 border border-border/60">
                  <img 
                    src="/optimized/reviews.webp" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                Second Person
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={secondPerson.name}
                    onChange={(e) => setSecondPerson(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={secondPerson.dob}
                    onChange={(e) => setSecondPerson(prev => ({ ...prev, dob: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time of Birth *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={secondPerson.time}
                    onChange={(e) => setSecondPerson(prev => ({ ...prev, time: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="place">Place of Birth *</Label>
                  <div className="relative" ref={placeBoxRef}>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      id="place"
                      placeholder="City, Country"
                      className="pl-10 h-11 bg-background/50 border-border/60 text-sm w-full"
                      value={placeQuery}
                      onChange={(e) => {
                        setPlaceQuery(e.target.value);
                        setSelectedPlace(null);
                      }}
                      onFocus={() => placeSuggestions.length && setPlaceOpen(true)}
                    />
                    {placeOpen && (
                      <div className="absolute z-50 mt-1 left-0 right-0 rounded-xl border-2 border-white/20 bg-black/90 backdrop-blur-lg shadow-2xl max-h-60 sm:max-h-80 overflow-auto">
                        {placeLoading && (
                          <div className="px-4 py-3 text-sm text-white/60 flex items-center gap-2">
                            <Loader className="w-4 h-4 animate-spin" />
                            Searching places…
                          </div>
                        )}
                        {!placeLoading && placeSuggestions.length === 0 && (
                          <div className="px-4 py-3 text-sm text-white/50">
                            No places found. Try typing more characters.
                          </div>
                        )}
                        {placeSuggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handlePlaceSelect(s)}
                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 border-b border-white/5 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-white/50 flex-shrink-0" />
                              <span className="text-white/90">{s.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              variant="cosmic"
              size="lg"
              className="rounded-xl px-8 py-3 text-base font-semibold"
              onClick={handleNext}
              disabled={!isStep1Valid || loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Calculating Planetary Positions...
                </>
              ) : (
                "Next: Choose Relationship Type"
              )}
            </Button>
          </div>
          
          {/* Informational Section */}
          <div className="mt-12 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                🧐 What is Veadicastro Compatibility?
              </h3>
            </div>
            
            <div className="space-y-4 text-sm text-white/80">
              <p className="leading-relaxed">
                <span className="font-semibold text-purple-300">Veadicastro Compatibility</span> is an Advance AI Feature that analyzes unique energy bond between two people. Unlike traditional matching that only looks at marriage, this feature lets you add anyone—a partner, a crush, a cousin, or a business associate—to see exactly how your stars align with theirs.
              </p>
              
              <p className="leading-relaxed">
                It acts like a <span className="font-semibold text-purple-300">Digital Astrologer</span> that reads two birth charts at once to tell you "vibe" and "future" of your relationship.
              </p>
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  ⚙️ How It Works
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="font-bold text-purple-300">1.</span>
                    <p className="flex-1"><span className="font-semibold">Add Second Person</span> - Enter birth details (Date, Time, and Place) of person you want to check. Our AI needs this to calculate their exact planetary positions.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-purple-300">2.</span>
                    <p className="flex-1"><span className="font-semibold">Define Your Relationship</span> - Tell AI who this person is to you. Whether it's your Sibling, Love Interest, or Business Partner, AI changes its logic to give you most relevant advice for that specific bond.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-purple-300">3.</span>
                    <p className="flex-1"><span className="font-semibold">Advance AI Analysis</span> - Our system overlays both birth charts. It doesn't just look at signs; it looks at how your Venus (Love), Mars (Action), and Mercury (Communication) interact with theirs.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-purple-300">4.</span>
                    <p className="flex-1"><span className="font-semibold">Get Your Relationship Rating (1-10)</span> - Finally, AI explains "How you both are together" in detail and gives you a Rating out of 10. This score tells you at a glance if your connection is a "Soul Match" or if it needs more work!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Choose relationship type
  return (
    <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-10">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold">Choose Relationship Type</h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">{compatibilityCredits} Credits</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {matchOptions.map((option) => (
            <Card
              key={option.id}
              className={`p-4 bg-card/40 backdrop-blur border rounded-2xl cursor-pointer transition-all hover:border-white/30 ${
                selectedMatchType === option.id ? 'border-white/50 ring-2 ring-white/20' : 'border-white/10'
              }`}
              onClick={() => setSelectedMatchType(option.id)}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${option.color}`}>
                {option.icon}
              </div>
              <h3 className="font-semibold mb-2">{option.label}</h3>
              <p className="text-xs text-white/70 leading-relaxed">{option.description}</p>
              {selectedMatchType === option.id && (
                <div className="mt-3 flex justify-center">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            variant="cosmic"
            size="lg"
            className="rounded-xl px-8 py-3 text-base font-semibold"
            onClick={handleProceed}
            disabled={!isStep2Valid || loading}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating Analysis...
              </>
            ) : (
              "Generate Compatibility Analysis"
            )}
          </Button>
        </div>
      </div>
      
      {/* Credit Modal */}
      <Dialog open={showCreditModal} onOpenChange={setShowCreditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              No Compatibility Credits
            </DialogTitle>
            <DialogDescription>
              Oh, it seems like you don't have credits to analyze compatibility. Purchase any plan to get compatibility credits and unlock this feature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => {
                  setShowCreditModal(false);
                  navigate('/pricing?plan=Standard');
                }}
              >
                <div className="text-lg font-bold">Standard</div>
                <div className="text-xs text-white/70">5 Compatibility Credits</div>
              </Button>
              <Button
                variant="cosmic"
                className="h-20 flex-col"
                onClick={() => {
                  setShowCreditModal(false);
                  navigate('/pricing?plan=Premium');
                }}
              >
                <div className="text-lg font-bold">Premium</div>
                <div className="text-xs text-white/70">10 Compatibility Credits</div>
              </Button>
            </div>
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setShowCreditModal(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compatibility;