const enginePoints = [
  {
    title: "Planetary positions",
    description:
      "We use Swiss Ephemeris calculations to place planets accurately for the date, time, and location provided by the user.",
  },
  {
    title: "Vedic chart foundation",
    description:
      "The chart is read through the Lahiri Ayanamsa sidereal system, including Lagna, Moon sign, Nakshatra, houses, and planetary strength.",
  },
  {
    title: "Dashas and transits",
    description:
      "Mahadasha, Antardasha, and current planetary transits are considered together so the answer reflects both birth potential and present timing.",
  },
  {
    title: "AI interpretation",
    description:
      "Vedika explains the chart in simple language after checking multiple signals. AI helps with clarity; the astrological base remains Vedic.",
  },
];

const AstrologyEngineSection = () => {
  return (
    <section className="py-20 px-4 border-y border-border/40">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-wider text-secondary">
            How it works
          </p>
          <h2 className="font-sans text-3xl font-semibold leading-tight text-foreground md:text-5xl">
            How Veadicastro Work?
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Veadicastro is built around chart-first interpretation. We calculate the birth chart, read the current timing, and then use AI to explain the result in a way that feels clear and practical.
          </p>
        </div>

        <div className="mt-10 divide-y divide-border/50">
          {enginePoints.map((point) => (
            <div key={point.title} className="grid gap-3 py-6 md:grid-cols-[220px_1fr] md:gap-8">
              <h3 className="text-lg font-semibold text-foreground">{point.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AstrologyEngineSection;
