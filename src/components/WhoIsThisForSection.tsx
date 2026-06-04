const audiences = [
  "Career guidance and work timing",
  "Relationship clarity and compatibility",
  "Daily predictions for health, self, and wealth",
  "Marriage and partnership matching",
  "Self-understanding through Lagna, Moon sign, and Nakshatra",
];

const WhoIsThisForSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-wider text-secondary">
            Who it is for
          </p>
          <h2 className="font-sans text-3xl font-semibold leading-tight text-foreground md:text-5xl">
            For real questions, not random predictions
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Veadicastro is meant for people who want practical guidance from their birth chart. It is useful when you have a decision to make, a pattern to understand, or a timing question that needs more than a generic horoscope.
          </p>
        </div>

        <ul className="mt-8 grid gap-x-10 gap-y-4 text-base text-muted-foreground md:grid-cols-2">
          {audiences.map((item) => (
            <li key={item} className="border-b border-border/40 pb-3">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default WhoIsThisForSection;
