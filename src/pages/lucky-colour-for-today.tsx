import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles, Palette, Loader2, Star, ChevronRight, Calendar,
} from "lucide-react";

interface BirthDetails {
  name: string;
  day: number;
  month: number;
  year: number;
}

interface LuckyColourResult {
  colour: string;
  colourHex: string;
  planet: string;
  planetVedic: string;
  dayName: string;
  meaning: string;
  benefits: string[];
  whenToWear: string[];
  astrology: string;
  date: string;
}

// Date validation helper
const isValidDate = (day: number, month: number, year: number): boolean => {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

// Planetary colours by day - Comprehensive variety
const planetaryColours = [
  {
    day: "Sunday",
    planet: "Sun",
    planetVedic: "Surya",
    colours: [
      { name: "Gold", hex: "#FFD700", meaning: "Prosperity and success" },
      { name: "Orange", hex: "#FFA500", meaning: "Energy and enthusiasm" },
      { name: "DarkOrange", hex: "#FF8C00", meaning: "Ambition and creativity" },
      { name: "Coral", hex: "#FF7F50", meaning: "Joy and vitality" },
      { name: "Tomato", hex: "#FF6347", meaning: "Passion and confidence" },
      { name: "OrangeRed", hex: "#FF4500", meaning: "Power and determination" },
      { name: "Goldenrod", hex: "#DAA520", meaning: "Wealth and abundance" },
      { name: "DarkGoldenrod", hex: "#B8860B", meaning: "Wisdom and achievement" },
      { name: "LightSalmon", hex: "#FFA07A", meaning: "Gentle strength" },
      { name: "Salmon", hex: "#FA8072", meaning: "Health and vitality" }
    ]
  },
  {
    day: "Monday",
    planet: "Moon",
    planetVedic: "Chandra",
    colours: [
      { name: "White", hex: "#FFFFFF", meaning: "Purity and clarity" },
      { name: "Silver", hex: "#C0C0C0", meaning: "Intuition and psychic ability" },
      { name: "LightGray", hex: "#D3D3D3", meaning: "Peace and tranquility" },
      { name: "Gainsboro", hex: "#DCDCDC", meaning: "Emotional balance" },
      { name: "AliceBlue", hex: "#F0F8FF", meaning: "Spiritual connection" },
      { name: "GhostWhite", hex: "#F8F8FF", meaning: "Divine guidance" },
      { name: "Snow", hex: "#FFFAFA", meaning: "Innocence and new beginnings" },
      { name: "MintCream", hex: "#F5FFFA", meaning: "Healing and renewal" },
      { name: "Azure", hex: "#F0FFFF", meaning: "Clarity of mind" },
      { name: "Ivory", hex: "#FFFFF0", meaning: "Gentle nurturing" }
    ]
  },
  {
    day: "Tuesday",
    planet: "Mars",
    planetVedic: "Mangal",
    colours: [
      { name: "Red", hex: "#FF0000", meaning: "Courage and action" },
      { name: "Crimson", hex: "#DC143C", meaning: "Leadership and power" },
      { name: "FireBrick", hex: "#B22222", meaning: "Strength and endurance" },
      { name: "DarkRed", hex: "#8B0000", meaning: "Protection and defense" },
      { name: "IndianRed", hex: "#CD5C5C", meaning: "Grounded energy" },
      { name: "LightCoral", hex: "#F08080", meaning: "Gentle passion" },
      { name: "DarkSalmon", hex: "#E9967A", meaning: "Balanced aggression" },
      { name: "DeepPink", hex: "#FF1493", meaning: "Intense emotions" },
      { name: "HotPink", hex: "#FF69B4", meaning: "Dynamic energy" },
      { name: "MediumVioletRed", hex: "#C71585", meaning: "Creative power" }
    ]
  },
  {
    day: "Wednesday",
    planet: "Mercury",
    planetVedic: "Budha",
    colours: [
      { name: "Green", hex: "#008000", meaning: "Communication and growth" },
      { name: "Lime", hex: "#00FF00", meaning: "Fresh ideas and innovation" },
      { name: "LimeGreen", hex: "#32CD32", meaning: "Youthful energy" },
      { name: "ForestGreen", hex: "#228B22", meaning: "Deep wisdom" },
      { name: "SeaGreen", hex: "#2E8B57", meaning: "Adaptability and change" },
      { name: "MediumSeaGreen", hex: "#3CB371", meaning: "Balanced communication" },
      { name: "SpringGreen", hex: "#00FF7F", meaning: "New beginnings" },
      { name: "LawnGreen", hex: "#7CFC00", meaning: "Natural harmony" },
      { name: "Chartreuse", hex: "#7FFF00", meaning: "Mental clarity" },
      { name: "GreenYellow", hex: "#ADFF2F", meaning: "Intellectual growth" }
    ]
  },
  {
    day: "Thursday",
    planet: "Jupiter",
    planetVedic: "Guru/Brihaspati",
    colours: [
      { name: "Yellow", hex: "#FFFF00", meaning: "Wisdom and knowledge" },
      { name: "Gold", hex: "#FFD700", meaning: "Prosperity and success" },
      { name: "LightYellow", hex: "#FFFFE0", meaning: "Optimism and joy" },
      { name: "LemonChiffon", hex: "#FFFACD", meaning: "Mental clarity" },
      { name: "LightGoldenrodYellow", hex: "#FAFAD2", meaning: "Abundance and growth" },
      { name: "PapayaWhip", hex: "#FFEFD5", meaning: "Nourishment and care" },
      { name: "Moccasin", hex: "#FFE4B5", meaning: "Comfort and stability" },
      { name: "PeachPuff", hex: "#FFDAB9", meaning: "Gentle expansion" },
      { name: "PaleGoldenrod", hex: "#EEE8AA", meaning: "Subtle wisdom" },
      { name: "Khaki", hex: "#F0E68C", meaning: "Practical knowledge" }
    ]
  },
  {
    day: "Friday",
    planet: "Venus",
    planetVedic: "Shukra",
    colours: [
      { name: "Pink", hex: "#FFC0CB", meaning: "Love and romance" },
      { name: "LightPink", hex: "#FFB6C1", meaning: "Gentle affection" },
      { name: "HotPink", hex: "#FF69B4", meaning: "Passionate love" },
      { name: "DeepPink", hex: "#FF1493", meaning: "Intense emotions" },
      { name: "PaleVioletRed", hex: "#DB7093", meaning: "Spiritual love" },
      { name: "Lavender", hex: "#E6E6FA", meaning: "Beauty and grace" },
      { name: "Thistle", hex: "#D8BFD8", meaning: "Gentle beauty" },
      { name: "Plum", hex: "#DDA0DD", meaning: "Creative expression" },
      { name: "Orchid", hex: "#DA70D6", meaning: "Artistic sensuality" },
      { name: "MediumOrchid", hex: "#BA55D3", meaning: "Refined beauty" }
    ]
  },
  {
    day: "Saturday",
    planet: "Saturn",
    planetVedic: "Shani",
    colours: [
      { name: "Black", hex: "#000000", meaning: "Discipline and focus" },
      { name: "Navy", hex: "#000080", meaning: "Authority and structure" },
      { name: "DarkBlue", hex: "#00008B", meaning: "Deep wisdom" },
      { name: "MediumBlue", hex: "#0000CD", meaning: "Stability and order" },
      { name: "Blue", hex: "#0000FF", meaning: "Truth and responsibility" },
      { name: "DarkSlateBlue", hex: "#483D8B", meaning: "Serious discipline" },
      { name: "SlateBlue", hex: "#6A5ACD", meaning: "Structured wisdom" },
      { name: "MediumSlateBlue", hex: "#7B68EE", meaning: "Balanced authority" },
      { name: "SteelBlue", hex: "#4682B4", meaning: "Endurance and strength" },
      { name: "RoyalBlue", hex: "#4169E1", meaning: "Noble leadership" }
    ]
  }
];

const LuckyColourForToday = () => {
  const navigate = useNavigate();
  
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "", day: 1, month: 1, year: 2000,
  });
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [result, setResult] = useState<LuckyColourResult | null>(null);
  const [error, setError] = useState<string>("");
  const [todayDate, setTodayDate] = useState<string>(() => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const formattedDate = `${month} ${now.getDate()}, ${year}`;
    return formattedDate;
  });
  const [todayDateISO, setTodayDateISO] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [todayDayIndex, setTodayDayIndex] = useState<number>(() => new Date().getDay());
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getDate() + ', ' + now.getFullYear();
      const iso = now.toISOString().split('T')[0];
      const dayIdx = now.getDay();
      setTodayDate(formatted);
      setTodayDateISO(iso);
      setTodayDayIndex(dayIdx);
    };

    const interval = setInterval(updateDate, 60000);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - Date.now();

    let innerIntervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      updateDate();
      innerIntervalId = setInterval(updateDate, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
      clearInterval(innerIntervalId);
    };
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    {v:1,l:"January"},{v:2,l:"February"},{v:3,l:"March"},{v:4,l:"April"},
    {v:5,l:"May"},{v:6,l:"June"},{v:7,l:"July"},{v:8,l:"August"},
    {v:9,l:"September"},{v:10,l:"October"},{v:11,l:"November"},{v:12,l:"December"},
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const calculateLuckyColour = async () => {
    setError("");
    setIsCalculating(true);

    // Validate date
    if (!isValidDate(birthDetails.day, birthDetails.month, birthDetails.year)) {
      setError("Please enter a valid date of birth");
      setIsCalculating(false);
      return;
    }

    // Simulate calculation delay (reduced from 2000ms to 800ms)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get today's planetary data
    const todayPlanetaryData = planetaryColours[todayDayIndex];
    
    // Generate personalized seed based on birth details and name
    const nameValue = birthDetails.name.length > 0
      ? birthDetails.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      : 1;
    const seed = ((birthDetails.day * 31 + birthDetails.month) * 12 + (birthDetails.year % 97) + todayDayIndex * 7) * nameValue;
    const colourIndex = Math.floor((seed * 7 + todayDayIndex * 3) % todayPlanetaryData.colours.length);
    const selectedColour = todayPlanetaryData.colours[colourIndex];

    const colourBasedBenefits = {
      "Gold": ["Prosperity and financial success", "Leadership opportunities", "Confidence in decision-making"],
      "Red": ["Courage and strength", "Protection from enemies", "Victory in competitions"],
      "Green": ["Growth and new opportunities", "Healing and health", "Harmony in relationships"],
      "Blue": ["Peace and tranquility", "Spiritual growth", "Success in education"],
      "Pink": ["Love and romance", "Beauty and attraction", "Happy relationships"],
      "Orange": ["Energy and enthusiasm", "Success in business", "Creative inspiration"],
      "White": ["Purity and clarity", "Spiritual connection", "New beginnings"],
      "Black": ["Discipline and focus", "Protection from negative energy", "Authority and power"],
      "Silver": ["Intuition and psychic abilities", "Emotional balance", "Wisdom and experience"],
      "Purple": ["Spiritual awakening", "Royal connections", "Creative genius"],
      "Yellow": ["Knowledge and learning", "Good fortune and luck", "Intellectual growth"]
    };

    const colourBasedWhenToWear = {
      "Gold": ["Important meetings and presentations", "Financial negotiations", "Investment decisions", "Leadership opportunities"],
      "Red": ["Competitive events", "Physical training", "Sports competitions", "Legal proceedings"],
      "Green": ["Job interviews", "Educational pursuits", "Health-related activities", "Environmental initiatives"],
      "Blue": ["Academic presentations", "Research work", "Study sessions", "Professional conferences"],
      "Pink": ["Social gatherings", "Romantic dates", "Wedding ceremonies", "Creative workshops"],
      "Orange": ["Business meetings", "Sales presentations", "Marketing events", "Product launches"],
      "White": ["Medical appointments", "Therapy sessions", "Spiritual practices", "Religious ceremonies"],
      "Black": ["Formal events", "Legal matters", "Important negotiations", "Disciplinary actions"],
      "Silver": ["Intuitive work", "Creative brainstorming", "Psychological counseling", "Meditation practices"],
      "Purple": ["Artistic performances", "Spiritual workshops", "Creative writing sessions", "Mystery-solving activities"],
      "Yellow": ["Educational seminars", "Teaching sessions", "Study groups", "Intellectual discussions", "Learning workshops"]
    };

    const selectedBenefits = colourBasedBenefits[selectedColour.name] || [
      "Enhanced intuition and spiritual awareness",
      "Improved decision-making abilities",
      "Better emotional balance and harmony"
    ];
    const selectedWhenToWear = colourBasedWhenToWear[selectedColour.name] || [
      "Important meetings and presentations",
      "Starting new projects or ventures",
      "Social gatherings and events"
    ];

    const result: LuckyColourResult = {
      colour: selectedColour.name,
      colourHex: selectedColour.hex,
      planet: todayPlanetaryData.planet,
      planetVedic: todayPlanetaryData.planetVedic,
      dayName: todayPlanetaryData.day,
      meaning: selectedColour.meaning,
      benefits: selectedBenefits,
      whenToWear: selectedWhenToWear,
      astrology: `According to Vedic astrology, ${todayPlanetaryData.day} is ruled by ${todayPlanetaryData.planetVedic}. The colour ${selectedColour.name} resonates with ${todayPlanetaryData.planet}'s energy, helping you align with the cosmic frequencies of the day. This colour therapy (Rang Chikitsa) has been used in Jyotish for centuries to balance planetary influences and enhance positive outcomes.`,
      date: todayDate
    };

    setResult(result);
    setIsCalculating(false);
  };

  return (
    <>
      <Helmet>
        <title>Lucky Colour for Today by Date of Birth — {todayDate} | Veadicastro</title>
        <meta name="description" content="Find your lucky colour for today by date of birth using Vedic astrology and planetary positions. Get personalized colour recommendations updated daily with cosmic insights based on your birth details." />
        <meta name="keywords" content="lucky colour today, daily colour astrology, Vedic astrology colours, planetary colours, colour therapy Jyotish, rang chikitsa, today's lucky colour" />
        <link rel="canonical" href="https://veadicastro.in/lucky-colour-for-today" />
        <meta name="robots" content="index, follow" />
        
        {/* WebApplication Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Lucky Colour for Today",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
            "description": "Find your lucky colour today based on Vedic astrology",
            "url": "https://veadicastro.in/lucky-colour-for-today"
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
                "name": "What is my lucky colour today?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your lucky colour for today is calculated based on Vedic astrology using your birth details and the current day's ruling planet. Each day of the week is governed by a specific planet, and each planet has associated colours that bring positive energy."
                }
              },
              {
                "@type": "Question",
                "name": "What colour should I wear on Monday?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Monday is ruled by the Moon, making white, silver, and light colours most auspicious. These colours promote emotional balance, intuition, and mental clarity throughout the day."
                }
              },
              {
                "@type": "Question",
                "name": "How is lucky colour calculated in Vedic astrology?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Vedic astrology calculates lucky colours based on planetary rulership of days, birth chart analysis, and colour therapy (Rang Chikitsa) principles. The calculation considers your birth details, current planetary positions, and traditional colour associations."
                }
              },
              {
                "@type": "Question",
                "name": "How does date of birth affect lucky colour calculation?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your date of birth is crucial for calculating your lucky colour as it determines your birth chart planetary positions and creates a personalized seed for calculation. When combined with today's ruling planet, this creates a unique colour recommendation specifically for you."
                }
              },
              {
                "@type": "Question",
                "name": "What colour should I wear today according to astrology?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Astrology suggests wearing colours that align with today's ruling planet and your birth chart. Use our lucky colour calculator to find your personalized colour recommendation based on your date of birth and current planetary positions."
                }
              }
            ]
          })}
        </script>
        
        {/* Open Graph */}
        <meta property="og:title" content="Lucky Colour for Today | Daily Colour Astrology" />
        <meta property="og:description" content="Discover your lucky colour for today based on Vedic astrology principles. Personalized colour recommendations updated daily." />
        <meta property="og:url" content="https://veadicastro.in/lucky-colour-for-today" />
        <meta property="og:type" content="website" />
        
        {/* Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "What Is Your Lucky Colour Today by Date of Birth? Here's What Astrology Actually Says",
            "author": {
              "@type": "Person",
              "name": "Arpit Uniyal"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Veadicastro",
              "url": "https://veadicastro.in"
            },
            "datePublished": todayDateISO,
            "dateModified": todayDateISO,
            "url": "https://veadicastro.in/lucky-colour-for-today#guide"
          })}
        </script>
        
        {/* Additional SEO */}
        <meta name="author" content="Veadicastro" />
        <meta name="theme-color" content="#0a0a0f" />
      </Helmet>

      <div className="anc-root" style={{
        minHeight:"100vh",
        background:"linear-gradient(135deg, #0a0a0f 0%, #1a1020 50%, #0a0a0f 100%)",
        color:"rgba(255,255,255,0.9)",
        position:"relative",
        overflow:"hidden"
      }}>
        {/* Background Effects */}
        <div style={{
          position:"absolute",
          top:"10%",
          left:"5%",
          width:"300px",
          height:"300px",
          background:"radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          borderRadius:"50%",
          filter:"blur(60px)",
          animation:"float 6s ease-in-out infinite"
        }} />
        <div style={{
          position:"absolute",
          bottom:"15%",
          right:"5%",
          width:"250px",
          height:"250px",
          background:"radial-gradient(circle, rgba(190,24,93,0.12) 0%, transparent 70%)",
          borderRadius:"50%",
          filter:"blur(50px)",
          animation:"float 8s ease-in-out infinite reverse"
        }} />

        <div style={{ position:"relative", zIndex:1, maxWidth:"900px", margin:"0 auto", padding:"40px 20px" }}>
          
          {/* Header with Date */}
          <div style={{ textAlign:"center", marginBottom:"40px" }}>
            <div style={{
              display:"inline-flex",
              alignItems:"center",
              gap:"12px",
              background:"rgba(255,255,255,0.05)",
              padding:"12px 24px",
              borderRadius:"100px",
              border:"1px solid rgba(255,255,255,0.1)",
              marginBottom:"20px"
            }}>
              <Calendar style={{ width:"18px", height:"18px", color:"rgba(255,255,255,0.6)" }} />
              <span style={{ fontSize:"16px", fontWeight:500, color:"rgba(255,255,255,0.8)" }}>
                Today: {todayDate}
              </span>
            </div>
            
            <h1 className="anc-serif" style={{ 
              fontSize:"clamp(32px, 5vw, 48px)", 
              fontWeight:700, 
              marginBottom:"16px", 
              background:"linear-gradient(135deg, #ec4899, #be185d)",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text"
            }}>
              Your Lucky Colour for Today by Date of Birth
            </h1>
            
            <p style={{ 
              fontSize:"18px", 
              color:"rgba(255,255,255,0.7)", 
              maxWidth:"600px", 
              margin:"0 auto",
              lineHeight:1.6
            }}>
              Discover your personalized lucky colour based on Vedic astrology and today's planetary alignments
            </p>
          </div>

          {/* Tool Section */}
          {!result ? (
            <div className="anc-glass" style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:"20px",
              padding:"32px",
              backdropFilter:"blur(20px)",
              marginBottom:"40px"
            }}>
              <div style={{ textAlign:"center", marginBottom:"32px" }}>
                <div style={{
                  display:"inline-flex",
                  alignItems:"center",
                  justifyContent:"center",
                  width:"64px",
                  height:"64px",
                  borderRadius:"50%",
                  background:"linear-gradient(135deg, rgba(236,72,153,0.2), rgba(190,24,93,0.1))",
                  marginBottom:"16px"
                }}>
                  <Palette style={{ width:"32px", height:"32px", color:"#ec4899" }} />
                </div>
                <h2 className="anc-serif" style={{ fontSize:"24px", fontWeight:600, marginBottom:"8px", color:"white" }}>
                  Enter Your Birth Details
                </h2>
                <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px" }}>
                  We'll calculate your lucky colour based on your birth chart and today's astrology
                </p>
              </div>

              <div style={{ display:"grid", gap:"20px", maxWidth:"400px", margin:"0 auto" }}>
                <div>
                  <label style={{ display:"block", fontSize:"14px", fontWeight:500, marginBottom:"8px", color:"rgba(255,255,255,0.8)" }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={birthDetails.name}
                    onChange={(e) => setBirthDetails({...birthDetails, name: e.target.value})}
                    placeholder="Enter your name"
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:"12px",
                      border:"1px solid rgba(255,255,255,0.2)",
                      background:"rgba(255,255,255,0.05)",
                      color:"white",
                      fontSize:"16px",
                      transition:"all 0.2s"
                    }}
                  />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))", gap:"12px" }}>
                  <div>
                    <label style={{ display:"block", fontSize:"14px", fontWeight:500, marginBottom:"8px", color:"rgba(255,255,255,0.8)" }}>
                      Day
                    </label>
                    <select
                      name="birthDay"
                      value={birthDetails.day}
                      onChange={(e) => setBirthDetails({...birthDetails, day: parseInt(e.target.value)})}
                      style={{
                        width:"100%",
                        padding:"12px",
                        borderRadius:"12px",
                        border:"1px solid rgba(255,255,255,0.2)",
                        background:"rgba(255,255,255,0.1)",
                        color:"white",
                        fontSize:"16px",
                        cursor:"pointer"
                      }}
                    >
                      {days.map(d => <option key={d} value={d} style={{ background:"#1a1020", color:"white" }}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display:"block", fontSize:"14px", fontWeight:500, marginBottom:"8px", color:"rgba(255,255,255,0.8)" }}>
                      Month
                    </label>
                    <select
                      name="birthMonth"
                      value={birthDetails.month}
                      onChange={(e) => setBirthDetails({...birthDetails, month: parseInt(e.target.value)})}
                      style={{
                        width:"100%",
                        padding:"12px",
                        borderRadius:"12px",
                        border:"1px solid rgba(255,255,255,0.2)",
                        background:"rgba(255,255,255,0.1)",
                        color:"white",
                        fontSize:"16px",
                        cursor:"pointer"
                      }}
                    >
                      {months.map(m => <option key={m.v} value={m.v} style={{ background:"#1a1020", color:"white" }}>{m.l}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display:"block", fontSize:"14px", fontWeight:500, marginBottom:"8px", color:"rgba(255,255,255,0.8)" }}>
                      Year
                    </label>
                    <select
                      name="birthYear"
                      value={birthDetails.year}
                      onChange={(e) => setBirthDetails({...birthDetails, year: parseInt(e.target.value)})}
                      style={{
                        width:"100%",
                        padding:"12px",
                        borderRadius:"12px",
                        border:"1px solid rgba(255,255,255,0.2)",
                        background:"rgba(255,255,255,0.1)",
                        color:"white",
                        fontSize:"16px",
                        cursor:"pointer"
                      }}
                    >
                      {years.map(y => <option key={y} value={y} style={{ background:"#1a1020", color:"white" }}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {error && (
                  <div style={{
                    padding:"12px",
                    background:"rgba(239,68,68,0.1)",
                    border:"1px solid rgba(239,68,68,0.3)",
                    borderRadius:"8px",
                    color:"#ef4444",
                    fontSize:"14px",
                    textAlign:"center"
                  }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={calculateLuckyColour}
                  disabled={isCalculating}
                  aria-label="Calculate your lucky colour for today"
                  style={{
                    width:"100%",
                    height:"48px",
                    borderRadius:"12px",
                    border:"none",
                    color:"white",
                    fontWeight:600,
                    fontSize:"16px",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:"8px",
                    cursor:isCalculating?"not-allowed":"pointer",
                    opacity:isCalculating?0.55:1,
                    transition:"opacity 0.2s",
                    background:"linear-gradient(135deg, #ec4899, #be185d)"
                  }}
                >
                  {isCalculating
                    ? <><Loader2 className="anc-spin" style={{ width:"16px", height:"16px" }} /> Calculating Your Lucky Colour…</>
                    : <>Reveal My Lucky Colour</>}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"24px", marginBottom:"40px" }}>
              {/* Colour Display */}
              <div className="anc-glass" style={{
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"20px",
                padding:"32px",
                backdropFilter:"blur(20px)",
                textAlign:"center"
              }}
              aria-live="polite"
              >
                <div style={{
                  display:"inline-flex",
                  alignItems:"center",
                  gap:"16px",
                  marginBottom:"24px"
                }}>
                  <div style={{
                    width:"80px",
                    height:"80px",
                    borderRadius:"50%",
                    background:result.colourHex,
                    border:"3px solid rgba(255,255,255,0.2)",
                    boxShadow:`0 0 40px ${result.colourHex}40`
                  }} />
                  <div style={{ textAlign:"left" }}>
                    <h2 className="anc-serif" style={{ fontSize:"28px", fontWeight:700, marginBottom:"4px", color:"white" }}>
                      {result.colour}
                    </h2>
                    <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px" }}>
                      {new Date(todayDateISO).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background:"rgba(150, 47, 47, 0.05)",
                  padding:"16px",
                  borderRadius:"12px",
                  marginBottom:"20px"
                }}>
                  <p style={{ margin:0, color:"rgba(255,255,255,0.8)", fontSize:"16px", lineHeight:1.6 }}>
                    {result.meaning}
                  </p>
                </div>

                <button
                  onClick={() => setResult(null)}
                  style={{
                    padding:"10px 20px",
                    borderRadius:"8px",
                    border:"1px solid rgba(255,255,255,0.2)",
                    background:"rgba(255,255,255,0.05)",
                    color:"rgba(255,255,255,0.8)",
                    fontSize:"14px",
                    cursor:"pointer",
                    transition:"all 0.2s"
                  }}
                >
                  Calculate Again
                </button>
                
                {/* Share Button */}
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/lucky-colour-for-today?dob=${birthDetails.day}-${birthDetails.month}-${birthDetails.year}&result=${result.colour.toLowerCase()}`;
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    padding:"10px 20px",
                    borderRadius:"8px",
                    border:"1px solid rgba(236,72,153,0.3)",
                    background:"linear-gradient(135deg, rgba(236,72,153,0.1), rgba(190,24,93,0.1))",
                    color:"#ec4899",
                    fontSize:"14px",
                    cursor:"pointer",
                    transition:"all 0.2s",
                    marginLeft:"10px"
                  }}
                >
                {copied ? "✓ Link Copied!" : "Share My Colour"}
                </button>
              </div>

              {/* Benefits Section */}
              <div className="anc-glass" style={{
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"20px",
                padding:"32px",
                backdropFilter:"blur(20px)"
              }}>
                <h3 className="anc-serif" style={{ fontSize:"20px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>
                  Benefits of {result.colour} Today
                </h3>
                <ul style={{ margin:0, paddingLeft:"20px", color:"rgba(255,255,255,0.8)", lineHeight:1.8 }}>
                  {result.benefits.map((benefit, index) => (
                    <li key={index} style={{ marginBottom:"8px" }}>{benefit}</li>
                  ))}
                </ul>
              </div>

              {/* When to Wear */}
              <div className="anc-glass" style={{
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"20px",
                padding:"32px",
                backdropFilter:"blur(20px)"
              }}>
                <h3 className="anc-serif" style={{ fontSize:"20px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>
                  Best Times to Wear This Colour
                </h3>
                <ul style={{ margin:0, paddingLeft:"20px", color:"rgba(255,255,255,0.8)", lineHeight:1.8 }}>
                  {result.whenToWear.map((when, index) => (
                    <li key={index} style={{ marginBottom:"8px" }}>{when}</li>
                  ))}
                </ul>
              </div>

              {/* Astrology Insight */}
              <div className="anc-glass" style={{
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"20px",
                padding:"32px",
                backdropFilter:"blur(20px)"
              }}>
                <h3 className="anc-serif" style={{ fontSize:"20px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>
                  Astrological Insight
                </h3>
                <p style={{ margin:0, color:"rgba(255,255,255,0.8)", fontSize:"16px", lineHeight:1.7 }}>
                  {result.astrology}
                </p>
              </div>
            </div>
          )}

          {/* Blog Content */}
          <div id="guide" style={{ maxWidth:"768px", margin:"56px auto 0", padding:"0 16px" }}>
            <h2 className="anc-serif" style={{ fontSize:"28px", fontWeight:700, marginBottom:"20px", color:"#ec4899" }}>
              What Is Your Lucky Colour Today by Date of Birth? Here's What Astrology Actually Says About It
            </h2>
            <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.6)", marginBottom:"24px" }}>
              By Arpit Uniyal | Founder & Vedic Astrology Expert | {todayDate}
            </p>
            
            <div style={{ display:"flex", flexDirection:"column", gap:"24px", color:"rgba(255,255,255,0.8)", fontSize:"16px", lineHeight:1.7 }}>
              <p>
                I'll be honest — I used to roll my eyes at the whole "lucky colour" thing. It felt like the kind of advice printed on cheap horoscope pamphlets or the back of a matchbox. But then I started digging into Vedic astrology seriously, and somewhere between studying planetary rulerships and talking to practitioners who've been doing this for decades, something clicked.
              </p>
              
              <p>
                Colour isn't decoration. It's vibration. And in astrology — both Vedic and Western — every colour is linked to a planet, every planet governs certain energies, and those energies shift depending on what day it is and where the planets sit in the sky right now.
              </p>
              
              <p>
                So no, your lucky colour isn't random. There's a whole framework behind it. Let me walk you through it.
              </p>

              <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>
                First, Why Do Colours Even Matter in Astrology?
              </h3>
              
              <p>
                The short answer: planets rule colours, and planets rule days.
                Monday is the Moon's day. Tuesday belongs to Mars. Wednesday to Mercury, Thursday to Jupiter, Friday to Venus, Saturday to Saturn, and Sunday back to the Sun. This isn't a modern invention — this planetary week system goes back thousands of years across Hindu, Greek, and Babylonian traditions.
              </p>
              
              <p>
                When you wear or surround yourself with a colour associated with the ruling planet of the day, you're essentially tuning yourself to the dominant frequency of that day. Think of it like a radio signal. You're not creating energy from nothing — you're aligning with what's already there.
              </p>
              
              <p>
                Vedic astrologers (Jyotishis) have used colour therapy, or rang chikitsa, as part of remedial astrology for centuries. It's not a trend. It's ancient, and it's specific.
              </p>

              <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>
                The Colours, Their Planets, and What They Actually Do
              </h3>
              
              <p>
                Let me go through each one properly, because this is where most articles get lazy and just list colours without explaining why they work.
              </p>

              <div style={{ background:"rgba(236,72,153,0.1)", padding:"20px", borderRadius:"12px", margin:"20px 0" }}>
                <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>Red — Mars</h4>
                <p>
                  Red is the colour of Mars, and Mars is about action, courage, drive, and physical energy. On Tuesdays especially, red is considered highly auspicious. But it goes beyond just wearing a red shirt. Red stimulates. It increases blood circulation, raises confidence, and — according to colour psychology studies, not just astrology — genuinely affects how bold and assertive people feel.
                </p>
                <p>
                  If you're going into a negotiation, starting a new project, or need to push past fear, red supports that. Too much red on the wrong day, though — say a calm Moon day like Monday — can make you restless or irritable. Balance matters.
                </p>
              </div>

              <div style={{ background:"rgba(255,215,0,0.1)", padding:"20px", borderRadius:"12px", margin:"20px 0" }}>
                <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"12px", color:"#FFD700" }}>Orange & Saffron — Sun</h4>
                <p>
                  The Sun rules Sundays and governs our soul, ego, vitality, and authority. Saffron and bright orange are its colours. In India, saffron isn't worn casually — it carries deep spiritual weight for a reason. It's the colour of fire, of the divine, of self-mastery.
                </p>
                <p>
                  When you're feeling scattered, low on confidence, or disconnected from your purpose, wearing orange or gold-adjacent tones on a Sunday can genuinely recentre you. There's a reason so many spiritual traditions across the world gravitate to this colour — it commands presence.
                </p>
              </div>

              <div style={{ background:"rgba(192,192,192,0.1)", padding:"20px", borderRadius:"12px", margin:"20px 0" }}>
                <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"12px", color:"#C0C0C0" }}>White & Silver — Moon</h4>
                <p>
                  Monday is Moon's day. White, pearl, and silver are its colours. The Moon governs emotions, intuition, the mind, and our relationship with our mother and home. White doesn't mean empty — it means clarity. It contains all colours, which is why it's associated with the Moon's full range of emotional depth.
                </p>
                <p>
                  If you're feeling emotionally chaotic, overwhelmed, or anxious, there's genuine wisdom in reaching for white clothing or surroundings on a Monday. Hospitals figured this out practically — sterile white creates calm. Astrology knew it first.
                </p>
              </div>

              <div style={{ background:"rgba(80,200,120,0.1)", padding:"20px", borderRadius:"12px", margin:"20px 0" }}>
                <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"12px", color:"#50C878" }}>Green — Mercury</h4>
                <p>
                  Mercury rules Wednesday, and its colour is green — specifically, the bright, fresh green of new leaves. Mercury governs communication, intellect, trade, learning, and wit. Green is growth. It's the colour of balance in nature, sitting right in the middle of the visible spectrum.
                </p>
                <p>
                  Students and writers and business people often find Wednesdays in green tones to be particularly productive. There's also research in environmental psychology showing that green reduces mental fatigue and improves focus. Ancient wisdom, modern data — same conclusion.
                </p>
              </div>

              <div style={{ background:"rgba(255,204,0,0.1)", padding:"20px", borderRadius:"12px", margin:"20px 0" }}>
                <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"12px", color:"#FFCC00" }}>Yellow & Gold — Jupiter</h4>
                <p>
                  Thursday belongs to Jupiter, the planet of wisdom, expansion, prosperity, and good fortune. Yellow and gold are its colours. In Vedic tradition, Jupiter is Guru — the teacher — and yellow is considered the most spiritually elevating colour for learning and blessings.
                </p>
                <p>
                  Wearing yellow on Thursdays, particularly a turmeric or mustard shade rather than a neon yellow, is one of the most commonly recommended colour remedies in Jyotish. If you're seeking guidance, studying for exams, or trying to attract abundance — this is the day and the colour.
                </p>
              </div>

              <div style={{ background:"rgba(255,182,193,0.1)", padding:"20px", borderRadius:"12px", margin:"20px 0" }}>
                <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"12px", color:"#FFB6C1" }}>Pink & Pastel — Venus</h4>
                <p>
                  Friday is Venus's day. Venus is love, beauty, pleasure, creativity, relationships, and luxury. Pink, light blue, and soft pastels carry Venus's gentle, harmonious energy.
                </p>
                <p>
                  Friday in soft colours isn't just aesthetically pleasant — it actively supports relationship energy. Wear something pink on a Friday date and you're not just making a fashion choice, you're in sync with planetary timing. That might sound poetic, but Vedic astrologers have prescribed this for marriage-related remedies for generations.
                </p>
              </div>

              <div style={{ background:"rgba(0,0,128,0.1)", padding:"20px", borderRadius:"12px", margin:"20px 0" }}>
                <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"12px", color:"#7B68EE" }}>Blue & Black — Saturn</h4>
                <p>
                  Saturday belongs to Saturn — the planet of discipline, karma, hard work, boundaries, and slowdown. Dark blue, navy, and black are Saturn's colours.
                </p>
                <p>
                  Saturn gets a bad reputation, but it's also the planet of structure and lasting achievement. Wearing dark blue on a Saturday signals seriousness. It's appropriate for focused work, legal matters, administration, or anything that requires patience and precision. Black isn't unlucky — it's protective. It absorbs rather than radiates, which is exactly Saturn's quality.
                </p>
              </div>

              <h3 style={{ fontSize:"20px", fontWeight:600, marginBottom:"12px", color:"#ec4899" }}>
                So How Do You Use This Day to Day?
              </h3>
              
              <p>
                The simplest way is just to keep the ruling planet of the day in mind when you're getting dressed or choosing how you decorate your workspace. You don't have to go head to toe in one colour — even a detail counts. A green notebook on Wednesday. A yellow bookmark when you're studying on Thursday. A red accessory before an important meeting on Tuesday.
              </p>
              
              <p>
                If you want to go deeper, your birth chart matters. Your ascendant (lagna) and your Moon sign determine which colours are most beneficial for you specifically. Someone with a strong Saturn in their chart might actually benefit from more Saturn-blue energy regularly, not just on Saturdays. Someone with a weak Sun might need to lean into orange and gold more intentionally.
              </p>
              
              <p>
                That's where a proper Jyotish reading helps — because the "lucky colour for today" is a starting point, not the whole picture.
              </p>

              <div style={{ padding:"20px", background:"linear-gradient(135deg, rgba(236,72,153,0.1), rgba(190,24,93,0.05))", borderRadius:"12px", border:"1px solid rgba(236,72,153,0.2)", marginTop:"32px" }}>
                <p style={{ margin:0, fontStyle:"italic", textAlign:"center", color:"rgba(255,255,255,0.9)" }}>
                  <strong>Arpit Uniyal</strong> is founder of VeadicAstro and a Vedic astrology researcher passionate about making ancient Jyotish wisdom accessible through technology. Inspired by a family tradition of astrology from Uttarakhand, he writes to help modern readers navigate life's key decisions through the lens of Vedic wisdom.
                </p>
              </div>

              {/* Internal Links */}
              <div style={{ marginTop:"32px", padding:"20px", background:"rgba(255,255,255,0.03)", borderRadius:"12px" }}>
                <h4 style={{ fontSize:"18px", fontWeight:600, marginBottom:"16px", color:"#ec4899" }}>Explore More Astrology Content - </h4>
                <div style={{ display:"grid", gap:"12px" }}>
                  <Link to="/angel-number-calculator" style={{ color:"#ec4899", textDecoration:"none", fontSize:"16px" }}>
                    → Angel Number Calculator: Discover Your Life Path Number
                  </Link>
                  <Link to="/free-kundli-generator" style={{ color:"#ec4899", textDecoration:"none", fontSize:"16px" }}>
                    → Free Kundli Generator: Complete Birth Chart Analysis
                  </Link>
                  <Link to="/free-ai-astrologer-chat" style={{ color:"#ec4899", textDecoration:"none", fontSize:"16px" }}>
                    → Free AI Astrologer Chat: Personalized Guidance
                  </Link>
                  <Link to="/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" style={{ color:"#ec4899", textDecoration:"none", fontSize:"16px" }}>
                    → Yearly Horoscope 2026: Complete Zodiac Predictions
                  </Link>
                  <Link to="/blog/how-ai-is-transforming-vedic-astrology" style={{ color:"#ec4899", textDecoration:"none", fontSize:"16px" }}>
                    → How AI is Transforming Vedic Astrology
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .anc-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .anc-serif {
          font-family: Georgia, serif;
        }
        .anc-glass {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </>
  );
};

export default LuckyColourForToday;