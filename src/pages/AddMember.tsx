import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Loader } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { BirthDetails, buildMemberRecord, loadMembers, saveMembers } from "@/lib/astroMock";
import { getPlanetaryData } from "@/lib/astroCalc";
import { usePlan } from "@/context/PlanContext";
import { FeaturePaywall } from "@/components/FeaturePaywall";
import { Card } from "@/components/ui/card";

type PlaceSuggestion = { label: string; lat: number; lng: number; tzone?: number };
type OpenCageResult = {
  formatted?: string;
  geometry?: { lat?: number; lng?: number };
  annotations?: { timezone?: { offset_sec?: number } };
};

const AddMember = () => {
  const [dob, setDob] = useState<Date | undefined>();
  const [hour, setHour] = useState<number | undefined>();
  const [minute, setMinute] = useState<number | undefined>();
  const [gender, setGender] = useState<string>("");
  const [photo, setPhoto] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeLoading, setPlaceLoading] = useState(false);
  const placeBoxRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { planName, loading: planLoading } = usePlan();
  const allowMembers = planName === "Elite";
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dobLabel = useMemo(() => {
    if (!dob) return "dd-mm-yyyy";
    const dd = String(dob.getDate()).padStart(2, "0");
    const mm = String(dob.getMonth() + 1).padStart(2, "0");
    const yyyy = dob.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }, [dob]);

  const requiredFilled = useMemo(() => {
    return (
      !!name.trim() &&
      !!dob &&
      hour !== undefined &&
      minute !== undefined &&
      placeQuery.trim().length > 1 &&
      !!gender &&
      selectedPlace !== null
    );
  }, [name, dob, hour, minute, placeQuery, gender, selectedPlace]);

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
        const items: PlaceSuggestion[] = (data?.results || []).map((r: OpenCageResult) => ({
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

  if (planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  if (!allowMembers) {
    return (
      <div className="min-h-screen px-4 py-10 flex items-center justify-center">
        <FeaturePaywall
          title="Family Members Locked"
          description="Upgrade to Elite to add and view member insights (up to 4 members)."
          ctaLabel="Upgrade for Members"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-3 sm:px-4 py-8 sm:py-16 overflow-x-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="hidden sm:block absolute -top-24 left-1/3 w-72 h-72 rounded-full bg-secondary/10 blur-3xl animate-float" />
        <div className="hidden sm:block absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float" style={{animationDelay:'0.5s'}} />
      </div>

      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold">Add Member</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Add a family member's birth details to generate insights.</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/30 backdrop-blur p-4 sm:p-6 md:p-8">
          {/* Single-step form */}

          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Birth details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2 md:col-span-3">
                <Label>Full name</Label>
                <Input placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-background/50 border-border/60" />
              </div>
              {/* Gender */}
              <div className="space-y-2 md:col-span-1 col-span-3">
                <Label>Gender</Label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    {key:'female', label:'Female'},
                    {key:'male', label:'Male'},
                    {key:'other', label:'Other'},
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
              <div className="space-y-2">
                <Label>Date of birth</Label>
                {/* Mobile: Native date input */}
                <input
                  type="date"
                  className="md:hidden w-full h-11 px-3 rounded-md bg-background/50 border border-border/60 text-foreground"
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
              <div className="space-y-2">
                <Label>Time of birth</Label>
                {/* Mobile: Native time input */}
                <input
                  type="time"
                  className="md:hidden w-full h-11 px-3 rounded-md bg-background/50 border border-border/60 text-foreground"
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
              <div className="space-y-2 md:col-span-1 col-span-3" ref={placeBoxRef}>
                <Label htmlFor="place">Place of birth</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="place"
                    placeholder="City, Country"
                    className="pl-10 h-11 bg-background/50 border-border/60"
                    value={placeQuery}
                    onChange={(e) => {
                      setPlaceQuery(e.target.value);
                      setSelectedPlace(null);
                    }}
                    onFocus={() => placeSuggestions.length && setPlaceOpen(true)}
                  />
                  {placeOpen && (
                    <div className="absolute z-20 mt-1 left-0 right-0 rounded-xl border border-border/60 bg-card/95 backdrop-blur shadow-xl max-h-64 overflow-auto">
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
              {/* Photo upload */}
              <div className="space-y-2 md:col-span-2 col-span-3">
                <Label htmlFor="photo">Photo</Label>
                <Input id="photo" type="file" accept="image/*" className="h-11 bg-background/50 border-border/60" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => setPhoto(String(reader.result || ""));
                  reader.readAsDataURL(f);
                }} />
                <p className="text-xs text-muted-foreground">Optional. Used in member list and reports.</p>
              </div>
              <div className="md:col-span-1 col-span-3">
                {photo && (
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-1 ring-border/60">
                    <img src={photo} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="ghost" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
            <Button
              variant="cosmic"
              disabled={!requiredFilled || saving}
              onClick={async () => {
                if (!dob || selectedPlace === null || hour === undefined || minute === undefined) {
                  setError("Please fill all required details and select a valid place.");
                  return;
                }
                setError(null);
                setSaving(true);
                try {
                  const dobLocal = `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, "0")}-${String(dob.getDate()).padStart(2, "0")}`;
                  const body = {
                    day: dob.getDate(),
                    month: dob.getMonth() + 1,
                    year: dob.getFullYear(),
                    hour,
                    min: minute,
                    lat: selectedPlace.lat,
                    lon: selectedPlace.lng,
                    tzone: typeof selectedPlace.tzone === "number" ? selectedPlace.tzone : -new Date().getTimezoneOffset() / 60,
                  };
                  const payload = await getPlanetaryData(body);
                  const form: BirthDetails = {
                    name,
                    date: dobLocal,
                    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
                    place: selectedPlace.label,
                    lat: selectedPlace.lat,
                    lon: selectedPlace.lng,
                    tzone: body.tzone,
                    gender,
                    photo,
                  };
                  const rec = buildMemberRecord(form, payload);
                  const list = loadMembers();
                  list.push(rec);
                  saveMembers(list);
                  navigate("/members");
                } catch (err) {
                  console.error("[members/add] Failed to compute planetary data", err);
                  setError("Unable to fetch planetary details for this member. Please double-check the birth info and try again.");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving..." : "Save Member"}
            </Button>
          </div>
        </div>
        <div className="mt-10">
          <Card className="p-6 bg-card/40 border border-border/60 rounded-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Need quick insights?</h3>
                <p className="text-sm text-muted-foreground">
                  Jump into chat and ask Vedika about {name ? `${name}'s` : "your member's"} future, wellness, or decisions.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const queryName = name || "my family member";
                  navigate("/chat", { state: { query: `Give me guidance for ${queryName}` } });
                }}
              >
                Ask Vedika
              </Button>
            </div>
          </Card>
        </div>
      </div>
      {/* No animation overlay in single-step flow */}
    </div>
  );
};

export default AddMember;
