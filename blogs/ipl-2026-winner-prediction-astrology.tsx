import React, { lazy, Suspense, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Calendar, Clock, Star, ChevronRight, UserPlus, ChevronDown, ChevronUp, TrendingUp, Zap, Trophy } from "lucide-react";
import { useAuth } from "../src/context/AuthContext";
import { ButtonLite } from "../src/components/ui/button-lite";
import AdBanner from "../src/components/AdBanner";

const LazyImage = lazy(() => import("../src/components/ui/lazy-image"));

// ─── Team Colors ───────────────────────────────────────────────────────────────
const teamColors: Record<string, string> = {
  MI:   "bg-blue-600/20 text-blue-300 border-blue-500/30",
  RCB:  "bg-red-600/20 text-red-300 border-red-500/30",
  CSK:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  KKR:  "bg-purple-600/20 text-purple-300 border-purple-500/30",
  SRH:  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  RR:   "bg-pink-600/20 text-pink-300 border-pink-500/30",
  GT:   "bg-sky-600/20 text-sky-300 border-sky-500/30",
  LSG:  "bg-teal-600/20 text-teal-300 border-teal-500/30",
  DC:   "bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
  PBKS: "bg-rose-600/20 text-rose-300 border-rose-500/30",
};

const fullTeamName: Record<string, string> = {
  MI:   "Mumbai Indians",
  RCB:  "Royal Challengers Bengaluru",
  CSK:  "Chennai Super Kings",
  KKR:  "Kolkata Knight Riders",
  SRH:  "Sunrisers Hyderabad",
  RR:   "Rajasthan Royals",
  GT:   "Gujarat Titans",
  LSG:  "Lucknow Super Giants",
  DC:   "Delhi Capitals",
  PBKS: "Punjab Kings",
};

type IPLMatch = {
  date: string;
  team1: string;
  team2: string;
  p1: number;
  p2: number;
  planet: string;
  reason?: string;
};

