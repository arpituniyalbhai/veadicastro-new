import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const Contact = () => {
  const navigate = useNavigate();

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Veadicastro",
    "description": "Get in touch with Veadicastro for support, partnerships, or inquiries",
    "mainEntity": {
      "@type": "Organization",
      "name": "Veadicastro",
      "email": "support@veadicastro.in"
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 lg:px-8 py-12">
      <SEO
        title="Contact Veadicastro - Get in Touch"
        description="Contact Veadicastro for product support, partnerships, or inquiries. Email: support@veadicastro.in"
        keywords={["contact veadicastro", "astrology support", "vedicastro contact", "customer support"]}
        url="https://veadicastro.in/contact"
        schema={contactSchema}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-secondary uppercase tracking-wide">Get in touch</p>
          <h1 className="text-4xl md:text-5xl font-bold">Contact Veadicastro</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you. Reach out for product support, partnerships, or just to say hello.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <Card className="p-6 space-y-3 bg-card/50 border-border/60 max-w-md mx-auto">
            <Mail className="w-8 h-8 text-secondary" />
            <h3 className="text-lg font-semibold">Email Support</h3>
            <p className="text-sm text-muted-foreground">We respond within 24 hours.</p>
            <Button variant="link" className="px-0 text-base" asChild>
              <a href="mailto:support@veadicastro.in">support@veadicastro.in</a>
            </Button>
          </Card>
        </div>

        <Card className="p-6 md:p-8 bg-card/40 border border-border/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Prefer WhatsApp or chat?</h3>
              <p className="text-sm text-muted-foreground">Drop us a quick message and we'll respond shortly.</p>
            </div>
            <Button variant="cosmic" className="w-full md:w-auto gap-2" asChild>
              <a href="mailto:support@veadicastro.in">
                <MessageCircle className="w-4 h-4" />
                Send a Message
              </a>
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card/40 border border-border/60">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Important Notice</h3>
            <p className="text-muted-foreground">
              For refund requests or feedback, please email us at <strong>support@veadicastro.in</strong>. 
              Before sending an email, we kindly request you to read our <strong>Privacy Policy</strong> and <strong>Refund Policy</strong>.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Privacy Policy
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href="/refund" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Refund Policy
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Contact;

