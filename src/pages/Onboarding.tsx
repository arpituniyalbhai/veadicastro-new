import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { Calendar, Clock, MapPin, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { persistAstroPayload } from "@/lib/astroStorage";
import { getPlanetaryData } from "@/lib/astroCalc";
import SwissEPH from "sweph-wasm";

type PlaceSuggestion = { label: string; lat: number; lng: number; tzone?: number; uid?: string | null };

const Onboarding = () => {
  const { user, loading } = useAuth();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referral = searchParams.get("referral") || "direct";
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState<Date | undefined>();
  const [hour, setHour] = useState<number | undefined>();
  const [minute, setMinute] = useState<number | undefined>();
  const [gender, setGender] = useState<string>("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [placeSuggestions, setPlaceSuggestions] = useState<Array<PlaceSuggestion>>([]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeLoading, setPlaceLoading] = useState(false);
  const placeBoxRef = useRef<HTMLDivElement | null>(null);
  const [animating, setAnimating] = useState(false);
  const [animStatus, setAnimStatus] = useState<string>("");
  const [placeError, setPlaceError] = useState("");
  const [wasmPreloaded, setWasmPreloaded] = useState(false);
  const [wasmLoading, setWasmLoading] = useState(false);
  const wasmPromiseRef = useRef<Promise<any> | null>(null);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Explorer";

  // Auth guard: redirect to landing if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  const next = () => {
    // Preload WASM when moving from step 1 to step 2
    if (step === 1 && requiredFilled && !wasmPreloaded && !wasmLoading) {
      preloadWasm();
    }
    setStep((s) => Math.min(2, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const dobLabel = useMemo(() => {
    if (!dob) return "dd-mm-yyyy";
    const dd = String(dob.getDate()).padStart(2, "0");
    const mm = String(dob.getMonth() + 1).padStart(2, "0");
    const yyyy = dob.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }, [dob]);

  const requiredFilled = useMemo(() => {
    return (
      !!dob &&
      hour !== undefined &&
      minute !== undefined &&
      !!selectedPlace &&
      !!gender
    );
  }, [dob, hour, minute, selectedPlace, gender]);

useEffect(() => {
  if (!user?.uid) {
    setPlaceQuery("");
    setSelectedPlace(null);
    return;
  }
  try {
    const saved = localStorage.getItem('onboarding_place');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (
      parsed?.label &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number" &&
      parsed?.uid === user.uid
    ) {
      setPlaceQuery(parsed.label);
      setSelectedPlace(parsed);
    } else if (!parsed?.uid) {
      localStorage.removeItem('onboarding_place');
    }
  } catch {
    localStorage.removeItem('onboarding_place');
  }
}, [user?.uid]);

  // Preload WASM function (check if already preloaded from Welcome page)
  const preloadWasm = async () => {
    if (wasmPreloaded || wasmLoading) return;
    
    // Check if WASM was preloaded from Welcome page
    if ((window as any).preloadedSwe) {
      setWasmPreloaded(true);
      return;
    }
    
    setWasmLoading(true);
    try {
      if (!wasmPromiseRef.current) {
        wasmPromiseRef.current = (async () => {
          const wasmUrl = "/swisseph.wasm";
          const swe = await SwissEPH.init(wasmUrl);
          await swe.swe_set_ephe_path();
          swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
          (window as any).preloadedSwe = swe; // Store for future use
          return swe;
        })();
      }
      await wasmPromiseRef.current;
      setWasmPreloaded(true);
    } catch (error) {
      console.error("WASM preload failed:", error);
    } finally {
      setWasmLoading(false);
    }
  };

  // Debounced OpenCage autocomplete
  useEffect(() => {
    const controller = new AbortController();
    const q = placeQuery.trim();
    if (q.length < 2) {
      setPlaceSuggestions([]);
      setPlaceOpen(false);
      setPlaceError("");
      return;
    }
    setPlaceLoading(true);
    const id = setTimeout(async () => {
      try {
        const key = "91ab8792290d414b92590c9d4cc0793c"; // OpenCage API key
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

  return (
    <div className="relative min-h-screen px-3 sm:px-4 py-8 sm:py-16 overflow-x-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="hidden sm:block absolute -top-24 left-1/3 w-72 h-72 rounded-full bg-secondary/10 blur-3xl animate-float" />
        <div className="hidden sm:block absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float" style={{animationDelay:'0.5s'}} />
      </div>

        <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold">{t('onboardingTitle')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t('onboardingSubtitle')}</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/30 backdrop-blur p-4 sm:p-6 md:p-8">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= step ? 'bg-secondary' : 'bg-border'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">{t('birthDetails')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-4">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium whitespace-nowrap">{t('dateOfBirth')}</Label>
                  {/* Mobile: Native date input */}
                  <input
                    type="date"
                    className="md:hidden w-full h-11 px-3 rounded-md bg-background/50 border border-border/60 text-foreground text-sm"
                    value={dob ? `${dob.getFullYear()}-${String(dob.getMonth()+1).padStart(2,'0')}-${String(dob.getDate()).padStart(2,'0')}` : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-').map(Number);
                        setDob(new Date(y, m - 1, d));
                      }
                    }}
                  />
                  {/* Desktop: Calendar popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "hidden md:flex w-full justify-start h-11 rounded-md bg-background/50 border-border/60 hover:bg-accent/10",
                          !dob && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dobLabel}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 rounded-xl border border-border/60 bg-card/95 backdrop-blur shadow-xl" align="end" side="left" sideOffset={8} avoidCollisions={false}>
                      <CalendarUI
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        initialFocus
                        showOutsideDays={false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium whitespace-nowrap">{t('timeOfBirth')}</Label>
                  {/* Mobile: Native time input */}
                  <input
                    type="time"
                    className="md:hidden w-full h-11 px-3 rounded-md bg-background/50 border border-border/60 text-foreground text-sm"
                    value={hour !== undefined && minute !== undefined ? `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}` : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [h, m] = e.target.value.split(':').map(Number);
                        setHour(h);
                        setMinute(m);
                      }
                    }}
                  />
                  {/* Desktop: Custom time picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={"hidden md:flex w-full justify-start h-11 rounded-md bg-background/50 border-border/60 hover:bg-accent/10"}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {hour !== undefined && minute !== undefined ? `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}` : "--:--"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-3 rounded-xl border border-border/60 bg-card/95 backdrop-blur shadow-xl" align="start" side="bottom" sideOffset={8} avoidCollisions={false}>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="max-h-56 overflow-auto rounded-md border border-border/60 bg-background/50 scrollbar-dark">
                          <div className="sticky top-0 z-10 bg-background/70 backdrop-blur text-xs px-3 py-1 border-b border-border/60">Hour</div>
                          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                            <button
                              type="button"
                              key={h}
                              onClick={() => setHour(h)}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm hover:bg-accent/20",
                                hour === h && "bg-secondary/30 text-foreground font-medium",
                              )}
                            >
                              {String(h).padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                        <div className="max-h-56 overflow-auto rounded-md border border-border/60 bg-background/50 scrollbar-dark">
                          <div className="sticky top-0 z-10 bg-background/70 backdrop-blur text-xs px-3 py-1 border-b border-border/60">Minute</div>
                          {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                            <button
                              type="button"
                              key={m}
                              onClick={() => setMinute(m)}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm hover:bg-accent/20",
                                minute === m && "bg-secondary/30 text-foreground font-medium",
                              )}
                            >
                              {String(m).padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 w-full md:col-span-1" ref={placeBoxRef}>
                  <Label htmlFor="place" className="text-sm font-medium whitespace-nowrap">{t('placeOfBirth')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      id="place"
                      placeholder="City, Country"
                      className="pl-10 h-11 bg-background/50 border-border/60 text-sm w-full"
                      value={placeQuery}
                      onChange={(e) => {
                        setPlaceQuery(e.target.value);
                        setSelectedPlace(null);
                        setPlaceError(e.target.value.trim().length > 1 ? "Please pick a place from the list" : "");
                      }}
                      onFocus={() => placeSuggestions.length && setPlaceOpen(true)}
                    />
                    {placeOpen && (
                      <div className="absolute z-20 mt-1 left-0 right-0 rounded-lg border border-border/60 bg-card/95 backdrop-blur shadow-xl max-h-48 sm:max-h-64 overflow-auto">
                        {placeLoading && (
                          <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>
                        )}
                        {!placeLoading && placeSuggestions.length === 0 && (
                          <div className="px-3 py-2 text-xs text-muted-foreground">No results</div>
                        )}
                        {placeSuggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setPlaceQuery(s.label);
                              setSelectedPlace(s);
                              setPlaceOpen(false);
                              localStorage.setItem('onboarding_place', JSON.stringify({ label: s.label, lat: s.lat, lng: s.lng, tzone: s.tzone, uid: user?.uid || null }));
                              setPlaceError("");
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {placeError && (
                  <p className="text-xs text-red-500">{placeError}</p>
                )}
                <div className="space-y-2 w-full md:col-span-3">
                  <Label className="text-sm font-medium">{t('gender')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {key:'female', label:'F♀️'},
                      {key:'male', label:'M♂️'},
                      {key:'other', label:'Oth⚧️'},
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setGender(opt.key)}
                        className={cn(
                          'h-11 rounded-md border border-border/60 bg-background/50 hover:bg-accent/10 text-sm',
                          gender === opt.key && 'border-secondary text-foreground'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {step === 2 && (
            <div className="space-y-6">
              {/* Vedika Avatar */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-secondary/40 overflow-hidden shadow-lg">
                  <img src="/optimized/vedika.webp" alt="Vedika" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
              
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-semibold">
                  {t('welcomeMessage').replace('{name}', displayName)}!
                </h2>
                <p className="text-muted-foreground">
                  {t('onboardingComplete')}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={back} disabled={step === 1}>{t('back')}</Button>
            {step < 2 ? (
              <Button variant="cosmic" onClick={next} disabled={step === 1 && !requiredFilled}>{t('next')}</Button>
            ) : (
              <Button
                variant="cosmic"
                disabled={!requiredFilled}
                onClick={async () => {
                  // Build details and persist
                  const storedPlace = (() => {
                    try {
                      const raw = localStorage.getItem('onboarding_place');
                      if (!raw || !user?.uid) return null;
                      const parsed = JSON.parse(raw);
                      if (parsed?.uid === user.uid) {
                        return parsed;
                      }
                      return null;
                    } catch {
                      return null;
                    }
                  })();
                  const sel = selectedPlace || storedPlace;
                  // Store DOB as local calendar date (YYYY-MM-DD) to avoid timezone shift
                  const dobLocal = dob ? `${dob.getFullYear()}-${String(dob.getMonth()+1).padStart(2,'0')}-${String(dob.getDate()).padStart(2,'0')}` : "";
                  const details = {
                    dob: dobLocal,
                    time: `${String(hour ?? 0).padStart(2,'0')}:${String(minute ?? 0).padStart(2,'0')}`,
                    place: placeQuery,
                    lat: sel?.lat ?? null,
                    lng: sel?.lng ?? null,
                    tzone: (typeof sel?.tzone === 'number' ? sel.tzone : -new Date().getTimezoneOffset()/60),
                    gender,
                  };
                  localStorage.setItem('onboarding_details', JSON.stringify(details));
                  setAnimating(true);
                  setAnimStatus("Connecting to astrology servers…");

                  // WASM is already preloaded, no artificial delay needed
                  const delay = new Promise((r) => setTimeout(r, 100));
                  // 1) Fetch planetary data (WASM should be preloaded)
                  async function fetchPlanets() {
                    try {
                      setAnimStatus(wasmPreloaded ? "Calculating planetary positions…" : "Loading astrology engine & calculating positions…");
                      const [y, m, d] = details.dob.split('-').map(n => parseInt(n,10));
                      const [hh, mm] = details.time.split(':').map(n => parseInt(n,10));
                      if (details.lat == null || details.lng == null) {
                        throw new Error("Missing coordinates");
                      }
                      const body = {
                        day: d,
                        month: m,
                        year: y,
                        hour: hh,
                        min: mm,
                        lat: details.lat,
                        lon: details.lng,
                        tzone: details.tzone,
                      };
                      const payload = await getPlanetaryData(body);
                      persistAstroPayload(payload);
                      return true;
                    } catch (e) {
                      console.error("[Onboarding] Planet calc failed", e);
                      return false;
                    }
                  }

                  // Retry planets once if needed
                  let ok = await fetchPlanets();
                  if (!ok) {
                    setAnimStatus("Retrying planetary data…");
                    ok = await fetchPlanets();
                  }
                  if (!ok) {
                    setAnimStatus("Unable to reach astrology servers. Please check your internet and try again…");
                    return; // do not navigate; stay on animation as requested
                  }

                  await delay;
                  setAnimating(false);
                  // Save referral source
                  localStorage.setItem('onboarding_complete', 'true');
                  localStorage.setItem('onboarding_referral', referral);
                  navigate('/dashboard');
                }}
              >
                {t('readMyStars')}
              </Button>
            )}
          </div>

          {/* Privacy Message */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Your birth details are private and securely stored</span>
          </div>
        </div>
      </div>
      {animating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-background/95" />
          {/* Starry background */}
          <div className="absolute inset-0 opacity-30" style={{background:
            'radial-gradient(circle at 20% 30%, rgba(147,51,234,0.25) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(236,72,153,0.25) 0%, transparent 45%)'}} />
          {/* Astrology image silhouettes */}
          <img src="/optimized/vedika.webp" alt="Vedika" className="absolute left-8 bottom-8 w-24 h-24 rounded-full object-cover opacity-70" />
          <div className="relative mx-6 max-w-xl text-center">
            <div className="animate-pulse text-lg text-muted-foreground mb-3">{animStatus || 'Personalizing your dashboard…'}</div>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary animate-bounce" /> Gathering your birth details…</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{animationDelay:'150ms'}}/> Calculating planetary positions…</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{animationDelay:'300ms'}}/> Preparing remedies and insights…</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{animationDelay:'450ms'}}/> Warming up Vedika ✨</div>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-border/60">
                <div className="h-2 rounded-full bg-secondary animate-[progress_0.5s_linear_forwards]" style={{width:'0%'}} />
              </div>
            </div>
          </div>
          <style>{`@keyframes progress{from{width:0%}to{width:100%}}`}</style>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
