const AccuracySection = () => {
  return (
    <section className="relative py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-10 bottom-10 w-80 h-80 rounded-full blur-3xl bg-secondary/20" />
      </div>
      <div className="container mx-auto px-4 max-w-6xl relative">
        <header className="mb-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-accent/15 border border-white/10">Why Choose Us</span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-white">Unmatched Accuracy.</span>{' '}
            <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">Real Guidance.</span>
          </h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            We combine traditional Vedic calculations with AI to deliver clarity you can trust.
          </p>
        </header>

        {/* Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[{k:"Calc Accuracy",v:"99.97%"},{k:"User Satisfaction",v:"4.9/5"},{k:"Avg. Response",v:"< 2s"},{k:"Reports Delivered",v:"100K+"}].map((m) => (
            <div key={m.k} className="rounded-2xl p-5 bg-card/40 border border-white/10 text-center">
              <div className="text-xs text-white/60">{m.k}</div>
              <div className="text-2xl font-bold mt-1 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">{m.v}</div>
            </div>
          ))}
        </div>

        {/* Comparison visual */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-2xl p-6 bg-background/50 border border-white/10">
            <h3 className="font-semibold mb-2">Others</h3>
            <ul className="text-sm text-white/70 space-y-2 list-disc pl-5">
              <li>Generic horoscopes and vague advice</li>
              <li>No timing clarity for decisions</li>
              <li>One-size-fits-all interpretations</li>
            </ul>
          </div>
          <div className="rounded-2xl p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">Veadicastro</h3>
            <ul className="text-sm text-white/80 space-y-2 list-disc pl-5">
              <li>Personalized insights based on your exact chart</li>
              <li>Clear timing from transits and dashas</li>
              <li>Actionable guidance in simple language</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccuracySection;
