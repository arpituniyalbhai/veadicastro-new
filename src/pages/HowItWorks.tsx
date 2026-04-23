import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const HowItWorks = () => {
  const navigate = useNavigate();
  
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How Veadicastro Works",
    "description": "Learn how Veadicastro uses AI and Vedic astrology to provide accurate predictions",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Onboarding: Birth Details",
        "text": "Provide Date, Time, and Place of Birth. We normalize time zones and geocode coordinates."
      },
      {
        "@type": "HowToStep",
        "name": "Astrology LLM Context",
        "text": "Chart context goes to our astrology LLM with retrieval of canonical rules (dashas, yogas, divisional logic)."
      },
      {
        "@type": "HowToStep",
        "name": "Today's Data Check",
        "text": "High-precision ephemeris + transit engine overlays current positions on D1/D9/D10."
      },
      {
        "@type": "HowToStep",
        "name": "Accuracy & Confidence",
        "text": "We cross-check dasha timing, transit strength, and divisional confirmations."
      },
      {
        "@type": "HowToStep",
        "name": "Clear, Actionable Output",
        "text": "You receive do's/don'ts, time windows, and remedies in simple language."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <SEO
        title="How Veadicastro Works - AI Astrology Process"
        description="Learn how Veadicastro combines high-precision ephemeris, AI-powered analysis, and Vedic astrology principles to deliver accurate predictions and guidance."
        keywords={["how astrology works", "vedic astrology process", "AI astrology technology", "astrology accuracy"]}
        url="https://veadicastro.in/how-it-works"
        schema={howToSchema}
      />
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/")}> 
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">How it works</h1>
        <p className="text-muted-foreground max-w-3xl">
          We aim for high accuracy by combining classical Vedic rules with modern computation. Below is the exact pipeline from onboarding to your final guidance.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-[0_10px_30px_hsl(var(--primary)/0.15)]">
            <h3 className="font-semibold mb-1">1) Onboarding: Birth details</h3>
            <p className="text-sm text-muted-foreground">You provide Date, Time, and Place of Birth. We normalize time zones/DST and geocode coordinates to compute precise longitudes.</p>
          </Card>
          <Card className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-[0_10px_30px_hsl(var(--primary)/0.15)]">
            <h3 className="font-semibold mb-1">2) Astrology LLM context</h3>
            <p className="text-sm text-muted-foreground">Chart context goes to our astrology LLM with retrieval of canonical rules (dashas, yogas, divisional logic). Guided prompts + function calling avoid guesses.</p>
          </Card>
          <Card className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-[0_10px_30px_hsl(var(--primary)/0.15)]">
            <h3 className="font-semibold mb-1">3) Today’s data check</h3>
            <p className="text-sm text-muted-foreground">High‑precision ephemeris + transit engine overlays current positions on D1/D9/D10 to highlight active themes, key dates, and risk windows.</p>
          </Card>
          <Card className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-[0_10px_30px_hsl(var(--primary)/0.15)]">
            <h3 className="font-semibold mb-1">4) Accuracy & confidence</h3>
            <p className="text-sm text-muted-foreground">We cross‑check dasha timing, transit strength, and divisional confirmations; conflicting signals reduce strength and show a confidence band.</p>
          </Card>
          <Card className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-[0_10px_30px_hsl(var(--primary)/0.15)] md:col-span-2">
            <h3 className="font-semibold mb-1">5) Clear, actionable output</h3>
            <p className="text-sm text-muted-foreground">You receive do’s/don’ts, time windows, and remedies in simple language—each grounded in checks above.</p>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tech under the hood</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>High‑precision ephemeris and transit engine</li>
            <li>Divisional charts (D1, D9, D10) computation</li>
            <li>Astrology LLM with retrieval‑augmented prompts and function calling</li>
            <li>Rule validation, conflict resolution, and confidence scoring</li>
            <li>Context memory so Vedika remembers your goals across chats</li>
          </ul>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Human-in-the-loop",
              text: "Astrologers audit new templates, review edge cases, and keep the AI grounded in classical texts."
            },
            {
              title: "Security & privacy",
              text: "Birth data is encrypted, GST invoices are stored in a separate project, and you can wipe data anytime from settings."
            },
            {
              title: "Continuous learning",
              text: "Feedback buttons, CSAT surveys, and cohort analysis feed a supervised fine-tuning loop every sprint."
            }
          ].map((item) => (
            <Card key={item.title} className="p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur">
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Journey from question to insight</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li><span className="font-semibold text-foreground">Intent capture:</span> Vedika tags your chat with themes (career, relationships, health) to pull the right rulebooks.</li>
            <li><span className="font-semibold text-foreground">Dynamic retrieval:</span> We fetch divisional highlights, active dashas, and relevant remedies instead of dumping your entire chart.</li>
            <li><span className="font-semibold text-foreground">Verification loop:</span> The model must cite at least two astrological signals before it can answer; if signals conflict, it marks the response as “low confidence.”</li>
            <li><span className="font-semibold text-foreground">Action layer:</span> Finally, Vedika converts the inference into “do / avoid / timing” statements and appends remedies only when all prerequisites are met.</li>
          </ol>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6 rounded-2xl border border-border/60 bg-card/40">
            <h3 className="font-semibold mb-2">What you can expect</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Context-aware chat replies within 30 seconds</li>
              <li>Weekly digest email summarizing transits that matter to you</li>
              <li>PDF reports with visual timelines and remedial checklists</li>
              <li>Proactive nudges when a key dasha change is 14 days away</li>
            </ul>
          </Card>
          <Card className="p-6 rounded-2xl border border-border/60 bg-card/40">
            <h3 className="font-semibold mb-2">Our promises</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>No fear mongering or fatalistic language</li>
              <li>Full transparency on why we recommend a remedy</li>
              <li>Human support within 24 hours if something feels off</li>
              <li>7-day refund window for every new subscription</li>
            </ul>
          </Card>
        </div>

        <Card className="p-6 rounded-2xl border border-secondary/40 bg-secondary/10">
          <h3 className="text-xl font-semibold mb-2">Ready to experience it?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start with a Basic plan, unlock Premium, or top up questions whenever you need deeper insights. Every plan comes with onboarding support so your birth inputs are verified once and reused forever.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="cosmic" onClick={() => navigate("/pricing")}>View plans</Button>
            <Button variant="outline" onClick={() => navigate("/contact")}>Talk to our team</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
;

export default HowItWorks;
