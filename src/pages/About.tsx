import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const About = () => {
  const navigate = useNavigate();
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Veadicastro",
    "url": "https://veadicastro.in",
    "logo": "https://veadicastro.in/logo.png",
    "description": "AI-powered Vedic astrology platform providing personalized astrological guidance",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "veadicastro@gmail.com",
      "telephone": "+91-94117-61184",
      "contactType": "Customer Service"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dehradun",
      "addressRegion": "Uttarakhand",
      "addressCountry": "IN"
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <SEO
        title="About Veadicastro - AI-Powered Vedic Astrology"
        description="Learn about Veadicastro's mission to blend classical Vedic astrology with modern AI technology. Authentic methods, clarity over fear, privacy first."
        keywords={["about veadicastro", "vedic astrology platform", "AI astrology", "astrology company"]}
        url="https://veadicastro.in/about"
        schema={organizationSchema}
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/")}> 
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">About Veadicastro</h1>
        <p className="text-muted-foreground">
          Veadicastro blends classical Vedic astrology with modern engineering to deliver clear, actionable guidance. 
          Our goal is to make authentic astrology simple, respectful, and genuinely helpful for everyday decisions.
        </p>
        <h2 className="text-xl font-semibold">Our Story</h2>
        <p className="text-muted-foreground">
          It started with one simple question: Can we combine 5,000 years of Vedic knowledge with the power of Artificial Intelligence? For a long time, astrology has been stuck between two worlds. On one side, you have ancient, deep knowledge that takes a lifetime to master. On the other, you have modern technology that is fast but often "hollow"—delivering vague, generic horoscopes that apply to everyone and no one.
        </p>
        
        <p className="text-muted-foreground">
          We saw the struggle users faced: the fear of being misled by "fraudless" claims and the frustration of getting answers that lacked depth. We decided to bridge that gap. The goal wasn't just to build a chatbot; it was to engineer Vedika AI—the world's most sophisticated "Digital Sage."
        </p>

        <h2 className="text-xl font-semibold">The Engineering Struggle: From Code to Consciousness</h2>
        <p className="text-muted-foreground">
          Building Vedika AI was not a simple weekend project. It was a rigorous journey of trial and error. The biggest challenge wasn't just the math—it was the logic of karma.
        </p>
        
        <p className="text-muted-foreground">
          Vedic astrology is incredibly complex, involving millions of permutations across divisional charts, dashas, and transits. Most AI models fail here because they try to generalize. We spent years in the "development trenches," refining our machine-learning algorithms to respect the nuances of the Parashara teachings while maintaining a scientific edge.
        </p>
        
        <p className="text-muted-foreground">
          There were countless nights where the logic didn't align—where the AI could calculate a position but couldn't explain the "why." We pushed through the technical exhaustion, retraining our models on massive datasets of historical charts and planetary patterns until the "robotic" tone disappeared, replaced by clear, actionable intelligence.
        </p>

        <h2 className="text-xl font-semibold">The 95% Breakthrough</h2>
        <p className="text-muted-foreground">
          The turning point came during our most intensive testing phase. We put Vedika AI against thousands of real-world scenarios and verified historical outcomes. The result changed everything: Vedika AI achieved a 95% accuracy rate.
        </p>
        
        <p className="text-muted-foreground">
          This milestone proved that the stars aren't just myths—they are data. By treating celestial movements with scientific precision, we created an engine that delivers:
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li><strong>Fraud-Free Results:</strong> No human bias, no hidden agendas, and no fear-based "remedies."</li>
          <li><strong>Actionable Clarity:</strong> Simple, easy-to-understand guidance for your career, relationships, and health.</li>
          <li><strong>Instant Intelligence:</strong> While a human expert might take hours to calculate a single Mahadasha, Vedika AI analyzes your entire cosmic roadmap in seconds.</li>
        </ul>

        <h2 className="text-xl font-semibold">What We Stand For</h2>
        <p className="text-muted-foreground">
          At Veadicastro, we believe that technology should empower you, not confuse you. We stand for Clarity Over Fear. We are a team of tech-savvies and tradition-keepers led by our 17-year-old founder, Arpit Uniyal, who believed that the next generation deserves a smarter way to look at the stars.
        </p>
        
        <p className="text-muted-foreground">
          We aren't just providing predictions; we are providing a Digital Compass. Every line of code in Vedika AI is dedicated to helping you make informed, confident decisions about your life.
        </p>

        <h2 className="text-xl font-semibold">Our Mission</h2>
        <p className="text-muted-foreground">
          At Veadicastro, we are committed to bridging the ancient wisdom of Vedic astrology with modern technology. 
          Our mission is to make authentic astrological guidance accessible, understandable, and practical for contemporary life.
        </p>
        
        <h2 className="text-xl font-semibold">Our Approach</h2>
        <p className="text-muted-foreground">
          We believe that astrology should be a tool for empowerment, not fear. Our platform provides insights based on 
          time-tested Vedic principles while ensuring that every recommendation is practical and grounded in reality. 
          We avoid sensational claims and focus on delivering value through accuracy, transparency, and genuine care for our users' wellbeing.
        </p>
        
        <h2 className="text-xl font-semibold">Our Promise</h2>
        <p className="text-muted-foreground">
          No vague predictions or exaggerated claims. We explain the reasoning behind every insight and maintain 
          complete transparency about our methods. Your trust is our highest priority, so we commit to honest, 
          accurate, and genuinely helpful guidance that respects both tradition and modern sensibilities.
        </p>

        <h2 className="text-xl font-semibold">Meet Our Founder</h2>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Arpit Uniyal</h3>
          <p className="text-muted-foreground leading-relaxed">
            Arpit Uniyal is the founder and visionary behind Veadicastro. With a deep passion for both 
            ancient Vedic wisdom and modern technology, he embarked on a mission to create a platform that 
            makes authentic astrology accessible to everyone. His approach combines rigorous study of classical 
            astrological texts with innovative engineering solutions, ensuring that traditional knowledge is 
            preserved while being made relevant for contemporary users. Under his leadership, Veadicastro 
            has become a trusted platform for those seeking genuine astrological guidance that is both 
            spiritually grounded and practically applicable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
