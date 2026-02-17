import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community College Program Development: A Data-Driven Approach",
  description:
    "How to use market data to identify what programs to build, validate demand before you invest, and avoid the most common misses in community college program development.",
  alternates: {
    canonical: "https://withwavelength.com/blog/community-college-program-development",
  },
  openGraph: {
    title: "Community College Program Development: A Data-Driven Approach",
    description:
      "How to use market data to identify what programs to build, validate demand before you invest, and avoid costly misses.",
    url: "https://withwavelength.com/blog/community-college-program-development",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community College Program Development: A Data-Driven Approach",
    description:
      "A framework for data-driven community college program development — what to build, how to validate, and how to avoid costly misses.",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Community College Program Development: A Data-Driven Approach",
  description:
    "A framework for data-driven community college program development: market scanning, demand validation, and competitive analysis.",
  url: "https://withwavelength.com/blog/community-college-program-development",
  datePublished: "2026-02-01",
  dateModified: "2026-02-01",
  author: {
    "@type": "Organization",
    name: "Wavelength",
    url: "https://withwavelength.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Wavelength",
    url: "https://withwavelength.com",
  },
};

const tocItems = [
  { id: "the-problem", label: "The Problem with How Programs Get Built" },
  { id: "what-data-driven-means", label: "What Data-Driven Actually Means" },
  { id: "demand-signals", label: "Finding Real Demand Signals" },
  { id: "competitive-analysis", label: "Competitive Analysis" },
  { id: "financial-viability", label: "Financial Viability Before Launch" },
  { id: "validation", label: "Validation Before You Build" },
  { id: "common-mistakes", label: "Common Mistakes" },
];