// ─── All Matches ───────────────────────────────────────────────────────────────
const allMatches: IPLMatch[] = [
  { date: "Mar 31", team1: "PBKS", team2: "GT",   p1: 78, p2: 22, planet: "Sun strongly favors PBKS" },
  { date: "Apr 01", team1: "LSG",  team2: "DC",   p1: 52, p2: 48, planet: "Mercury slightly tips LSG" },
  { date: "Apr 02", team1: "KKR",  team2: "SRH",  p1: 51, p2: 49, planet: "Saturn edges KKR" },
  { date: "Apr 03", team1: "CSK",  team2: "PBKS", p1: 54, p2: 46, planet: "Jupiter supports CSK" },
  { date: "Apr 04", team1: "DC",   team2: "MI",   p1: 47, p2: 53, planet: "Saturn favors MI" },
  { date: "Apr 04", team1: "GT",   team2: "RR",   p1: 49, p2: 51, planet: "Venus edges RR" },
  { date: "Apr 05", team1: "SRH",  team2: "LSG",  p1: 50, p2: 50, planet: "Balanced — coin toss" },
  { date: "Apr 05", team1: "RCB",  team2: "CSK",  p1: 55, p2: 45, planet: "Mars fire boosts RCB" },
  { date: "Apr 06", team1: "KKR",  team2: "PBKS", p1: 53, p2: 47, planet: "Saturn supports KKR" },
  { date: "Apr 07", team1: "RR",   team2: "MI",   p1: 48, p2: 52, planet: "Saturn tips MI" },
  { date: "Apr 08", team1: "DC",   team2: "GT",   p1: 50, p2: 50, planet: "Perfect balance — neutral" },
  { date: "Apr 09", team1: "KKR",  team2: "LSG",  p1: 52, p2: 48, planet: "Rahu favors KKR" },
  { date: "Apr 10", team1: "RR",   team2: "RCB",  p1: 49, p2: 51, planet: "Mars edges RCB" },
  { date: "Apr 11", team1: "PBKS", team2: "SRH",  p1: 51, p2: 49, planet: "Sun slightly favors PBKS" },
  { date: "Apr 11", team1: "CSK",  team2: "DC",   p1: 56, p2: 44, planet: "Jupiter strongly supports CSK" },
  { date: "Apr 12", team1: "LSG",  team2: "GT",   p1: 52, p2: 48, planet: "Mercury tips LSG" },
  { date: "Apr 12", team1: "MI",   team2: "RCB",  p1: 50, p2: 50, planet: "Deadlock — Guru-Mangal yoga" },
  { date: "Apr 13", team1: "SRH",  team2: "RR",   p1: 48, p2: 52, planet: "Venus boosts RR" },
  { date: "Apr 14", team1: "CSK",  team2: "KKR",  p1: 53, p2: 47, planet: "Jupiter over Saturn" },
  { date: "Apr 15", team1: "RCB",  team2: "LSG",  p1: 54, p2: 46, planet: "Mars energizes RCB" },
  { date: "Apr 16", team1: "MI",   team2: "PBKS", p1: 55, p2: 45, planet: "Saturn discipline wins" },
  { date: "Apr 17", team1: "GT",   team2: "KKR",  p1: 51, p2: 49, planet: "Rahu influence on GT" },
  { date: "Apr 18", team1: "RCB",  team2: "DC",   p1: 53, p2: 47, planet: "Mars supports RCB" },
  { date: "Apr 18", team1: "SRH",  team2: "CSK",  p1: 49, p2: 51, planet: "Jupiter edges CSK" },
  { date: "Apr 19", team1: "KKR",  team2: "RR",   p1: 50, p2: 50, planet: "Ketu-Rahu standoff" },
  { date: "Apr 19", team1: "PBKS", team2: "LSG",  p1: 52, p2: 48, planet: "Sun tips PBKS" },
  { date: "Apr 20", team1: "GT",   team2: "MI",   p1: 49, p2: 51, planet: "Saturn holds for MI" },
  { date: "Apr 21", team1: "SRH",  team2: "DC",   p1: 53, p2: 47, planet: "Mars favors SRH" },
  { date: "Apr 22", team1: "LSG",  team2: "RR",   p1: 51, p2: 49, planet: "Mercury edges LSG" },
  { date: "Apr 23", team1: "MI",   team2: "CSK",  p1: 52, p2: 48, planet: "Saturn tips MI" },
  { date: "Apr 24", team1: "RCB",  team2: "GT",   p1: 52, p2: 48, planet: "Mars energizes RCB" },
  { date: "Apr 25", team1: "DC",   team2: "PBKS", p1: 49, p2: 51, planet: "Sun slightly tips PBKS" },
  { date: "Apr 25", team1: "RR",   team2: "SRH",  p1: 53, p2: 47, planet: "Venus boosts RR" },
  { date: "Apr 26", team1: "GT",   team2: "CSK",  p1: 50, p2: 50, planet: "Deadlock — Jupiter vs Rahu" },
  { date: "Apr 26", team1: "LSG",  team2: "KKR",  p1: 51, p2: 49, planet: "Mercury edges LSG" },
  { date: "Apr 27", team1: "DC",   team2: "RCB",  p1: 48, p2: 52, planet: "Mars burns for RCB" },
  { date: "Apr 28", team1: "PBKS", team2: "RR",   p1: 49, p2: 51, planet: "Venus tips RR" },
  { date: "Apr 29", team1: "MI",   team2: "SRH",  p1: 54, p2: 46, planet: "Saturn discipline dominates" },
  { date: "Apr 30", team1: "GT",   team2: "RCB",  p1: 49, p2: 51, planet: "Mars edges RCB" },
  { date: "May 01", team1: "RR",   team2: "DC",   p1: 54, p2: 46, planet: "Venus strongly favors RR" },
  { date: "May 02", team1: "CSK",  team2: "MI",   p1: 52, p2: 48, planet: "Jupiter tips CSK" },
  { date: "May 03", team1: "SRH",  team2: "KKR",  p1: 50, p2: 50, planet: "Perfect balance" },
  { date: "May 03", team1: "GT",   team2: "PBKS", p1: 51, p2: 49, planet: "Rahu slightly favors GT" },
  { date: "May 04", team1: "MI",   team2: "LSG",  p1: 53, p2: 47, planet: "Saturn supports MI" },
  { date: "May 05", team1: "DC",   team2: "CSK",  p1: 47, p2: 53, planet: "Jupiter holds CSK" },
  { date: "May 06", team1: "SRH",  team2: "PBKS", p1: 52, p2: 48, planet: "Mars tips SRH" },
  { date: "May 07", team1: "LSG",  team2: "RCB",  p1: 50, p2: 50, planet: "Balanced — watch toss" },
  { date: "May 08", team1: "DC",   team2: "KKR",  p1: 49, p2: 51, planet: "Rahu edges KKR" },
  { date: "May 09", team1: "RR",   team2: "GT",   p1: 52, p2: 48, planet: "Venus favors RR" },
  { date: "May 10", team1: "CSK",  team2: "LSG", p1: 55, p2: 45, planet: "Jupiter strongly backs CSK" },
  { date: "May 10", team1: "RCB",  team2: "MI",   p1: 49, p2: 51, planet: "Saturn edges MI" },
  { date: "May 12", team1: "GT",   team2: "SRH", p1: 52, p2: 48, planet: "Saturn favors GT" },
  { date: "May 14", team1: "PBKS", team2: "MI",   p1: 48, p2: 52, planet: "Saturn discipline edges MI over Moon's fluctuation" },
  { date: "May 15", team1: "LSG",  team2: "CSK",  p1: 47, p2: 53, planet: "Jupiter's wisdom overpowers Mercury's speed" },
  { date: "May 16", team1: "KKR",  team2: "GT",   p1: 54, p2: 46, planet: "Rahu's mystery dominates Saturn-Rahu grind" },
  { date: "May 17", team1: "PBKS", team2: "RCB",  p1: 49, p2: 51, planet: "Mars fire burns brighter than Moon's phases" },
  { date: "May 17", team1: "DC",   team2: "RR",   p1: 52, p2: 48, planet: "Jupiter's strategy outsmarts Venus's elegance" },
  { date: "May 19", team1: "RR",   team2: "LSG",  p1: 53, p2: 47, planet: "Venus elegance favors RR at home" },
  { date: "May 20", team1: "KKR",  team2: "MI",   p1: 51, p2: 49, planet: "Rahu's mystery edges KKR at Eden" },
  { date: "May 21", team1: "GT",   team2: "CSK",  p1: 48, p2: 52, planet: "Jupiter's wisdom guides CSK to victory" },
  { date: "May 22", team1: "SRH",  team2: "RCB",  p1: 52, p2: 48, planet: "Mars fire energizes SRH at home" },
  { date: "May 23", team1: "LSG",  team2: "PBKS", p1: 54, p2: 46, planet: "Mercury's speed favors LSG" },
  { date: "May 24", team1: "MI",   team2: "RR",   p1: 51, p2: 49, planet: "Saturn discipline tips MI in morning clash" },
  { date: "May 24", team1: "KKR",  team2: "DC",   p1: 53, p2: 47, planet: "Rahu's influence strengthens KKR at Eden" },
  { date: "May 26", team1: "RCB",  team2: "GT",   p1: 70, p2: 30, planet: "Mars and Jupiter favor RCB's momentum", reason: "RCB's batting core looks sharper under pressure, while the planetary pattern gives them stronger timing in the powerplay and chase control." },
  { date: "May 27", team1: "SRH",  team2: "RR",   p1: 40, p2: 60, planet: "Venus and Moon support RR's balance", reason: "RR look calmer and more settled in a playoff-style game, with a smoother temperament in the middle overs and stronger closing stability." },
  { date: "May 29", team1: "GT",   team2: "RR",   p1: 30, p2: 70, planet: "Venus, Moon and Jupiter strongly favor RR", reason: "Rajasthan Royals get the stronger astrological push today because Venus supports their natural balance, the Moon gives better emotional control in pressure overs, and Jupiter improves decision-making around bowling changes and chase tempo. GT still carry Saturn's discipline, but Rahu's restless influence can create mistimed risks, so the cosmic ratio leans clearly toward RR at 70:30." },
  { date: "May 31", team1: "RCB",  team2: "GT",   p1: 64, p2: 36, planet: "Mars and Jupiter give RCB the final-day edge", reason: "RCB carry the stronger final-day astrological pattern: Mars boosts aggression, Jupiter improves calm decision-making, and the pressure timing favors their batting rhythm. GT remain dangerous through Saturn discipline and Rahu surprise, but the RCB vs GT final prediction leans RCB at 64:36." },
];

const finalMatch = allMatches.find(
  (match) => match.date === "May 31" && match.team1 === "RCB" && match.team2 === "GT"
);

