import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Star,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const reportPlans = [
  {
    name: "Basic Personalized Report",
    price: "₹999",
    pages: "10-15 pages",
    delivery: "24-48 hours",
    description: "Good entry product for clear guidance on key life areas.",
    features: ["Career", "Finance", "Relationship", "Current dasha", "Remedies"],
  },
  {
    name: "Deep Life Analysis",
    price: "₹1999",
    pages: "25-35 pages",
    delivery: "24-48 hours",
    description: "Our recommended best-seller for a complete life blueprint.",
    highlighted: true,
    features: [
      "Complete life blueprint",
      "Yearly timeline",
      "Marriage timing",
      "Wealth periods",
      "Business and career",
      "Strengths and weaknesses",
      "Remedies",
      "Lucky periods",
    ],
  },
  {
    name: "Premium Expert Guidance",
    price: "₹3999",
    pages: "40+ pages + personal voice note OR short video summary",
    delivery: "Priority delivery",
    description: "High-touch guidance with expert review, support, and consultation.",
    features: [
      "Expert astrologer review",
      "Priority delivery",
      "WhatsApp support",
      "Custom remedies",
      "15 min consultation",
    ],
  },
];

const trustCards = [
  {
    title: "Expert Astrologer Analysis",
    text: "Your report is personally reviewed and prepared by experienced Vedic astrologers.",
    icon: UserCheck,
  },
  {
    title: "Delivered Within 48 Hours",
    text: "Every report takes time because it is manually analyzed and customized for you.",
    icon: Clock,
  },
  {
    title: "Deep Personalized Guidance",
    text: "Includes detailed insights on career, money, marriage, health, relationships, future timing, and remedies.",
    icon: BookOpen,
  },
];

const processSteps = [
  "Study your complete birth chart",
  "Analyze planetary combinations",
  "Check dashas and transits",
  "Prepare personalized remedies",
  "Manually review every section before delivery",
];

const comparisonRows = [
  ["Auto generated instantly", "Personally prepared"],
  ["Generic predictions", "Deep personalized analysis"],
  ["No astrologer review", "Expert reviewed"],
  ["Basic insights", "Detailed life guidance"],
  ["Same template for everyone", "Customized for your chart"],
];

const requiredDetails = [
  "Date of birth",
  "Exact birth time",
  "Birth place",
  "Main question/focus area",
];

const qualityPoints = [
  "Human-prepared & expert-reviewed before delivery",
  "Specific chart references, timing, and custom remedies",
  "Technology may support formatting, but final analysis is prepared and reviewed by an astrologer.",
  "No generic instant PDF or copy-paste astrology text",
  "If birth details are incorrect, prediction accuracy may be affected.",
];

const testimonials = [
  {
    quote:
      "I expected a normal astrology PDF, but this felt deeply personal. The career and relationship timing matched my real situation surprisingly well.",
    name: "Rahul S.",
    location: "Delhi",
  },
  {
    quote:
      "The report was detailed, structured, and easy to understand. It felt like someone actually studied my chart instead of generating generic predictions.",
    name: "Priya M.",
    location: "Mumbai",
  },
  {
    quote:
      "The remedies section was my favorite part. It didn’t feel copy-pasted like other astrology reports online.",
    name: "Ankit R.",
    location: "Bangalore",
  },
  {
    quote:
      "I was confused about career and finances. The Deep Life Analysis gave me clarity and confidence about my next steps.",
    name: "Sneha K.",
    location: "Pune",
  },
  {
    quote:
      "You can clearly feel the difference between instant AI reports and this expert-prepared analysis.",
    name: "Harsh V.",
    location: "Jaipur",
  },
];

