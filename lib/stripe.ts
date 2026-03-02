import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
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
