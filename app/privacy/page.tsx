import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Wavelength',
  description: 'Privacy policy for Wavelength workforce program intelligence services.',
};

export default function PrivacyPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      <div className="relative min-h-screen pt-32 pb-20">
        <div className="max-w-[760px] mx-auto px-6">
          
          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="text-sm text-theme-secondary hover:text-theme-primary transition-colors mb-6 inline-block">
              ← Back to Home
            </Link>
            <h1 className="font-heading font-bold text-theme-primary text-4xl mb-3">
              Privacy Policy
            </h1>
            <p className="text-theme-muted text-sm">
              Last updated: February 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose-wavelength">
            
            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Overview</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                Wavelength is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding your personal information. We believe in transparency and keep our data practices simple.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">What Data We Collect</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                We collect information you provide directly to us through:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 mb-4 list-disc pl-6">
                <li><strong className="text-theme-primary">Contact forms:</strong> Name, email address, institution name, and message content when you contact us or request a report</li>
                <li><strong className="text-theme-primary">Newsletter signups:</strong> Email address when you subscribe to The Signal newsletter or footer updates</li>
                <li><strong className="text-theme-primary">Lead magnet downloads:</strong> Email address and institution name when you download resources like checklists</li>
                <li><strong className="text-theme-primary">Service requests:</strong> Additional information you provide when ordering reports (e.g., state, program focus areas)</li>
              </ul>
              <p className="text-theme-secondary leading-relaxed mb-4">
                We also automatically collect:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li><strong className="text-theme-primary">Usage data:</strong> Pages visited, time on site, referring URLs via Vercel Analytics (anonymous, aggregated data only)</li>
                <li><strong className="text-theme-primary">Theme preference:</strong> Your light/dark mode selection stored in your browser's localStorage (stored locally, never sent to our servers)</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">How We Use Your Data</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li>Deliver the reports and services you request</li>
                <li>Communicate with you about your orders, our services, and relevant updates</li>
                <li>Send you The Signal newsletter or other resources you've opted into</li>
                <li>Improve our website and services based on usage patterns</li>
                <li>Respond to your inquiries and provide customer support</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Data Sharing</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                We do not sell, rent, or share your personal information with third parties for their marketing purposes. We only share data with service providers who help us operate our business:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li><strong className="text-theme-primary">Resend:</strong> Email delivery service used to send reports, confirmations, and newsletters</li>
                <li><strong className="text-theme-primary">Vercel:</strong> Web hosting and analytics platform (analytics data is anonymous and aggregated)</li>
              </ul>
              <p className="text-theme-secondary leading-relaxed mt-4">
                These providers are contractually obligated to protect your data and use it only for the services they provide to us.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Cookies & Local Storage</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                We keep cookies minimal. Our site uses:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li><strong className="text-theme-primary">Theme preference:</strong> Stored in localStorage to remember your light/dark mode choice across visits</li>
                <li><strong className="text-theme-primary">Vercel Analytics:</strong> Anonymous, cookieless web analytics to understand aggregate usage patterns</li>
              </ul>
              <p className="text-theme-secondary leading-relaxed mt-4">
                We do not use tracking cookies, advertising cookies, or third-party analytics tools that track you across sites.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">FERPA Compliance</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                Wavelength does not collect, process, or store student personally identifiable information (PII) as defined by the Family Educational Rights and Privacy Act (FERPA). Our services analyze publicly available labor market data and institutional program catalogs — not student records.
              </p>
              <p className="text-theme-secondary leading-relaxed">
                If you are a FERPA-covered institution, you may share your program catalog and institutional data with us without triggering FERPA obligations, as this information does not constitute student education records.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Your Privacy Rights</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li><strong className="text-theme-primary">Access:</strong> Request a copy of the personal information we have about you</li>
                <li><strong className="text-theme-primary">Correction:</strong> Ask us to correct inaccurate or incomplete information</li>
                <li><strong className="text-theme-primary">Deletion:</strong> Request that we delete your personal information (subject to legal obligations)</li>
                <li><strong className="text-theme-primary">Opt-out:</strong> Unsubscribe from marketing emails at any time via the link in our emails</li>
              </ul>
              <p className="text-theme-secondary leading-relaxed mt-4">
                To exercise these rights, email us at{' '}
                <a href="mailto:hello@withwavelength.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  hello@withwavelength.com
                </a>.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">California & State-Specific Rights</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li>Right to know what personal information is collected and how it's used</li>
                <li>Right to request deletion of your personal information</li>
                <li>Right to opt-out of the sale of your information (note: we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
              </ul>
              <p className="text-theme-secondary leading-relaxed mt-4">
                Other states may provide similar rights. To exercise any of these rights, contact us at{' '}
                <a href="mailto:hello@withwavelength.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  hello@withwavelength.com
                </a>.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Data Security</h2>
              <p className="text-theme-secondary leading-relaxed">
                We take reasonable measures to protect your personal information from unauthorized access, disclosure, or destruction. Our site uses HTTPS encryption, and our service providers employ industry-standard security practices. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Changes to This Policy</h2>
              <p className="text-theme-secondary leading-relaxed">
                We may update this privacy policy from time to time. When we make significant changes, we'll update the "Last updated" date at the top of this page. Continued use of our services after changes are posted constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Contact Us</h2>
              <p className="text-theme-secondary leading-relaxed">
                If you have questions about this privacy policy or how we handle your data, please contact us:
              </p>
              <p className="text-theme-secondary leading-relaxed mt-4">
                <strong className="text-theme-primary">Email:</strong>{' '}
                <a href="mailto:hello@withwavelength.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  hello@withwavelength.com
                </a>
              </p>
            </section>

          </div>

        </div>
      </div>
    </div>
  );
}
