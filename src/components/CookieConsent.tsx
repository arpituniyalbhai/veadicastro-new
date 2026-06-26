import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay so it feels natural
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-[420px] bg-[#12121a] border border-[#d9277a]/20 rounded-2xl shadow-2xl p-5 sm:p-6 transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-8 fade-in-50">
      <div className="flex items-start gap-4">
        <div className="bg-[#d9277a]/10 p-2.5 rounded-full shrink-0 mt-0.5">
          <Cookie className="w-6 h-6 text-[#d9277a]" />
        </div>
        <div className="flex-1">
          <h3 className="text-[#f2f2f2] font-semibold text-lg mb-2">We use cookies</h3>
          <p className="text-[#c4c4d4] text-sm leading-relaxed mb-5">
            We use cookies to understand how you use Vedic Astro and to improve your experience. You can choose what to allow.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:opacity-90 text-white font-semibold py-2.5 px-4 rounded-xl transition-opacity text-sm shadow-lg shadow-[hsl(var(--primary))]/20"
            >
              Accept all
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-transparent hover:bg-white/5 border border-white/10 text-[#f2f2f2] font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
            >
              Reject all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
