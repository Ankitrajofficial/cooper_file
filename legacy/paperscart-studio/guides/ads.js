const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';
const guideSlot = import.meta.env.VITE_ADSENSE_GUIDE_SLOT || '';

function removeAdPlaceholders() {
  document.querySelectorAll('[data-adsense-guide-slot]').forEach((element) => element.remove());
}

function loadAdSenseScript() {
  const existingScript = document.querySelector('script[data-paperscart-adsense="true"]');
  if (existingScript) return;

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.dataset.paperscartAdsense = 'true';
  document.head.appendChild(script);
}

if (!clientId || !guideSlot) {
  removeAdPlaceholders();
} else {
  loadAdSenseScript();
  document.querySelectorAll('[data-adsense-guide-slot]').forEach((element) => {
    element.classList.add('is-ready');
    const ad = document.createElement('ins');
    ad.className = 'adsbygoogle block';
    ad.dataset.adClient = clientId;
    ad.dataset.adSlot = guideSlot;
    ad.dataset.adFormat = 'auto';
    ad.dataset.fullWidthResponsive = 'true';
    element.appendChild(ad);
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  });
}
