const FounderTrustSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-accent">
              Founder note
            </p>
            <h2 className="font-sans text-2xl font-semibold leading-tight text-foreground md:text-4xl">
              Why Arpit Uniyal built Veadicastro
            </h2>
          </div>

          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Veadicastro was founded by <span className="font-semibold text-foreground">Arpit Uniyal</span> to make Vedic astrology easier to understand and more accessible for everyday decisions. The goal is not to make astrology feel mysterious or fear-based. The goal is to help people read their chart with more clarity.
            </p>
            <p>
              Trust matters in astrology because people ask personal questions about career, relationships, marriage, money, and timing. That is why Veadicastro keeps traditional chart logic at the center, uses transparent calculation methods, and applies AI only to explain the reading in simpler language.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Founded by Arpit Uniyal with a focus on practical Vedic guidance.</li>
              <li>Birth chart logic, dashas, and transits stay at the foundation.</li>
              <li>AI is used for explanation, not as a replacement for calculation.</li>
              <li>Guidance is written to be calm, practical, and easy to understand.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderTrustSection;
