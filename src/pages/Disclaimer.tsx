import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";

const Disclaimer = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <SEO
        title="Disclaimer - Veadicastro"
        description="Veadicastro Disclaimer. Read our educational and motivational guidance disclaimer for AI-powered Vedic astrology content."
        keywords={["disclaimer", "veadicastro disclaimer", "astrology disclaimer", "ai astrology guidance"]}
        url="https://veadicastro.in/disclaimer"
      />

      <div className="mx-auto w-full max-w-4xl">
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

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Disclaimer for Veadicastro.in</h1>
          <p className="text-muted-foreground">Last updated: April 3, 2026</p>
          <div className="h-px w-full bg-border" />
        </header>

        <article className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
          <p>
            Welcome to Veadicastro.in. Our goal is to provide you with helpful guidance and motivation based on ancient traditions and modern technology. Please read this short disclaimer before using our site.
          </p>

          <h2>1. Educational & Motivational Purpose</h2>
          <p>
            The content on this website—including AI Chatbot, marriage dates, horoscopes, and planetary analysis—is shared for educational and motivational purposes. We want to guide you through life's journey using the wisdom of Vedic traditions, but our content should be seen as a helpful guide, not a final command.
          </p>

          <h2>2. How We Create Content (AI + Vedic Astrology)</h2>
          <p>
            We use a unique combination of Advanced AI (LLM models) and Traditional Vedic Astrology calculations to create our blogs. While we work hard to provide the best possible insights, please remember that astrology is an interpretive science.
          </p>

          <h2>3. Accuracy & Reliability</h2>
          <p>
            We aim for high quality, but we are not 100% accurate. Life is full of many factors, and astrological predictions can vary. Veadicastro.in is not responsible for any decisions made based on the information provided here. We encourage you to use our site as a starting point for your own research and guidance.
          </p>

          <h2>4. Not Professional Advice</h2>
          <p>
            Our blog is meant to provide spiritual and motivational guidance. It is not professional legal, financial, or medical advice. For serious life matters, please consult with a certified expert or a local priest (Pandit Ji).
          </p>

          <h2>5. External Links</h2>
          <p>
            We may link to other helpful websites. We do not control those sites and are not responsible for their content.
          </p>
        </article>
      </div>
    </div>
  );
};

export default Disclaimer;
