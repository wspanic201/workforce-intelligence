import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Iowa Program ROI Reporting Requirements | Wavelength',
  description: 'New Iowa legislation requires community colleges to report program ROI with unit-level wage data. Wavelength provides the workforce intelligence you need to comply.',
  alternates: {
    canonical: 'https://withwavelength.com/iowa-roi-reporting',
  },
}

export default function IowaROIPage() {
  return (
    <div className="min-h-screen bg-theme-page">
      {/* Hero */}
      <section className="relative py-20 md:py-28 border-b border-theme-subtle">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-6 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Iowa Community Colleges
          </div>
          
          <h1 className="font-heading font-bold text-gray-900 mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            New Iowa ROI Reporting Requirements: What Your College Needs to Know
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Iowa HF 2633 is moving through the legislature — requiring Iowa Workforce Development to share unit-level wage data with Iowa Department of Education for program evaluation. Community colleges will soon be required to report program ROI: costs, retention, completion, and post-completion outcomes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/pell">
              <button className="btn-cosmic btn-cosmic-primary py-3 px-8">
                Start Free Pell Readiness Check
              </button>
            </Link>
            <Link href="/contact">
              <button className="btn-cosmic btn-cosmic-ghost py-3 px-8">
                Schedule a Strategy Call
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* What's Changing */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading font-bold text-gray-900 text-3xl mb-12">
            What's Changing in Iowa
          </h2>

          <div className="space-y-8">
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                1. Unit-Level Wage Data Sharing
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Iowa Workforce Development will be required to share detailed, program-specific wage outcomes with Iowa Department of Education. No more relying on self-reported or aggregated data — this will be actual UI wage records matched to program completers.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                2. Mandatory ROI Reporting by Community Colleges
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Colleges will be required to report program-level ROI metrics: program costs (direct + indirect), retention rates, completion rates, and post-completion employment outcomes. This data will be public and used for state funding decisions.
              </p>
            </div>

            <div className="border-l-4 border-teal-500 pl-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                3. Increased Accountability for Workforce Programs
              </h3>
              <p className="text-gray-700 leading-relaxed">
                The state is tightening oversight of continuing education and workforce development programs. Programs with poor ROI — low completion, weak wage outcomes, high cost per credential — will face scrutiny and potential defunding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="relative py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading font-bold text-gray-900 text-3xl mb-12">
            Why This Makes Wavelength More Valuable
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                You Already Need the Data
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Wavelength's validation reports include BLS wage data, financial projections, and outcome forecasts — exactly what you'll need to report under the new requirements.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                ROI Becomes Your Competitive Advantage
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Programs with strong ROI metrics will get more state funding, more student interest, and more employer partnerships. Wavelength helps you launch programs that perform.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                Proactive, Not Reactive
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Don't wait for the state to flag your programs. Use Wavelength's Gap Audit to identify underperforming programs now — before they show up in public ROI reports.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                Evidence-Based Program Development
              </h3>
              <p className="text-gray-700 leading-relaxed">
                When you propose new programs to leadership, you'll have labor market validation, financial projections, and wage outcome data — making it easier to get approvals and funding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Wavelength Helps */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading font-bold text-gray-900 text-3xl mb-12">
            How Wavelength Helps You Prepare
          </h2>

          <div className="space-y-6">
            <div className="card-cosmic rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Pell Readiness Check
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Score your programs against Workforce Pell eligibility criteria
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-teal-600">Free</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Identify which programs qualify for Workforce Pell funding — a major ROI boost when federal aid covers tuition.
              </p>
              <Link href="/pell">
                <button className="text-sm text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1">
                  Run Free Check
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>

            <div className="card-cosmic rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Program Gap Audit
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Baseline your current portfolio against new ROI requirements
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-purple-600">$295</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Scan your entire program catalog for compliance gaps, curriculum drift, and ROI risk factors. Get ahead of the state's audit.
              </p>
              <Link href="/compliance-gap">
                <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1">
                  Learn More
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>

            <div className="card-cosmic rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Program Validation
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Full financial model + wage outcome projections for new programs
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-purple-600">$3,500</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Before you invest in curriculum development or faculty hires, validate that the program will deliver strong ROI — completion rates, wage outcomes, and financial viability.
              </p>
              <Link href="/validate">
                <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1">
                  Learn More
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-violet-50 to-teal-50 border-t border-violet-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading font-bold text-gray-900 text-3xl mb-4">
            Don't Wait for the State to Audit Your Programs
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Start with a free Pell Readiness Check, or schedule a call to discuss how Wavelength can help your institution meet Iowa's new ROI reporting requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pell">
              <button className="btn-cosmic btn-cosmic-primary py-3 px-8">
                Run Free Pell Check
              </button>
            </Link>
            <Link href="/contact">
              <button className="btn-cosmic btn-cosmic-ghost py-3 px-8">
                Schedule Strategy Call
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
