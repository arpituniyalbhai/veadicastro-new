import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Copy, Gift, Link2, Share2, Sparkles, Trophy, Users, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import "./Referral.css";

function getPreviewCode(userId: string) {
  const key = `referral_preview_${userId}`;
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const code = `VED-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
    localStorage.setItem(key, code);
    return code;
  } catch { return "VED-PREVIEW"; }
}

export default function Referral() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [code] = useState(() => getPreviewCode(user?.uid || "guest"));
  const [eligibility, setEligibility] = useState<"idle" | "checking" | "eligible" | "inviting">("idle");
  const firstName = user?.displayName?.split(" ")[0] || "friend";
  useEffect(() => {
    if (eligibility !== "checking") return;
    const timer = window.setTimeout(() => setEligibility("eligible"), 5000);
    return () => window.clearTimeout(timer);
  }, [eligibility]);
  const inviteUrl = `https://veadicastro.in/?ref=${encodeURIComponent(code)}`;
  const shareText = `Discover personalized astrology with Vedika AI. My preview referral code is ${code}. Referral rewards are coming soon.`;
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copied!", description: "Your invitation is ready to share." });
    } catch {
      toast({ title: "Select and copy your invitation", description: "Automatic copying isn't available in this browser.", variant: "destructive" });
    }
  };
  const share = async () => {
    if (!navigator.share) return copy(`${shareText}\n${inviteUrl}`);
    try { await navigator.share({ title: "An invitation to Veadicastro", text: shareText, url: inviteUrl }); }
    catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) await copy(`${shareText}\n${inviteUrl}`);
    }
  };

  return (
    <div className="referral-page">
      <header className="referral-header"><div className="referral-container referral-nav">
        <Link className="referral-brand" to="/dashboard"><img src="/optimized/logo.webp" alt="" />Veadicastro<span> / Refer & Earn</span></Link>
        <Link className="referral-back" to="/dashboard"><ArrowLeft size={16} />Dashboard</Link>
      </div></header>
      <main className="referral-container">
        <section className="referral-hero" aria-labelledby="referral-title">
          <div className="referral-eyebrow"><Sparkles size={14} /> THE VEADICASTRO REFERRAL PROGRAM</div>
          <h1 id="referral-title">A little sharing.<br /><span>Up to ₹5,000 a week.</span></h1>
          <p>Introduce your friends to Veadicastro.<br />Share the guidance you love. Make your connections count.</p>
          <a className="referral-button referral-hero-cta" href="#invite"><Gift size={19} /> {eligibility === "inviting" ? "Refer your friends" : "Check your eligibility"} <ArrowRight size={18} /></a>
          <span className="referral-hero-note">Program preview · Reward terms available at launch</span>
          <div className="referral-benefits"><span><Check /> Your personal invite code</span><span><Check /> Easy sharing</span><span><Check /> All your referrals in one place</span></div>
        </section>
        <div className="referral-workspace">
          <section className="referral-panel referral-invite" id="invite" aria-labelledby="invite-title">
            {eligibility !== "inviting" ? (
              <div className="referral-eligibility" aria-live="polite" aria-atomic="true">
                <span className="referral-badge">Eligibility preview</span>
                <div className={`referral-eligibility-symbol ${eligibility === "checking" ? "is-checking" : ""}`}>
                  {eligibility === "eligible" ? <Check size={32} /> : <Gift size={32} />}
                </div>
                <h2 id="invite-title">{eligibility === "idle" ? "Check your eligibility for our referral program" : eligibility === "checking" ? `Checking ${firstName}’s eligibility…` : `Congratulations, ${firstName}!`}</h2>
                <p>{eligibility === "idle" ? "Your referral journey starts here. Find out if you’re ready to join the Veadicastro circle." : eligibility === "checking" ? "Preparing your referral program preview. This will take about five seconds." : "You’re eligible for our referral program in this preview. You can earn up to ₹5,000 per week when the program launches."}</p>
                {eligibility === "checking" ? <div className="referral-progress" aria-label="Checking eligibility"><span /></div> : <button type="button" className="referral-button" onClick={() => setEligibility(eligibility === "eligible" ? "inviting" : "checking")}>{eligibility === "eligible" ? "Get my referral code" : "Check my eligibility"}<ArrowRight size={17} /></button>}
                <p className="referral-small">UI preview only. This animation does not perform a real eligibility check.</p>
              </div>
            ) : <>
            <div className="referral-section-heading"><div><span className="referral-kicker">YOUR INVITATION</span><h2 id="invite-title">Good guidance deserves company.</h2></div><span className="referral-icon"><Link2 size={21} /></span></div>
            <p>Hey {user?.displayName?.split(" ")[0] || "friend"}, invite someone who would love to meet Vedika.</p>
            <label htmlFor="referral-code">Your personal code <span>Preview</span></label>
            <div className="referral-code"><input id="referral-code" readOnly value={code} onFocus={(e) => e.target.select()} /><button type="button" onClick={() => copy(code)} aria-label="Copy referral code"><Copy size={18} /></button></div>
            <label htmlFor="referral-link">Your invitation link</label>
            <div className="referral-link"><Link2 size={16} aria-hidden="true" /><input id="referral-link" readOnly value={inviteUrl} onFocus={(e) => e.target.select()} /><button type="button" onClick={() => copy(inviteUrl)} aria-label="Copy invitation link"><Copy size={16} /></button></div>
            <button type="button" className="referral-button referral-share" onClick={share}><Share2 size={17} /> Share invitation <ArrowRight size={17} /></button>
            <p className="referral-small">Preview code saved in this browser. Tracking and payouts activate when the program launches.</p>
            </>}
          </section>
          <section className="referral-panel referral-leaderboard" aria-labelledby="earners-title">
            <div className="referral-section-heading"><div><span className="referral-kicker">THE COMMUNITY</span><h2 id="earners-title">Top earner spotlight</h2></div><span className="referral-icon"><Trophy size={21} /></span></div>
            <div className="referral-leader-period"><span>Weekly leaderboard</span><span className="referral-badge">Sample data</span></div>
            {[
              { name: "Soni Kuman", amount: "3,000" },
              { name: "Priya Sharma", amount: "2,750" },
              { name: "Rahul Verma", amount: "2,400" },
              { name: "Anjali Singh", amount: "2,100" },
              { name: "Amit Patel", amount: "1,850" },
            ].map((earner, index) => <div key={earner.name} className="referral-winner"><span className="referral-rank">0{index + 1}</span><span className="referral-avatar">{earner.name.split(" ").map((part) => part[0]).join("")}</span><div className="referral-winner-name"><strong>{earner.name}</strong><span>Community member</span></div><div className="referral-winner-amount"><strong>₹{earner.amount}</strong><span>Weekly earnings</span></div></div>)}
            <p className="referral-small">Sample names and earnings for the design preview; these are not verified earners.</p>
          </section>
        </div>
        <section className="referral-rewards" aria-labelledby="rewards-title">
          <div className="referral-centered-heading"><span className="referral-kicker">EVERY INTRODUCTION COUNTS</span><h2 id="rewards-title">They find guidance. You earn rewards.</h2><p>Here’s what you earn when a referred friend buys a plan.</p></div>
          <div className="referral-reward-grid">{[
            { name: "Quick Ask", price: "₹199 plan", reward: "50" },
            { name: "Deep Dive", price: "₹299 plan", reward: "149" },
            { name: "Power Pack", price: "₹699 plan", reward: "300" },
            { name: "Monthly Pro", price: "₹499 plan", reward: "200" },
            { name: "Astrologer", price: "Astrologer booking", reward: "120" },
          ].map((plan) => <article key={plan.name} className="referral-reward-card"><span>{plan.price}</span><h3>{plan.name}</h3><div className="referral-reward-amount">₹{plan.reward}</div><p>Your referral reward</p><Gift size={18} aria-hidden="true" /></article>)}</div>
          <p className="referral-small">Proposed rewards shown for this preview. Eligibility and payout terms apply at launch.</p>
        </section>
        <section className="referral-how" aria-labelledby="how-title">
          <div className="referral-centered-heading"><span className="referral-kicker">SIMPLE BY DESIGN</span><h2 id="how-title">Three steps. A growing circle.</h2><p>From your first invitation to your referral overview.</p></div>
          <div className="referral-steps">{[
            { icon: Share2, title: "Share your link", text: "Send a personal invitation to friends, family, or your community." },
            { icon: Users, title: "Introduce them to Vedika", text: "Let your friends discover personalized astrology on Veadicastro." },
            { icon: Wallet, title: "Follow your rewards", text: "Eligible referrals and earnings will appear here once the program is live." },
          ].map(({ icon: Icon, title, text }, index) => <article key={title} className="referral-step"><div className="referral-step-top"><span className="referral-icon"><Icon size={22} /></span><span>0{index + 1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
        <section className="referral-overview" aria-labelledby="overview-title">
          <div className="referral-overview-heading"><h2 id="overview-title">Your referral activity</h2><span className="referral-badge">Available at launch</span></div>
          <div className="referral-stats">{[{ icon: Users, title: "Friends referred" }, { icon: Check, title: "Eligible referrals" }, { icon: Wallet, title: "Total earnings" }].map(({ icon: Icon, title }) => <div key={title}><span><Icon size={16} />{title}</span><strong>—</strong><small>No activity tracked yet</small></div>)}</div>
        </section>
        <section className="referral-faq"><div><span className="referral-kicker">A LITTLE MORE CLARITY</span><h2>Before you share.</h2><p>Everything you need to know about the preview.</p></div><div>{[
          ["How much can I earn?", "The proposed program offers the potential to earn up to ₹5,000 per week. Earnings are not guaranteed. Final eligibility, reward amounts, and payout terms will be published at launch."],
          ["Can I use my referral code today?", "You can copy and share your preview code today. It is saved only in this browser; referral attribution and rewards are not active yet."],
          ["How will I receive my rewards?", "Payout details will be available when the program launches. This preview does not record earnings or process withdrawals."],
        ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
        <footer className="referral-footer"><span>Veadicastro · Share a little clarity.</span><Link to="/dashboard">Back to dashboard <ArrowRight size={14} /></Link></footer>
      </main>
    </div>
  );
}
