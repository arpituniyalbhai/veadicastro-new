import { Link } from "react-router-dom";

const FounderTrustSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            Why Trust Veadicastro
          </p>
          <h2 className="font-sans text-2xl font-semibold leading-tight text-foreground md:text-4xl">
            3 Generations of Vedic Knowledge —<br />
            <span className="text-accent">Now Powered by AI</span>
          </h2>
        </div>

        {/* Main Grid */}
        <div className="grid gap-10 md:grid-cols-[1fr_1.5fr] items-start">

          {/* Left — Founder Card */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-accent/40">
              <img
                src="/optimized/founder.webp"
                alt="Arpit Uniyal — Founder of Veadicastro"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/founder.jpeg';
                }}
              />
            </div>
            <div>
              <Link to="/arpit-uniyal" className="font-semibold text-foreground text-lg hover:text-accent transition-colors">Arpit Uniyal</Link>
              <p className="text-sm text-muted-foreground">Founder, Veadicastro</p>
              <p className="text-sm text-accent mt-1">📍 Pauri Garhwal, Uttarakhand</p>
            </div>
            <div className="border-t border-border/40 pt-4 space-y-2 text-sm text-muted-foreground text-left">
              <div className="flex items-center gap-2">
                <span className="text-accent">✦</span>
                <span>Family practicing Vedic astrology for 3 generations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✦</span>
                <span>Swiss Ephemeris + Lahiri Ayanamsa calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✦</span>
                <span>50,000+ users guided since 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✦</span>
                <span>Hindi & English — built for India</span>
              </div>
            </div>
          </div>

          {/* Right — Trust Content */}
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              Veadicastro was built in Pauri Garhwal — a place where Vedic knowledge has lived for thousands of years.{' '}
              <span className="font-semibold text-foreground">
                Arpit's family has practiced Vedic astrology for three generations.
              </span>{' '}
              That real-world knowledge is what powers every prediction on this platform — not generic AI guesswork.
            </p>
            <p>
              Most AI astrology apps are just ChatGPT with an astrology skin. Veadicastro is different —
              it calculates your actual birth chart using{' '}
              <span className="font-semibold text-foreground">Swiss Ephemeris with arc-second precision</span>,
              applies classical Vedic rules for dashas, yogas, and transits, and only then uses AI
              to explain the reading in clear language.
            </p>
            <p>
              People ask personal questions here — about marriage, career, money, timing.
              That trust is not taken lightly. Every answer Vedika gives is grounded in
              your actual chart data, not a zodiac sign generalisation.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-border/50 bg-card/30 px-4 py-3">
                <p className="text-foreground font-semibold text-sm">Real Chart Calculations</p>
                <p className="text-xs text-muted-foreground mt-0.5">Swiss Ephemeris, not estimates</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/30 px-4 py-3">
                <p className="text-foreground font-semibold text-sm">Pauri Garhwal</p>
                <p className="text-xs text-muted-foreground mt-0.5">3-generation Vedic background</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/30 px-4 py-3">
                <p className="text-foreground font-semibold text-sm">50,000+ Users</p>
                <p className="text-xs text-muted-foreground mt-0.5">Trusted across India</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/30 px-4 py-3">
                <p className="text-foreground font-semibold text-sm">Hindi & English</p>
                <p className="text-xs text-muted-foreground mt-0.5">Built for Indian users</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FounderTrustSection;