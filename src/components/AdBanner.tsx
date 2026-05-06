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
        if (window.adsbygoogle && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    // Delay ad push to ensure container is ready
    const timer = setTimeout(pushAd, 100);

    return () => clearTimeout(timer);
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
    adsbygoogle: any[];
  }
}