function WaveDivider() {
  return (
    <div className="w-full overflow-hidden py-4" aria-hidden="true">
      <svg viewBox="0 0 1200 60" className="w-full h-8 opacity-[0.10]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="blog-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <path
          d="M0,30 C150,5 300,55 450,30 C600,5 750,55 900,30 C1050,5 1150,55 1200,30"
          fill="none"
          stroke="url(#blog-wave-2)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export default function ProgramDevelopmentPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero */}
      <section className="py-16 px-6 border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block bg-teal-400/10 text-teal-400 border border-teal-400/20 px-3 py-1 rounded-full text-xs font-semibold">
              Program Development
            </span>
            <span className="text-white/30 text-sm">7 min read</span>
          </div>
          <h1
            className="text-gradient-cosmic font-bold leading-tight mb-5"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            }}
          >
            Community College Program Development: A Data-Driven Approach
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-4">
            Building a new program at a community college is a multi-year, multi-hundred-thousand-dollar
            commitment. Curriculum development, instructor hiring, equipment purchasing, accreditation
            work — it all happens before a single student enrolls. And yet, at many institutions, the
            decision to build comes down to a hunch, a board member&apos;s suggestion, or an employer
            who made a compelling pitch at a lunch meeting.
          </p>
          <p className="text-white/70 leading-relaxed">
            This guide lays out a data-driven approach to program development — one that replaces
            intuition with evidence at every major decision point.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-12">
        {/* TOC Sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-24 card-cosmic rounded-xl p-5">
            <h2
              className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              In This Guide
            </h2>
            <nav className="space-y-2">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-white/50 hover:text-white/80 transition-colors leading-snug"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Article */}
        <article className="flex-1 min-w-0">
          {/* The Problem */}
          <section id="the-problem" className="mb-12">
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The Problem with How Programs Get Built
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Program development at most community colleges follows a familiar pattern: someone
              identifies a perceived need, champions the idea through shared governance, secures
              approval, and then builds. By the time enrollment data comes in, the institution is
              two or three years and significant dollars into something that may — or may not —
              actually have an audience.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              The failure mode isn&apos;t usually the program itself. It&apos;s the assumption
              that perceived need equals actual demand. These are very different things.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 my-6">
              {[
                {
                  label: "Perceived need",
                  desc: '"Employers keep telling us they need more welders." "There\'s a nursing shortage." "The tech industry is growing fast."',
                  color: "border-red-500/20 bg-red-500/5",
                  textColor: "text-red-300",
                },
                {
                  label: "Actual demand",
                  desc: "How many students in your specific region will enroll, at what price point, in a program at your institution specifically.",
                  color: "border-teal-500/20 bg-teal-500/5",
                  textColor: "text-teal-300",
                },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-5 border ${item.color}`}>
                  <p className={`font-bold text-sm mb-2 ${item.textColor}`}>{item.label}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-white/70 leading-relaxed">
              Data-driven program development doesn&apos;t eliminate judgment — it informs it.
              The goal is to replace unsupported intuition with evidence at the points where
              the stakes are highest.
            </p>
          </section>

          <WaveDivider />

          {/* What Data-Driven Means */}
          <section id="what-data-driven-means" className="mb-12">
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What &quot;Data-Driven&quot; Actually Means in Program Development
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              In practice, data-driven program development means answering these questions with
              evidence before committing to build:
            </p>
            <div className="space-y-3 my-4">
              {[
                {
                  q: "Is there real employer demand in our region for this occupation?",
                  note: "Not nationally, not anecdotally — specifically in your labor market.",
                },
                {
                  q: "Are there students in our catchment area who would enroll?",
                  note: "At your price point, in your format, at your institution.",
                },
                {
                  q: "What are our competitors already offering?",
                  note: "Other community colleges, four-year institutions, private training providers, and employer-run programs.",
                },
                {
                  q: "Does this program fit our institution's capacity and mission?",
                  note: "Can you deliver it at quality? Do you have the instructors, equipment, and infrastructure?",
                },
                {
                  q: "What does the financial picture look like?",
                  note: "Minimum viable cohort size, cost per student, revenue at various enrollment levels.",
                },
              ].map((item) => (
                <div key={item.q} className="card-cosmic rounded-xl p-5">
                  <p className="font-semibold text-white text-sm mb-1">{item.q}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-white/70 leading-relaxed">
              Answering these questions rigorously requires pulling from multiple sources and
              synthesizing them. That&apos;s what a proper market scan does — and it&apos;s the
              difference between building programs that fill cohorts and building programs that
              sit underenrolled for years.
            </p>
          </section>

          <WaveDivider />

          {/* Demand Signals */}
          <section id="demand-signals" className="mb-12">
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Finding Real Demand Signals
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Demand for workforce programs shows up in several places. The most useful signals:
            </p>
            <div className="space-y-4">
              {[
                {
                  signal: "Job posting volume and velocity",
                  detail:
                    "How many employers in your region are actively posting for this occupation, and how long do those postings stay open? High posting volume with long time-to-fill is a strong demand signal. Be specific: regional data matters far more than national averages.",
                  icon: "📊",
                },
                {
                  signal: "Employer partnership interest",
                  detail:
                    "Are employers asking your institution to build this, offering to co-fund development, or willing to commit to interviewing graduates? Expressed interest without commitment is worth noting but not betting on.",
                  icon: "🤝",
                },
                {
                  signal: "Wage trends for the occupation",
                  detail:
                    "Rising wages in a region signal employer competition for talent — which means real demand. Flat or declining wages may indicate the market is oversupplied or the occupation is being automated.",
                  icon: "📈",
                },
                {
                  signal: "Search and inquiry patterns",
                  detail:
                    "Are prospective students in your region searching for this type of training? Inquiry patterns from your own marketing channels, community searches, and referral sources can reveal latent demand.",
                  icon: "🔍",
                },
                {
                  signal: "Competitor enrollment data",
                  detail:
                    "What are similar programs at nearby institutions doing? Are they growing, stable, or declining? If programs in your region are filling cohorts and students are coming from your area, that&apos;s meaningful.",
                  icon: "🏫",
                },
              ].map((item) => (
                <div key={item.signal} className="card-cosmic rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <h3
                        className="font-bold text-white mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {item.signal}
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <WaveDivider />

          {/* Competitive Analysis */}
          <section id="competitive-analysis" className="mb-12">
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Competitive Analysis: Who Else Is in This Space?
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              A market with strong employer demand and no community college training programs is
              an opportunity. A market with strong employer demand and four well-established
              programs already serving it is a much more complicated conversation.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              Competitive analysis for program development should map:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 my-4">
              {[
                { item: "Other community colleges within your commute shed", icon: "🏛️" },
                { item: "Four-year institutions offering similar credentials", icon: "🎓" },
                { item: "Private training providers and bootcamps", icon: "💼" },
                { item: "Employer-run training programs and apprenticeships", icon: "🏭" },
                { item: "Online providers targeting your geographic audience", icon: "💻" },
                { item: "Union training programs in the same occupations", icon: "🔧" },
              ].map((item) => (
                <div
                  key={item.item}
                  className="card-cosmic rounded-xl p-4 flex items-start gap-3"
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <p className="text-white/70 text-sm leading-relaxed">{item.item}</p>
                </div>
              ))}
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              The goal isn&apos;t to find markets with zero competition — it&apos;s to identify
              where your institution has a genuine competitive advantage. That might be geography,
              employer relationships, pricing, format (accelerated, evening, hybrid), or a
              differentiated credential pathway.
            </p>
            <p className="text-white/70 leading-relaxed">
              Our{" "}
              <Link
                href="/discover"
                className="text-teal-400 underline hover:text-teal-300 transition-colors"
              >
                Market Scan
              </Link>{" "}
              includes a full competitive landscape analysis as part of the delivered report —
              mapping what&apos;s available in your region and identifying white-space opportunities
              your competitors aren&apos;t addressing.
            </p>
          </section>

          <WaveDivider />

          {/* Financial Viability */}
          <section id="financial-viability" className="mb-12">
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Financial Viability: The Math Before You Build
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Every new program has a minimum viable cohort — the enrollment level at which it
              breaks even or contributes positively to institutional finances. Running this
              calculation before you launch is non-negotiable.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              The inputs:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 my-4">
              {[
                { item: "Per-student tuition revenue (or Pell funding if eligible)", icon: "💰" },
                { item: "Per-cohort fixed costs: instructor, space, equipment depreciation", icon: "🏗️" },
                { item: "Variable costs: materials, certifications, student support", icon: "📦" },
                { item: "Overhead allocation for marketing, enrollment, advising", icon: "📣" },
              ].map((item) => (
                <div key={item.item} className="card-cosmic rounded-xl p-4 flex items-start gap-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <p className="text-white/70 text-sm leading-relaxed">{item.item}</p>
                </div>
              ))}
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              With these inputs, you can model the revenue and cost at various enrollment levels
              and determine your break-even threshold. If that threshold requires more students
              than your market analysis suggests you can realistically attract, you have a problem
              to solve before you build — not after.
            </p>
            <p className="text-white/70 leading-relaxed">
              Workforce Pell changes this math significantly for qualifying programs.
              A program priced at $3,000 that becomes Pell-eligible can shift from a challenging
              enrollment challenge to a strong financial performer — because cost is no longer the
              barrier it was for prospective students.
            </p>
          </section>

          <WaveDivider />

          {/* Validation */}
          <section id="validation" className="mb-12">
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Validation Before You Build
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Market analysis tells you what the opportunity looks like on paper. Validation
              tells you whether your institution can actually capture it. These are two different
              questions.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              Before committing to full program development, run some form of validation:
            </p>
            <div className="space-y-3">
              {[
                {
                  type: "Employer letters of support or pre-commitment",
                  detail:
                    "Not just verbal interest — written commitments to interview graduates, offer co-op placements, or contribute to program development. This is the strongest signal you can get.",
                },
                {
                  type: "Prospective student interest surveys",
                  detail:
                    "Ask people in your market if they&apos;d enroll, at what price, in what format. Willingness to pay is very different from expressed interest — push for it.",
                },
                {
                  type: "Pilot cohort or micro-credential test",
                  detail:
                    "Can you run a smaller version of the program as a non-credit offering to test demand and refine the curriculum before full-scale investment?",
                },
                {
                  type: "Third-party market validation",
                  detail:
                    "An independent market scan from Wavelength or another source gives you an outside perspective that&apos;s not filtered by institutional enthusiasm. Sometimes the most valuable thing is having someone tell you what the data actually shows.",
                },
              ].map((item) => (
                <div key={item.type} className="card-cosmic rounded-xl p-5">
                  <h3
                    className="font-semibold text-white mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.type}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <WaveDivider />

          {/* Common Mistakes */}
          <section id="common-mistakes" className="mb-8">
            <h2
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Common Mistakes in Community College Program Development
            </h2>
            <div className="space-y-4">
              {[
                {
                  mistake: "Confusing national trends with regional demand",
                  detail:
                    "A growing national occupation doesn&apos;t mean there&apos;s unmet demand in your specific labor market. Always localize your analysis to your realistic service area.",
                },
                {
                  mistake: "Over-relying on single-employer interest",
                  detail:
                    "One employer asking for a program is a data point, not a market. If that employer&apos;s needs change — or the company shrinks — your program loses its anchor. Build programs for labor market conditions, not single employer requests.",
                },
                {
                  mistake: "Underestimating time to enrollment momentum",
                  detail:
                    "New programs typically take 2–3 cohorts before word-of-mouth and outcomes data build enrollment naturally. Financial models need to account for the ramp period, not just steady-state enrollment.",
                },
                {
                  mistake: "Skipping competitive analysis",
                  detail:
                    "If a competitor is already serving this market well, the question isn&apos;t whether the market exists — it&apos;s whether you can take market share. That&apos;s a harder problem and requires a different strategy.",
                },
                {
                  mistake: "Not planning for Pell eligibility from the start",
                  detail:
                    "New programs entering the 150–599 clock-hour range should be designed with Pell eligibility in mind from day one — meeting the credential, duration, and outcomes criteria from the start, not retrofitted later.",
                },
              ].map((item) => (
                <div
                  key={item.mistake}
                  className="rounded-xl p-5 bg-red-500/5 border border-red-500/20"
                >
                  <p className="text-red-300 font-semibold mb-2">❌ {item.mistake}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>

      {/* CTA */}
      <section className="relative py-16 px-6 text-center border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Build programs the market will fill
          </h2>
          <p className="text-white/50 mb-6 leading-relaxed">
            Our Market Scan delivers 25+ pages of scored opportunities, employer demand signals,
            competitive gaps, and financial modeling for your specific region and program area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/discover" className="btn-cosmic btn-cosmic-primary px-6 py-3">
              Market Scan — $1,500
            </Link>
            <Link href="/validate" className="btn-cosmic btn-cosmic-ghost px-6 py-3">
              Validate a Program
            </Link>
          </div>
          <p className="mt-4 text-white/30 text-sm">
            Also:{" "}
            <Link
              href="/blog/workforce-pell-grant-eligibility"
              className="text-teal-400/70 hover:text-teal-400 transition-colors underline"
            >
              Workforce Pell Grant Eligibility Guide →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
