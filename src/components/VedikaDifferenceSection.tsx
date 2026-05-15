import React from 'react';
import { Sparkles, Award } from 'lucide-react';

const rows = [
  { feature: 'Real-time AI Chat',       sub: 'Ask anything, anytime',      vedika: 'yes', melloha: 'yes',     astro: 'no'      },
  { feature: 'Lahiri Ayanamsa',         sub: 'Govt. of India standard',     vedika: 'yes', melloha: 'Partial', astro: 'Partial' },
  { feature: 'Personalised Predictions',sub: 'Your exact birth chart',      vedika: 'yes', melloha: 'yes',     astro: 'no'      },
  { feature: 'Hindi + English',         sub: 'Switch anytime',              vedika: 'yes', melloha: 'no',      astro: 'Hindi only'},
  { feature: 'Instant AI Kundli',       sub: 'Under 60 seconds',            vedika: 'yes', melloha: 'Basic',   astro: 'Basic'   },
  { feature: 'Mahadasha + AI Insights', sub: 'Full dasha roadmap',          vedika: '✓ + AI', melloha: 'Basic', astro: 'yes'   },
  { feature: 'Human Astrologer',        sub: 'Book a real pandit',          vedika: 'yes', melloha: 'yes',     astro: 'yes'     },
  { feature: 'Ad-free Experience',      sub: 'Zero distractions',           vedika: 'yes', melloha: 'no',      astro: 'no'      },
  { feature: 'Starting Price',          sub: 'Lowest paid plan',            vedika: '₹149/mo', melloha: '₹799+/mo', astro: '₹500+/mo' },
];

const Cell = ({ val, isVedika = false }: { val: string; isVedika?: boolean }) => {
  if (val === 'yes') return <span className={isVedika ? 'text-green-400' : 'text-green-500'}>✓</span>;
  if (val === 'no')  return <span className="text-red-500">✕</span>;
  if (val === 'Partial' || val === 'Basic' || val === 'Hindi only')
    return <span className="text-yellow-500 text-[10px] font-semibold">{val}</span>;
  if (isVedika && val.startsWith('₹'))
    return <span className="font-bold text-xs" style={{color:'#d9277a'}}>{val}</span>;
  if (val.startsWith('₹'))
    return <span className="text-xs text-muted-foreground">{val}</span>;
  if (isVedika)
    return <span className="text-[10px] font-semibold" style={{color:'#d9277a'}}>{val}</span>;
  return <span className="text-xs text-muted-foreground">{val}</span>;
};

const VedikaDifferenceSection = () => (
  <section className="py-16 px-4 bg-gradient-to-b from-background via-primary/5 to-background border-y border-border/40">
    <div className="container mx-auto max-w-5xl">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-[11px] font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3 h-3" /> Side-by-Side Comparison
        </div>
        <h2 className="text-2xl sm:text-4xl font-semibold mb-3 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent">
          Why <span style={{color:'#d9277a'}}>Vedika AI</span> stands apart
        </h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Compare us vs premium & popular astrology platforms
        </p>
      </div>

      {/* Scroll hint */}
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
        <span>←</span> Scroll to compare all columns <span>→</span>
      </p>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-border/60" style={{WebkitOverflowScrolling:'touch'}}>
        <table className="border-collapse" style={{minWidth:'400px', width:'100%'}}>
          <thead>
            <tr>
              <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-foreground bg-card/80 sticky left-0 z-10 border-r border-border/40" style={{minWidth:'130px'}}>Feature</th>
              <th className="text-center px-3 py-3 text-[11px] font-bold border-l-2 border-r border-secondary/60" style={{background:'#d9277a18', color:'#d9277a', minWidth:'110px'}}>✦ Vedika AI</th>
              <th className="text-center px-3 py-3 text-[11px] font-semibold text-muted-foreground bg-card/80" style={{minWidth:'100px'}}>Melloha</th>
              <th className="text-center px-3 py-3 text-[11px] font-semibold text-muted-foreground bg-card/80" style={{minWidth:'100px'}}>AstroSage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border/40">
                <td className="px-3 py-3 sticky left-0 z-10 bg-background border-r border-border/40">
                  <span className="text-xs font-semibold text-foreground block">{row.feature}</span>
                  <span className="text-[10px] text-muted-foreground">{row.sub}</span>
                </td>
                <td className="text-center px-3 py-3 border-l-2 border-r border-secondary/40 text-base" style={{background:'#d9277a08'}}>
                  <Cell val={row.vedika} isVedika />
                </td>
                <td className="text-center px-3 py-3 text-base"><Cell val={row.melloha} /></td>
                <td className="text-center px-3 py-3 text-base"><Cell val={row.astro} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Winner bar */}
      <div className="mt-5 flex items-start gap-3 px-4 py-4 rounded-2xl border border-secondary/40 bg-secondary/10">
        <Award className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color:'#d9277a'}} />
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold" style={{color:'#d9277a'}}>Vedika AI</span> beats premium platforms on AI chat, Vedic accuracy & bilingual support — at{' '}
          <span className="font-semibold" style={{color:'#d9277a'}}>5× lower price</span> than Melloha. No ads. Built for India.
        </p>
      </div>

    </div>
  </section>
);

export default VedikaDifferenceSection;