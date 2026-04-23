import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const Mission = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Our Mission - Veadicastro"
        description="Discover Veadicastro's mission to bring authentic Vedic astrology back with AI technology. We're building a transparent, fear-free astrology platform rooted in ancient wisdom."
        keywords={[
          "vedic astrology mission",
          "authentic astrology",
          "AI astrology platform",
          "fear-free predictions",
          "transparent astrology",
          "vedic wisdom",
          "astrology revolution",
          "ethical astrology"
        ]}
        url="https://veadicastro.in/mission"
      />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <header className="mb-10 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Our Mission</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            At Veadicastro, our goal is simple: bring real Vedic knowledge back to astrology
            and end all the fake, fear-based prediction culture.
          </p>
        </header>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">Why we exist</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            We're building an AI-powered astrology system that's 100% transparent, data-backed,
            and rooted in original Vedic principles — not superstition, not guesswork, and
            definitely not fraud.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Veadicastro exists to make astrology clean, trustworthy, and accessible for
            everyone. We want people to feel clarity, not fear, when they look at their chart
            or predictions.
          </p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">What we want for every person</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Our mission is to give every user a simple, honest way to understand their
            horoscope and life patterns:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground">
            <li>Understand their birth chart clearly in plain language.</li>
            <li>Get predictions based on real planetary logic and timing.</li>
            <li>Receive guidance without fear, manipulation, or confusion.</li>
            <li>Experience modern AI + ancient Vedic wisdom in one place.</li>
            <li>Access accurate, honest, and easy-to-use astrology — for free.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">How we see Vedic astrology</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            We believe Vedic astrology is a deep calculation science, not a business of fear.
            Our long-term vision is to show that when done properly, with correct rules and
            transparent explanations, astrology can be a tool for better decisions rather than
            anxiety.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Every feature we build — from daily predictions to detailed reports — follows this
            principle: clear logic, clear language, and clear boundaries on what astrology can
            and cannot promise.
          </p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">Our core principles</h2>
          <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground">
            <li>100% transparent calculations and predictions.</li>
            <li>No fear-based marketing, threats, or manipulation.</li>
            <li>Rooted in authentic Vedic rules, not shortcuts or superstition.</li>
            <li>AI used as a helper to scale accuracy, not to replace core logic.</li>
            <li>Design every flow to reduce confusion and increase understanding.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">Where we are going</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Step by step, we are building the most accurate, ethical, and user-first astrology
            platform we can. That means slow, careful improvements, listening to feedback,
            and keeping our mission above everything else.
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            If you choose to use Veadicastro, you are part of that mission: proving that
            Vedic astrology can be modern, honest, and genuinely helpful.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Mission;
