import Link from 'next/link';
import { CheckCircle2, ArrowRight, Clock, FileText, Mail, Users } from 'lucide-react';
import { Stars } from '@/components/cosmic/Stars';
import { Aurora } from '@/components/cosmic/Aurora';

export const metadata = {
  title: 'Request Received | Wavelength',
  robots: { index: false },
};

export default function ConfirmationPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center pt-36 lg:pt-40 pb-16 overflow-hidden">
        <Stars count={80} />
        <Aurora className="opacity-50" />
        <div className="relative z-10 max-w-[700px] mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-teal-400" />
          </div>
          <h1
            className="font-heading font-bold text-theme-primary leading-[1.08] mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            We&apos;ve received your request.
          </h1>
          <p className="text-theme-secondary text-lg leading-relaxed max-w-xl mx-auto">
            Your feasibility study is now in our queue. Here&apos;s what to expect.
          </p>
        </div>
      </section>

      {/* Timeline & Details */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-[800px] mx-auto px-6">
          {/* Timeline expectations */}
          <div className="card-cosmic rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="font-heading font-bold text-theme-primary text-xl">Timeline</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 text-sm font-mono font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary text-sm">Confirmation email (within minutes)</h3>
                  <p className="text-theme-secondary text-sm mt-1">Check your inbox for a confirmation with your submission details.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 text-sm font-mono font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary text-sm">Onboarding call (within 48 hours)</h3>
                  <p className="text-theme-secondary text-sm mt-1">We&apos;ll reach out to confirm scope, discuss your institution, and align on any additional context.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 text-sm font-mono font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-theme-primary text-sm">Report delivery (7–10 business days)</h3>
                  <p className="text-theme-secondary text-sm mt-1">Your completed feasibility study will be delivered via email as a professional PDF report.</p>
                </div>
              </div>
            </div>
          </div>

          {/* What we need from you */}
          <div className="card-cosmic rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="font-heading font-bold text-theme-primary text-xl">What we may need from you</h2>
            </div>
            <ul className="space-y-3">
              {[
                'Access to your current program catalog (if not publicly available)',
                'Any internal enrollment or demand data you can share',
                'Preferred contact method for the onboarding conversation',
                'Names of specific employer partners (if applicable)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-theme-secondary">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-theme-muted text-xs mt-4">
              Don&apos;t worry if you don&apos;t have all of this — we&apos;ll work with what you have.
            </p>
          </div>

          {/* What happens next */}
          <div className="card-cosmic rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-teal-400" />
              </div>
              <h2 className="font-heading font-bold text-theme-primary text-xl">What happens next</h2>
            </div>
            <div className="space-y-3">
              {[
                'Your program is analyzed across 7 validation dimensions',
                'We cross-reference 50+ live data sources for your specific region',
                'Financial viability modeling with 3-scenario P&L projections',
                'Competitive landscape mapping and positioning analysis',
                'You receive a board-ready report with a GO / NO-GO recommendation',
              ].map((step) => (
                <div key={step} className="flex items-start gap-3 text-sm text-theme-secondary">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="card-cosmic rounded-2xl p-8 mb-8 text-center">
            <Mail className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-theme-secondary text-sm leading-relaxed">
              Questions before we start? Reach us at{' '}
              <a href="mailto:hello@withwavelength.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                hello@withwavelength.com
              </a>
            </p>
          </div>

          {/* CTAs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/blog" className="card-cosmic rounded-xl p-6 group hover:border-purple-500/20 transition-all">
              <h3 className="font-heading font-semibold text-theme-primary text-sm mb-1 group-hover:text-gradient-cosmic transition-colors">
                Read the Blog
              </h3>
              <p className="text-theme-muted text-xs">Workforce intelligence insights while you wait.</p>
              <ArrowRight className="h-4 w-4 text-theme-muted mt-3 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/pell" className="card-cosmic rounded-xl p-6 group hover:border-teal-500/20 transition-all">
              <h3 className="font-heading font-semibold text-theme-primary text-sm mb-1 group-hover:text-gradient-cosmic transition-colors">
                Free Pell Readiness Check
              </h3>
              <p className="text-theme-muted text-xs">See which programs qualify for Workforce Pell.</p>
              <ArrowRight className="h-4 w-4 text-theme-muted mt-3 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
