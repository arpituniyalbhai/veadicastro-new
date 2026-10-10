import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { Calendar, Clock, MapPin, CheckCircle2, Moon, Sunrise, Sun, Sunset } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [showUnknownTimeDialog, setShowUnknownTimeDialog] = useState(false);
  const [approximateBirthPeriod, setApproximateBirthPeriod] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [placeSuggestions, setPlaceSuggestions] = useState<Array<PlaceSuggestion>>([]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeLoading, setPlaceLoading] = useState(false);
  const placeBoxRef = useRef<HTMLDivElement | null>(null);
  const [animating, setAnimating] = useState(false);
  const [animStatus, setAnimStatus] = useState<string>("");
  const [animationStep, setAnimationStep] = useState(0);
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

  const requiredFilled = useMemo(
    () => !!dob && hour !== undefined && minute !== undefined && !!selectedPlace && !!gender,
    [dob, hour, minute, selectedPlace, gender],
  );

  const handleUnknownBirthTimeChange = (checked: boolean) => {
    setUnknownBirthTime(checked);
    if (checked) {
      setHour(undefined);
      setMinute(undefined);
      setApproximateBirthPeriod("");
      setShowUnknownTimeDialog(true);
    } else {
      setShowUnknownTimeDialog(false);
      setApproximateBirthPeriod("");
      setHour(undefined);
      setMinute(undefined);
    }
  };

  const selectApproximateBirthTime = (period: string, selectedHour: number) => {
    setHour(selectedHour);
    setMinute(0);
    setApproximateBirthPeriod(period);
    setShowUnknownTimeDialog(false);
  };

  const continueWithoutBirthTime = () => {
    setHour(0);
    setMinute(0);
    setApproximateBirthPeriod("Unknown");
    setShowUnknownTimeDialog(false);
  };

  const handleUnknownTimeDialogChange = (open: boolean) => {
    setShowUnknownTimeDialog(open);
    if (!open && !approximateBirthPeriod) {
      setUnknownBirthTime(false);
      setHour(undefined);
      setMinute(undefined);
    }
  };

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
        const key = "d52e8cb97dd44516b5e66f634b8a3c93"; // OpenCage API key
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

        <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur p-4 sm:p-6 md:p-8">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= step ? 'bg-secondary' : 'bg-border'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-5 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">{t('birthDetails')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5 sm:gap-y-6">
                <div className="min-w-0 space-y-2 w-full">
                  <Label className="text-sm font-medium">{t('dateOfBirth')}</Label>
                  {/* Mobile: Native date input */}
                  <div className="relative md:hidden">
                    <Calendar aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      aria-label={t('dateOfBirth')}
                      className="h-12 w-full min-w-0 rounded-xl border border-border/70 bg-background/60 pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20 [color-scheme:dark]"
                      value={dob ? `${dob.getFullYear()}-${String(dob.getMonth()+1).padStart(2,'0')}-${String(dob.getDate()).padStart(2,'0')}` : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [y, m, d] = e.target.value.split('-').map(Number);
                          setDob(new Date(y, m - 1, d));
                        }
                      }}
                    />
                  </div>
                  {/* Desktop: Calendar popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "hidden md:flex w-full justify-start h-12 rounded-xl bg-background/60 border-border/70 shadow-sm hover:bg-accent/10",
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
                <div className="min-w-0 space-y-2 w-full">
                  <Label className="text-sm font-medium">{t('timeOfBirth')}</Label>
                  {/* Mobile: Native time input */}
                  <div className="relative md:hidden">
                    <Clock aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="time"
                      aria-label={t('timeOfBirth')}
                      className="h-12 w-full min-w-0 rounded-xl border border-border/70 bg-background/60 pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark]"
                      disabled={unknownBirthTime}
                      value={hour !== undefined && minute !== undefined ? `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}` : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [h, m] = e.target.value.split(':').map(Number);
                          setHour(h);
                          setMinute(m);
                        }
                      }}
                    />
                  </div>
                  {/* Desktop: Custom time picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={unknownBirthTime}
                        className={"hidden md:flex w-full justify-start h-12 rounded-xl bg-background/60 border-border/70 shadow-sm hover:bg-accent/10"}
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
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-background/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground transition-colors hover:border-secondary/40 hover:bg-accent/5 sm:min-h-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:hover:border-transparent sm:hover:bg-transparent">
                    <input
                      type="checkbox"
                      checked={unknownBirthTime}
                      onChange={(e) => handleUnknownBirthTimeChange(e.target.checked)}
                      className="h-4 w-4 shrink-0 rounded border-border/60 accent-pink-500"
                    />
                    <span>I don't know my exact time of birth</span>
                  </label>
                  {unknownBirthTime && approximateBirthPeriod && hour !== undefined && (
                    <p className="text-xs text-secondary">
                      {approximateBirthPeriod === "Unknown"
                        ? "Birth time unknown — using default time: 12:00 AM"
                        : `Using ${approximateBirthPeriod.toLowerCase()} time: ${String(hour).padStart(2, '0')}:00`}
                    </p>
                  )}
                </div>
                <div className="min-w-0 space-y-2 w-full md:col-span-1" ref={placeBoxRef}>
                  <Label htmlFor="place" className="text-sm font-medium">{t('placeOfBirth')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="place"
                      placeholder="City, Country"
                      className="h-12 w-full rounded-xl border-border/70 bg-background/60 pl-10 text-sm shadow-sm focus-visible:border-secondary focus-visible:ring-secondary/20"
                      value={placeQuery}
                      onChange={(e) => {
                        setPlaceQuery(e.target.value);
                        setSelectedPlace(null);
                        setPlaceError(e.target.value.trim().length > 1 ? "Please pick a place from the list" : "");
                      }}
                      onFocus={() => placeSuggestions.length && setPlaceOpen(true)}
                    />
                    {placeOpen && (
                      <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-auto rounded-xl border border-border/60 bg-card/95 shadow-xl backdrop-blur sm:max-h-64">
                        {placeLoading && <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>}
                        {!placeLoading && placeSuggestions.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No results</div>}
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
                            className="w-full px-3 py-3 text-left text-sm hover:bg-accent/20"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {placeError && <p className="text-xs text-red-500">{placeError}</p>}
                </div>
                <div className="min-w-0 space-y-2 w-full md:col-span-3">
                  <Label className="text-sm font-medium">{t('gender')}</Label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { key: 'female', label: 'F ♀️' },
                      { key: 'male', label: 'M ♂️' },
                      { key: 'other', label: 'Other ⚧️' },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        aria-pressed={gender === option.key}
                        onClick={() => setGender(option.key)}
                        className={cn(
                          'h-12 rounded-xl border border-border/60 bg-background/40 text-sm transition-colors hover:border-secondary/50 hover:bg-accent/10',
                          gender === option.key && 'border-secondary bg-secondary/10 text-foreground ring-1 ring-secondary/30',
                        )}
                      >
                        {option.label}
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

          <div className="mt-7 flex items-stretch gap-3 sm:mt-8 sm:gap-4">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 1}
              className="h-12 min-w-0 flex-1 rounded-xl border border-border/60 bg-background/30 px-4 text-sm font-semibold transition-colors hover:bg-accent/10 disabled:opacity-40 sm:flex-none sm:min-w-28"
            >
              {t('back')}
            </Button>
            {step < 2 ? (
              <Button
                variant="cosmic"
                onClick={next}
                disabled={step === 1 && !requiredFilled}
                className="h-12 min-w-0 flex-[1.25] whitespace-nowrap rounded-xl px-4 text-sm font-semibold shadow-md shadow-secondary/20 transition-transform active:scale-[0.98] sm:flex-none sm:min-w-32 sm:px-6 sm:text-base"
              >
                {t('next')}
              </Button>
            ) : (
              <Button
                variant="cosmic"
                disabled={!requiredFilled}
                className="h-12 min-w-0 flex-[1.25] whitespace-nowrap rounded-xl px-3 text-sm font-semibold shadow-md shadow-secondary/20 transition-transform active:scale-[0.98] sm:flex-none sm:min-w-40 sm:px-6 sm:text-base"
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
                  
                  // Calculate current age (years, months, days)
                  const today = new Date();
                  const birthDate = dob ? new Date(dobLocal) : new Date();
                  let ageYears = today.getFullYear() - birthDate.getFullYear();
                  let ageMonths = today.getMonth() - birthDate.getMonth();
                  let ageDays = today.getDate() - birthDate.getDate();
                  
                  if (ageDays < 0) {
                    ageMonths--;
                    const daysInPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
                    ageDays += daysInPrevMonth;
                  }
                  if (ageMonths < 0) {
                    ageYears--;
                    ageMonths += 12;
                  }
                  
                  const details = {
                    dob: dobLocal,
                    time: `${String(hour ?? 0).padStart(2,'0')}:${String(minute ?? 0).padStart(2,'0')}`,
                    place: placeQuery,
                    lat: sel?.lat ?? null,
                    lng: sel?.lng ?? null,
                    tzone: (typeof sel?.tzone === 'number' ? sel.tzone : -new Date().getTimezoneOffset()/60),
                    gender,
                    unknownBirthTime,
                    age: { years: ageYears, months: ageMonths, days: ageDays },
                  };
                  localStorage.setItem('onboarding_details', JSON.stringify(details));
                  setAnimating(true);
                  setAnimationStep(0);
                  setAnimStatus("Reviewing your birth details…");
                  const animationStartedAt = Date.now();

                  // 1) Fetch planetary data (WASM should be preloaded)
                  async function fetchPlanets() {
                    try {
                      setAnimationStep(1);
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
                      setAnimationStep(2);
                      setAnimStatus("Planetary positions are ready. Preparing your birth chart…");
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

                  // Keep the loading animation visible for at least five seconds.
                  const remainingAnimationTime = Math.max(0, 5000 - (Date.now() - animationStartedAt));
                  await new Promise((resolve) => setTimeout(resolve, remainingAnimationTime));
                  setAnimationStep(3);
                  setAnimStatus("Your chart is ready. Opening your dashboard…");
                  await new Promise((resolve) => setTimeout(resolve, 550));
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
          <div className="mx-auto mt-5 flex w-fit max-w-full items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-center text-[11px] font-medium leading-snug text-emerald-400 sm:mt-6 sm:text-xs">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Your birth details are handled securely and kept private</span>
          </div>
        </div>
      </div>
      <Dialog open={showUnknownTimeDialog} onOpenChange={handleUnknownTimeDialogChange}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-border/60 bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <DialogHeader className="pr-6 text-left">
            <DialogTitle className="text-xl leading-7">Do you have any idea when you were born?</DialogTitle>
            <DialogDescription className="pt-1 leading-5">
              Choose the closest part of the day. We will use an approximate birth time for your reading.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            {[
              { period: "Night", time: "2:00 AM", hour: 2, Icon: Moon },
              { period: "Morning", time: "6:00 AM", hour: 6, Icon: Sunrise },
              { period: "Afternoon", time: "1:00 PM", hour: 13, Icon: Sun },
              { period: "Evening", time: "5:00 PM", hour: 17, Icon: Sunset },
            ].map(({ period, time, hour: selectedHour, Icon }) => (
              <button
                key={period}
                type="button"
                onClick={() => selectApproximateBirthTime(period, selectedHour)}
                className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-border/60 bg-background/50 p-4 text-left transition-colors hover:border-secondary/70 hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{period}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Use {time}</span>
                </span>
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={continueWithoutBirthTime}
            className="w-full border-border/60 bg-background/50 hover:bg-secondary/10"
          >
            Still I don&apos;t know — use 12:00 AM
          </Button>

          <p className="text-xs leading-5 text-muted-foreground">
            Exact birth time gives the most accurate chart. You can return and enter it manually if you find it later.
          </p>
        </DialogContent>
      </Dialog>
      {animating && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/95 px-4 py-6 backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-label="Preparing your birth chart"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ background: 'radial-gradient(circle at 20% 25%, rgba(147,51,234,0.22) 0%, transparent 38%), radial-gradient(circle at 82% 72%, rgba(236,72,153,0.2) 0%, transparent 42%)' }}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-5 shadow-2xl shadow-secondary/10 backdrop-blur-xl sm:p-7">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/80 to-transparent" />

            <div className="mb-6 flex flex-col items-center text-center">
              <div className="relative mb-4 h-20 w-20 rounded-full border border-secondary/50 bg-secondary/10 p-1 shadow-lg shadow-secondary/20">
                <div className="absolute inset-0 animate-ping rounded-full border border-secondary/30 [animation-duration:2.4s]" />
                <img src="/optimized/vedika.webp" alt="" className="relative h-full w-full rounded-full object-cover" />
              </div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Your personal birth chart</p>
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">The stars are aligning</h2>
              <p className="mt-2 min-h-5 text-sm text-muted-foreground" aria-live="polite">{animStatus || 'Reviewing your birth details…'}</p>
            </div>

            <div className="relative space-y-4" aria-label={`Progress step ${animationStep + 1} of 4`}>
              <div className="absolute bottom-4 left-[15px] top-4 w-px bg-border/70" aria-hidden="true">
                <div
                  className="w-full bg-secondary transition-all duration-700 ease-out"
                  style={{ height: `${(animationStep / 3) * 100}%` }}
                />
              </div>
              {[
                'Reviewing your birth details',
                'Calculating planetary positions',
                'Preparing your birth chart',
                'Opening your personalized dashboard',
              ].map((label, index) => {
                const complete = index < animationStep;
                const active = index === animationStep;
                return (
                  <div key={label} className="relative flex min-h-8 items-center gap-3">
                    <div className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500',
                      complete && 'border-secondary bg-secondary text-secondary-foreground',
                      active && 'border-secondary bg-background text-secondary shadow-[0_0_18px_hsl(var(--secondary)/0.35)]',
                      !complete && !active && 'border-border bg-card text-muted-foreground',
                    )}>
                      {complete ? (
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      ) : active ? (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-50" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
                        </span>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-border" />
                      )}
                    </div>
                    <span className={cn(
                      'text-sm transition-colors duration-500',
                      active && 'font-semibold text-foreground',
                      complete && 'text-muted-foreground',
                      !complete && !active && 'text-muted-foreground/70',
                    )}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className="mt-6 h-1.5 overflow-hidden rounded-full bg-border/60"
              role="progressbar"
              aria-label="Birth chart preparation progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round((animationStep / 3) * 100)}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(8, (animationStep / 3) * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">This usually takes just a few moments.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