// ─── Dynamic Date Functions ───────────────────────────────────────────────────
const getDateStringWithOffset = (offsetDays: number) => {
  const today = new Date();
  today.setDate(today.getDate() + offsetDays);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${months[today.getMonth()]} ${String(today.getDate()).padStart(2, '0')}`;
  console.log('Date string:', dateStr); // Debug log
  return dateStr;
};

const getTodayDateString = () => getDateStringWithOffset(0);
const getTomorrowDateString = () => getDateStringWithOffset(1);
const getDayAfterTomorrowDateString = () => getDateStringWithOffset(2);

const getTodayMatch = () => {
  const todayStr = getTodayDateString();
  console.log('Looking for match with date:', todayStr); // Debug log
  const match = allMatches.find(match => match.date === todayStr);
  console.log('Found match:', match); // Debug log
  return match;
};

const getFinalCountdown = () => {
  const finalStart = new Date("2026-05-31T19:30:00+05:30").getTime();
  const diff = Math.max(0, finalStart - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
};

const FinalAnnouncementBar = () => {
  const [countdown, setCountdown] = useState(getFinalCountdown());

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getFinalCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-50 border-b border-yellow-300/40 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-3 text-center sm:flex-row sm:gap-4">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-yellow-200 sm:text-base">
          <Trophy className="h-5 w-5 text-yellow-300" />
          IPL 2026 FINAL TOMORROW - RCB vs GT
        </div>
        <div className="flex items-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-300/15 px-3 py-1 text-xs font-bold text-white sm:text-sm">
          Countdown:
          <span className="text-yellow-200">{countdown.days}d</span>
          <span className="text-yellow-200">{countdown.hours}h</span>
          <span className="text-yellow-200">{countdown.minutes}m</span>
          <span className="text-yellow-200">{countdown.seconds}s</span>
        </div>
      </div>
    </div>
  );
};

// ─── Match Card Component ──────────────────────────────────────────────────────
const MatchCard = ({ match, isToday, featured = false }: { match: IPLMatch; isToday: boolean; featured?: boolean }) => {
  const winner = match.p1 > match.p2 ? match.team1 : match.p1 < match.p2 ? match.team2 : null;
  const t1Color = teamColors[match.team1] || "bg-white/10 text-white border-white/20";
  const t2Color = teamColors[match.team2] || "bg-white/10 text-white border-white/20";
  const isFinal = match.date === "May 31" && match.team1 === "RCB" && match.team2 === "GT";

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isFinal
        ? "bg-gradient-to-br from-yellow-400/18 via-red-500/18 to-sky-500/18 border-yellow-300/60 shadow-2xl shadow-yellow-400/15"
        : featured
        ? "bg-gradient-to-r from-orange-500/18 to-pink-500/18 border-orange-400/40 shadow-lg shadow-orange-500/10"
        : isToday
        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/40 shadow-lg"
        : "bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-md"
    }`}>
      {isToday && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">Today's Match</span>
          </div>
          <span className="text-xs text-pink-300 bg-pink-500/30 px-2 py-1 rounded-full">
            {match.date}
          </span>
        </div>
      )}
      {featured && !isToday && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-300 animate-pulse" />
            <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">Upcoming Playoff</span>
          </div>
          <span className="text-xs text-orange-200 bg-orange-500/20 px-2 py-1 rounded-full">
            {match.date}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/60 font-medium">{match.date}</span>
        <span className="text-xs text-purple-300/80 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
          ✦ {match.planet}
        </span>
      </div>

      {isFinal && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-300/15 px-4 py-2 text-sm font-bold text-yellow-100">
          <Trophy className="h-4 w-4" />
          IPL 2026 Final Prediction: RCB vs GT
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 text-center">
          <div className={`relative min-h-[154px] p-3 rounded-lg border transition-all ${
            winner === match.team1
              ? "bg-gradient-to-br from-emerald-400/35 via-green-500/25 to-yellow-400/20 border-emerald-300/80 shadow-2xl shadow-emerald-400/25 ring-2 ring-emerald-300/50 scale-[1.03]"
              : `${t1Color} ${winner ? "opacity-55 grayscale-[35%]" : "hover:scale-105"}`
          }`}>
            {winner === match.team1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-300 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black shadow-lg">
                <Trophy className="mr-1 inline h-3.5 w-3.5" /> Predicted Winner
              </div>
            )}
            <div className={`font-black mb-1 ${winner === match.team1 ? "text-3xl text-white" : "text-lg"}`}>
              {match.team1}
            </div>
            <div className={`text-xs uppercase tracking-wider mb-2 ${winner === match.team1 ? "text-white/85" : "text-gray-500"}`}>
              {fullTeamName[match.team1]}
            </div>
            <div className={`font-black leading-none ${
              winner === match.team1
                ? "text-5xl text-yellow-200 drop-shadow"
                : match.p1 === match.p2 ? "text-2xl text-yellow-400" : "text-2xl text-gray-400"
            }`}>
              {match.p1}%
            </div>
            {winner === match.team1 && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-sm font-black text-yellow-200">
                <Trophy className="h-4 w-4" /> WINNER
              </div>
            )}
          </div>
        </div>

        <div className="text-lg font-bold text-gray-400 mx-2">VS</div>

        <div className="flex-1 text-center">
          <div className={`relative min-h-[154px] p-3 rounded-lg border transition-all ${
            winner === match.team2
              ? "bg-gradient-to-br from-emerald-400/35 via-green-500/25 to-yellow-400/20 border-emerald-300/80 shadow-2xl shadow-emerald-400/25 ring-2 ring-emerald-300/50 scale-[1.03]"
              : `${t2Color} ${winner ? "opacity-55 grayscale-[35%]" : "hover:scale-105"}`
          }`}>
            {winner === match.team2 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-300 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black shadow-lg">
                <Trophy className="mr-1 inline h-3.5 w-3.5" /> Predicted Winner
              </div>
            )}
            <div className={`font-black mb-1 ${winner === match.team2 ? "text-3xl text-white" : "text-lg"}`}>
              {match.team2}
            </div>
            <div className={`text-xs uppercase tracking-wider mb-2 ${winner === match.team2 ? "text-white/85" : "text-gray-500"}`}>
              {fullTeamName[match.team2]}
            </div>
            <div className={`font-black leading-none ${
              winner === match.team2
                ? "text-5xl text-yellow-200 drop-shadow"
                : match.p1 === match.p2 ? "text-2xl text-yellow-400" : "text-2xl text-gray-400"
            }`}>
              {match.p2}%
            </div>
            {winner === match.team2 && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-sm font-black text-yellow-200">
                <Trophy className="h-4 w-4" /> WINNER
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 rounded-full bg-gray-700/30 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              winner === match.team1
                ? "bg-gradient-to-r from-green-500 to-green-600 shadow-lg"
                : winner === match.team2
                ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg"
                : "bg-gradient-to-r from-blue-500 to-purple-500"
            }`}
            style={{ width: `${match.p1}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/50 mt-1">
          <span>{match.p1}%</span>
          <span>{match.p2}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="text-xs text-white/40">
          <span className="font-medium">Astrology:</span> {match.planet}
        </div>
        {isToday && (
          <div className="text-xs text-pink-300 animate-pulse">
            ● LIVE
          </div>
        )}
      </div>

      {match.reason && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/45 mb-1">Why this pick</div>
          <p className="text-xs text-white/70 leading-relaxed">{match.reason}</p>
        </div>
      )}
    </div>
  );
};

