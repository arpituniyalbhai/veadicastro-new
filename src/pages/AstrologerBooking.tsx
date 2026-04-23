import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Phone, MessageCircle, Clock, CheckCircle, Award, Calendar, User, BookOpen } from "lucide-react";

const AstrologerBooking = () => {
  const { astrologerId } = useParams<{ astrologerId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // P. Aman Sharma details
  const astrologerDetails = {
    name: "P. Aman Sharma",
    title: "Master Vedic Astrologer & Spiritual Guide",
    experience: "10+ Years",
    rating: 4.9,
    reviews: 340,
    image: "/optimized/reviews.webp",
    specialties: [
      "Career & Business Guidance",
      "Marriage & Relationship Counseling", 
      "Vastu Shastra Consultation",
      "Gemstone Therapy",
      "Kundali Dosh Remedies",
      "Financial Astrology"
    ],
    languages: ["Hindi", "English", "Sanskrit", "Punjabi"],
    qualifications: [
      "Ph.D. in Vedic Astrology",
      "Jyotish Acharya",
      "Vastu Visharad",
      "Gemology Expert",
      "Spiritual Counselor"
    ],
    description: "P. Aman Sharma is a renowned Vedic astrologer with over 10 years of experience in guiding people through life's challenges using ancient Vedic wisdom. His expertise spans across various domains including career guidance, relationship counseling, and spiritual healing. He has helped hundreds of clients find their true path and overcome obstacles through precise astrological predictions and effective remedies.",
    pricing: {
      call: 799,
      chat: 599,
      consultation: 299
    },
    achievements: [
      "Awarded Best Astrologer 2023",
      "5000+ Happy Clients",
      "Guest Speaker on Astrology Summits",
    ]
  };

  const handleBookNow = () => {
    setShowPopup(true);
  };

  const handleCallSupport = () => {
    setShowPopup(false);
    window.location.href = 'tel:9411761184';
  };

  const handleEmailBooking = () => {
    setShowPopup(true);
    setIsLoading(true);
    
    // Send email to support
    const subject = encodeURIComponent("Booking Request - P. Aman Sharma");
    const body = encodeURIComponent("Hey, I want to book P. Aman Sharma");
    const mailtoUrl = `mailto:support@veadicastro.in?subject=${subject}&body=${body}`;
    
    // Simulate loading delay before redirect
    setTimeout(() => {
      // Open email client
      window.location.href = mailtoUrl;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-6 relative">
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
              <p className="text-muted-foreground">Choose how you'd like to book P. Aman Sharma</p>
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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 mb-6" 
            onClick={() => navigate("/talk-to-astrologer")}
          > 
            <ArrowLeft className="w-4 h-4" />
            Back to Astrologers
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="p-8 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={astrologerDetails.image}
                      alt={astrologerDetails.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-border/60"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground rounded-full p-2">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{astrologerDetails.name}</h1>
                  <p className="text-accent text-lg mb-3">{astrologerDetails.title}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="font-semibold">{astrologerDetails.experience}</span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{astrologerDetails.rating}</span>
                      <span>({astrologerDetails.reviews} reviews)</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {astrologerDetails.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {astrologerDetails.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-border/60">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Specialties */}
            <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Areas of Expertise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {astrologerDetails.specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-white">{specialty}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Qualifications */}
            <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Qualifications & Achievements
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-accent mb-2">Qualifications:</h4>
                  <div className="space-y-1">
                    {astrologerDetails.qualifications.map((qual, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        {qual}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-accent mb-2 mt-4">Achievements:</h4>
                  <div className="space-y-1">
                    {astrologerDetails.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="w-3 h-3 text-yellow-400" />
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Pricing & Booking */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl sticky top-6">
              <h3 className="text-xl font-bold text-white mb-6">Consultation Pricing</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between bg-card/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-accent" />
                    <span className="text-sm text-white">Call Consultation</span>
                  </div>
                  <span className="text-lg font-bold text-accent">₹{astrologerDetails.pricing.call} (unlimited)</span>
                </div>
                
                <div className="flex items-center justify-between bg-card/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm text-white">Chat Consultation</span>
                  </div>
                  <span className="text-lg font-bold text-accent">₹{astrologerDetails.pricing.chat} (20 min)</span>
                </div>

                              </div>

              {/* Booking Button */}
              <Button
                className="w-full h-14 rounded-lg font-semibold text-base bg-accent hover:bg-accent/90 text-accent-foreground text-lg"
                onClick={handleBookNow}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Now
                  </>
                )}
              </Button>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Instant confirmation available
                </p>
                <p className="text-xs text-muted-foreground">
                  100% refund if not satisfied
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-semibold text-accent">
                  After payment, our team will reach out and directly connect with the astrologer
                </p>
              </div>
            </Card>

            {/* Availability */}
            <Card className="p-4 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Available Today</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                8 AM to 10 PM
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstrologerBooking;
