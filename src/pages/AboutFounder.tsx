import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const AboutFounder = () => {
  const navigate = useNavigate();
  
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Arpit Uniyal",
    "jobTitle": "Founder & Visionary",
    "worksFor": {
      "@type": "Organization",
      "name": "Veadicastro"
    },
    "description": "Founder of Veadicastro, passionate about blending ancient Vedic wisdom with modern technology",
    "sameAs": "https://veadicastro.in"
  };

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <SEO
        title="About Founder - Arpit Uniyal | Veadicastro"
        description="Meet Arpit Uniyal, the 17-year-old founder of Veadicastro who is bridging ancient Vedic wisdom with modern AI technology."
        keywords={["Arpit Uniyal", "founder veadicastro", "vedic astrology founder", "AI astrology founder"]}
        url="https://veadicastro.in/about-founder"
        schema={personSchema}
      />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/")}> 
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">About the Founder</h1>
          <h2 className="text-2xl font-semibold text-secondary">Arpit Uniyal</h2>
          <p className="text-lg text-muted-foreground">Founder & Visionary, Veadicastro</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">The Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              At just 17 years old, Arpit Uniyal is the visionary force behind Veadicastro, driven by a profound passion for both ancient Vedic wisdom and cutting-edge technology. His journey began with a simple yet revolutionary question: Could we bridge the gap between 5,000 years of astrological knowledge and the power of Artificial Intelligence?
            </p>
          </div>

          <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">The Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              Arpit's mission extends beyond building a successful platform. He believes that the next generation deserves a smarter, more authentic way to connect with celestial guidance. Under his leadership, Veadicastro has become a trusted platform that combines rigorous study of classical astrological texts with innovative engineering solutions.
            </p>
          </div>

          <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">The Approach</h3>
            <p className="text-muted-foreground leading-relaxed">
              What sets Arpit apart is his unique approach to problem-solving. He doesn't just code; he engineers solutions that respect tradition while embracing innovation. His work involves deep research into ancient Vedic texts, understanding complex astrological calculations, and translating that knowledge into algorithms that can provide genuine, actionable guidance.
            </p>
          </div>

          <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">The Innovation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Arpit led the development of Vedika AI, the world's most sophisticated "Digital Sage" for Vedic astrology. This breakthrough achievement came after countless hours of refining machine learning algorithms to respect the nuances of Parashara teachings while maintaining scientific precision. The result: a 95% accuracy rate that proves the stars aren't just myths—they're data.
            </p>
          </div>

          <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">The Philosophy</h3>
            <p className="text-muted-foreground leading-relaxed">
              For Arpit, technology should empower, not confuse. He stands for "Clarity Over Fear" and believes that astrology should be a tool for empowerment, not superstition. Every line of code he writes is dedicated to helping people make informed, confident decisions about their lives.
            </p>
          </div>

          <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">The Future</h3>
            <p className="text-muted-foreground leading-relaxed">
              Arpit continues to push the boundaries of what's possible when ancient wisdom meets modern technology. His vision for Veadicastro is not just to provide predictions, but to offer a Digital Compass that helps navigate life's challenges with authenticity, accuracy, and genuine care for users' wellbeing.
            </p>
          </div>
        </div>

        {/* Special Thanks & Team */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Special Thanks</h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                A heartfelt thank you to Arpit Uniyal for his vision, dedication, and relentless pursuit of excellence. 
                His innovative spirit and deep respect for ancient wisdom have made Veadicastro a beacon of authenticity 
                in the world of astrology. At just 17 years old, he has shown that age is no barrier to creating 
                meaningful change and bridging the gap between tradition and technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutFounder;
