import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Wavelength',
  description: 'Terms of service for Wavelength workforce program intelligence services.',
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-theme-muted text-sm">
              Last updated: February 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose-wavelength">
            
            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Agreement to Terms</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                By accessing or using Wavelength's website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Description of Services</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                Wavelength provides workforce program intelligence services to community colleges and educational institutions. Our services include:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li><strong className="text-theme-primary">Program Finders:</strong> Identification and analysis of potential workforce program opportunities based on labor market data</li>
                <li><strong className="text-theme-primary">Feasibility Report:</strong> In-depth validation of specific program concepts through market research and competitive analysis</li>
                <li><strong className="text-theme-primary">Pell Readiness Checks:</strong> Analysis of institutional programs against Workforce Pell eligibility criteria</li>
                <li><strong className="text-theme-primary">Add-on services:</strong> Including program gap audits, grant intelligence scans, and curriculum drift analysis</li>
              </ul>
              <p className="text-theme-secondary leading-relaxed mt-4">
                Our reports analyze publicly available labor market data, employer demand signals, competitive landscapes, and regulatory requirements to inform program development decisions.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Informational Purpose & No Guarantees</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                Wavelength's reports and recommendations are provided for informational and strategic planning purposes only. Our services are designed to help inform decision-making, not to guarantee outcomes.
              </p>
              <p className="text-theme-secondary leading-relaxed mb-4">
                <strong className="text-theme-primary">We do not guarantee:</strong>
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li>That any program identified will be successful if launched</li>
                <li>Specific enrollment numbers, completion rates, or placement outcomes</li>
                <li>Approval of Workforce Pell applications or other regulatory submissions</li>
                <li>Grant funding or external financial support</li>
                <li>That labor market conditions will remain stable or favorable</li>
              </ul>
              <p className="text-theme-secondary leading-relaxed mt-4">
                Program success depends on many factors including institutional execution, local market conditions, competitive dynamics, and regulatory environments — factors outside Wavelength's control.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Intellectual Property</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                <strong className="text-theme-primary">Your rights:</strong> Reports delivered to you are licensed for your institution's internal use. You may share them within your organization, with your governing board, and with relevant stakeholders for program development purposes.
              </p>
              <p className="text-theme-secondary leading-relaxed mb-4">
                <strong className="text-theme-primary">Our rights:</strong> Wavelength retains all intellectual property rights to our methodology, analytical frameworks, data sources, report templates, and the Wavelength brand. You may not:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li>Resell, redistribute, or commercialize our reports to third parties</li>
                <li>Reverse-engineer our methodology or analytical processes</li>
                <li>Use our brand, logo, or name without written permission</li>
                <li>Publish our reports publicly without prior written consent</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Payment Terms</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                All services are billed as one-time payments unless otherwise specified (e.g., recurring engagements). Pricing is listed on our website at{' '}
                <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
                  withwavelength.com
                </Link>.
              </p>
              <p className="text-theme-secondary leading-relaxed mb-4">
                Payment is due upon ordering. Reports are delivered after payment confirmation. If you have questions about institutional purchasing processes or need alternative payment arrangements, contact us at{' '}
                <a href="mailto:hello@withwavelength.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  hello@withwavelength.com
                </a>.
              </p>
              <p className="text-theme-secondary leading-relaxed">
                <strong className="text-theme-primary">Refunds:</strong> If you are unsatisfied with a delivered report, contact us within 14 days of delivery. We'll work with you to address concerns or issue a refund at our discretion.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Limitation of Liability</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                To the fullest extent permitted by law, Wavelength and its operators shall not be liable for:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li>Any indirect, incidental, special, or consequential damages arising from the use of our services</li>
                <li>Lost profits, enrollment shortfalls, or other business losses related to program development decisions</li>
                <li>Decisions made by your institution based on our reports or recommendations</li>
                <li>Changes in labor market conditions, regulatory environments, or competitive landscapes after report delivery</li>
              </ul>
              <p className="text-theme-secondary leading-relaxed mt-4">
                In any case, our total liability shall not exceed the amount you paid for the specific service giving rise to the claim.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Data Accuracy</h2>
              <p className="text-theme-secondary leading-relaxed">
                We use reputable data sources and exercise reasonable care in our analysis. However, we do not warrant that all data is error-free or that labor market conditions will remain constant. Our reports reflect conditions at the time of analysis and should be considered alongside your institution's own research and judgment.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">User Responsibilities</h2>
              <p className="text-theme-secondary leading-relaxed mb-4">
                When using Wavelength's services, you agree to:
              </p>
              <ul className="text-theme-secondary leading-relaxed space-y-2 list-disc pl-6">
                <li>Provide accurate information when submitting requests or ordering services</li>
                <li>Use reports for legitimate educational and strategic planning purposes</li>
                <li>Not misrepresent our findings or use them to mislead stakeholders</li>
                <li>Comply with all applicable laws and regulations in your use of our services</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Modification of Terms</h2>
              <p className="text-theme-secondary leading-relaxed">
                We reserve the right to modify these terms at any time. When we make material changes, we'll update the "Last updated" date at the top of this page. Continued use of our services after changes are posted constitutes acceptance of the updated terms. For significant changes, we may notify active clients via email.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Termination</h2>
              <p className="text-theme-secondary leading-relaxed">
                We reserve the right to refuse service or terminate access to our platform at our discretion, including for violation of these terms or misuse of our services. Upon termination, your right to use reports delivered to you remains intact, but you may not order new services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Governing Law</h2>
              <p className="text-theme-secondary leading-relaxed">
                These Terms of Service are governed by the laws of the State of Iowa, without regard to its conflict of law provisions. Any disputes arising from these terms or our services shall be resolved in the courts of Iowa.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="font-heading font-semibold text-theme-primary text-2xl mb-4">Contact Us</h2>
              <p className="text-theme-secondary leading-relaxed">
                If you have questions about these terms or our services, please contact us:
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
