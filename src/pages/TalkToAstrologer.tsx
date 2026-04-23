import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Phone, MessageCircle, Clock, CheckCircle, Award, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const astrologers = [
  {
    id: 1,
    name: "P. Aman Sharma",
    title: "Vedic Astrology Expert",
    experience: "10+ Years",
    rating: 4.7,
    reviews: 2847,
    specialties: ["Career Guidance", "Marriage Compatibility", "Vedic Astrology", "Vastu Consultation"],
    languages: ["Hindi", "English", "Sanskrit"],
    callPrice: 799,
    chatPrice: 599,
    available: true,
    image: "/optimized/reviews.webp",
    nextAvailable: "Available Now",
    qualifications: ["Ph.D. in Vedic Astrology", "Gold Medalist", "Jyotish Visharad"],
    description: "Expert in traditional Vedic astrology with deep knowledge of ancient scriptures and helping people find clarity."
  },
  {
    id: 2,
    name: "Pt. Anjali Verma",
    title: "Kundali & Relationship Specialist",
    experience: "12+ Years",
    rating: 4.8,
    reviews: 1956,
    specialties: ["Love & Relationships", "Kundali Matching", "Gemstone Therapy"],
    languages: ["Hindi", "English", "Punjabi"],
    callPrice: 799,
    chatPrice: 599,
    available: true,
    image: "/optimized/reviews.webp",
    nextAvailable: "Available Now",
    qualifications: ["M.A. in Astrology", "Relationship Counselor", "Gemstone Expert"],
    description: "Specialized in relationship astrology and kundali matching with a compassionate approach to love and marriage guidance."
  },
  {
    id: 3,
    name: "Acharya Vikram Singh",
    title: "Numerology & Remedy Expert",
    experience: "18+ Years",
    rating: 5.0,
    reviews: 3214,
    specialties: ["Numerology", "Vedic Remedies", "Business Astrology"],
    languages: ["Hindi", "English", "Gujarati"],
    callPrice: 799,
    chatPrice: 599,
    available: true,
    image: "/optimized/reviews.webp",
    nextAvailable: "Available Now",
    qualifications: ["Numerology Master", "Vedic Remedies Expert", "Business Consultant"],
    description: "Renowned numerologist and remedy specialist helping people overcome obstacles through ancient Vedic solutions."
  }
];

