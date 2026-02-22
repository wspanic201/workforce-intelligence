import type { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing | Wavelength — Workforce Program Intelligence',
  description:
    'Transparent pricing for every Wavelength service. From free Pell checks to full program validation — intelligence that pays for itself.',
  alternates: { canonical: 'https://withwavelength.com/pricing' },
};

export default function PricingPage() {
  return <PricingClient />;
}
