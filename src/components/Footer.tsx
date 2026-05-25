import { Linkedin, Facebook, Instagram, Rocket, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  console.log('Footer component rendered - pathname:', window.location.pathname);
  return (
    <footer className="border-t border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-footer="global-footer">
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          
          {/* Logo Section - Left */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Veadicastro Logo" className="w-10 h-10" />
              <h3 className="text-lg font-bold text-white">Veadicastro</h3>
            </div>
            <p className="text-sm text-white/60">India's Most Accurate AI Astrology Platform</p>
            
            {/* Contact Information */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@veadicastro.in</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Quick Links</span>
            <Link to="/free-ai-astrologer-chat" className="text-white/80 hover:text-white transition-colors">
             Chat with vedika AI Astrologer in free
            </Link>
            <Link to="/free-5-minutes-astrology-ai" className="text-white/80 hover:text-white transition-colors">
              Free 5-Minutes Astrology
            </Link>
            <Link to="/talk-to-astrologer" className="text-white/80 hover:text-white transition-colors">
              Talk to Astrologer
            </Link>
            <Link to="/free-kundali-matching" className="text-white/80 hover:text-white transition-colors">
              Kundali Matching for Marriage
            </Link>
            <Link to="/angel-number-calculator" className="text-white/80 hover:text-white transition-colors">
              Angel Number Calculator
            </Link>
            <Link to="/lucky-colour-for-today" className="text-white/80 hover:text-white transition-colors">
              Lucky Colour for Today
            </Link>
            <Link to="/free-kundli-generator" className="text-white/80 hover:text-white transition-colors">
              Free Kundali Generator
            </Link>
            <Link to="/today-horoscope" className="text-white/80 hover:text-white transition-colors">
              Today Horoscope
            </Link>
            <Link to="/ai-astrology" className="text-white/80 hover:text-white transition-colors">
              AI Astrology Guide
            </Link>
            <Link to="/kundali-matching" className="text-white/80 hover:text-white transition-colors">
              Kundali Matching for Marriage
            </Link>
          </div>

          {/* Blogs From Us - All blogs in one section */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Blogs From Us</span>
            <Link to="/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" className="text-white/80 hover:text-white transition-colors text-sm">
              Yearly Horoscope 2026
            </Link>
            <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-white/80 hover:text-white transition-colors text-sm">
              AI Transforming Vedic Astrology
            </Link>
            <Link to="/blog/best-careers-for-each-zodiac-sign-in-2026" className="text-white/80 hover:text-white transition-colors text-sm">
              Best Careers for Zodiac Signs
            </Link>
            <Link to="/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis" className="text-white/80 hover:text-white transition-colors text-sm">
              Rahu Ketu Transit 2026
            </Link>
            <Link to="/blog/online-jyotishi-vs-ai-astrologer" className="text-white/80 hover:text-white transition-colors text-sm">
              Online Jyotishi vs AI Astrologer
            </Link>
            <Link to="/blog/vedic-vs-western-astrology" className="text-white/80 hover:text-white transition-colors text-sm">
              Vedic vs Western Astrology
            </Link>
            <Link to="/blog/ipl-2026-winner-prediction-astrology" className="text-white/80 hover:text-white transition-colors text-sm">
              IPL 2026 Winner Prediction
            </Link>
            <Link to="/blog/next-pm-india-2029-astrology-prediction" className="text-white/80 hover:text-white transition-colors text-sm">
              Next PM India 2029 Prediction
            </Link>
            <Link to="/blog/marriage-compatibility-based-on-your-zodiac-sign" className="text-white/80 hover:text-white transition-colors text-sm">
              Marriage Compatibility Zodiac
            </Link>
            <Link to="/blog/top-10-vedic-astrology-platform" className="text-white/80 hover:text-white transition-colors text-sm">
              Top 10 Vedic Astrology Platform
            </Link>
            <Link to="/blog/vedic-astrology-ai-kese-kaam-karta-ha" className="text-white/80 hover:text-white transition-colors text-sm">
              Vedic Astrology AI Kaise Kaam Karta Hai
            </Link>
            <Link to="/blog" className="text-white/80 hover:text-white transition-colors text-sm font-medium mt-2">
              View All Blogs →
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Legal</span>
            <Link to="/refund" className="text-white/80 hover:text-white transition-colors">
              Refund Policy
            </Link>
            <Link to="/terms" className="text-white/80 hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="text-white/80 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/disclaimer" className="text-white/80 hover:text-white transition-colors">
              Disclaimer
            </Link>
          </div>

          {/* Important Links */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Important Links</span>
            <Link to="/how-it-works" className="text-white/80 hover:text-white transition-colors">
              How We Work
            </Link>
            <Link to="/mission" className="text-white/80 hover:text-white transition-colors">
              Our Mission
            </Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors">
              About Us
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent mb-6" />

        {/* Social Media Links */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider mr-4">Follow Us</span>
            <a 
              href="https://www.facebook.com/veadicastro" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/70 hover:text-pink-500 transition-colors"
              aria-label="Follow Veadicastro on Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://www.instagram.com/veadicastro" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/70 hover:text-pink-500 transition-colors"
              aria-label="Follow Veadicastro on Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://www.linkedin.com/company/veadicastro" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/70 hover:text-pink-500 transition-colors"
              aria-label="Follow Veadicastro on LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a 
              href="https://www.producthunt.com/products/vedicastro?utm_source=other&utm_medium=social" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Find Veadicastro on Product Hunt"
            >
              <Rocket size={20} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="space-y-4">
          <p className="text-center text-xs text-white/70">
            © 2026 veadicastro - Rooted In India | All Rights Reserved
          </p>
          
          {/* SEO Badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-white/50">
            <span className="bg-white/10 px-2 py-1 rounded">✓ AI Astrology</span>
            <span className="bg-white/10 px-2 py-1 rounded">✓ Daily Horoscope</span>
            <span className="bg-white/10 px-2 py-1 rounded">✓ Kundli Generation</span>
            <span className="bg-white/10 px-2 py-1 rounded">✓ Vedic Astrology</span>
            <span className="bg-white/10 px-2 py-1 rounded">✓ Hindi & English</span>
            <span className="bg-white/10 px-2 py-1 rounded">✓ 24/7 Available</span>
          </div>
          
          {/* Additional Links */}
          <div className="flex justify-center items-center gap-6 text-xs text-white/50">
            <a href="/sitemap.xml" className="hover:text-white/70 transition-colors">Sitemap</a>
            <a href="/robots.txt" className="hover:text-white/70 transition-colors">Robots</a>
            <a href="/manifest.json" className="hover:text-white/70 transition-colors">PWA</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
