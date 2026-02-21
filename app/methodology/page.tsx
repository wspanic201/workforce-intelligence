import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Methodology — 6-Lens Workforce Feasibility Report Framework",
  description:
    "Learn how Wavelength validates community college programs using a 6-lens framework: market demand, financial viability, competitive landscape, curriculum design, workforce alignment, and marketing strategy.",
  alternates: {
    canonical: "/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Our Methodology</h1>
      <p className="text-xl text-muted-foreground mb-12">
        How we validate workforce programs using the 6-lens framework
      </p>

      <div className="prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold mt-8 mb-4">The Multi-Perspective Analysis Framework</h2>
        <p className="text-muted-foreground mb-6">
          Every program is evaluated through six critical business perspectives —
          the same lenses a $100k consulting team would apply. Our analysis engine
          systematically evaluates your program from each perspective using real
          labor market data and proven validation frameworks.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">1. Market Demand Analysis</h3>
        <p className="text-muted-foreground mb-6">
          We analyze real-time employer job postings, BLS growth projections, regional
          workforce gaps, and wage trends to determine if there&apos;s sustainable demand
          for your program&apos;s graduates.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">2. Financial Viability</h3>
        <p className="text-muted-foreground mb-6">
          A CFO-level financial analysis evaluating startup costs, enrollment projections,
          break-even timeline, and 5-year ROI modeling.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">3. Competitive Landscape</h3>
        <p className="text-muted-foreground mb-6">
          We map nearby program offerings, benchmark enrollment, analyze market saturation,
          and identify differentiation opportunities.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">4. Curriculum Design</h3>
        <p className="text-muted-foreground mb-6">
          Alignment between your proposed curriculum and actual job requirements, industry
          credentials, optimal program length, and stackability pathways.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">5. Workforce Alignment</h3>
        <p className="text-muted-foreground mb-6">
          Evaluation of employer partnership opportunities, work-based learning models,
          placement potential, and industry advisory engagement.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">6. Marketing Strategy</h3>
        <p className="text-muted-foreground mb-6">
          Target audience identification, enrollment funnel design, channel recommendations,
          and launch campaign timeline.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Powered by Confluence Labs</h2>
        <p className="text-muted-foreground mb-6">
          Our validation framework is built on Confluence Labs&apos; multi-perspective analysis
          methodology — a structured approach to evaluating programs from multiple executive
          viewpoints simultaneously, grounded in real data and proven business frameworks.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Data Sources</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Bureau of Labor Statistics (BLS) employment projections</li>
          <li>O*NET occupational standards and skill requirements</li>
          <li>Real-time job posting data from 50,000+ employers</li>
          <li>U.S. Census Bureau demographic and economic data</li>
          <li>Industry-specific market research</li>
        </ul>

        <h2 className="text-2xl font-bold mt-10 mb-4">Transparency Commitment</h2>
        <p className="text-muted-foreground mb-8">
          All recommendations are backed by data citations. Every projection includes our
          methodology and assumptions. If we recommend NO-GO, we explain exactly why and
          what would need to change.
        </p>

        <div className="text-center mt-12">
          <Link href="/submit">
            <Button size="lg">Start a Validation</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
