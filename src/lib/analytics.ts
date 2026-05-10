const GA_MEASUREMENT_ID: string | undefined = import.meta.env[
  'VITE_GA_MEASUREMENT_ID'
];

let scriptAdded = false;

export function initGA4(): void {
  if (scriptAdded || !GA_MEASUREMENT_ID) return;
  scriptAdded = true;

  // Set up gtag + dataLayer before the script loads — events are queued in
  // dataLayer and processed by gtag.js once the remote script arrives.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.onload = () => console.log('[GA4] gtag script loaded');
  script.onerror = () => console.error('[GA4] Failed to load gtag script');
  document.head.appendChild(script);
}

export function trackPageView(path: string, title: string): void {
  if (!GA_MEASUREMENT_ID) return;
  // Pushes to dataLayer regardless of whether the remote script has loaded
  // yet — gtag.js replays queued events when it arrives.
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
    dataLayer: unknown[];
  }
}