const faqs = [
  {
    q: "Is this an AI-generated report?",
    a: "No. Every report is personally prepared and reviewed by an expert Vedic astrologer. Technology may assist formatting and research, but the final analysis is human-reviewed and customized.",
  },
  {
    q: "How long does delivery take?",
    a: "Most reports are delivered within 24-48 hours. Premium reports may receive priority delivery.",
  },
  {
    q: "What details do I need to provide?",
    a: "You need your date of birth, exact birth time, birth place, and your main concern or question if you have one.",
  },
  {
    q: "Why does the report take time?",
    a: "Because astrologers manually analyze your birth chart, planetary combinations, dashas, transits, remedies, and life timing before preparing your final report.",
  },
  {
    q: "Will my report be personalized?",
    a: "Yes. Your report is prepared specifically for your birth chart and life situation. It is not a generic template shared with everyone.",
  },
  {
    q: "Can I ask questions after receiving the report?",
    a: "Premium plans include support/consultation options. Basic plans may have limited support.",
  },
  {
    q: "What topics are covered in the report?",
    a: "Depending on the plan, reports may cover career, finance, marriage, love life, health, wealth timing, lucky periods, remedies, spiritual growth, and future opportunities.",
  },
  {
    q: "What if my birth time is not accurate?",
    a: "Astrology accuracy depends heavily on correct birth details. Incorrect birth time may affect prediction accuracy.",
  },
  {
    q: "Are refunds available?",
    a: "Because reports are manually prepared and personalized, refunds may not be available once work has started.",
  },
  {
    q: "How is this different from free astrology websites?",
    a: "Most free websites generate instant automated reports. Veadicastro reports are manually reviewed, deeply personalized, and focused on practical life guidance.",
  },
];

