import { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: string;
  className?: string;
}

const AdBanner = ({ adSlot, adFormat = 'auto', className = '' }: AdBannerProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const pushAd = () => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src*="adsbygoogle.js"]');

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8272452438501804';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = pushAd;
      document.head.appendChild(script);
      return;
    }

    const timer = window.setTimeout(pushAd, 100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-8272452438501804"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;

// Add TypeScript declarations for Google AdSense
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}
