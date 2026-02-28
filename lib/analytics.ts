// Plausible Analytics helper
// Wraps window.plausible() calls for type-safe custom event tracking

type PlausibleEventName =
  | 'Order Program Finder'
  | 'Order Feasibility Study'
  | 'Start Free Pell Check'
  | 'Contact Form Submit'
  | 'Newsletter Signup'
  | 'Lead Magnet Download'
  | 'Blog CTA Click';

interface PlausibleOptions {
  props?: Record<string, string | number | boolean>;
}

declare global {
  interface Window {
    plausible?: (event: string, options?: PlausibleOptions) => void;
  }
}

export function trackEvent(event: PlausibleEventName, props?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }
}
