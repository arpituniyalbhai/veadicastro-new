import { Facebook, Instagram, Linkedin, Mail, MapPin, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-footer="global-footer">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5 mb-8">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Veadicastro Logo" className="w-10 h-10" />
              <h3 className="text-lg font-bold text-white">Veadicastro</h3>
            </div>
            <p className="text-sm text-white/60">India's AI-powered Vedic astrology platform.</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@veadicastro.in</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">India</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Tools</span>
            <Link to="/free-ai-astrologer-chat" className="text-white/80 hover:text-white transition-colors">
              Chat with Vedika AI
            </Link>
            <Link to="/free-kundli-generator" className="text-white/80 hover:text-white transition-colors">
              Kundli Generator
            </Link>
            <Link to="/free-kundali-matching" className="text-white/80 hover:text-white transition-colors">
              Kundli Matching
            </Link>
            <Link to="/today-horoscope" className="text-white/80 hover:text-white transition-colors">
              Today Horoscope
            </Link>
            <Link to="/lucky-colour-for-today" className="text-white/80 hover:text-white transition-colors">
              Lucky Colour
            </Link>
            <Link to="/astrology-store" className="text-white/80 hover:text-white transition-colors">
              Astrology Store
            </Link>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Learn</span>
            <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-white/80 hover:text-white transition-colors text-sm">
              AI and Vedic Astrology
            </Link>
            <Link to="/blog/vedic-vs-western-astrology" className="text-white/80 hover:text-white transition-colors text-sm">
              Vedic vs Western Astrology
            </Link>
            <Link to="/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis" className="text-white/80 hover:text-white transition-colors text-sm">
              Rahu Ketu Transit
            </Link>
            <Link to="/blog/manglik-dosha-myths-vs-reality" className="text-white/80 hover:text-white transition-colors text-sm">
              Manglik Dosha
            </Link>
            <Link to="/blog" className="text-white/80 hover:text-white transition-colors text-sm font-medium mt-2">
              View All Blogs
            </Link>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Company</span>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors">
              About Us
            </Link>
            <Link to="/mission" className="text-white/80 hover:text-white transition-colors">
              Our Mission
            </Link>
            <Link to="/how-it-works" className="text-white/80 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors">
              Contact
            </Link>
          </div>

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
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent mb-6" />

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-white/60 uppercase tracking-wider mr-4">Follow Us</span>
            <a href="https://www.facebook.com/veadicastro" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-pink-500 transition-colors" aria-label="Follow Veadicastro on Facebook">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/veadicastro" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-pink-500 transition-colors" aria-label="Follow Veadicastro on Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://www.linkedin.com/company/veadicastro" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-pink-500 transition-colors" aria-label="Follow Veadicastro on LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="https://www.producthunt.com/products/vedicastro?utm_source=other&utm_medium=social" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="Find Veadicastro on Product Hunt">
              <Rocket size={20} />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-center text-xs text-white/70">
            Copyright 2026 Veadicastro - Rooted In India | All Rights Reserved
          </p>
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
