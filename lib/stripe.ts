import Stripe from 'stripe';

// Lazy singleton — avoids throwing at build time when STRIPE_SECRET_KEY is absent
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

/** @deprecated use getStripe() */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export interface Product {
  slug: string;
  name: string;
  serviceTier: string;
  amountCents: number;
  priceEnvKey: string;
}

export const PRODUCTS: Record<string, Product> = {
  'program-finder': {
    slug: 'program-finder',
    name: 'Program Finder',
    serviceTier: 'discovery',
    amountCents: 150000,
    priceEnvKey: 'STRIPE_PRICE_PROGRAM_FINDER',
  },
  'feasibility-study': {
    slug: 'feasibility-study',
    name: 'Feasibility Study',
    serviceTier: 'validation',
    amountCents: 300000,
    priceEnvKey: 'STRIPE_PRICE_FEASIBILITY_STUDY',
  },
};
