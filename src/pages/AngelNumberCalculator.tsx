import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles, User, Calendar, Loader2, Star, ChevronRight,
} from "lucide-react";

interface BirthDetails {
  name: string;
  day: number;
  month: number;
  year: number;
}

interface AngelNumberResult {
  finalNumber: number;
  planet: string;
  planetVedic: string;
  meaning: string;
  traits: string[];
  remedies: string[];
  luckyColor: string;
  luckyStone: string;
  mantra: string;
}

// Date validation helper
const isValidDate = (day: number, month: number, year: number): boolean => {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const AngelNumberCalculator = () => {
  const navigate = useNavigate();

  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "", day: 7, month: 3, year: 2000,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<AngelNumberResult | null>(null);
  const [error, setError] = useState<string>("");

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    {v:1,l:"January"},{v:2,l:"February"},{v:3,l:"March"},{v:4,l:"April"},
    {v:5,l:"May"},{v:6,l:"June"},{v:7,l:"July"},{v:8,l:"August"},
    {v:9,l:"September"},{v:10,l:"October"},{v:11,l:"November"},{v:12,l:"December"},
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  // Angel number meanings with Vedic planet connections
  const angelNumberData: Record<number, Omit<AngelNumberResult, 'finalNumber'>> = {
    1: {
      planet: "Sun",
      planetVedic: "Surya",
      meaning: "Leadership, independence, and new beginnings. You are a natural-born leader with strong willpower and creativity.",
      traits: ["Leadership qualities", "Independent nature", "Creative thinking", "Strong willpower", "Pioneering spirit"],
      remedies: ["Worship Surya at sunrise", "Offer water to Sun", "Chant 'Om Suryaya Namaha'", "Wear ruby or red coral", "Fast on Sundays"],
      luckyColor: "Orange, Gold, Red",
      luckyStone: "Ruby",
      mantra: "Om Suryaya Namaha"
    },
    2: {
      planet: "Moon",
      planetVedic: "Chandra",
      meaning: "Sensitivity, intuition, and relationships. You are empathetic, nurturing, and have strong emotional intelligence.",
      traits: ["Intuitive abilities", "Compassionate nature", "Diplomatic skills", "Artistic talent", "Emotional depth"],
      remedies: ["Worship Moon on Monday", "Wear white clothes", "Chant 'Om Chandraya Namaha'", "Donate milk or rice", "Keep silver items"],
      luckyColor: "White, Cream, Light Blue",
      luckyStone: "Pearl",
      mantra: "Om Chandraya Namaha"
    },
    3: {
      planet: "Jupiter",
      planetVedic: "Guru/Brihaspati",
      meaning: "Wisdom, expansion, and communication. You are optimistic, knowledgeable, and have natural teaching abilities.",
      traits: ["Optimistic outlook", "Teaching abilities", "Spiritual wisdom", "Good communication", "Generous nature"],
      remedies: ["Worship Guru on Thursday", "Chant 'Om Gurave Namaha'", "Wear yellow sapphire", "Donate yellow clothes or food", "Respect elders and teachers"],
      luckyColor: "Yellow, Orange, Gold",
      luckyStone: "Yellow Sapphire",
      mantra: "Om Gurave Namaha"
    },
    4: {
      planet: "Rahu",
      planetVedic: "Rahu",
      meaning: "Ambition, transformation, and unconventional thinking. You are ambitious, innovative, and break traditions.",
      traits: ["Ambitious nature", "Innovative thinking", "Strong determination", "Unconventional approach", "Leadership skills"],
      remedies: ["Worship Rahu on Saturday", "Chant 'Om Rahave Namaha'", "Wear hessonite garnet", "Donate black clothes", "Help the underprivileged"],
      luckyColor: "Black, Blue, Purple",
      luckyStone: "Hessonite Garnet",
      mantra: "Om Rahave Namaha"
    },
    5: {
      planet: "Mercury",
      planetVedic: "Budha",
      meaning: "Communication, intelligence, and adaptability. You are versatile, witty, and excel in learning and teaching.",
      traits: ["Quick learner", "Excellent communication", "Versatile nature", "Analytical mind", "Social skills"],
      remedies: ["Worship Budha on Wednesday", "Chant 'Om Budhaya Namaha'", "Wear emerald", "Donate green items", "Feed cows with green grass"],
      luckyColor: "Green, Light Blue, Gray",
      luckyStone: "Emerald",
      mantra: "Om Budhaya Namaha"
    },
    6: {
      planet: "Venus",
      planetVedic: "Shukra",
      meaning: "Love, beauty, and harmony. You are artistic, romantic, and value relationships and material comforts.",
      traits: ["Artistic talent", "Loving nature", "Appreciation of beauty", "Social grace", "Diplomatic skills"],
      remedies: ["Worship Shukra on Friday", "Chant 'Om Shukraya Namaha'", "Wear diamond", "Donate white clothes or sweets", "Respect women and relationships"],
      luckyColor: "White, Pink, Light Blue",
      luckyStone: "Diamond",
      mantra: "Om Shukraya Namaha"
    },
    7: {
      planet: "Ketu",
      planetVedic: "Ketu",
      meaning: "Spirituality, intuition, and detachment. You are spiritual, analytical, and seek deeper meaning in life.",
      traits: ["Spiritual inclination", "Analytical mind", "Intuitive abilities", "Research skills", "Detached nature"],
      remedies: ["Worship Ketu on Tuesday", "Chant 'Om Ketave Namaha'", "Wear cat's eye", "Donate brown or multi-colored items", "Serve dogs"],
      luckyColor: "Brown, Multi-colors, Purple",
      luckyStone: "Cat's Eye",
      mantra: "Om Ketave Namaha"
    },
    8: {
      planet: "Saturn",
      planetVedic: "Shani",
      meaning: "Discipline, karma, and achievement. You are hardworking, responsible, and achieve success through persistence.",
      traits: ["Disciplined nature", "Hard working", "Responsible attitude", "Leadership qualities", "Patient temperament"],
      remedies: ["Worship Shani on Saturday", "Chant 'Om Shanaye Namaha'", "Wear blue sapphire", "Donate black clothes or iron items", "Serve the elderly"],
      luckyColor: "Black, Blue, Dark Gray",
      luckyStone: "Blue Sapphire",
      mantra: "Om Shanaye Namaha"
    },
    9: {
      planet: "Mars",
      planetVedic: "Mangal",
      meaning: "Courage, passion, and transformation. You are energetic, brave, and have strong leadership abilities.",
      traits: ["Courageous nature", "Passionate attitude", "Leadership qualities", "Physical strength", "Determined mind"],
      remedies: ["Worship Mangal on Tuesday", "Chant 'Om Mangalaya Namaha'", "Wear red coral", "Donate red clothes or food", "Help soldiers and police"],
      luckyColor: "Red, Maroon, Orange",
      luckyStone: "Red Coral",
      mantra: "Om Mangalaya Namaha"
    },
    11: {
      planet: "Moon + Jupiter",
      planetVedic: "Chandra + Guru",
      meaning: "Master number of intuition and enlightenment. You have heightened spiritual awareness and natural healing abilities.",
      traits: ["Highly intuitive", "Spiritual master", "Healing abilities", "Visionary thinking", "Empathic nature"],
      remedies: ["Meditate regularly", "Chant 'Om Aim' (Saraswati mantra)", "Wear clear quartz", "Practice yoga and pranayama", "Serve spiritual teachers"],
      luckyColor: "Silver, White, Gold",
      luckyStone: "Clear Quartz",
      mantra: "Om Aim Saraswatyai Namaha"
    },
    22: {
      planet: "Moon + Saturn",
      planetVedic: "Chandra + Shani",
      meaning: "Master number of manifestation and building. You can turn dreams into reality through practical action.",
      traits: ["Master builder", "Practical visionary", "Strong manifesting power", "Leadership abilities", "Organized nature"],
      remedies: ["Practice manifestation", "Chant 'Om Kleem' (Krishna mantra)", "Wear amethyst", "Build something meaningful", "Help build communities"],
      luckyColor: "Gold, Purple, White",
      luckyStone: "Amethyst",
      mantra: "Om Kleem Krishnaya Namaha"
    },
    33: {
      planet: "Jupiter + Mars",
      planetVedic: "Guru + Mangal",
      meaning: "Master number of compassion and teaching. You are a natural healer and teacher with universal love.",
      traits: ["Universal compassion", "Natural teacher", "Healing abilities", "Creative expression", "Spiritual wisdom"],
      remedies: ["Practice unconditional love", "Chant 'Om Shanti'", "Wear rose quartz", "Teach and heal others", "Practice charity"],
      luckyColor: "Pink, Gold, White",
      luckyStone: "Rose Quartz",
      mantra: "Om Shanti Shanti Shanti"
    }
  };

  // Core calculation functions
  const extractNumbers = (dateString: string): number[] => {
    return dateString.split('').filter(char => /\d/.test(char)).map(Number);
  };

  const reduceToSingle = (num: number): number => {
    // Keep master numbers 11, 22, 33 as is
    if (num === 11 || num === 22 || num === 33) return num;
    
    // If single digit, return as is
    if (num <= 9) return num;
    
    // Note: Numbers like 44, 55, etc. are reduced further (44→8) as they're not master numbers
    // Only 11, 22, 33 are considered master numbers in Vedic numerology
    const sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    return reduceToSingle(sum); // Recursive call
  };

  const calculateAngelNumber = () => {
    // Clear previous errors
    setError("");
    
    // Validate name
    if (!birthDetails.name.trim()) {
      setError("Please enter your name");
      return;
    }
    
    // Validate date
    if (!isValidDate(birthDetails.day, birthDetails.month, birthDetails.year)) {
      setError("Please enter a valid date of birth");
      return;
    }

    setIsCalculating(true);
    
    // Calculate immediately without artificial delay
    try {
      // Step 1: Create date string and extract numbers
      const dateString = `${birthDetails.year}-${birthDetails.month.toString().padStart(2, '0')}-${birthDetails.day.toString().padStart(2, '0')}`;
      const numbers = extractNumbers(dateString);
      
      // Step 2: Sum all numbers
      const totalSum = numbers.reduce((acc, num) => acc + num, 0);
      
      // Step 3: Reduce to single digit (or master number)
      const finalNumber = reduceToSingle(totalSum);
      
      // Step 4: Get meaning and create result
      const angelData = angelNumberData[finalNumber];
      if (angelData) {
        setResult({
          finalNumber,
          ...angelData
        });
      }
    } catch (err) {
      setError("Calculation failed. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const fmtDate = (d: number, m: number, y: number) =>
    `${d} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]} ${y}`;

  // ── Shared inline style atoms ──────────────────────────────────────────────
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

  return (
    <>
      <Helmet>
        <title>Angel Number Calculator by Date of Birth — Free Vedic Numerology</title>
        <meta name="description" content="Calculate your angel number free using your date of birth. Discover your Vedic ruling planet, lucky stone, mantra, and personalized remedies. Instant results." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://veadicastro.in/angel-number-calculator" />
        
        {/* Google Fonts Preconnect & Preload */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Angel Number Calculator by Date of Birth — Free Vedic Numerology" />
        <meta property="og:description" content="Calculate your angel number free using your date of birth. Discover your Vedic ruling planet, lucky stone, mantra, and personalized remedies. Instant results." />
        <meta property="og:url" content="https://veadicastro.in/angel-number-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://veadicastro.in/optimized/logo.webp" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Angel Number Calculator by Date of Birth — Free Vedic Numerology" />
        <meta name="twitter:description" content="Calculate your angel number free using your date of birth. Discover your Vedic ruling planet, lucky stone, mantra, and personalized remedies. Instant results." />
        <meta name="twitter:image" content="https://veadicastro.in/optimized/logo.webp" />
        
        {/* Schema Markup */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Angel Number Calculator",
          "url": "https://veadicastro.in/angel-number-calculator",
          "description": "Calculate your angel number from date of birth using Vedic astrology. Discover your ruling planet, lucky stone, mantra and personalized remedies.",
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
          }
        })}
        </script>
        
        {/* FAQ Schema */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is angel number the same as life path number?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "They are calculated the same way but come from different traditions. Angel numbers emphasize spiritual guidance and divine communication, while life path numbers focus more on personality and life direction."
              }
            },
            {
              "@type": "Question",
              "name": "Can my angel number change?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. It is based on your fixed date of birth and does not change throughout your lifetime. However, your understanding and relationship with your number's energy can deepen over time."
              }
            },
            {
              "@type": "Question",
              "name": "What if my number is 10?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "10 reduces to 1+0 = 1. There is no angel number 10 in Vedic numerology as all numbers must be reduced to single digits or master numbers (11, 22, 33)."
              }
            },
            {
              "@type": "Question",
              "name": "Are master numbers always lucky?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Not exactly. They carry high potential but also high responsibility and challenge. Master numbers require greater self-awareness and spiritual discipline to fulfill their potential."
              }
            },
            {
              "@type": "Question",
              "name": "How do I know if I'm fulfilling my angel number's potential?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "When you're aligned with your number's energy, you'll feel a sense of flow, purpose, and synchronicity in your life. Challenges become opportunities, and your natural talents emerge effortlessly."
              }
            }
          ]
        })}
        </script>
      </Helmet>

      <style>{`
        html { overflow-y: scroll; scrollbar-gutter: stable; }

        .anc-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #07070c; color: white; }
        .anc-serif { font-family: 'DM Sans', sans-serif; font-weight: 700; }
        .anc-pink-glow { text-shadow: 0 0 36px rgba(236,72,153,.5); }
        .anc-glass { background: rgba(255,255,255,.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.08); }
        .anc-btn-pink { background: linear-gradient(135deg,#ec4899,#be185d); }
        .anc-btn-pink:hover { background: linear-gradient(135deg,#f472b6,#ec4899); }

        select option { background: #180a20; color: white; }
        select:focus  { border-color: #ec4899 !important; box-shadow: 0 0 0 1px #ec4899; }
        input:focus   { border-color: #ec4899 !important; box-shadow: 0 0 0 1px #ec4899; outline: none; }

        @keyframes anc-spin { to { transform: rotate(360deg); } }
        .anc-spin { animation: anc-spin 1s linear infinite; }

        @keyframes anc-pulse { 0%{box-shadow:0 0 0 0 rgba(236,72,153,.35)} 70%{box-shadow:0 0 0 10px rgba(236,72,153,0)} 100%{box-shadow:0 0 0 0 rgba(236,72,153,0)} }
        .anc-pulse { animation: anc-pulse 3s ease-in-out infinite; }

        @keyframes anc-blink { 0%,100%{opacity:.08} 50%{opacity:.28} }
      `}</style>

      <div className="anc-root" style={{ position:"relative" }}>

        {/* ── BACKGROUND ── */}
        <div aria-hidden="true" style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-120px", right:"-120px", width:"420px", height:"420px", borderRadius:"50%", background:"radial-gradient(circle, rgba(190,24,93,0.05) 0%, transparent 70%)" }} />
          <div style={{ position:"absolute", bottom:"-120px", left:"-120px", width:"360px", height:"360px", borderRadius:"50%", background:"radial-gradient(circle, rgba(109,40,217,0.04) 0%, transparent 70%)" }} />
          {([[7,12],[19,35],[47,68],[61,24],[75,52],[23,57],[41,90],[58,44]] as [number,number][]).map(([t,l],i) => (
            <div key={i} style={{ position:"absolute", borderRadius:"50%", background:"white", width:"1.5px", height:"1.5px", top:`${t}%`, left:`${l}%`, opacity:"0.15" }} />
          ))}
        </div>

        {/* ── ALL PAGE CONTENT ── */}
        <div style={{ position:"relative", zIndex:1 }}>

          {/* HEADER */}
          <header style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(5,3,10,0.80)", backdropFilter:"blur(18px)" }}>
            <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"0 24px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <button onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:"10px", background:"none", border:"none", color:"white", cursor:"pointer" }}>
                <img src="/optimized/logo.webp" alt="Veadicastro angel number calculator" style={{ width:"36px", height:"36px", borderRadius:"50%" }} />
                <span className="anc-serif" style={{ fontSize:"17px", fontWeight:700 }}>Veadicastro</span>
              </button>
              <button onClick={() => navigate("/free-ai-astrologer-chat")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"13px" }}>
                ← Free AI Chat
              </button>
            </div>
          </header>

          {/* HERO */}
          <section style={{ padding:"56px 16px 36px", textAlign:"center" }}>
            <p style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", color:"#ec4899", border:"1px solid rgba(236,72,153,0.3)", borderRadius:"999px", padding:"6px 16px", marginBottom:"20px" }}>
              <Sparkles style={{ width:"12px", height:"12px" }} /> Angel Number Calculator — Vedic Wisdom
            </p>
            <h1 className="anc-serif" style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:900, lineHeight:1.1, marginBottom:"14px" }}>
              Angel Number Calculator — Find Your Vedic Numerology Number
            </h1>
            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"16px", maxWidth:"540px", margin:"0 auto", lineHeight:1.7 }}>
              Calculate your angel number from your date of birth using Vedic astrology principles. Connect with your ruling planet and discover personalized remedies.
            </p>
          </section>

          {/* MAIN */}
          <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 16px 56px" }}>
            {!result ? (
              <>
              <div style={{ maxWidth:"580px", margin:"0 auto", minHeight:"500px", transform:"translateZ(0)", willChange:"transform" }}>
                <div className="anc-glass" style={{ borderRadius:"24px", padding:"32px", position:"relative", overflow:"visible", transform:"translateZ(0)", backfaceVisibility:"hidden" }}>
                  <h2 className="anc-serif" style={{ fontSize:"21px", fontWeight:700, textAlign:"center", marginBottom:"26px" }}>
                    Calculate Your <span style={{ color:"#ec4899" }}>Angel Number</span>
                  </h2>

                  <div style={{ display:"flex", flexDirection:"column", gap:"20px", position:"relative", isolation:"isolate" }}>
                    {/* Error Display */}
                    {error && (
                      <div style={{ 
                        background:"rgba(236,72,153,0.15)", 
                        border:"1px solid rgba(236,72,153,0.3)", 
                        borderRadius:"12px", 
                        padding:"12px 16px", 
                        color:"#ec4899", 
                        fontSize:"14px", 
                        textAlign:"center",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        gap:"8px"
                      }}>
                        <span style={{ fontSize:"16px" }}>⚠️</span>
                        {error}
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label style={S.label}><User style={{ width:"15px", height:"15px", color:"#ec4899" }} /> Full Name *</label>
                      <input type="text" placeholder="Enter your full name" value={birthDetails.name}
                        onChange={e => setBirthDetails(p => ({ ...p, name: e.target.value }))} style={S.inp} />
                    </div>

                    {/* DOB */}
                    <div>
                      <label style={S.label}><Calendar style={{ width:"15px", height:"15px", color:"#ec4899" }} /> Date of Birth *</label>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", isolation:"isolate" }}>
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
                        <div style={{ transform:"translateZ(0)", willChange:"transform", gridColumn:"1 / -1" }}>
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

                    {/* Calculate button */}
                    <button 
                      onClick={calculateAngelNumber} 
                      disabled={isCalculating} 
                      className="anc-btn-pink"
                      aria-label="Calculate your angel number from date of birth"
                      style={{ width:"100%", height:"48px", borderRadius:"12px", border:"none", color:"white", fontWeight:600, fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", cursor:isCalculating?"not-allowed":"pointer", opacity:isCalculating?0.55:1, transition:"opacity 0.2s" }}>
                      {isCalculating
                        ? <><Loader2 className="anc-spin" style={{ width:"16px", height:"16px" }} /> Calculating Your Angel Number…</>
                        : <>Calculate My Angel Number</>}
                    </button>
                  </div>
                </div>
              </div>

              </>
            ) : (
              <>
              {/* ════════════════ RESULTS ════════════════ */}
              <div style={{ display:"flex", flexDirection:"column", gap:"18px", maxWidth:"768px", margin:"0 auto" }}>

                {/* Summary */}
                <div className="anc-glass" style={{ borderRadius:"16px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                  <div className="anc-pulse" style={{ width:"46px", height:"46px", borderRadius:"50%", background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Star style={{ width:"20px", height:"20px", color:"rgba(255,255,255,0.45)" }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 className="anc-serif" style={{ fontWeight:700, fontSize:"15px" }}>{birthDetails.name}'s Angel Number</h3>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"12px", color:"rgba(255,255,255,0.4)", fontSize:"12px", marginTop:"4px" }}>
                      <span>📅 {fmtDate(birthDetails.day, birthDetails.month, birthDetails.year)}</span>
                      <span>🔢 Angel Number: {result.finalNumber}</span>
                      <span>🪐 Ruling Planet: {result.planetVedic}</span>
                    </div>
                  </div>
                  <button onClick={() => { setResult(null); setBirthDetails({name:"",day:7,month:3,year:2000}); }}
                    style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"6px 12px", background:"none", cursor:"pointer", flexShrink:0 }}>
                    New Calculation
                  </button>
                </div>

                {/* Angel Number Display */}
                <div className="anc-glass" style={{ borderRadius:"20px", padding:"32px", textAlign:"center", background:"linear-gradient(135deg, rgba(236,72,153,0.1), rgba(190,24,93,0.05))" }}>
                  <div style={{ fontSize:"120px", fontWeight:900, color:"#ec4899", lineHeight:1, marginBottom:"16px", textShadow:"0 0 40px rgba(236,72,153,0.5)" }}>
                    {result.finalNumber}
                  </div>
                  <h2 className="anc-serif" style={{ fontSize:"24px", fontWeight:700, marginBottom:"8px" }}>
                    Angel Number {result.finalNumber}
                  </h2>
                  <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"16px", marginBottom:"16px" }}>
                    Ruled by {result.planet} ({result.planetVedic})
                  </p>
                  <p style={{ color:"rgba(255,255,255,0.8)", fontSize:"18px", lineHeight:1.6, maxWidth:"500px", margin:"0 auto" }}>
                    {result.meaning}
                  </p>
                </div>

                {/* Detailed Analysis */}
                <div className="anc-glass" style={{ borderRadius:"20px", padding:"26px" }}>
                  <h3 className="anc-serif" style={{ fontSize:"21px", fontWeight:700, color:"#ec4899", marginBottom:"20px" }}>
                    Your Angel Number Analysis
                  </h3>
                  
                  <div style={{ display:"grid", gap:"20px" }}>
                    {/* Personality Traits */}
                    <div style={S.card}>
                      <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px", color:"#ec4899" }}>Personality Traits</h4>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                        {result.traits.map((trait, i) => (
                          <span key={i} style={{ background:"rgba(236,72,153,0.15)", color:"#ec4899", padding:"6px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:500 }}>
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Vedic Remedies */}
                    <div style={S.card}>
                      <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px", color:"#ec4899" }}>Vedic Remedies</h4>
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {result.remedies.map((remedy, i) => (
                          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"8px", fontSize:"13px", color:"rgba(255,255,255,0.8)" }}>
                            <ChevronRight style={{ width:"14px", height:"14px", color:"#ec4899", flexShrink:0, marginTop:"1px" }} />
                            <span>{remedy}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Favorable Items */}
                    <div style={S.card}>
                      <h4 style={{ fontWeight:600, fontSize:"15px", marginBottom:"14px", color:"#ec4899" }}>Favorable Items</h4>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"12px" }}>
                        <div>
                          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginBottom:"4px" }}>Lucky Colors</p>
                          <p style={{ color:"white", fontSize:"14px" }}>{result.luckyColor}</p>
                        </div>
                        <div>
                          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginBottom:"4px" }}>Lucky Stone</p>
                          <p style={{ color:"white", fontSize:"14px" }}>{result.luckyStone}</p>
                        </div>
                        <div>
                          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginBottom:"4px" }}>Mantra</p>
                          <p style={{ color:"white", fontSize:"14px", fontStyle:"italic" }}>{result.mantra}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              </>
            )}

            {/* BLOG CONTENT - ALWAYS VISIBLE */}

            <div id="guide" style={{ maxWidth:"768px", margin:"56px auto 0", padding:"0 16px" }}>
              <h2 className="anc-serif" style={{ fontSize:"28px", fontWeight:700, marginBottom:"20px", color:"#ec4899" }}>
                What Is an Angel Number?
              </h2>
              
              <div style={{ display:"flex", flexDirection:"column", gap:"24px", color:"rgba(255,255,255,0.8)", fontSize:"16px", lineHeight:1.7 }}>
                <p>
                  Angel numbers are more than just repeating digits you see on clocks or number plates. In Vedic tradition, your birth date carries a cosmic code — a single number that connects you to a ruling planet, a set of life traits, and a path of spiritual growth. This ancient system of numerology, deeply intertwined with Vedic astrology, reveals the fundamental energetic patterns that shape your personality, relationships, and life journey. Unlike Western numerology which often focuses solely on personality traits, Vedic angel numbers connect directly to planetary deities and cosmic forces that influence your destiny. When you understand your angel number, you gain a practical spiritual tool that helps you navigate life with greater clarity and purpose.
                </p>

                <div>
                  <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>How Angel Numbers Are Calculated</h3>
                  <p style={{ marginBottom:"12px" }}>
                    Your angel number comes from your full date of birth using a precise mathematical process that has been used in Vedic tradition for thousands of years. Every digit in your birth date — day, month, and year — is added together to create a sum. This sum is then reduced to a single digit by adding its digits again. This process repeats until you reach a number between 1 and 9. The only exceptions are the master numbers 11, 22, and 33. These are never reduced further because they carry special spiritual significance and represent higher vibrational frequencies that connect directly to divine consciousness.
                  </p>
                  <p style={{ background:"rgba(236,72,153,0.1)", padding:"16px", borderRadius:"12px", borderLeft:"4px solid #ec4899" }}>
                    <strong>Example:</strong> If you were born on 15 August 1995, you add 1+5+0+8+1+9+9+5 which equals 38, then 3+8 equals 11. So your angel number is 11, a master number that signifies intuitive vision and spiritual leadership.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>Angel Numbers vs Western Numerology</h3>
                  <p>
                    Many people confuse Vedic numerology with Western numerology. While both systems use birth date calculations, they differ in one important way. Western numerology assigns personality archetypes to each number and stops there. Vedic numerology goes further by connecting each number to a specific planet, a deity, a set of daily remedies, and a karmic life lesson. This means your Vedic angel number is not just a personality description — it is a living practice. It tells you which planet governs your soul, which gemstone strengthens your energy, which mantra activates your potential, and which day of the week is most powerful for you to take action.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>The 9 Angel Numbers — Deep Meanings and Planetary Rulers</h3>
                  <p style={{ marginBottom:"16px" }}>
                    Each number from 1 to 9 carries a unique vibration governed by a specific Vedic planet. Understanding your number in depth helps you work with its energy consciously rather than being unconsciously driven by it.
                  </p>
                  
                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 1 is ruled by the Sun, known as Surya in Sanskrit.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      People with this number are natural leaders with strong willpower and a pioneering spirit. They are born to initiate, build, and inspire others. Their greatest challenge is learning to collaborate without controlling. Their highest expression is becoming a leader who empowers rather than dominates.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 2 is ruled by the Moon, known as Chandra.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      These individuals are deeply empathetic, intuitive, and emotionally intelligent. They thrive in partnerships and feel most fulfilled when nurturing others. Their challenge is setting emotional boundaries and not absorbing others' energy. At their best, they become gifted healers, counselors, and peacemakers.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 3 is ruled by Jupiter, known as Guru or Brihaspati.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      This is the number of wisdom, optimism, and expansion. Number 3 people have a natural gift for teaching, writing, and inspiring others with their enthusiasm. Their challenge is staying focused and not scattering their energy across too many interests. Their highest potential is becoming a teacher or guide who transforms lives.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 4 is ruled by Rahu, the north node of the Moon.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      This is the number of transformation and unconventional thinking. Number 4 people are ambitious, innovative, and often ahead of their time. They break traditions and challenge the status quo. Their challenge is managing obsessive thinking and staying grounded. At their best they become visionaries who build entirely new systems and ideas.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 5 is ruled by Mercury, known as Budha.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      This is the number of communication, intelligence, and adaptability. Number 5 people are quick thinkers, natural communicators, and lifelong learners. They thrive in environments that offer variety and stimulation. Their challenge is committing to one path long enough to master it. Their highest expression is becoming a brilliant communicator who connects people and ideas.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 6 is ruled by Venus, known as Shukra.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      This is the number of love, beauty, and harmony. Number 6 people have a deep appreciation for art, relationships, and the finer things in life. They are natural peacemakers and caregivers. Their challenge is avoiding co-dependency and learning to receive love as freely as they give it. At their best they create beauty, harmony, and deep connection wherever they go.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 7 is ruled by Ketu, the south node of the Moon.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      This is the most spiritual number in Vedic numerology. Number 7 people are introspective, analytical, and drawn to mysticism and deeper truth. They often feel different from others and need significant time alone to recharge. Their challenge is avoiding isolation and trusting others enough to share their inner world. Their highest potential is becoming a profound spiritual teacher or researcher who reveals hidden truths.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 8 is ruled by Saturn, known as Shani.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      This is the number of karma, discipline, and achievement through hard work. Number 8 people are responsible, ambitious, and capable of building lasting structures in the material world. Their path is rarely easy, but their rewards are significant and lasting. Their challenge is avoiding the extremes of either working themselves to exhaustion or feeling defeated by obstacles. At their best they become powerful builders of empires, institutions, and legacies.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 9 is ruled by Mars, known as Mangal.</h4>
                    <p style={{ marginBottom:"16px" }}>
                      This is the number of courage, passion, and completion. Number 9 people are energetic, brave, and deeply driven by a sense of justice. They often feel called to fight for causes larger than themselves. Their challenge is managing anger and learning when to let go rather than push harder. Their highest expression is becoming a courageous leader and protector who uses their strength in service of others.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>Master Numbers 11, 22, and 33</h3>
                  <p style={{ marginBottom:"12px" }}>
                    Master numbers carry amplified energy and greater spiritual responsibility. People with these numbers often feel a stronger calling toward spiritual work, healing, or large-scale creation. However they also carry greater challenges and life lessons that must be mastered before their full potential can be expressed.
                  </p>
                  
                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 11 is the intuitive visionary.</h4>
                    <p style={{ marginBottom:"12px" }}>
                      It connects to spiritual insight, psychic abilities, and divine inspiration. These individuals often serve as bridges between the physical and spiritual realms and are here to illuminate truth for others.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 22 is the master builder.</h4>
                    <p style={{ marginBottom:"12px" }}>
                      It represents the ability to manifest grand visions into physical reality. These individuals can transform abstract ideas into tangible structures that serve humanity on a large scale.
                    </p>
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"#ec4899" }}>Number 33 is the master teacher.</h4>
                    <p style={{ marginBottom:"12px" }}>
                      It embodies universal love, compassion, and service. These individuals often become spiritual guides, healers, and teachers who uplift collective consciousness simply by living authentically.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>Vedic Remedies — Why They Work</h3>
                  <p>
                    In Vedic astrology, each planet has associated colors, stones, mantras, and rituals that create energetic resonance with cosmic forces. When your ruling planet is weak or under stress in your birth chart, simple daily remedies help balance its energy and strengthen its positive influence in your life. These remedies work on the principle of sympathetic resonance — like attracts like. By wearing your lucky stone, chanting your planet's mantra, or making a small donation on your planet's day, you create a vibrational harmony that aligns you with your ruling planet's highest expression. The effectiveness of these remedies depends on consistent daily practice rather than one-time grand gestures.
                  </p>
                </div>


                <div>
                  <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>Angel Numbers in Daily Life</h3>
                  <p>
                    Many people notice they repeatedly see a specific number on clocks, receipts, license plates, or phone numbers. In Vedic thought this is not coincidence but divine communication from your ruling planet. These synchronicities often occur during important life transitions or when you are facing significant decisions. If you keep seeing your angel number during a difficult period, it is a cosmic reminder to apply the remedies and qualities associated with that number. The timing and context of these appearances carries additional meaning. Seeing your number in the morning may indicate the energy available for that day, while seeing it during moments of doubt may be confirmation that you are on the right path.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>The Connection Between Angel Numbers and Karma</h3>
                  <p>
                    In Vedic philosophy your angel number represents your karmic blueprint and the specific lessons you are here to master in this lifetime. Each number carries both blessings and challenges that reflect your soul's evolutionary journey. Understanding your angel number helps you recognize patterns in your life, relationships, and career choices that align with your karmic path. By working consciously with your number's energy, you can accelerate your spiritual growth and transform challenges into opportunities for advancement.
                  </p>
                </div>

                <div style={{ padding:"20px", background:"linear-gradient(135deg, rgba(236,72,153,0.1), rgba(190,24,93,0.05))", borderRadius:"12px", border:"1px solid rgba(236,72,153,0.2)", marginTop:"32px" }}>
                  <p style={{ margin:0, fontStyle:"italic", textAlign:"center" }}>
                    Your angel number is a starting point, not a destiny. Vedic numerology gives you a map, but you walk the road. Use the remedies as daily anchors, reflect on your traits honestly, and treat your ruling planet as a teacher rather than a judge. The journey of self-discovery through your angel number is lifelong, with each day offering new opportunities to deepen your understanding and step into your highest potential.
                  </p>
                </div>
              </div>

            </div>{/* end #guide */}
          </div>{/* end maxWidth:900px main */}

        </div>{/* end zIndex:1 content wrapper */}
      </div>{/* end anc-root */}
    </>
  );
};

export default AngelNumberCalculator;
