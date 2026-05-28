'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

type AdSenseAdProps = {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
};

const AdSenseAd = ({ adSlot, adFormat = 'auto', style = { display: 'block' }, className = '' }: AdSenseAdProps) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className={className}>
        <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Placeholder Publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        ></ins>
    </div>
  );
};

export default AdSenseAd;
