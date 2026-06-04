const FounderTrustSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-accent">
              Built with purpose
            </p>
            <h2 className="font-sans text-2xl font-semibold leading-tight text-foreground md:text-4xl">
              Making Vedic astrology easier to understand
            </h2>
          </div>

          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Veadicastro was built to bring serious Vedic knowledge into a format people can use in everyday life. The goal is not to make astrology feel mysterious or fear-based. The goal is to make the chart easier to read, question, and apply.
            </p>
            <p>
              The product keeps traditional chart logic at the center, then uses AI to explain the reading clearly. That balance matters: calculation first, interpretation second, and practical guidance last.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Traditional Vedic chart logic stays at the foundation.</li>
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
