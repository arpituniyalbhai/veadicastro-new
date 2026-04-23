import React from 'react';
import { CheckCircle, Brain, TrendingUp, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const VedikaDifferenceSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-primary/5 to-background border-y border-border/40">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header - More Impactful */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> The Science of Destiny
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent">
            Precision Beyond Prediction
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Most AI tools guess based on text patterns. <span className="text-white font-semibold">Vedika AI</span> calculates based on real-time planetary mathematics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side: Technical Edge */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-sm hover:border-accent/50 transition-all">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">The Lahiri Precision</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We use the <strong>Lahiri Ayanamsa System</strong>, the same standard used by the Govt. of India for official Panchangs. Every planet's position is calculated to the exact arc-second.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-sm hover:border-secondary/50 transition-all">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">The Probability Engine</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our AI generates <strong>Probability Scores</strong> for career, health, and marriage, giving you a data-backed roadmap rather than vague generic advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
{/* Right Side: Visual Proof (The "Clarity" Part) */}
<div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 overflow-hidden shadow-2xl">
  <div className="relative z-10 space-y-5">
    <h4 className="text-xs font-bold uppercase text-accent tracking-widest mb-4 flex items-center gap-2">
      <Sparkles className="w-4 h-4" /> Live AI Analysis Preview
    </h4>
    
    {/* Card 1: Marriage (The most asked question) */}
    <div className="bg-background/60 backdrop-blur-md p-4 rounded-xl border border-border/40 hover:border-pink-500/50 transition-all group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium group-hover:text-pink-400 transition-colors">Marriage & Relationship Timing</span>
        <span className="text-pink-500 font-bold text-sm">88% Accuracy</span>
      </div>
      <div className="w-full bg-border/20 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 h-full w-[88%]" />
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 italic">"Strong Venus-Jupiter alignment detected for late 2026."</p>
    </div>

    {/* Card 2: Startup / Business (Entrepreneurial focus) */}
    <div className="bg-background/60 backdrop-blur-md p-4 rounded-xl border border-border/40 hover:border-blue-500/50 transition-all group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">Startup Success & Funding</span>
        <span className="text-blue-500 font-bold text-sm">74% Probability</span>
      </div>
      <div className="w-full bg-border/20 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-[74%]" />
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 italic">"10th House Lord strength suggests success in Tech ventures."</p>
    </div>

    {/* Card 3: Government Job (High volume search in India) */}
    <div className="bg-background/60 backdrop-blur-md p-4 rounded-xl border border-border/40 hover:border-yellow-500/50 transition-all group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium group-hover:text-yellow-400 transition-colors">Government Job (Sarkari Naukri)</span>
        <span className="text-yellow-500 font-bold text-sm">62% Match</span>
      </div>
      <div className="w-full bg-border/20 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-400 h-full w-[62%]" />
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 italic">"Sun (Surya) position indicates high authority but requires Rahu remedies."</p>
    </div>

    {/* Card 4: Foreign Settlement (Modern aspiration) */}
    <div className="bg-background/60 backdrop-blur-md p-4 rounded-xl border border-border/40 hover:border-green-500/50 transition-all group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium group-hover:text-green-400 transition-colors">Foreign Travel & Settlement</span>
        <span className="text-green-500 font-bold text-sm">91% Probability</span>
      </div>
      <div className="w-full bg-border/20 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full w-[91%]" />
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 italic">"9th and 12th House connection is extremely favorable in 2026."</p>
    </div>

    <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
      <ShieldCheck className="w-4 h-4 text-accent" /> 
      <span>Data-backed roadmap updated for 2026 transits.</span>
    </div>
  </div>
  
  {/* Decorative Glow */}
  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 blur-[80px] rounded-full" />
</div>

        {/* Bottom Trust Banner */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-medium text-sm"> <Zap className="w-4 h-4 text-yellow-500" /> Real-time Ephemeris </div>
          <div className="flex items-center gap-2 font-medium text-sm"> <CheckCircle className="w-4 h-4 text-green-500" /> Lahiri Ayanamsa </div>
          <div className="flex items-center gap-2 font-medium text-sm"> <ShieldCheck className="w-4 h-4 text-blue-500" /> Verified Logic </div>
        </div>
      </div>
    </div>
    </section>
  );
};

export default VedikaDifferenceSection;