// ─── Match Predictions Section ─────────────────────────────────────────────────
const MatchPredictionsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const [todayStr, setTodayStr] = useState(getTodayDateString());
  const [todayMatch, setTodayMatch] = useState(getTodayMatch());
  const [tomorrowStr, setTomorrowStr] = useState(getTomorrowDateString());
  const [dayAfterTomorrowStr, setDayAfterTomorrowStr] = useState(getDayAfterTomorrowDateString());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Auto-update at 1 AM
  useEffect(() => {
    const updateDailyData = () => {
      const newTodayStr = getTodayDateString();
      const newTomorrowStr = getTomorrowDateString();
      const newDayAfterTomorrowStr = getDayAfterTomorrowDateString();
      setTodayStr(newTodayStr);
      setTomorrowStr(newTomorrowStr);
      setDayAfterTomorrowStr(newDayAfterTomorrowStr);
      setTodayMatch(getTodayMatch());
      setLastUpdate(new Date());
    };
    
    // Update immediately on mount
    updateDailyData();
    
    // Schedule daily updates at 1 AM
    const now = new Date();
    const tomorrow1AM = new Date(now);
    tomorrow1AM.setDate(tomorrow1AM.getDate() + 1);
    tomorrow1AM.setHours(1, 0, 0, 0);
    
    const msUntil1AM = tomorrow1AM.getTime() - now.getTime();
    
    const dailyUpdateTimer = setTimeout(() => {
      updateDailyData();
      // Then set up recurring daily updates
      setInterval(updateDailyData, 24 * 60 * 60 * 1000); // Every 24 hours
    }, msUntil1AM);
    
    return () => clearTimeout(dailyUpdateTimer);
  }, []);
  
  const visibleMatches = showAll ? allMatches : allMatches.slice(0, 6);
  const highlightedUpcoming = allMatches.filter(
    (match) => match.date === tomorrowStr || match.date === dayAfterTomorrowStr
  );

  return (
    <div className="mb-12">
      {/* Today's Match Teams Highlight */}
      {todayMatch && (
        <div className="mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/40 p-6 shadow-lg shadow-yellow-500/10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            <h3 className="text-2xl font-bold text-white">Today's Match Teams</h3>
            <span className="px-3 py-1 bg-yellow-500/30 text-yellow-300 rounded-full text-sm font-medium animate-pulse">
              LIVE NOW
            </span>
          </div>
          
          {/* Teams Highlight */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`text-center px-6 py-4 rounded-xl border-2 ${teamColors[todayMatch.team1]} border-yellow-400/50 shadow-lg`}>
              <div className="text-3xl font-bold mb-2">{todayMatch.team1}</div>
              <div className="text-sm text-white/70">{fullTeamName[todayMatch.team1]}</div>
              <div className="text-xl font-bold text-green-400 mt-2">{todayMatch.p1}%</div>
            </div>
            
            <div className="text-2xl font-bold text-yellow-400">VS</div>
            
            <div className={`text-center px-6 py-4 rounded-xl border-2 ${teamColors[todayMatch.team2]} border-yellow-400/50 shadow-lg`}>
              <div className="text-3xl font-bold mb-2">{todayMatch.team2}</div>
              <div className="text-sm text-white/70">{fullTeamName[todayMatch.team2]}</div>
              <div className="text-xl font-bold text-green-400 mt-2">{todayMatch.p2}%</div>
            </div>
          </div>
          
          <div className="text-center text-sm text-white/60">
            <span className="text-yellow-300 font-semibold">Astrological Prediction:</span> {todayMatch.planet}
          </div>
        </div>
      )}

      {highlightedUpcoming.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">Upcoming Playoff Matches</h3>
              <p className="text-sm text-white/60 mt-1">Tomorrow's and next day's highlighted predictions</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-200 border border-orange-400/30 text-xs font-semibold">
              Highlighted
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlightedUpcoming.map((match) => (
              <MatchCard key={`${match.date}-${match.team1}-${match.team2}`} match={match} isToday={false} featured />
            ))}
          </div>
        </div>
      )}

      {/* Ad - After Highlighted Playoff Matches */}
      <div className="flex justify-center my-8">
        <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
      </div>

      {/* Today's Match Highlight */}
      {todayMatch && (
        <div className="mb-8 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-pink-400" />
            <h3 className="text-xl font-bold text-white">Today's IPL Match Prediction</h3>
            <span className="px-3 py-1 bg-pink-500/30 text-pink-300 rounded-full text-sm font-medium">
              {todayMatch.date}
            </span>
          </div>
          <MatchCard match={todayMatch} isToday={true} />
          <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Auto-updates daily at 1 AM</span>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-2 text-center">
        IPL 2026 — Daily Match Predictions
      </h2>
      <p className="text-white/60 text-center text-sm mb-4">
        Looking for <strong>today IPL match winner prediction</strong>? Our AI analyzes planetary transits to find which captain has the strongest Rajyoga for victory.
      </p>
      <p className="text-white/60 text-center text-sm mb-6">
        Astrological win probabilities for every IPL 2026 match · ★ = Predicted winner · <strong>Today IPL match kaun jitega</strong> astrology insights
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleMatches.map((match, i) => (
          <MatchCard key={i} match={match} isToday={match.date === todayStr} />
        ))}
      </div>

      {/* Show More / Less */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm font-medium"
      >
        {showAll ? (
          <><ChevronUp className="w-4 h-4" /> Show Less</>
        ) : (
          <><ChevronDown className="w-4 h-4" /> Show All {allMatches.length} Matches</>
        )}
      </button>

      <p className="text-xs text-white/30 text-center mt-3">
        Predictions based on planetary transits · Updated per Vedic astrology analysis
      </p>
      
      {/* Ad 3 - After Show All 51 Blog */}
      <div className="flex justify-center my-8">
        <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const WhichTeamWinIPL2026 = () => {
  const { setAuthOpen } = useAuth();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const finalWinner = finalMatch?.p1 && finalMatch.p1 > finalMatch.p2 ? finalMatch.team1 : finalMatch?.team2;

  return (
    <>
      <Helmet>
        <title>IPL 2026 Final Prediction: Who Will Win RCB vs GT?</title>
        <meta
          name="description"
          content="IPL 2026 Final prediction for RCB vs GT tomorrow, May 31. Vedic astrology match analysis, win probability, winner pick, countdown, and final-day cricket bhavishyawani."
        />
        <meta
          name="keywords"
          content="IPL 2026 final prediction, RCB vs GT prediction, RCB vs GT winner prediction, who will win RCB vs GT, IPL final 2026 winner prediction, aaj ka IPL final kaun jitega, IPL 2026 final winner prediction astrology, today IPL match winner, today IPL match kaun jitega, aaj ka IPL match kaun jitega, today IPL match prediction astrology, cricket bhavishyawani 2026"
        />
        <link rel="canonical" href="https://veadicastro.in/blog/ipl-2026-winner-prediction-astrology" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="theme-color" content="#0a0a0f" />

        {/* Open Graph */}
        <meta property="og:title" content="IPL 2026 Final Prediction: Who Will Win RCB vs GT?" />
        <meta property="og:description" content="RCB vs GT IPL 2026 Final prediction for May 31 with Vedic astrology winner pick, countdown, and win probability." />
        <meta property="og:url" content="https://veadicastro.in/blog/ipl-2026-winner-prediction-astrology" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://veadicastro.in/optimized/ipl-2026.webp" />
        <meta property="og:image:alt" content="IPL 2026 Final Prediction RCB vs GT Astrology" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content="Veadicastro" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="IPL 2026 Final Prediction: Who Will Win RCB vs GT?" />
        <meta name="twitter:description" content="RCB vs GT IPL 2026 Final prediction for May 31 with astrology winner pick and win probability." />
        <meta name="twitter:image" content="https://veadicastro.in/optimized/ipl-2026.webp" />
        <meta name="twitter:site" content="@veadicastro" />
        <meta name="twitter:creator" content="@veadicastro" />

        {/* BlogPosting Schema */}
        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": "IPL 2026 Final Prediction: Who Will Win RCB vs GT?",
          "description": "IPL 2026 Final prediction for RCB vs GT on May 31 with Vedic astrology winner pick, win probability, and final-day match analysis.",
          "image": {
            "@type": "ImageObject",
            "url": "https://veadicastro.in/optimized/ipl-2026.webp",
            "width": 1200,
            "height": 630
          },
          "author": {
            "@type": "Organization",
            "name": "Veadicastro",
            "url": "https://veadicastro.in"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Veadicastro",
            "logo": {
              "@type": "ImageObject",
              "url": "https://veadicatro.in/logo.jpg"
            }
          },
          "datePublished": "2026-03-13",
          "dateModified": "2026-05-30",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://veadicastro.in/blog/ipl-2026-winner-prediction-astrology"
          },
          "keywords": ["IPL 2026 final prediction", "RCB vs GT prediction", "RCB vs GT winner prediction", "IPL 2026 final winner prediction astrology", "who will win RCB vs GT", "aaj ka IPL final kaun jitega", "today IPL match winner astrology", "cricket bhavishyawani 2026"],
          "inLanguage": "en",
          "articleSection": "Sports Astrology"
        }
        `}</script>

        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veadicastro.in" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://vedaicastro.in/blog" },
            { "@type": "ListItem", "position": 3, "name": "IPL 2026 Prediction", "item": "https://veadicastro.in/blog/ipl-2026-winner-prediction-astrology" }
          ]
        }
        `}</script>

        {/* FAQPage Schema */}
        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Who will win IPL 2026 Final RCB vs GT according to astrology?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "According to our Vedic astrology analysis for the IPL 2026 Final on May 31, RCB have the stronger edge over GT with a 64% win probability."
              }
            },
            {
              "@type": "Question",
              "name": "What is tomorrow's IPL 2026 Final astrology prediction?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tomorrow's IPL 2026 Final prediction is RCB vs GT, with RCB favored at 64% and GT at 36% based on final-day planetary transits."
              }
            },
            {
              "@type": "Question",
              "name": "Which team is favored by planets in IPL 2026?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "For the final, RCB receive the stronger Mars and Jupiter support, while GT carry Saturn discipline and Rahu surprise potential."
              }
            }
          ]
        }
        `}</script>

        {/* SportsEvent Schema */}
        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "name": "IPL 2026 Final - RCB vs GT",
          "startDate": "2026-03-28",
          "endDate": "2026-05-31",
          "sport": "Cricket",
          "location": {
            "@type": "Country",
            "name": "India"
          },
          "image": "https://veadicastro.in/optimized/ipl-2026.webp",
          "url": "https://veadicastro.in/blog/ipl-2026-winner-prediction-astrology"
        }
        `}</script>

        {/* Speakable */}
        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "h2"] },
          "url": "https://veadicastro.in/blog/ipl-2026-winner-prediction-astrology"
        }
        `}</script>

      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a1020] to-[#0a0a0f] text-white">
        <FinalAnnouncementBar />

        {finalMatch && (
          <section className="border-b border-yellow-300/20 bg-gradient-to-r from-red-950/70 via-black to-sky-950/70 px-4 py-5">
            <div className="mx-auto max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-center">
                <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-wider text-black">
                  Final Prediction
                </span>
                <h2 className="text-2xl font-black text-white md:text-3xl">
                  RCB vs GT Match Prediction - {finalWinner} to Win
                </h2>
              </div>
              <MatchCard match={finalMatch} isToday={false} featured />
              <p className="mt-3 text-center text-sm leading-relaxed text-white/70">
                Tomorrow, May 31, 2026, is the IPL 2026 Final. This RCB vs GT astrology prediction gives RCB the stronger winning edge with a 64% probability.
              </p>
            </div>
          </section>
        )}

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-blue-600/10" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-pink-400">IPL 2026 Final Prediction:</span> Who Will Win RCB vs GT?
              </h1>
              
              <p className="text-xl text-white/70 mb-4 leading-relaxed max-w-3xl mx-auto">
                🏏 <strong>Today IPL match kaun jitega?</strong> Get accurate astrology predictions for today's IPL 2026 match. 
                Vedic astrology analysis with win probabilities, toss predictions, and planetary insights.
              </p>
              <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-3xl mx-auto">
                Looking for <strong>today IPL match winner prediction</strong>? Our AI analyzes planetary transits, 
                Moon positions, and captain's horoscopes to predict today's match outcome with astrology accuracy.
              </p>

              {/* Hero Image */}
              <div className="mb-8">
                <Suspense fallback={<div className="w-full max-w-3xl mx-auto rounded-2xl bg-gray-800 h-64 animate-pulse" />}>
                  <LazyImage
                    src="/optimized/ipl-2026.webp"
                    alt="Today IPL Match Winner Prediction Astrology"
                    className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl"
                    priority={true}
                  />
                </Suspense>
              </div>
              
              {/* AdSense Ad - After Image */}
              <div className="flex justify-center my-8">
                <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Calendar className="w-4 h-4" />
                  <span>Daily Updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Star className="w-4 h-4" />
                  <span>95% Accuracy</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-pink-400">
                  <Zap className="w-4 h-4" />
                  <span>Today's Match Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Introduction - SEO Optimized */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-pink-400">Today IPL Match Winner Prediction - Astrology Analysis</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              <strong>Today IPL match kaun jitega</strong>? Get the most accurate astrology predictions for today's IPL 2026 match. 
              Our Vedic astrology experts analyze planetary positions, Moon transits, and captain horoscopes to predict 
              today's match winner with precision. Whether you're searching for "<strong>today IPL match winner</strong>" or 
              "<strong>aaj ka IPL match kaun jitega</strong>", we provide daily updated predictions.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Looking for <strong>today IPL match prediction</strong>? Our advanced astrology system considers:
              <a href="https://www.iplt20.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 underline">
                IPL 2026 official schedule
              </a>
              for complete match timings, or{" "}
              <Link to="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 underline transition-colors">
                check your own horoscope
              </Link>{" "}
              to see if your favorite team aligns with your cosmic destiny! You can also use our comprehensive <Link to="/ai-astrology" className="text-pink-400 hover:text-pink-300 underline">AI astrology platform</Link> for detailed match analysis and predictions.
            </p>
          </div>

          {/* ── Daily Match Predictions ── */}
          <MatchPredictionsSection />
          
          {/* AdSense Ad - After Daily Match Predictions */}
          <div className="flex justify-center my-8">
            <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
          </div>

          {/* Ad 4 - Before Mumbai Indians Section */}
          <div className="flex justify-center my-8">
            <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
          </div>

          {/* Section 1: MI */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Mumbai Indians (MI) — The Saturnian Powerhouse & Shani Mahadasha IPL</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Mumbai Indians is a team traditionally governed by Saturn. In 2026, Saturn's placement in its own sign
              indicates a "restructuring" year that brings immense strength — discipline, patience, and strategic thinking
              essential for T20 cricket. The <strong>Shani Mahadasha IPL</strong> period favors MI's methodical approach.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              The captain's chart shows a strong Sun-Mars conjunction, signaling authoritative leadership and
              bold decision-making under pressure — particularly effective in high-stakes playoff situations. <strong>Hardik Pandya horoscope 2026</strong> reveals strong Saturn influence enhancing his captaincy.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-yellow-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Death Over specialists this season</li>
              <li className="list-disc">Saturn's retrograde may cause a mid-season slump</li>
              <li className="list-disc">Strong comeback potential after initial struggles</li>
              <li className="list-disc">Best performance expected in evening matches</li>
            </ul>
          </div>


          {/* Section 2: RCB */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Royal Challengers Bengaluru (RCB) — The Martian Fire & Mars in 10th House</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              RCB's soul is tied to Rajat Patidar, who led them to their first trophy in 2025. His chart shows strong
              Mars influence. In April 2026, Mars transits through a favorable Trikona house, bringing explosive energy. The <strong>Mars in 10th house</strong> position creates exceptional leadership qualities.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              The combination of Mars in Aries and Venus in Taurus creates a powerful "Rajyoga" that could bring
              them another trophy under Patidar's leadership. While <strong>Virat Kohli retirement astrology</strong> speculation continues, his planetary positions suggest continued dominance in 2026.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-red-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">A very high Strike Rate season expected</li>
              <li className="list-disc">Rahu's shadow on the Moon suggests emotional decisions</li>
              <li className="list-disc">Powerplay dominance strongly indicated</li>
              <li className="list-disc">Mars-Ketu conjunction may cause inconsistency</li>
            </ul>
          </div>

          {/* Section 3: CSK */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Chennai Super Kings (CSK) — The Jupiter Strategy & Ruturaj Gaikwad Career Astrology</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              CSK operates on the "Guru" principle — wisdom and timing. Jupiter is the benefactor for this franchise.
              In 2026, Jupiter's position in the 10th house suggests another strong campaign under Ruturaj Gaikwad. <strong>Ruturaj Gaikwad career astrology</strong> shows exceptional growth potential this season.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              With Sanju Samson now in the squad alongside Gaikwad's captaincy, CSK has both fire and experience.
              Mercury's favorable position indicates excellent field coordination throughout the tournament. <strong>Jupiter transit 2026</strong> strongly favors CSK's title ambitions.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-yellow-300">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Will win matches that look "lost"</li>
              <li className="list-disc">Moon influence enhances chase performance</li>
              <li className="list-disc">Slow start but strong finish predicted</li>
              <li className="list-disc">Jupiter-Saturn aspect brings clutch performance</li>
            </ul>
          </div>

          {/* Section 4: KKR */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Kolkata Knight Riders (KKR) — The Rahu Mystique</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              KKR is governed by the unpredictable energy of Rahu. In 2026, Rahu's transit suggests "out-of-the-box" strategies and "X-factor" players who can turn a game in a single over. Their approach defies conventional cricket wisdom.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              The franchise thrives on mystery and surprise elements. Under Rahu's influence, KKR will likely employ unconventional bowling changes and tactical innovations that leave opponents baffled.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-purple-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Tactical Chaos: Unconventional bowling changes that baffle opponents</li>
              <li className="list-disc">Data & Destiny: Favors high-tech, data-driven decision making</li>
              <li className="list-disc">Night Mastery: Particularly strong during late-night matches under stadium lights</li>
              <li className="list-disc">X-Factor Players: Uncapped talents will emerge as match-winners</li>
            </ul>
          </div>

          {/* Section 5: SRH */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Sunrisers Hyderabad (SRH) — The Solar Dominance</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              SRH is at its most lethal when the Sun (Surya) is high. In 2026, they possess "Digbali" (directional strength) during the peak summer months, making them dominant in day matches. Their power peaks when the sun is brightest.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              The solar energy enhances their opening partnerships and gives them an edge in high-scoring encounters. Their batting lineup will be particularly formidable during 4 PM starts when solar influence is maximum.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-orange-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Daylight Mastery: Most dangerous during 4 PM starts</li>
              <li className="list-disc">The Shield: Opening partnerships are their primary strength</li>
              <li className="list-disc">Velocity Surge: Mars transit brings a surge in bowling speeds in late May</li>
              <li className="list-disc">Solar Confidence: Exceptional performance in high-pressure chases</li>
            </ul>
          </div>

          {/* Section 6: RR */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Rajasthan Royals (RR) — The Venusian Elegance</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Under the influence of Venus (Shukra), RR brings balance and "classical" cricket to the field. Their stars favor technical perfection over brute force in 2026, making them a joy for cricket purists who appreciate elegant strokeplay.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Venus governs aesthetics and fair play, which reflects in RR's approach. They'll likely excel in defensive situations and showcase exceptional fielding standards that set them apart from other teams.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-pink-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Fair Play Kings: Likely to lead the Fair Play points table</li>
              <li className="list-disc">Defensive Prowess: High success rate in defending small totals</li>
              <li className="list-disc">Luck Factor: Highly favored in toss decisions and DLS outcomes</li>
              <li className="list-disc">Technical Excellence: Classical batting approach will yield consistent results</li>
            </ul>
          </div>

          {/* Section 7: DC */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Delhi Capitals (DC) — The Jupiter Ascent</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              DC is under the expansive influence of Jupiter (Guru). This season marks their transition from "potential" to "dominance," with a squad that finds wisdom in high-pressure moments. Jupiter blesses them with strategic depth.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              The Jupiter influence enhances their decision-making abilities, particularly in crucial moments like DRS calls and tactical changes. Their young players will display maturity beyond their years under this planetary blessing.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-indigo-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Wise Decisions: Exceptional success rate with DRS calls</li>
              <li className="list-disc">Underdog Rise: Uncapped Indian players will perform like seasoned veterans</li>
              <li className="list-disc">Spin Control: Jupiter favors their slow bowlers during the middle overs</li>
              <li className="list-disc">Strategic Growth: Strong learning curve throughout the tournament</li>
            </ul>
          </div>

          {/* Ad - After Delhi Capitals Section */}
          <div className="flex justify-center my-8">
            <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
          </div>

          {/* Section 8: GT */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Gujarat Titans (GT) — The Rahu-Saturn Grind</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              The Titans represent Earth and the discipline of Saturn mixed with Rahu's ambition. They won't always win beautifully, but they will win through sheer persistence and late-game surges. Their approach is methodical and relentless.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              This unique combination makes GT particularly dangerous in tight situations. Saturn provides the discipline to maintain composure, while Rahu supplies the ambition to chase down impossible targets.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-sky-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Last-Ball Heroics: Statistically favored to win matches in the final over</li>
              <li className="list-disc">Bowling Discipline: Lowest extra-run count due to Saturnian influence</li>
              <li className="list-disc">Pressure Management: Extreme calmness in "Do or Die" scenarios</li>
              <li className="list-disc">Grind Mentality: Excel in low-scoring defensive contests</li>
            </ul>
          </div>

          {/* Section 9: LSG */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Lucknow Super Giants (LSG) — The Mercury Speedsters</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              LSG is governed by Mercury (Budha), the planet of speed and intelligence. They excel in matches where quick thinking and rapid tactical adjustments are required. Their approach is built on adaptability and smart cricket.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Mercury's influence makes them masters of innovation and quick decision-making. They'll likely employ frequent strategic changes and excel in utilizing the Impact Player rule to maximum advantage.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-teal-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Strategic Shifts: Frequent and successful batting order rotations</li>
              <li className="list-disc">Smart Cricket: High success in "Impact Player" substitutions</li>
              <li className="list-disc">Away Game Luck: Mercury's movement favors their traveling performance</li>
              <li className="list-disc">Quick Adaptation: Excel in adjusting to different pitch conditions</li>
            </ul>
          </div>

          {/* Section 10: PBKS */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Punjab Kings (PBKS) — The Lunar Flux</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Punjab is influenced by the Moon (Chandra), leading to extreme performance shifts. They are unstoppable when the momentum is with them but must guard against sudden collapses. Their journey will be one of peaks and valleys.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              The lunar influence makes them highly emotional and momentum-driven. When they're in flow, they can beat any team, but they're also vulnerable to dramatic swings in fortune that characterize Moon-ruled entities.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-4">
              <strong className="text-rose-400">Cosmic Outlook:</strong>
            </p>
            <ul className="space-y-2 text-white/70 ml-6">
              <li className="list-disc">Mood Momentum: Performance is heavily tied to early-season results</li>
              <li className="list-disc">The Anchor: A single key player will carry the team through fluctuations</li>
              <li className="list-disc">Super Overs: Expect the most tie-breakers from this franchise</li>
              <li className="list-disc">Emotional Surge: Will produce both spectacular wins and shocking losses</li>
            </ul>
          </div>


          {/* Winning Probabilities Table */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Final Winning Probabilities (Astrological)</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Based on planetary transits during Finals week in 2026:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left">Team</th>
                    <th className="px-6 py-4 text-left">Astrological Edge</th>
                    <th className="px-6 py-4 text-left">Win Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { team: "RCB", color: "text-red-400", edge: "Mars + Jupiter final-day support", prob: "64%", probColor: "text-green-400" },
                    { team: "Gujarat Titans", color: "text-sky-400", edge: "Saturn discipline + Rahu surprise", prob: "36%", probColor: "text-yellow-400" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className={`px-6 py-4 font-semibold ${row.color}`}>{row.team}</td>
                      <td className="px-6 py-4 text-white/70">{row.edge}</td>
                      <td className={`px-6 py-4 font-semibold ${row.probColor}`}>{row.prob}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ad 5 - After Final Winning Probability Table */}
          <div className="flex justify-center my-8">
            <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
          </div>

          {/* Conclusion */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Conclusion</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              For the IPL 2026 Final, RCB hold the stronger cosmic edge over GT. The team whose leader
              manages the Rahu-Ketu fluctuations in the final overs will lift the trophy, but the planetary positions
              currently give RCB the sharper timing and higher win probability.
            </p>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Remember, astrology provides insights and probabilities — not certainties. The beauty of cricket
              lies in its uncertainty, and that's what makes it so captivating. On any given day, passion and
              performance can rewrite destiny.
            </p>
            <p className="text-lg leading-relaxed text-white/80">
              May the best team win, and may your favorite team's stars align with victory!{" "}
              <Link to="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline transition-colors">
                Chat with our AI astrologer
              </Link>{" "}
              for personalized cricket predictions and life guidance.
            </p>
          </div>

          {/* FAQ */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Who will win IPL 2026 Final RCB vs GT according to astrology?",
                  a: "According to our Vedic astrology analysis for May 31, RCB have the stronger final-day alignment and a 64% win probability against Gujarat Titans.",
                },
                {
                  q: "Which team is favored by planets in IPL 2026?",
                  a: "Mumbai Indians (Saturn), CSK (Jupiter), and RCB (Mars) hold the strongest planetary backing. Saturn favors MI's discipline, Jupiter guides CSK's strategy, and Mars fuels RCB's aggression.",
                },
                {
                  q: "What is today's IPL match astrology prediction?",
                  a: "Check our IPL 2026 Daily Match Predictions section above — it shows Vedic astrology win probabilities for every match from March 31 to May 10, updated based on current planetary transits.",
                },
                {
                  q: "Aaj ka IPL match kaun jitega astrology se?",
                  a: "Aaj ke match ki astrological prediction upar diye gaye Daily Match Predictions section mein diye gaye hain. Har match ke liye planetary transit ke aadhar par win probability calculate ki gayi hai.",
                },
                {
                  q: "Which team is lucky for IPL 2026?",
                  a: "According to Vedic astrology, Mumbai Indians are the luckiest team for IPL 2026 with Saturn's strong placement. CSK follows with Jupiter's blessings, while RCB's Mars energy makes them highly competitive. The planetary positions strongly favor these three teams.",
                },
                {
                  q: "IPL 2026 final winner prediction astrology?",
                  a: "Our IPL 2026 Final winner prediction points to RCB over GT. Mars gives RCB aggression, Jupiter supports calmer decision-making, and the probability split is RCB 64% vs GT 36%.",
                },
                {
                  q: "Astrology signs of IPL winners?",
                  a: "Historically, IPL winners show specific astrological patterns: strong Saturn for discipline (MI), Jupiter for strategy (CSK), Mars for aggression (RCB), and beneficial Rahu for surprise elements (GT/KKR). The winning team typically has their captain's main dasha planet favorably placed during the tournament.",
                },
              ].map((faq, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold mb-3 text-pink-400">{faq.q}</h3>
                  <p className="text-white/80 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final Winner FAQ */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Final Winner FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Who will win the IPL 2026 final?",
                  a: "According to our astrological analysis, RCB have the highest chance of winning the IPL 2026 Final against GT.",
                },
                {
                  q: "What are the chances of RCB winning the IPL 2026 final?",
                  a: "RCB have a 64% chance of winning the IPL 2026 Final against GT in this astrology-based prediction.",
                },
                {
                  q: "Can GT win the IPL 2026 final?",
                  a: "Yes, GT can still win. Their Saturn discipline and Rahu surprise factor keep them dangerous, but their astrology probability is lower at 36%.",
                },
                {
                  q: "What role will Rahu-Ketu play in the IPL 2026 final?",
                  a: "Rahu-Ketu will play a crucial role in the IPL 2026 final, as their transitions will determine the outcome of the match. The team whose captain can handle these transitions effectively will likely emerge victorious.",
                },
              ].map((faq, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold mb-3 text-pink-400">{faq.q}</h3>
                  <p className="text-white/80 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <div className="border-t border-white/10 pt-8 mb-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-lg flex-shrink-0">V</div>
            <div>
              <p className="font-semibold text-white">Veadicastro Astrology Team</p>
              <p className="text-white/60 text-sm mt-1">
                Vedic astrology analysts specializing in sports predictions, kundli reading, and planetary transit analysis for over 10 years.
              </p>
            </div>
          </div>

          {/* More Blogs */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-6 text-center">See Our More Blog</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  to: "/blogs/online-jyotishi-vs-ai-astrologer",
                  img: "/optimized/online-jyotish-vs-ai-astrologer.webp",
                  alt: "Online Jyotishi vs AI Astrologer",
                  title: "Online Jyotishi vs AI Astrologer",
                  desc: "Discover the key differences between traditional online jyotishi and modern AI astrologers.",
                },
                {
                  to: "/blogs/vedic-astrology-ai-kese-kaam-karta-ha",
                  img: "/optimized/image.webp",
                  alt: "Vedic Astrology AI Kaise Kaam Karta Hai",
                  title: "Vedic Astrology AI Kaise Kaam Karta Hai?",
                  desc: "Complete guide in Hindi about how Vedic astrology AI works and the technology behind it.",
                },
                {
                  to: "/blog/next-pm-india-2029-astrology-prediction",
                  img: "/optimized/who-will-become-the-next-pm-of-india.webp",
                  alt: "Next PM of India 2029",
                  title: "Next PM of India 2029 — Astrology Predictions",
                  desc: "Yogi vs Modi vs Rahul vs Amit Shah: Detailed Vedic astrology predictions for India's next PM.",
                },
              ].map((blog, i) => (
                <Link
                  key={i}
                  to={blog.to}
                  onClick={scrollToTop}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="mb-4">
                    <img loading="lazy" src={blog.img} alt={blog.alt} className="w-full h-40 object-cover rounded-lg" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-white group-hover:text-pink-400 transition-colors">{blog.title}</h4>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{blog.desc}</p>
                  <div className="flex items-center text-pink-400 text-sm font-medium">
                    Read More <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Discover Your Cosmic Connection to IPL 2026</h3>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Check if your horoscope aligns with your favorite team's victory. Get your free kundli
              and personalized astrological insights for IPL 2026 and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/free-kundli-generator"
                className="inline-flex items-center justify-center px-8 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors"
              >
                Generate Free Kundli
              </Link>
              <Link
                to="/free-ai-astrologer-chat"
                className="inline-flex items-center justify-center px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Chat with AI Astrologer
              </Link>
              <ButtonLite variant="cosmic" onClick={() => setAuthOpen(true)} className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Sign Up Free
              </ButtonLite>
            </div>
          </div>
        </div>

      </div>
      
      {/* AdSense Ad - Below Content */}
      <div className="flex justify-center my-6">
        <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
      </div>
    </>
  );
};

export default WhichTeamWinIPL2026;
