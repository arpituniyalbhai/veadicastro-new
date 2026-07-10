import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlanetaryData, type AstroPayload, getNakshatraLord, getYoni } from "@/lib/astroCalc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Calendar, MapPin, Clock, User, Loader2, Star, Globe, Heart, Zap, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";

// Types
interface Planet {
  name?: string;
  planet?: string;
  sign: string;
  degree?: string | number;
  house?: string | number;
  retrograde?: boolean;
  nakshatra?: { name: string; pada: number; index?: number };
  color?: string;
  combust?: boolean;
  relation?: string;
  longitude?: string;
}

interface ChartData {
  planets?: Planet[];
  ascendant?: string;
  houses?: any[];
  nakshatra?: any;
  moonSign?: string;
  sunSign?: string;
  lagnaSign?: string;
}

// Planet color mapping
const PLANET_COLORS: Record<string, string> = {
  "Sun": "#f97316",
  "Moon": "#6366f1", 
  "Mars": "#ef4444",
  "Mercury": "#22c55e",
  "Jupiter": "#eab308",
  "Venus": "#ec4899",
  "Saturn": "#64748b",
  "Rahu": "#94a3b8",
  "Ketu": "#a78bfa",
};

// Planet emoji mapping
const PLANET_EMOJI: Record<string, string> = {
  "Sun": "☀️", "Moon": "🌙", "Mars": "♂️", "Mercury": "☿",
  "Jupiter": "♃", "Venus": "♀", "Saturn": "♄", "Rahu": "🌑", "Ketu": "🌘"
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me",
  Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

const ZODIAC = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

// Astrology helpers
const signLords: Record<string,string> = { 
  Aries:"Mars",Taurus:"Venus",Gemini:"Mercury",Cancer:"Moon",
  Leo:"Sun",Virgo:"Mercury",Libra:"Venus",Scorpio:"Mars",
  Sagittarius:"Jupiter",Capricorn:"Saturn",Aquarius:"Saturn",Pisces:"Jupiter" 
};

const nakLords: Record<string,string> = { 
  Ashwini:"Ketu",Bharani:"Venus",Krittika:"Sun",Rohini:"Moon",Mrigashirsha:"Mars",Ardra:"Rahu",Punarvasu:"Jupiter",Pushya:"Saturn",Ashlesha:"Mercury",Magha:"Ketu","Purva Phalguni":"Venus","Uttara Phalguni":"Sun",Hasta:"Moon",Chitra:"Mars",Swati:"Rahu",Vishakha:"Jupiter",Anuradha:"Saturn",Jyeshtha:"Mercury",Mula:"Ketu","Purva Ashadha":"Venus","Uttara Ashadha":"Sun",Shravana:"Moon",Dhanishtha:"Mars",Shatabhisha:"Rahu","Purva Bhadrapada":"Jupiter","Uttara Bhadrapada":"Saturn",Revati:"Mercury" 
};

const luckyStones: Record<string,string> = { 
  Leo:"Ruby",Taurus:"Diamond",Libra:"Diamond",Cancer:"Pearl",Aries:"Red Coral",Scorpio:"Red Coral",Sagittarius:"Yellow Sapphire",Pisces:"Yellow Sapphire",Capricorn:"Blue Sapphire",Aquarius:"Blue Sapphire",Gemini:"Emerald",Virgo:"Emerald" 
};

const mantras: Record<string,string> = { 
  Leo:"Om Suryaya Namaha",Taurus:"Om Shukraya Namaha",Libra:"Om Shukraya Namaha",Cancer:"Om Chandraya Namaha",Aries:"Om Mangalaya Namaha",Scorpio:"Om Mangalaya Namaha",Sagittarius:"Om Gurave Namaha",Pisces:"Om Gurave Namaha",Capricorn:"Om Shanaye Namaha",Aquarius:"Om Shanaye Namaha",Gemini:"Om Budhaya Namaha",Virgo:"Om Budhaya Namaha" 
};

const luckyColors: Record<string,string> = { 
  Leo:"Gold, Orange",Taurus:"White, Pink",Libra:"White, Pink",Cancer:"White, Cream",Aries:"Red, Maroon",Scorpio:"Red, Maroon",Sagittarius:"Yellow, Orange",Pisces:"Yellow, Orange",Capricorn:"Black, Blue",Aquarius:"Black, Blue",Gemini:"Green, Light Blue",Virgo:"Green, Light Blue" 
};

const luckyGods: Record<string,string> = {
  "Aries": "Hanuman", "Taurus": "Lakshmi", "Gemini": "Vishnu", "Cancer": "Shiva",
  "Leo": "Shiva", "Virgo": "Vishnu", "Libra": "Lakshmi", "Scorpio": "Hanuman",
  "Sagittarius": "Vishnu", "Capricorn": "Shani", "Aquarius": "Indra", "Pisces": "Vishnu"
};

const luckyDays: Record<string,string> = {
  "Aries": "Tuesday, Sunday", "Taurus": "Friday, Monday", "Gemini": "Wednesday, Friday", "Cancer": "Monday, Thursday",
  "Leo": "Sunday, Tuesday", "Virgo": "Wednesday, Friday", "Libra": "Friday, Monday", "Scorpio": "Tuesday, Thursday",
  "Sagittarius": "Thursday, Sunday", "Capricorn": "Saturday, Friday", "Aquarius": "Saturday, Wednesday", "Pisces": "Thursday, Monday"
};

// Helper functions for planetary table
const getPlanetRelation = (planetName?: string, sign?: string): string => {
  if (!planetName || !sign) return '';
  
  const planetRelations: Record<string, Record<string, string>> = {
    'Sun': { Aries: 'Friendly', Taurus: 'Neutral', Gemini: 'Enemy', Cancer: 'Friendly', Leo: 'Own', Virgo: 'Enemy', Libra: 'Enemy', Scorpio: 'Friendly', Sagittarius: 'Friendly', Capricorn: 'Neutral', Aquarius: 'Enemy', Pisces: 'Friendly' },
    'Moon': { Aries: 'Friendly', Taurus: 'Friendly', Gemini: 'Neutral', Cancer: 'Own', Leo: 'Friendly', Virgo: 'Enemy', Libra: 'Neutral', Scorpio: 'Enemy', Sagittarius: 'Friendly', Capricorn: 'Neutral', Aquarius: 'Enemy', Pisces: 'Friendly' },
    'Mars': { Aries: 'Own', Taurus: 'Neutral', Gemini: 'Enemy', Cancer: 'Enemy', Leo: 'Friendly', Virgo: 'Friendly', Libra: 'Enemy', Scorpio: 'Own', Sagittarius: 'Friendly', Capricorn: 'Enemy', Aquarius: 'Friendly', Pisces: 'Enemy' },
    'Mercury': { Aries: 'Enemy', Taurus: 'Friendly', Gemini: 'Own', Cancer: 'Enemy', Leo: 'Enemy', Virgo: 'Own', Libra: 'Friendly', Scorpio: 'Enemy', Sagittarius: 'Enemy', Capricorn: 'Friendly', Aquarius: 'Friendly', Pisces: 'Enemy' },
    'Jupiter': { Aries: 'Friendly', Taurus: 'Enemy', Gemini: 'Enemy', Cancer: 'Friendly', Leo: 'Friendly', Virgo: 'Enemy', Libra: 'Friendly', Scorpio: 'Enemy', Sagittarius: 'Own', Capricorn: 'Enemy', Aquarius: 'Friendly', Pisces: 'Own' },
    'Venus': { Aries: 'Enemy', Taurus: 'Own', Gemini: 'Friendly', Cancer: 'Enemy', Leo: 'Enemy', Virgo: 'Friendly', Libra: 'Own', Scorpio: 'Friendly', Sagittarius: 'Enemy', Capricorn: 'Friendly', Aquarius: 'Enemy', Pisces: 'Friendly' },
    'Saturn': { Aries: 'Enemy', Taurus: 'Friendly', Gemini: 'Friendly', Cancer: 'Enemy', Leo: 'Enemy', Virgo: 'Friendly', Libra: 'Friendly', Scorpio: 'Friendly', Sagittarius: 'Enemy', Capricorn: 'Own', Aquarius: 'Own', Pisces: 'Friendly' },
    'Rahu': { Aries: 'Friendly', Taurus: 'Friendly', Gemini: 'Friendly', Cancer: 'Neutral', Leo: 'Neutral', Virgo: 'Friendly', Libra: 'Friendly', Scorpio: 'Friendly', Sagittarius: 'Neutral', Capricorn: 'Friendly', Aquarius: 'Own', Pisces: 'Neutral' },
    'Ketu': { Aries: 'Neutral', Taurus: 'Neutral', Gemini: 'Neutral', Cancer: 'Friendly', Leo: 'Friendly', Virgo: 'Neutral', Libra: 'Neutral', Scorpio: 'Neutral', Sagittarius: 'Friendly', Capricorn: 'Neutral', Aquarius: 'Neutral', Pisces: 'Own' }
  };
  
  return planetRelations[planetName]?.[sign] || '';
};

const formatLongitude = (degree?: string | number): string => {
  if (!degree) return '0-00-00';
  
  const deg = typeof degree === 'string' ? parseFloat(degree) : degree;
  if (isNaN(deg)) return '0-00-00';
  
  const degrees = Math.floor(deg);
  const minutes = Math.floor((deg - degrees) * 60);
  const seconds = Math.floor(((deg - degrees) * 60 - minutes) * 60);
  
  return `${degrees}-${minutes.toString().padStart(2, '0')}-${seconds.toString().padStart(2, '0')}`;
};

// Shared inline styles
const S = {
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

function NorthIndianChart({ chart }: { chart: ChartData }) {
  const lagnaSign = chart.lagnaSign || "Aries";
  const lagnaIdx = ZODIAC.indexOf(lagnaSign);
  const houseSignNames = ZODIAC.slice(lagnaIdx).concat(ZODIAC.slice(0, lagnaIdx));

  const planetMap: Record<string, { house: number }> = {};
  (chart.planets || []).forEach((p) => {
    const name = p.name || p.planet || "";
    if (name) {
      const h = parseInt(String(p.house || "1").replace("H", ""), 10);
      planetMap[name] = { house: h };
    }
  });

  const planetsInHouse = (h: number): string[] => {
    const list: string[] = [];
    for (const [name, pd] of Object.entries(planetMap)) {
      if (pd.house === h) list.push(name);
    }
    return list;
  };

  const houseLabelPos: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 23 },
    2: { x: 25, y: 8 },
    12: { x: 75, y: 8 },
    3: { x: 8, y: 25 },
    11: { x: 92, y: 25 },
    4: { x: 22, y: 50 },
    10: { x: 78, y: 50 },
    5: { x: 8, y: 75 },
    9: { x: 92, y: 75 },
    6: { x: 25, y: 92 },
    8: { x: 75, y: 92 },
    7: { x: 50, y: 77 },
  };

  const renderHouseContent = (houseNum: number) => {
    const signName = houseSignNames[houseNum - 1] || "";
    const glyph = SIGN_GLYPHS[signName] || "";
    const planets = planetsInHouse(houseNum);
    const pos = houseLabelPos[houseNum];
    const isKendra = [1, 4, 7, 10].includes(houseNum);

    return (
      <div
        key={houseNum}
        className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
        style={{
          left: `${pos?.x || 50}%`,
          top: `${pos?.y || 50}%`,
          transform: "translate(-50%, -50%)",
          width: isKendra ? "26%" : "20%",
        }}
      >
        <div className={`flex items-center gap-1 ${houseNum === 1 ? "text-pink-400" : ""}`}>
          <span className="text-xs md:text-sm leading-none">{glyph}</span>
          <span className="text-[9px] md:text-[11px] font-medium leading-none">{signName}</span>
        </div>
        {planets.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-center gap-x-1 gap-y-0.5">
            {planets.map((p) => (
              <span
                key={p}
                className={`text-[10px] md:text-xs font-semibold`}
                style={{ color: PLANET_COLORS[p] || "#fff" }}
                title={p}
              >
                {PLANET_SYMBOLS[p] || p.substring(0, 2)}
              </span>
            ))}
          </div>
        )}
        <span className="text-[8px] text-white/30 leading-none mt-0.5">
          H{houseNum}
        </span>
      </div>
    );
  };

  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-square">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" style={{ color: "rgba(255,255,255,0.15)" }}>
        <rect x="1" y="1" width="398" height="398" fill="none" stroke="currentColor" strokeWidth="2" />
        <polygon points="200,0 300,100 200,200 100,100" fill="rgba(236,72,153,0.08)" />
        <line x1="0" y1="0" x2="400" y2="400" stroke="currentColor" strokeWidth="1.5" />
        <line x1="400" y1="0" x2="0" y2="400" stroke="currentColor" strokeWidth="1.5" />
        <line x1="200" y1="0" x2="400" y2="200" stroke="currentColor" strokeWidth="1.5" />
        <line x1="400" y1="200" x2="200" y2="400" stroke="currentColor" strokeWidth="1.5" />
        <line x1="200" y1="400" x2="0" y2="200" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="200" x2="200" y2="0" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(renderHouseContent)}
    </div>
  );
}

