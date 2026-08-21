import { useEffect } from 'react';

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';

function ensureAdSenseScript() {
  if (!ADSENSE_CLIENT_ID || typeof document === 'undefined') return;
  const existingScript = document.querySelector('script[data-paperscart-adsense="true"]');
  if (existingScript) return;

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
  script.dataset.paperscartAdsense = 'true';
  document.head.appendChild(script);
}

export default function AdSenseSlot({ slot, className = '', label = 'Advertisement' }) {
  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || !slot) return;
    ensureAdSenseScript();
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, [slot]);

  if (!ADSENSE_CLIENT_ID || !slot) return null;

  return (
    <section className={className} aria-label={label}>
      <div className="mx-auto max-w-4xl border-y border-black/10 py-5 text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-black/35">{label}</p>
        <ins
          className="adsbygoogle block"
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}
