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
    name: "P. Aman Uniyal",
    title: "Vedic Astrology Expert",
    experience: "10+ Years",
    rating: 4.7,
    reviews: 156,
    specialties: ["Career Guidance", "Marriage Compatibility", "Vedic Astrology", "Vastu Consultation"],
    languages: ["Hindi", "English", "Sanskrit"],
    callPrice: 799,
    chatPrice: 599,
    available: true,
    image: "/amanuniyalastrologe.webp",
    nextAvailable: "Available Now",
    qualifications: ["Ph.D. in Vedic Astrology", "Gold Medalist", "Jyotish Visharad"],
    description: "Expert in traditional Vedic astrology with deep knowledge of ancient scriptures and helping people find clarity."
  }
];

const TalkToAstrologer = () => {
  const navigate = useNavigate();
  const [selectedAstrologer, setSelectedAstrologer] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConsultation = (astrologerId: number) => {
    setSelectedAstrologer(astrologerId);
    setShowPopup(true);
  };

  const handleCallSupport = () => {
    setShowPopup(false);
    window.location.href = 'tel:9411761184';
  };

  const handleEmailBooking = () => {
    setIsLoading(true);
    
    // Send email to support
    const subject = encodeURIComponent("Booking Request - P. Aman Uniyal");
    const body = encodeURIComponent("Hey, I want to book a consultation with P. Aman Uniyal");
    const mailtoUrl = `mailto:support@veadicastro.in?subject=${subject}&body=${body}`;
    
    // Simulate loading delay before redirect
    setTimeout(() => {
      // Open email client
      window.location.href = mailtoUrl;
      setIsLoading(false);
    }, 1500);
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
                    "name": "Is consultation available in Hindi?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. Pandit Aman Uniyal consults in Hindi and English. Most clients from North India prefer Hindi and he is fully comfortable with that."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What details do I need to provide before the session?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "You need your date of birth, time of birth, and place of birth. Birth time determines your Lagna (ascendant) in Vedic astrology. If you do not know your exact birth time, inform us in advance — approximate times can also be worked with."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is the call consultation really unlimited?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. The ₹799 call package gives you unlimited call duration on the day of your session with Pandit Aman Uniyal. No per-minute charges."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How is Veadicastro different from other astrology apps?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Most platforms route you to whoever is available from a large pool of astrologers. At Veadicastro, you book specifically with Pandit Aman Uniyal — a verified astrologer from a traditional Brahmin background in Uttarakhand with over 10 years of experience."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I consult about someone else's chart?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. You can consult about your child, spouse, or another family member's chart as long as you provide their date, time, and place of birth."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do you offer consultations outside India?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. We have clients in the US, UK, Canada, UAE, and other countries. Sessions are held via phone or online and can be scheduled across time zones. Payment can be made through standard online methods."
                    }
                  }
                ]
              }
            ]
          })}
        </script>
      </Helmet>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4"></div>
            <p className="text-white font-semibold">Redirecting to email...</p>
            <p className="text-muted-foreground text-sm mt-2">Please wait while we prepare your booking request</p>
          </div>
        </div>
      )}

      {/* Booking Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card/95 border border-border/60 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Contact for Booking</h3>
              <p className="text-muted-foreground">Choose how you'd like to book P. Aman Uniyal</p>
            </div>

            <div className="bg-card/20 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Customer Support Number:</p>
                <p className="text-2xl font-bold text-accent">9411761184</p>
                <p className="text-xs text-muted-foreground mt-1">Call our customer support for booking</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full h-12 rounded-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground mb-3"
                onClick={handleCallSupport}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now for Booking
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-12 rounded-lg font-semibold border-border/60 hover:bg-card/40"
                onClick={handleEmailBooking}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Book by Email
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
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
        <div className="flex justify-center mb-12">
          {astrologers.map((astrologer) => (
            <Card
              key={astrologer.id}
              className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 relative min-h-[500px] max-w-md w-full"
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
                <h2 className="text-xl font-bold text-white mb-1">Talk to Aman Uniyal – Vedic Astrologer</h2>
                <p className="text-accent text-sm mb-2">Expert in Vedic Astrology</p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>10+ years of experience</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>4.9/5</span>
                    <span>(100+ reviews)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center mb-4">
                Aman Uniyal is a renowned Vedic astrologer with over 10 years of experience in providing personalized guidance on career, marriage, love, and life decisions. He is an expert in Vedic astrology and has helped numerous clients achieve their goals and overcome challenges.
              </p>

              {/* Specialties */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Specialties:</h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">Vedic Astrology</Badge>
                  <Badge variant="secondary" className="text-xs">Career Guidance</Badge>
                  <Badge variant="secondary" className="text-xs">Marriage and Relationships</Badge>
                  <Badge variant="secondary" className="text-xs">Life Decisions</Badge>
                </div>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Languages:</h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs border-border/60">Hindi</Badge>
                  <Badge variant="outline" className="text-xs border-border/60">English</Badge>
                </div>
              </div>

              {/* Qualifications */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Qualifications:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Certified Vedic Astrologer
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    10+ years of experience
                  </div>
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
          ))}</div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 p-6 rounded-xl border border-border/60 bg-background/50">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">What Our Clients Say About Pandit Aman Uniyal</h3>
            <p className="text-sm text-muted-foreground">
              Real experiences from people who have consulted with our Vedic astrology expert
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Rohit Sharma" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Rohit Sharma</h4>
                  <p className="text-xs text-muted-foreground">Delhi</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Honestly pehle mujhe doubt tha, but session lene ke baad clear ho gaya ki sir ko kaafi deep knowledge hai. 799 me unlimited call milna is actually crazy value. Maine 3 baar call kiya same din."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Neha Verma" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Neha Verma</h4>
                  <p className="text-xs text-muted-foreground">Lucknow</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Bhai sach bolu toh expectations low thi, but experience mast raha. Jo problems chal rahi thi, unpe proper guidance mila. Aur unlimited calls ka option toh next level hai."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Aman Gupta" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Aman Gupta</h4>
                  <p className="text-xs text-muted-foreground">Jaipur</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Mujhe sabse achha ye laga ki wo jaldi jaldi answer nahi dete, pura samajh ke batate hai. 799 me itna detailed consultation milna rare hai, plus unlimited calls ka option bhi diya."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Pooja Singh" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Pooja Singh</h4>
                  <p className="text-xs text-muted-foreground">Bhopal</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Main thoda emotional phase me tha, unse baat karke clarity mili. Vibe bhi kaafi calm thi. Unlimited call feature helpful raha kyunki baad me aur doubts aaye toh phir se call kar liya."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Karan Mehta" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Karan Mehta</h4>
                  <p className="text-xs text-muted-foreground">Chandigarh</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Pehli baar astrology try ki aur honestly kaafi accurate nikla. Jo career ke baare me bola wo relatable tha. 799 me unlimited baat kar sakte ho, worth it laga mujhe."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Sneha Iyer" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Sneha Iyer</h4>
                  <p className="text-xs text-muted-foreground">Bengaluru</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Sir ka approach simple aur practical hai, bas faltu ke complicated words nahi use karte. Unlimited call ka option best part hai, ek hi session me sab clear nahi hota toh baar baar connect ho sakte ho."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Rahul Nair" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Rahul Nair</h4>
                  <p className="text-xs text-muted-foreground">Kochi</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "I wasn't sure what to expect at first, but the consultation turned out to be really insightful. The astrologer explained things in a very calm and structured way. The unlimited calls for 799 is honestly a great deal."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Priya Shah" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Priya Shah</h4>
                  <p className="text-xs text-muted-foreground">Ahmedabad</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "What I liked most is that the session didn't feel rushed. I had multiple questions, and being able to call again without extra charges made a big difference. Definitely worth trying."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Vikram Reddy" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Vikram Reddy</h4>
                  <p className="text-xs text-muted-foreground">Hyderabad</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "The predictions were surprisingly accurate, especially regarding my career situation. Having unlimited access for 799 makes it much more comfortable to clarify doubts later."
              </p>
            </div>

            <div className="bg-card/30 p-4 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <img src="/optimized/reviews.webp" alt="Anjali Kulkarni" className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Anjali Kulkarni</h4>
                  <p className="text-xs text-muted-foreground">Pune</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Very genuine experience. No unnecessary upselling, just straight guidance. The unlimited call feature is super helpful because real clarity often comes after asking follow-up questions."
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Section 1: How It Works */}
        <section className="mt-16 p-8 rounded-xl border border-border/60 bg-background/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How Online Vedic Astrology Consultation Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-accent font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Choose Your Mode</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Booking a consultation with Pandit Aman Uniyal is simple and takes less than two minutes. Here's what happens after you click "Book Now":
              </p>
              <div className="space-y-3 mt-4">
                <div className="flex gap-3">
                  <span className="text-accent font-semibold">Step 1 — Choose Your Mode:</span>
                  <p className="text-muted-foreground">
                    Decide whether you want a call consultation (₹799, unlimited duration) or a chat consultation (₹599, 20 minutes). Both options give you direct, one-on-one access to Pandit Aman Uniyal — no bots, no automated responses, no junior assistants. You speak directly with the astrologer himself.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-accent font-semibold">Step 2 — Confirm Your Booking:</span>
                  <p className="text-muted-foreground">
                    After clicking Book Now, you'll be connected to our support team via call or email. Share your preferred time slot and basic birth details — date, time, and place of birth. These three details are the foundation of any Vedic chart reading and the more accurate they are, the more precise your consultation will be.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-accent font-semibold">Step 3 — Your Consultation Begins:</span>
                  <p className="text-muted-foreground">
                    At your scheduled time, Pandit Aman Uniyal will call you directly on your registered number, or connect via chat mode you selected. He will have already reviewed your chart before the session begins, so the conversation starts from a place of genuine preparation — not generic advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: About Pandit Aman Uniyal */}
        <section className="mt-16 p-8 rounded-xl border border-border/60 bg-background/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Meet Your Astrologer — Pandit Aman Uniyal</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Pandit Aman Uniyal comes from a traditional Brahmin family in Uttarakhand, where Vedic astrology has been a living practice across generations — not just an academic subject. He has spent over a decade studying Jyotisha Shastra, Parashari system, and Vastu Vidya, and has personally guided thousands of individuals across India on matters of career, marriage, health, and life decisions.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  What makes his approach different from most online astrology platforms is this: he reads your chart the way it was meant to be read — through the lens of your specific planetary placements, dasha periods, and transits — not through generic Sun sign predictions that apply to one-twelfth of the entire population.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  He holds a Jyotish Visharad certification and has been recognised with a gold medal for academic excellence in Vedic astrology. He consults in Hindi, English, and Sanskrit, making him accessible to both traditional households and modern professionals looking for clarity.
                </p>
                <p className="text-accent font-semibold mb-2">Over the years, clients have consulted him for:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Career transitions and business timing using Raj Yoga and Dasha analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Marriage compatibility through Kundali Milan and Ashtakoot matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Remedies for Manglik Dosha, Shani Sade Sati, and Rahu-Ketu transits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Muhurat selection for weddings, property purchases, and new ventures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Vastu consultation for home and office layouts</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  He does not believe in fear-based astrology. His goal in every session is to give you clarity, timing, and practical remedies — not to overwhelm you with doom-laden predictions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: What You Can Ask */}
        <section className="mt-16 p-8 rounded-xl border border-border/60 bg-background/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What Can You Discuss in Your Consultation?</h2>
          <p className="text-muted-foreground leading-relaxed mb-8 text-center">
            A lot of people come into their first astrology consultation unsure of what to ask. Here is a broad overview of what Pandit Aman Uniyal covers in his sessions — and what people most commonly seek guidance on.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-3">Career and Finance</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you are at a crossroads in your professional life — whether to switch jobs, start a business, pursue a government exam, or wait for the right opportunity — Vedic astrology can offer remarkable clarity. Through analysis of your 10th house, its lord, and active Dasha periods, it becomes possible to identify windows of time when career moves are naturally supported. Many clients have used this timing framework to make major decisions with far more confidence than they would have otherwise.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-3">Marriage and Relationships</h3>
              <p className="text-muted-foreground leading-relaxed">
                Marriage-related questions are among the most common reasons people seek a Vedic consultation. Whether you are looking for Kundali matching before an engagement, trying to understand compatibility issues in an existing relationship, or navigating delays in marriage despite being of eligible age — all of these can be addressed through a detailed chart reading. Pandit ji also explains Manglik Dosha in its correct context, which is often misunderstood and unnecessarily feared by many families.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-3">Health and Mental Wellbeing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Vedic astrology identifies periods of physical and mental vulnerability through planetary transits and Dasha sequences. While astrology is never a substitute for medical advice, understanding these cycles can help you be more proactive during sensitive periods — whether that means taking better care of your health, reducing stress, or making lifestyle adjustments. The 6th and 8th house in a natal chart carry significant information about recurring health patterns.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-3">Children and Family</h3>
              <p className="text-muted-foreground leading-relaxed">
                Questions around delayed pregnancy, children's education, family disputes, and generational patterns are frequently addressed in consultations. The 5th house in Vedic astrology governs children and creative intelligence, and a detailed reading of this house — along with the charts of family members — can provide meaningful perspective.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-3">Spirituality and Life Purpose</h3>
              <p className="text-muted-foreground leading-relaxed">
                Some people come not with a specific problem but with a deeper question: what am I here to do? Vedic astrology, at its highest level, is a tool for self-understanding. The 9th house governs dharma, 12th governs spiritual liberation, and the overall chart — read holistically — can reveal your natural strengths, karmic patterns, and the broad arc of your life's purpose.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Why Human Astrology Still Matters */}
        <section className="mt-16 p-8 rounded-xl border border-border/60 bg-background/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Why Talking to a Real Astrologer Still Makes a Difference</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Veadicastro offers AI-powered astrology tools, and we are proud of them. Vedika AI can generate Kundali reports, answer general astrology questions, and help you understand your chart at any time of day or night. For many queries, that level of access is genuinely transformative.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  But there are moments in life where a conversation matters more than a report.
                </p>
              </div>
              <div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you are dealing with a genuinely difficult decision — a marriage proposal, a business risk, a health scare, a family conflict — what you need is not just data. You need someone who can listen to your specific situation, hold your chart in mind, ask the right follow-up questions, and give you an honest, experience-backed perspective. That is what a real astrologer brings to the table.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Pandit Aman Uniyal has had thousands of such conversations. He has seen how the same planetary combination expresses differently depending on a person's background, their chart's overall strength, and phase of life they are in. That pattern recognition — built over a decade of real consultations — is not something any algorithm can fully replicate yet.
                </p>
              </div>
            </div>
            <div className="mt-8 p-6 bg-card/20 rounded-lg border border-border/40">
              <p className="text-accent font-semibold mb-3">We see AI and human astrology not as competitors but as complements.</p>
              <p className="text-muted-foreground leading-relaxed">
                Use Vedika AI when you want quick answers, chart generation, or everyday guidance. Come to Pandit Aman Uniyal when the stakes are higher and you want a real conversation with a real expert.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section className="mt-16 p-8 rounded-xl border border-border/60 bg-background/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">Is the consultation available in Hindi?</h3>
              <p className="text-muted-foreground">Yes. Pandit Aman Uniyal consults primarily in Hindi and also in English. Most clients from North India prefer conversing in Hindi, and he is completely comfortable with that.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">What details do I need to provide before the session?</h3>
              <p className="text-muted-foreground">You will need your date of birth, time of birth, and place of birth. The birth time is particularly important in Vedic astrology as it determines your Lagna (ascendant), which shapes the entire chart reading. If you do not know your exact birth time, inform us in advance — there are techniques to work with approximate times as well.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">Is the call consultation really unlimited?</h3>
              <p className="text-muted-foreground">Yes. The ₹799 call package gives you unlimited call duration on the day of your session with Pandit Aman Uniyal. Many clients use this to ask follow-up questions they think of after the initial discussion, without worrying about per-minute charges.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">How is Veadicastro different from other astrology apps?</h3>
              <p className="text-muted-foreground">Most astrology apps, including larger platforms, work with a pool of hundreds of astrologers with varying levels of experience and quality. At Veadicastro, you are consulting with one verified astrologer who has been vetted by our team and comes from a genuine traditional background. There is no algorithm routing your call to whoever is available. You book with Pandit Aman Uniyal specifically.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">Can I consult about someone else's chart — like my child or spouse?</h3>
              <p className="text-muted-foreground">Yes. You can consult about your child, spouse, or another family member's chart as long as you provide their date, time, and place of birth.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent mb-2">Do you offer consultations outside India?</h3>
              <p className="text-muted-foreground">Yes. We have clients in the US, UK, Canada, UAE, and other countries. Sessions are conducted via phone or online and can be scheduled across time zones. Payment can be made through standard online methods.</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default TalkToAstrologer;