const TalkToAstrologer = () => {
  const navigate = useNavigate();
  const [selectedAstrologer, setSelectedAstrologer] = useState<number | null>(null);

  const handleConsultation = (astrologerId: number) => {
    setSelectedAstrologer(astrologerId);
    // Navigate to booking details page
    navigate(`/astrologer-booking/${astrologerId}`);
  };

  return (
    <>
      <Helmet>
        <title>Talk to Astrologer Online | Vedic Consultation ₹599 | Veadicastro</title>
        <meta name="description" content="Get instant Vedic astrology consultation online. Talk to expert astrologers for career, love, marriage & kundali matching. Starting ₹40/min. Available 24/7." />
        <link rel="canonical" href="https://veadicastro.in/talk-to-astrologer" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:title" content="Talk to Astrologer Online | Vedic Consultation ₹599 | Veadicastro" />
        <meta property="og:description" content="Get instant Vedic astrology consultation online. Talk to expert astrologers for career, love, marriage & kundali matching. Starting ₹40/min. Available 24/7." />
        <meta property="og:image" content="https://veadicastro.in/optimized/reviews.webp" />
        <meta property="og:url" content="https://veadicastro.in/talk-to-astrologer" />
        <meta property="og:type" content="website" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://veadicastro.in"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Talk to Astrologer",
                    "item": "https://veadicastro.in/talk-to-astrologer"
                  }
                ]
              },
              ...astrologers.map(astrologer => ({
                "@type": "Person",
                "name": astrologer.name,
                "jobTitle": astrologer.title,
                "knowsAbout": astrologer.specialties.join(", "),
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": astrologer.rating.toString(),
                  "reviewCount": astrologer.reviews.toString()
                },
                "image": `https://veadicastro.in${astrologer.image}`,
                "sameAs": `https://veadicastro.in/talk-to-astrologer`
              })),
              {
                "@type": "Service",
                "name": "Vedic Astrology Consultation",
                "description": "Get instant Vedic astrology consultation online. Talk to expert astrologers for career, love, marriage & kundali matching. Starting ₹40/min. Available 24/7.",
                "provider": {
                  "@type": "Organization",
                  "name": "Veadicastro",
                  "url": "https://veadicastro.in"
                },
                "serviceType": "Professional Service",
                "areaServed": "India",
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Astrology Consultation Services",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Call Consultation",
                        "description": "Unlimited call consultation with expert Vedic astrologer",
                        "price": "799",
                        "priceCurrency": "INR"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Chat Consultation",
                        "description": "20 minute text chat consultation with expert Vedic astrologer",
                        "price": "599",
                        "priceCurrency": "INR"
                      }
                    }
                  ]
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What is the cost of talking to an astrologer online?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Chat consultations start at ₹599 for 20 minutes. Call consultations available at ₹799 for unlimited calls. No hidden fees."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How accurate is Vedic astrology consultation?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our astrologers have 10–18 years of experience with accurate birth chart analysis."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Which astrologer is best for marriage compatibility?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Pt. Anjali Verma specializes in kundali matching with 12+ years of experience."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I talk to an astrologer in Hindi?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes! All our astrologers are fluent in Hindi and English."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How do I book an astrology consultation online?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Simply click 'Book Now' on any astrologer profile or contact our support directly at 9411761184 or support@veadicastro.in."
                    }
                  }
                ]
              }
            ]
          })}
        </script>
      </Helmet>
      
      <Navbar />
      
      <div className="min-h-screen bg-background px-4 lg:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 mb-6" 
            onClick={() => navigate("/")}
          > 
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 border border-border/60 mb-4">
              <Star className="w-4 h-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Expert Human Astrologers</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 relative">
              <span className="relative z-10 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent drop-shadow-2xl">
                Talk to Astrologer Online – Live Vedic Consultation
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-accent/50 to-primary/40 blur-2xl -z-10 scale-110"></div>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with India's top Vedic astrologers for personalized guidance on career, marriage, love, and life decisions. Our verified experts provide real-time astrology consultation via call or chat — in Hindi and English — starting at just ₹40/min.
            </p>
          </div>

        {/* Astrologers Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {astrologers.map((astrologer) => (
            <Card
              key={astrologer.id}
              className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 relative min-h-[600px] lg:min-h-[700px]"
            >
              {/* Availability Badge */}
              <div className="absolute top-4 right-4">
                <Badge 
                  variant={astrologer.available ? "default" : "secondary"}
                  className={astrologer.available ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                >
                  {astrologer.available ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {astrologer.nextAvailable}
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      {astrologer.nextAvailable}
                    </>
                  )}
                </Badge>
              </div>

              {/* Profile Image */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img
                    src={astrologer.image}
                    alt={astrologer.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-border/60"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground rounded-full p-2">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Talk to {astrologer.name} – {astrologer.title}</h2>
                <p className="text-accent text-sm mb-2">{astrologer.title}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>{astrologer.experience}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{astrologer.rating}</span>
                    <span>({astrologer.reviews})</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center mb-4">
                {astrologer.description}
              </p>

              {/* Specialties */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Specialties:</h4>
                <div className="flex flex-wrap gap-1">
                  {astrologer.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Languages:</h4>
                <div className="flex flex-wrap gap-1">
                  {astrologer.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-border/60">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Qualifications */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Qualifications:</h4>
                <div className="space-y-1">
                  {astrologer.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {qual}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Consultation Rates:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-card/20 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-accent" />
                        <span className="text-sm text-white">Call</span>
                      </div>
                      <span className="text-lg font-bold text-accent">₹799</span>
                    </div>
                    <div className="flex items-center justify-between bg-card/20 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-accent" />
                        <span className="text-sm text-white">Chat</span>
                      </div>
                      <span className="text-lg font-bold text-accent">₹599 (20 min)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-auto">
                <Button
                  className="w-full h-12 rounded-lg font-semibold text-base bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => handleConsultation(astrologer.id)}
                  disabled={!astrologer.available}
                >
                  {astrologer.available ? (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      {astrologer.nextAvailable}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-12 p-6 rounded-xl border border-border/60 bg-background/50">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Why Choose Our Astrologers?</h3>
            <p className="text-sm text-muted-foreground">
              All our astrologers are verified experts with years of experience in Vedic astrology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold mb-1">Verified Experts</h4>
              <p className="text-xs text-muted-foreground">All astrologers undergo strict verification process</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold mb-1">Instant Availability</h4>
              <p className="text-xs text-muted-foreground">Get connected with astrologers within minutes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold mb-1">100% Privacy</h4>
              <p className="text-xs text-muted-foreground">Your consultations are completely private and secure</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 p-8 bg-card/20 backdrop-blur-sm border-border/60 rounded-2xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">What is the cost of talking to an astrologer online?</h3>
              <p className="text-muted-foreground">Chat consultations start at ₹599 for 20 minutes. Call consultations available at ₹799 for unlimited calls. No hidden fees.</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">How accurate is Vedic astrology consultation?</h3>
              <p className="text-muted-foreground">Our astrologers have 10–18 years of experience with accurate birth chart analysis.</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">Which astrologer is best for marriage compatibility?</h3>
              <p className="text-muted-foreground">Pt. Anjali Verma specializes in kundali matching with 12+ years of experience.</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">Can I talk to an astrologer in Hindi?</h3>
              <p className="text-muted-foreground">Yes! All our astrologers are fluent in Hindi and English.</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">How do I book an astrology consultation online?</h3>
              <p className="text-muted-foreground">Simply click "Book Now" on any astrologer profile or contact our support directly:</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 bg-card/40 rounded-lg p-3">
                  <Phone className="w-4 h-4 text-accent" />
                  <span className="text-white font-semibold">Call Support: 9411761184</span>
                </div>
                <div className="flex items-center gap-2 bg-card/40 rounded-lg p-3">
                  <MessageCircle className="w-4 h-4 text-accent" />
                  <span className="text-white font-semibold">Email: support@veadicastro.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* SEO Content Block */}
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
                Talk to an Astrologer Online — Real Guidance, Not Generic Horoscopes
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
                There is something deeply personal about astrology. Most people who come to an astrologer are not just looking for predictions — they are looking for clarity. They have a question on their mind that they cannot seem to answer on their own, and they want someone who has studied the stars, planets, and ancient science of Jyotish to help them find direction.
          </p>
          <p className="text-muted-foreground leading-relaxed">
                At Veadicastro, that is exactly what we offer. A real conversation with a real, experienced astrologer — available to you from wherever you are, at any time that works for you. Our astrologers are not reading from a script or giving you a recycled sun-sign prediction. They are reading your personal birth chart, your current planetary periods, and giving you guidance that is specific to your life situation.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
                What Is Vedic Astrology and Why Is It Different?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
                Most people's first experience with astrology is their sun sign — Aries, Taurus, Libra. They read a horoscope in a magazine or app, find it too generic, and assume astrology doesn't really work. That is a fair conclusion to draw from sun-sign astrology, because sun-sign columns are written for one-twelfth of world's population at once. They cannot possibly be accurate for any one individual.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
                Vedic astrology — also called Jyotish Shastra — is something entirely different. Jyotish is a system that has been refined over more than 5,000 years in India. It is based on your exact birth chart, which is a map of where every planet in the solar system was positioned at the precise moment and location of your birth. No two birth charts are the same.
          </p>
          <p className="text-muted-foreground leading-relaxed">
                A trained Vedic astrologer does not read from a generic template. They read your kundali — your planetary placements, your dasha sequence, your current transits — and give you guidance that is specific to your life situation. That is why people who have tried generic horoscopes and found them useless are often surprised by how accurate a proper Vedic consultation can be.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
                What Can You Ask an Astrologer About?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
                This is one of the questions we get asked most often, and the honest answer is: almost anything that is weighing on your mind. Here are the areas our astrologers help with most:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                        title: "Career & Professional Life",
                        text: "Should I change my job right now? Is this business idea likely to succeed? Why is my career feeling stuck despite all my effort? The 10th house, position of Saturn and Mercury, and your current dasha all have a strong bearing on your professional trajectory."
                  },
                  {
                        title: "Marriage & Relationships",
                        text: "Whether you are looking for a life partner, wondering about compatibility with someone specific, going through a difficult phase in your marriage, or trying to understand why relationships keep not working out — kundali matching and relationship astrology can offer real insight."
                  },
                  {
                        title: "Finance & Wealth",
                        text: "The 2nd house, 8th house, and Jupiter's position all relate to wealth and financial growth. If you are making a significant financial decision, understanding what your chart says about your current planetary period can be genuinely useful context."
                  },
                  {
                        title: "Gemstones & Vedic Remedies",
                        text: "A proper gemstone recommendation requires looking at your full chart, your lagna, and the strength of specific planets. Our astrologers do not recommend gemstones or remedies casually — every remedy is based on your individual chart."
                  },
                  {
                        title: "Health & Family",
                        text: "Certain planetary placements and periods can indicate times when health requires more attention. Many people consult astrologers during health challenges for perspective, Vedic remedies, and timing guidance alongside their medical treatment."
                  },
                  {
                        title: "Vastu Shastra",
                        text: "The ancient Indian science of space and direction is closely related to Jyotish and can have a real impact on the energy of your home or workplace. Our Vastu specialists help you understand how your living space aligns with favorable energies."
                  }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/60 bg-card/20">
                        <h3 className="text-base font-semibold text-accent mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
                How Online Astrology Consultation Works — Step by Step
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
                Online astrology consultation simply means speaking to a Vedic astrologer through a call or chat instead of visiting them in person. The experience is just as personal, just as detailed, and in many ways more convenient — because you do not have to travel, wait in a queue, or adjust your schedule around someone else's availability.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
                {[
                  { step: "01", title: "Choose Your Astrologer", text: "Browse our verified Vedic experts by specialty, experience, and ratings. Read their profiles and pick the one that feels right for your question." },
                  { step: "02", title: "Select Call or Chat", text: "Start an unlimited voice call at ₹799 or a 20-minute text chat at ₹599 — whichever you are more comfortable with. Both are fully private and secure." },
                  { step: "03", title: "Get Personal Guidance", text: "Share your date, time, and place of birth. Your astrologer will prepare your kundali and give you chart-based, honest, personalized guidance." }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/60 bg-card/20 text-center">
                        <div className="text-3xl font-bold text-accent/40 mb-2">{item.step}</div>
                        <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
                How Much Does It Cost to Talk to an Astrologer Online?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
                At Veadicastro, we have kept the pricing straightforward and accessible. Chat consultations are ₹599 for 20 minutes, and call consultations are ₹799 for unlimited calls — giving you comprehensive guidance without worrying about time limits.
          </p>
          <p className="text-muted-foreground leading-relaxed">
                We deliberately kept prices at this level because we believe astrology should not be a luxury available only to people who can spend thousands of rupees on a single session. The wisdom of Jyotish is for everyone. There are no hidden charges, no forced packages, and no pressure to extend your session. You decide how long you want to talk, and you pay only for that time.
          </p>
        </section>

        {/* Section 6 - Glossary */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
                Common Vedic Astrology Terms Explained
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
                If you are new to Vedic astrology, some of the terms your astrologer uses might be unfamiliar. Here is a simple guide to the most important ones:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
                {[
                  { term: "Kundali", def: "Your birth chart — a diagram showing position of all planets at exact time and location of your birth." },
                  { term: "Lagna", def: "Your rising sign — zodiac sign rising on eastern horizon at birth. Often more important than your sun sign in Vedic astrology." },
                  { term: "Rashi", def: "Your moon sign — zodiac sign the moon occupied at your birth. This is what Vedic astrologers primarily use for general guidance." },
                  { term: "Dasha", def: "Planetary periods — Vedic astrology divides your life into major and minor periods ruled by different planets, strongly influencing current life events." },
                  { term: "Nakshatra", def: "Lunar mansions — 27 star clusters the moon travels through, each with distinct qualities that shape your personality and destiny." },
                  { term: "Gochar", def: "Planetary transits — current movement of planets and how they interact with your birth chart right now." },
                  { term: "Dosha", def: "A challenging combination in chart — Mangal dosha (Mars affliction) is most commonly discussed in marriage compatibility readings." },
                  { term: "Jyotish", def: "The Sanskrit name for Vedic astrology — literally meaning 'science of light.' One of the six Vedangas (limbs of Vedas)." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/40 bg-card/10">
                        <span className="text-accent font-semibold text-sm min-w-fit">{item.term}:</span>
                        <span className="text-muted-foreground text-sm leading-relaxed">{item.def}</span>
                  </div>
                ))}
          </div>
        </section>

        {/* Section 7 - Cities */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
                Online Astrology Consultation Available Across India
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
                Our astrologers provide online Vedic astrology consultations to clients across all of India and internationally. Whether you are in Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Jaipur, Ahmedabad, Lucknow, Chandigarh, Dehradun, Indore, Bhopal, Nagpur, Patna, Ranchi, Kochi, Coimbatore, or any other city — genuine Vedic astrology guidance is just a few clicks away.
          </p>
          <p className="text-muted-foreground leading-relaxed">
                We also serve the Indian diaspora internationally — clients in the USA, UK, Canada, Australia, and Singapore who want authentic Vedic guidance from qualified Indian astrologers. Language is no barrier — our astrologers consult in Hindi, English, Punjabi, Gujarati, and Sanskrit.
          </p>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/60 border-t border-border/30 pt-6">
                All consultations on Veadicastro are conducted by verified, qualified Vedic astrologers. Astrology is a complementary guidance system and should not replace professional medical, legal, or financial advice.
        </p>
      </div>
    <Footer />
    </>
  );
};

export default TalkToAstrologer;