const Chart = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    const loadChartData = () => {
      try {
        const savedData = localStorage.getItem('astrology_planets');
        const savedPlanetPositions = localStorage.getItem('planet_positions');
        const savedAscendant = localStorage.getItem('ascendant');
        const savedOnboarding = localStorage.getItem('onboarding_details');
        
        if (savedData) {
          const planets = JSON.parse(savedData);
          const processedPlanets = Array.isArray(planets) ? planets.map((planet: any) => ({
            ...planet,
            name: planet.name || planet.planet,
            color: PLANET_COLORS[planet.name || planet.planet] || "#f97316",
            house: getHouseForPlanet(planet, savedAscendant),
            degree: planet.longitude ? `${Math.round(planet.longitude % 30)}°` : '0°'
          })) : [];
          
          setChartData({
            planets: processedPlanets,
            ascendant: savedAscendant || 'Aries',
            houses: [],
            nakshatra: planets.find((x: any) => (x.name || x.planet) === 'Moon')?.nakshatra || null,
            moonSign: planets.find((x: any) => (x.name || x.planet) === 'Moon')?.sign || null,
            sunSign: planets.find((x: any) => (x.name || x.planet) === 'Sun')?.sign || null,
            lagnaSign: savedAscendant || 'Aries'
          });
        }

        if (savedOnboarding) {
          setUserDetails(JSON.parse(savedOnboarding));
        }
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  const getHouseForPlanet = (planet: any, ascendant: string): string => {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                   "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const planetSignIndex = signs.indexOf(planet.sign);
    const ascendantIndex = signs.indexOf(ascendant);
    if (planetSignIndex === -1 || ascendantIndex === -1) return "H1";
    const houseNumber = ((planetSignIndex - ascendantIndex + 12) % 12) + 1;
    return `H${houseNumber}`;
  };

  const getSignLord = (sign: string): string => {
    return signLords[sign] || "Unknown";
  };

  const getNakshatraLord = (index: number): string => {
    const nakshatras = ["Ashwini","Bharani","Krittika","Rohini","Mrigashirsha","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
    return nakLords[nakshatras[index % 27]] || "Unknown";
  };

  const getLuckyStone = (sign: string): string => {
    return luckyStones[sign] || "Unknown";
  };

  const getLuckyColor = (sign: string): string => {
    return luckyColors[sign] || "Unknown";
  };

  const getLuckyDay = (sign: string): string => {
    return luckyDays[sign] || "Unknown";
  };

  const getLuckyGod = (lagnaSign: string): string => {
    return luckyGods[lagnaSign] || "Vishnu";
  };

  const getMantra = (sign: string): string => {
    return mantras[sign] || "Unknown";
  };

  const fmtDate = (d: number, m: number, y: number) =>
    `${d} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]} ${y}`;
  const fmtTime = (h: number, m: number, ap: string) =>
    `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ap}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        html { overflow-y: scroll; scrollbar-gutter: stable; }

        .fkg-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #07070c; color: white; }
        .fkg-serif { font-family: 'Playfair Display', serif; }
        .fkg-pink-glow { text-shadow: 0 0 36px rgba(236,72,153,.5); }
        .fkg-glass { background: rgba(255,255,255,.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.08); }
        .fkg-btn-pink { background: linear-gradient(135deg,#ec4899,#be185d); }
        .fkg-btn-pink:hover { background: linear-gradient(135deg,#f472b6,#ec4899); }

        select option { background: #180a20; color: white; }
        select:focus  { border-color: #ec4899 !important; box-shadow: 0 0 0 1px #ec4899; }
        input:focus   { border-color: #ec4899 !important; box-shadow: 0 0 0 1px #ec4899; outline: none; }

        @keyframes fkg-spin { to { transform: rotate(360deg); } }
        .fkg-spin { animation: fkg-spin 1s linear infinite; }

        @keyframes fkg-pulse { 0%{box-shadow:0 0 0 0 rgba(236,72,153,.35)} 70%{box-shadow:0 0 0 10px rgba(236,72,153,0)} 100%{box-shadow:0 0 0 0 rgba(236,72,153,0)} }
        .fkg-pulse { animation: fkg-pulse 3s ease-in-out infinite; }
      `}</style>

      <div className="fkg-root" style={{ position:"relative" }}>
        {/* Background */}
        <div aria-hidden="true" style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-120px", right:"-120px", width:"420px", height:"420px", borderRadius:"50%", background:"radial-gradient(circle, rgba(190,24,93,0.05) 0%, transparent 70%)" }} />
          <div style={{ position:"absolute", bottom:"-120px", left:"-120px", width:"360px", height:"360px", borderRadius:"50%", background:"radial-gradient(circle, rgba(109,40,217,0.04) 0%, transparent 70%)" }} />
          {([[7,12],[19,35],[47,68],[61,24],[75,52],[23,57],[41,90],[58,44]] as [number,number][]).map(([t,l],i) => (
            <div key={i} style={{ position:"absolute", borderRadius:"50%", background:"white", width:"1.5px", height:"1.5px", top:`${t}%`, left:`${l}%`, opacity:"0.15" }} />
          ))}
        </div>

        {/* Main Content */}
        <div style={{ position:"relative", zIndex:1 }}>
          {/* Header */}
          <header style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(5,3,10,0.80)", backdropFilter:"blur(18px)" }}>
            <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"0 24px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <button onClick={() => navigate("/dashboard")} style={{ display:"flex", alignItems:"center", gap:"10px", background:"none", border:"none", color:"white", cursor:"pointer" }}>
                <img src="/logo.jpg" alt="Veadicastro" style={{ width:"36px", height:"36px", borderRadius:"50%" }} />
                <span className="fkg-serif" style={{ fontSize:"17px", fontWeight:700 }}>Veadicastro</span>
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <section style={{ padding:"56px 16px 36px", textAlign:"center" }}>
            <p style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", color:"#ec4899", border:"1px solid rgba(236,72,153,0.3)", borderRadius:"999px", padding:"6px 16px", marginBottom:"20px" }}>
              <Sparkles style={{ width:"12px", height:"12px" }} /> Your Janam Kundali — Complete Analysis
            </p>
            <h1 className="fkg-serif" style={{ fontSize:"clamp(30px,6vw,54px)", fontWeight:900, lineHeight:1.1, marginBottom:"14px" }}>
              {userDetails?.name}'s <span className="fkg-pink-glow" style={{ color:"#ec4899" }}>Birth Chart</span>
            </h1>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"16px", maxWidth:"540px", margin:"0 auto" }}>
              Your complete Vedic astrology analysis with planetary positions, dosha analysis, and personalized insights.
            </p>
          </section>

          {/* Main Results */}
          <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 16px 56px" }}>
            {/* Summary */}
            <div className="fkg-glass" style={{ borderRadius:"16px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
              <div className="fkg-pulse" style={{ width:"46px", height:"46px", borderRadius:"50%", background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <User style={{ width:"20px", height:"20px", color:"rgba(255,255,255,0.45)" }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <h3 className="fkg-serif" style={{ fontWeight:700, fontSize:"15px" }}>{userDetails?.name}'s Kundli</h3>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"12px", color:"rgba(255,255,255,0.4)", fontSize:"12px", marginTop:"4px" }}>
                  <span>📅 {userDetails?.dob}</span>
                  <span>🕐 {userDetails?.time}</span>
                  <span>📍 {userDetails?.place?.split(",")[0]}</span>
                </div>
              </div>
              <button onClick={() => navigate('/dashboard')}
                style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"6px 12px", background:"none", cursor:"pointer", flexShrink:0 }}>
                Dashboard
              </button>
            </div>

            {/* Highlights */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginTop:"18px" }}>
              {[
                ["☀️","Sun Sign",chartData.sunSign],
                ["🌙","Moon Sign",chartData.moonSign],
                ["⬆️","Ascendant",chartData.lagnaSign],
                ["✨","Nakshatra",chartData.nakshatra?.name||""]
              ].map(([e,l,v],i)=>(
                <div key={i} className="fkg-glass" style={{ borderRadius:"12px", padding:"12px", textAlign:"center" }}>
                  <div style={{ fontSize:"20px", marginBottom:"4px" }}>{e}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"11px", marginBottom:"2px" }}>{l}</div>
                  <div style={{ fontWeight:600, fontSize:"13px" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* North Indian Chart */}
            <div className="fkg-glass" style={{ borderRadius:"22px", padding:"26px", marginTop:"18px" }}>
              <h3 className="fkg-serif" style={{ fontSize:"17px", fontWeight:700, marginBottom:"18px", textAlign:"center", color:"rgba(255,255,255,0.7)" }}>
                ⬡ North Indian Birth Chart
              </h3>
              <NorthIndianChart chart={chartData} />
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", background:"rgba(255,255,255,0.04)", borderRadius:"12px", padding:"4px", marginTop:"18px" }}>
              {[
                {id:"basic",label:"Basic & Panchang",I:Star},
                {id:"planets",label:"Planets",I:Globe},
                {id:"dosha",label:"Dosha",I:Heart},
                {id:"dasha",label:"Dasha",I:Zap},
                {id:"remedies",label:"Remedies",I:Sparkles}
              ].map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)} className={activeTab===t.id?"fkg-btn-pink":""}
                  style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"8px", border:"none", color:activeTab===t.id?"white":"rgba(255,255,255,0.5)", fontWeight:500, fontSize:"13px", cursor:"pointer", background:activeTab===t.id?undefined:"none", transition:"all 0.15s" }}>
                  <t.I style={{ width:"13px", height:"13px" }} />{t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="fkg-glass" style={{ borderRadius:"22px", padding:"26px", marginTop:"18px" }}>

              {/* BASIC */}
              {activeTab==="basic" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
                  <h3 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899" }}>Basic Details & Panchang</h3>
                  {[
                    { title:"Basic Details", rows:[
                      ["Name", userDetails?.name], 
                      ["Birth Date & Time", `${userDetails?.dob} | ${userDetails?.time}`], 
                      ["Birth Place", userDetails?.place?.split(",")[0]], 
                      ["Nakshatra", chartData.nakshatra?.name||"—"], 
                      ["Ascendant", chartData.lagnaSign], 
                      ["Sun Sign", chartData.sunSign], 
                      ["Moon Sign", chartData.moonSign||"—"]
                    ]},
                    { title:"Kundli Details", rows:[
                      ["Nakshatra Lord", getNakshatraLord(chartData.nakshatra?.index || 0)],
                      ["Yoni", getYoni(chartData.nakshatra?.index || 0)],
                      ["Charan", chartData.nakshatra?.pada?.toString()||"—"],
                      ["Sign Lord", getSignLord(chartData.lagnaSign)||"—"]
                    ]},
                    { title:"Favourable", rows:[
                      ["Lucky Stone", getLuckyStone(chartData.sunSign)],
                      ["Mantra", getMantra(chartData.sunSign)],
                      ["Lucky Color", getLuckyColor(chartData.sunSign)],
                      ["Lucky God", getLuckyGod(chartData.lagnaSign)],
                      ["Lucky Day", getLuckyDay(chartData.sunSign)]
                    ]}
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
                          {["","Planet","C","R","Rashi","Longitude","Nakshatra","Pada","Relation"].map(h=>(
                            <th key={h} style={{ textAlign:"left", padding:"9px 8px", color:"rgba(255,255,255,0.4)", fontWeight:500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.planets?.map((planet, index) => {
                          const isCombust = planet.combust || false;
                          const isRetrograde = planet.retrograde || false;
                          const relation = planet.relation || getPlanetRelation(planet.name || planet.planet, planet.sign);
                          const longitude = planet.longitude || formatLongitude(planet.degree);
                          const pada = planet.nakshatra?.pada || 1;
                          
                          return (
                            <tr key={index} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding:"8px 8px" }}>{PLANET_EMOJI[planet.name || planet.planet || ""]??""}</td>
                              <td style={{ padding:"8px 8px", fontWeight:500, textTransform:"capitalize" }}>{planet.name || planet.planet}</td>
                              <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{isCombust ? "C" : ""}</td>
                              <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{isRetrograde ? "R" : ""}</td>
                              <td style={{ padding:"8px 8px" }}>{planet.sign}</td>
                              <td style={{ padding:"8px 8px" }}>{longitude}</td>
                              <td style={{ padding:"8px 8px" }}>{planet.nakshatra?.name || '-'}</td>
                              <td style={{ padding:"8px 8px" }}>{pada}</td>
                              <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}>{relation}</td>
                            </tr>
                          );
                        })}
                        <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding:"8px 8px" }}>⬆️</td>
                          <td style={{ padding:"8px 8px", fontWeight:500 }}>Asc</td>
                          <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}></td>
                          <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}></td>
                          <td style={{ padding:"8px 8px" }}>{chartData.lagnaSign}</td>
                          <td style={{ padding:"8px 8px" }}>{chartData.ascendant}</td>
                          <td style={{ padding:"8px 8px" }}>{chartData.nakshatra?.name||'-'}</td>
                          <td style={{ padding:"8px 8px" }}>{chartData.nakshatra?.pada || 1}</td>
                          <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.4)" }}></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DOSHA */}
              {activeTab==="dosha" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                  <h3 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899" }}>Dosha Analysis</h3>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", lineHeight:1.6, textAlign:"center", padding:"40px" }}>
                    Complete dosha analysis coming soon with detailed Manglik, Kaal Sarp, and other dosha reports.
                  </div>
                </div>
              )}

              {/* DASHA */}
              {activeTab==="dasha" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                  <h3 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899" }}>Dasha Timeline</h3>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", lineHeight:1.6, textAlign:"center", padding:"40px" }}>
                    Complete Vimshottari Dasha timeline coming soon with detailed period analysis.
                  </div>
                </div>
              )}

              {/* REMEDIES */}
              {activeTab==="remedies" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                  <h3 className="fkg-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899" }}>Personalized Remedies</h3>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", lineHeight:1.6, textAlign:"center", padding:"40px" }}>
                    Personalized Vedic remedies based on your birth chart coming soon.
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chart;