import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, TrendingUp, DollarSign, Users, BookOpen, Target, Megaphone, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Validate Any Workforce Program in 48 Hours
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Comprehensive market analysis, financial projections, and strategic recommendations —
            the rigor of a $100k consulting engagement, delivered in days.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="#sample-report">
              <Button size="lg">See a Sample Report</Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline">Start a Validation</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Data Sources Trust Bar */}
      <section className="py-8 bg-slate-50 border-y">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-slate-600 mb-4">
            Built on trusted data sources
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium">Bureau of Labor Statistics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <span className="text-sm font-medium">O*NET Occupational Data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-sm font-medium">U.S. Census Bureau</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              <span className="text-sm font-medium">Real-Time Labor Market Intelligence</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Lens Validation Framework */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            The 6-Lens Validation Framework
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Every program is evaluated through six critical business perspectives —
            the same analysis a $100k consulting engagement would provide.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-blue-600" />
                <CardTitle>Market Demand Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Employer job postings (real-time)</li>
                  <li>• BLS growth projections</li>
                  <li>• Regional workforce gaps</li>
                  <li>• Wage data and trends</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 mb-2 text-green-600" />
                <CardTitle>Financial Viability</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Startup cost analysis</li>
                  <li>• Enrollment projections</li>
                  <li>• Break-even timeline</li>
                  <li>• 5-year ROI modeling</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-purple-600" />
                <CardTitle>Competitive Landscape</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Nearby program offerings</li>
                  <li>• Enrollment benchmarks</li>
                  <li>• Market saturation analysis</li>
                  <li>• Differentiation opportunities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 mb-2 text-amber-600" />
                <CardTitle>Curriculum Design</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Skill alignment with job requirements</li>
                  <li>• Industry credential mapping</li>
                  <li>• Program length optimization</li>
                  <li>• Stackability pathways</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 mb-2 text-red-600" />
                <CardTitle>Workforce Alignment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Employer partnership opportunities</li>
                  <li>• Work-based learning models</li>
                  <li>• Placement potential</li>
                  <li>• Industry advisory input</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Megaphone className="h-10 w-10 mb-2 text-indigo-600" />
                <CardTitle>Marketing Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Target audience identification</li>
                  <li>• Enrollment funnel design</li>
                  <li>• Channel recommendations</li>
                  <li>• Launch campaign timeline</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Process</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Submit Program Details</h3>
                <p className="text-muted-foreground">
                  Provide basic information about your program concept, target audience, and
                  constraints
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Comprehensive Research</h3>
                <p className="text-muted-foreground">
                  Our analysis engine evaluates market demand, competition, curriculum design,
                  financials, and marketing strategy using real labor market data
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">6-Lens Evaluation</h3>
                <p className="text-muted-foreground">
                  Multi-perspective analysis evaluates viability from every critical business angle
                  and provides a GO/NO-GO recommendation
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Professional Report</h3>
                <p className="text-muted-foreground">
                  Receive a comprehensive validation report with executive summary, detailed analysis,
                  and implementation roadmap
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Report */}
      <section id="sample-report" className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">See What You Get</h2>
          <p className="text-xl text-slate-300 mb-8">
            Here&apos;s a sample validation report for an Industrial Coatings Specialist Certificate program
          </p>

          <div className="bg-white/10 rounded-lg p-8 mb-6">
            <p className="text-sm text-slate-300 mb-4">
              14-page report including Executive Summary, Market Demand Analysis,
              Competitive Landscape, Curriculum Design, Financial Projections &amp; Marketing Strategy
            </p>
            <p className="text-2xl font-bold text-green-400 mb-2">Recommendation: CONDITIONAL GO ✓</p>
            <p className="text-slate-400 text-sm">Eastern Iowa region | 18% job growth | $52K median salary | Low competition</p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sample-report.pdf" download>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                📄 Download Sample Report (PDF)
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Your Own Validation →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Transparent Pricing
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            No &quot;contact for pricing&quot; — here&apos;s exactly what it costs
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Entry Validation</CardTitle>
                <div className="text-3xl font-bold mt-4">$2,500</div>
                <CardDescription>Perfect for testing our service</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Single program validation</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">All 6 lenses analyzed</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">GO/NO-GO recommendation</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">48-hour delivery</span>
                  </li>
                </ul>
                <Link href="/submit">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-600 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                MOST POPULAR
              </div>
              <CardHeader>
                <CardTitle>Standard Validation</CardTitle>
                <div className="text-3xl font-bold mt-4">$7,500</div>
                <CardDescription>Comprehensive analysis + roadmap</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Everything in Entry, plus:</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Implementation roadmap</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Risk mitigation strategies</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">1-hour consultation call</span>
                  </li>
                </ul>
                <Link href="/submit">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Annual Partnership</CardTitle>
                <div className="text-3xl font-bold mt-4">$25,000</div>
                <CardDescription>Up to 5 validations per year</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">5 standard validations</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Quarterly market updates</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Save $12,500/year</span>
                  </li>
                </ul>
                <Link href="/submit">
                  <Button className="w-full" variant="outline">Contact Us</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            <Shield className="inline w-4 h-4 mr-1" />
            100% satisfaction guarantee on your first validation — full refund if not actionable
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <details className="bg-slate-50 rounded-lg p-6">
              <summary className="font-bold cursor-pointer">
                How is this different from hiring a consultant?
              </summary>
              <p className="mt-3 text-muted-foreground">
                Traditional consultants bring 1-2 people and deliver in 3-6 months for $50k-$150k.
                We provide the same multi-perspective rigor (financial, marketing, curriculum, market demand, etc.)
                in 48 hours using our structured analysis framework backed by real labor market data.
              </p>
            </details>

            <details className="bg-slate-50 rounded-lg p-6">
              <summary className="font-bold cursor-pointer">
                What data sources do you use?
              </summary>
              <p className="mt-3 text-muted-foreground">
                Bureau of Labor Statistics employment projections, O*NET occupational standards,
                real-time job posting data from 50,000+ employers, U.S. Census demographic data,
                and BLS wage information. All citations included in your report.
              </p>
            </details>

            <details className="bg-slate-50 rounded-lg p-6">
              <summary className="font-bold cursor-pointer">
                What if the report recommends NO-GO?
              </summary>
              <p className="mt-3 text-muted-foreground">
                That&apos;s valuable! A NO-GO recommendation saves you from investing $500k+ in a program with weak demand.
                The report will explain exactly why and what would need to change for the program to succeed.
              </p>
            </details>

            <details className="bg-slate-50 rounded-lg p-6">
              <summary className="font-bold cursor-pointer">
                How long does it actually take?
              </summary>
              <p className="mt-3 text-muted-foreground">
                Entry validations: 48 hours. Standard validations with implementation roadmap: 72 hours.
                We run all research in parallel, so the timeline is consistent regardless of program complexity.
              </p>
            </details>

            <details className="bg-slate-50 rounded-lg p-6">
              <summary className="font-bold cursor-pointer">
                Is my institution&apos;s data secure?
              </summary>
              <p className="mt-3 text-muted-foreground">
                Yes. All data is encrypted in transit and at rest using SOC 2 Type II certified infrastructure.
                Your program details are never shared with third parties. Reports are delivered via secure link.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <div className="py-16 container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Ready to validate your program idea?</CardTitle>
              <CardDescription>
                Get comprehensive validation in 48 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/submit">
                <Button size="lg">Get Started</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
