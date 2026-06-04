import { useNavigate } from "react-router-dom";

const linkGroups = [
  {
    title: "AI Astrology",
    links: [
      { name: "AI Astrologer Chat", path: "/free-ai-astrologer-chat" },
      { name: "AI Kundli", path: "/free-kundli-generator" },
      { name: "AI Predictions", path: "/free-5-minutes-astrology-ai" },
    ],
  },
  {
    title: "Vedic Tools",
    links: [
      { name: "Kundli Generator", path: "/free-kundli-generator" },
      { name: "Kundli Matching", path: "/free-kundali-matching" },
      { name: "Today Horoscope", path: "/today-horoscope" },
    ],
  },
  {
    title: "Learn Astrology",
    links: [
      { name: "Mahadasha Guide", path: "/blog/vedic-astrology-ai-kese-kaam-karta-ha" },
      { name: "Nakshatra Basics", path: "/blog/ai-jyotish-vedic-astrology" },
      { name: "Rahu Ketu Transit", path: "/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis" },
    ],
  },
];

const InternalLinksSection = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-16 px-4 border-t border-border/40">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            Explore
          </p>
          <h2 className="font-sans text-2xl font-semibold text-foreground md:text-4xl">
            Simple paths into Veadicastro
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            A small set of useful links for people who want to try the product, generate a chart, or learn the core ideas behind Vedic astrology.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-base font-semibold text-foreground">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavigate(link.path)}
                      className="text-left text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InternalLinksSection;