const DeepReports = () => {
  const navigate = useNavigate();

  const startReport = (planName: string, amount: string) => {
    const numericAmount = amount.replace(/[^0-9]/g, "");
    navigate(`/pricing/onboarding?plan=${encodeURIComponent(planName)}&amount=${numericAmount}&type=report`);
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Veadicastro Deep Reports",
    description: "Personalized Vedic astrology reports prepared and reviewed by expert astrologers.",
    brand: {
      "@type": "Brand",
      name: "Veadicastro",
    },
    offers: reportPlans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price.replace(/[^0-9]/g, ""),
      priceCurrency: "INR",
      availability: "https://schema.org/LimitedAvailability",
    })),
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-10 lg:px-6">
      <SEO
        title="Deep Reports - Veadicastro Expert Astrology Reports"
        description="Personally prepared Vedic astrology reports reviewed by expert astrologers. Choose Basic, Deep Life Analysis, or Premium Expert Guidance."
        keywords={["vedic astrology report", "expert astrology report", "personalized kundli report", "deep life analysis", "astrology remedies"]}
        url="https://veadicastro.in/deep-reports"
        schema={schema}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
          <div className="relative px-5 py-10 sm:px-8 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--secondary)/0.22),transparent_32%),radial-gradient(circle_at_85%_15%,hsl(var(--primary)/0.18),transparent_34%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <Badge className="mb-4 border-secondary/40 bg-secondary/15 text-secondary hover:bg-secondary/15">
                  Expert reviewed reports
                </Badge>
                <h1 className="max-w-4xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Personally Prepared by Expert Vedic Astrologers
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Not instant automated text. Every report is carefully analyzed and prepared by a real astrology expert using your birth chart, planetary positions, dashas, and life patterns.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button variant="cosmic" size="xl" onClick={() => startReport("Deep Life Analysis", "₹1999")}>
                    Choose Deep Life Analysis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="cosmicOutline" size="xl" onClick={() => navigate("/reports?referral=deep-reports")}>
                    View Existing Reports
                  </Button>
                </div>
              </div>

              <Card className="rounded-2xl border-secondary/30 bg-background/70 p-5 shadow-[0_20px_70px_hsl(var(--primary)/0.18)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Most recommended</p>
                    <h2 className="text-2xl font-bold text-foreground">Deep Life Analysis</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                </div>
                <div className="mb-4 flex items-end gap-2">
                  <span className="text-4xl font-bold text-secondary">₹1999</span>
                  <span className="pb-1 text-sm text-muted-foreground">25-35 pages</span>
                </div>
                <p className="mb-5 text-sm leading-6 text-muted-foreground">
                  Built for users who want serious timing, marriage, wealth, career, strengths, remedies, and lucky periods in one detailed report.
                </p>
                <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-4">
                  <p className="text-sm font-semibold text-foreground">This is NOT an instant automated PDF.</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Unlike generic instant astrology reports, your report is manually prepared with personal analysis and detailed guidance.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-foreground">Your Best Pricing Structure</h2>
            <p className="mt-2 text-muted-foreground">Choose the depth of analysis that matches the decision you are making.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {reportPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex h-full flex-col rounded-2xl border p-6 ${
                  plan.highlighted
                    ? "border-secondary/70 bg-secondary/10 shadow-[0_18px_60px_hsl(var(--secondary)/0.18)]"
                    : "border-border/60 bg-card/40"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-5 border-green-500/40 bg-green-500/15 text-green-300 hover:bg-green-500/15">
                    Best seller
                  </Badge>
                )}
                <div className="mb-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <FileText className={plan.highlighted ? "h-6 w-6 text-secondary" : "h-6 w-6 text-muted-foreground"} />
                    <span className="text-sm text-muted-foreground">{plan.pages}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-3 text-4xl font-bold text-secondary">{plan.price}</div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-5 rounded-xl border border-border/60 bg-background/40 p-4">
                  <p className="mb-3 text-sm font-semibold text-foreground">Includes:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-secondary" />
                    Delivery: {plan.delivery}
                  </div>
                  <Button
                    variant={plan.highlighted ? "cosmic" : "cosmicOutline"}
                    className="w-full"
                    onClick={() => startReport(plan.name, plan.price)}
                  >
                    Select Report
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-5 py-4 md:grid-cols-3">
          {trustCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="rounded-2xl border-border/60 bg-card/40 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{card.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{card.text}</p>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="rounded-2xl border-secondary/30 bg-secondary/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">Why It Takes 48 Hours</h2>
            </div>
            <p className="mb-5 text-sm leading-6 text-muted-foreground">
              People value a report more when they can see the care behind it. Our astrologers do the detailed work before your final report is delivered.
            </p>
            <ul className="space-y-3">
              {processSteps.map((step) => (
                <li key={step} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/40">
            <div className="border-b border-border/60 p-6">
              <h2 className="text-2xl font-bold text-foreground">Generic AI Reports vs Veadicastro Expert Reports</h2>
              <p className="mt-2 text-sm text-muted-foreground">This is the key difference users need to feel before buying.</p>
            </div>
            <div className="grid grid-cols-2 border-b border-border/60 bg-background/50 text-sm font-semibold text-foreground">
              <div className="border-r border-border/60 p-4">Generic AI Reports</div>
              <div className="p-4">Veadicastro Expert Reports</div>
            </div>
            {comparisonRows.map(([generic, expert]) => (
              <div key={generic} className="grid grid-cols-2 border-b border-border/60 last:border-b-0">
                <div className="flex items-start gap-2 border-r border-border/60 p-4 text-sm text-muted-foreground">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <span>{generic}</span>
                </div>
                <div className="flex items-start gap-2 p-4 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>{expert}</span>
                </div>
              </div>
            ))}
          </Card>
        </section>

        <section className="grid gap-6 pb-12 lg:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-2xl border-border/60 bg-card/40 p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">Quality Promise</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {qualityPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-4">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <p className="text-sm leading-6 text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border-orange-500/30 bg-orange-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">Limited Daily Capacity</h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Due to manual preparation, limited reports are accepted daily. This helps keep every report personal, specific, and properly reviewed.
            </p>
            <Button variant="cosmic" className="mt-6 w-full" onClick={() => startReport("Deep Life Analysis", "₹1999")}>
              Book Your Report
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </section>

        <section className="grid gap-6 pb-12 lg:grid-cols-[0.8fr_1fr]">
          <Card className="rounded-2xl border-border/60 bg-card/40 p-6">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">What You Need to Provide</h2>
            </div>
            <p className="mb-5 text-sm leading-6 text-muted-foreground">
              These details help the astrologer prepare an accurate, personalized analysis for your chart and life situation.
            </p>
            <ul className="space-y-3">
              {requiredDetails.map((detail) => (
                <li key={detail} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-2xl border-orange-500/30 bg-orange-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-orange-300" />
              <h2 className="text-2xl font-bold text-foreground">Accuracy & Quality Note</h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              If birth details are incorrect, prediction accuracy may be affected. Because every report is manually prepared and personalized, refunds may not be available once work has started.
            </p>
          </Card>
        </section>

        <section className="pb-12">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-foreground">Testimonials</h2>
            <p className="mt-2 text-muted-foreground">Real reactions from people who wanted more than a generic report.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="rounded-2xl border-border/60 bg-card/40 p-6">
                <div className="mb-4 flex gap-1 text-secondary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">“{testimonial.quote}”</p>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  — {testimonial.name}, {testimonial.location}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="pb-12">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.q} className="rounded-2xl border-border/60 bg-card/40 p-5">
                <h3 className="text-base font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DeepReports;
