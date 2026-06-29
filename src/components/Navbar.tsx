import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

type NavbarProps = {
  user?: { email?: string } | null;
  onAuthOpen?: () => void;
};

const Navbar = ({ user = null, onAuthOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get current page name for referral tracking
  const currentPage = location.pathname.split('/').filter(Boolean)[0] || 'landing';

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(currentScrollY > 80);
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Handle smooth navigation to blog pages
  const handleBlogNavigation = (path: string) => {
    // If we're already on a blog page, just navigate normally
    navigate(path);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  return (
    <nav className={`fixed top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-600 overflow-visible ${scrolled ? 'md:w-[80%] w-[98%]' : 'w-full'}`} style={{ top: scrolled ? '16px' : '0px' }}>
      <div
        className={
          "mx-auto flex items-center justify-between transition-all duration-600 " +
          (scrolled
            ? "h-14 rounded-full border border-border/60 bg-background/30 backdrop-blur shadow-[0_8px_30px_hsl(var(--primary)/0.25)] px-6"
            : "h-16 rounded-2xl border border-transparent bg-transparent px-4 md:px-10")
        }
      >
          {/* Logo */}
          <div className="flex items-center gap-2 transition-all duration-500 flex-shrink-0">
            <img src="/optimized/logo.webp" alt="Veadicastro logo" className={`rounded transition-all duration-500 ${scrolled ? 'w-6 h-6' : 'w-8 h-8'}`} loading="eager" />
            <span className={`font-display font-bold transition-all duration-500 ${scrolled ? 'text-base' : 'text-lg md:text-xl lg:text-2xl'}`}>Veadicastro</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className={`hidden md:flex items-center transition-all duration-600 ${scrolled ? 'gap-3' : 'gap-6'}`}>
            <button onClick={() => navigate(`/about?referral=${currentPage}`)} className={`transition-colors whitespace-nowrap duration-600 ${scrolled ? 'text-[15px] text-foreground hover:text-secondary' : 'text-base text-muted-foreground hover:text-foreground'}`}>
              About Us
            </button>
            <button 
              onClick={() => navigate(`/mission?referral=${currentPage}`)} 
              className={`transition-colors whitespace-nowrap ${scrolled ? 'text-[15px] text-foreground hover:text-secondary' : 'text-base text-muted-foreground hover:text-foreground'}`}
            >
              Our Mission
            </button>
            <button onClick={() => navigate(`/how-it-works?referral=${currentPage}`)} className={`transition-colors whitespace-nowrap ${scrolled ? 'text-[15px] text-foreground hover:text-secondary' : 'text-base text-muted-foreground hover:text-foreground'}`}>
              How it works
            </button>
            <button onClick={() => handleBlogNavigation(`/blog?referral=${currentPage}`)} className={`transition-colors whitespace-nowrap ${scrolled ? 'text-[15px] text-foreground hover:text-secondary' : 'text-base text-muted-foreground hover:text-foreground'}`}>
              Blog
            </button>
            <button onClick={() => { localStorage.setItem("pricing_source","landing"); navigate(`/talk-to-astrologer?referral=${currentPage}`); }} className={`transition-colors whitespace-nowrap ${scrolled ? 'text-[15px] text-foreground hover:text-secondary' : 'text-base text-muted-foreground hover:text-foreground'}`}>
              Human astrologer
            </button>
            <button
              onClick={() => navigate(`/contact?referral=${currentPage}`)}
              className={`transition-colors whitespace-nowrap ${scrolled ? 'text-[15px] text-foreground hover:text-secondary' : 'text-base text-muted-foreground hover:text-foreground'}`}
            >
              Contact
            </button>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size={scrolled ? "sm" : "default"}
              className={`transition-all duration-600 ${scrolled ? 'px-3 py-1 text-[15px]' : 'px-4 py-2 text-sm'}`}
              onClick={() => {
                if (!user) {
                  onAuthOpen?.();
                } else {
                  navigate(`/dashboard?referral=${currentPage}`);
                }
              }}
            >
              Try Vedika Free
            </Button>
            <Button
              variant="cosmic"
              size={scrolled ? "sm" : "default"}
              className={`transition-all duration-600 ${scrolled ? 'px-3 py-1 text-[15px]' : 'px-4 py-2 text-sm'}`}
              onClick={() => {
                if (!user) {
                  onAuthOpen?.();
                } else {
                  localStorage.setItem("redirect_intent", "dashboard");
                  navigate(`/dashboard?referral=${currentPage}`);
                }
              }}
            >
              {location.pathname === '/ai-future-spouse-prediction' ? "Ask Vedika about your future wife" : (user ? "Go to Dashboard" : "Get Started Free")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
      </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-[0_8px_30px_hsl(var(--primary)/0.25)]">
            <div className="flex flex-col space-y-4">
              <button onClick={() => { navigate(`/about?referral=${currentPage}`); setMobileMenuOpen(false); }} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                About Us
              </button>
              <button 
                onClick={() => { navigate(`/mission?referral=${currentPage}`); setMobileMenuOpen(false); }} 
                className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Our Mission
              </button>
              <button onClick={() => { navigate(`/how-it-works?referral=${currentPage}`); setMobileMenuOpen(false); }} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                How it works
              </button>
              <button onClick={() => { navigate(`/blog?referral=${currentPage}`); setMobileMenuOpen(false); }} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                Blog
              </button>
              <button onClick={() => { localStorage.setItem("pricing_source","landing"); navigate(`/privacy?referral=${currentPage}`); setMobileMenuOpen(false); }} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                Privacy Policy
              </button>
              <button
                onClick={() => { navigate(`/contact?referral=${currentPage}`); setMobileMenuOpen(false); }}
                className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Contact
              </button>
              <div className="pt-4 border-t border-border/40 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      onAuthOpen?.();
                    } else {
                      navigate(`/dashboard?referral=${currentPage}`);
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  Try Vedika Free
                </Button>
                <Button
                  variant="cosmic"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      onAuthOpen?.();
                    } else {
                      localStorage.setItem("redirect_intent", "dashboard");
                      navigate(`/dashboard?referral=${currentPage}`);
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  {location.pathname === '/ai-future-spouse-prediction' ? "Ask Vedika about your future wife" : (user ? "Go to Dashboard" : "Get Started Free")}
                </Button>
              </div>
            </div>
          </div>
        )}
    </nav>
  );
};

export default Navbar;
