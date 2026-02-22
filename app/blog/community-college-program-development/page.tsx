import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data-Driven Program Development for Community Colleges: A Practical Framework",
  description:
    "How to use labor market data, regional demand signals, and competitive analysis to build community college programs that enroll well, complete well, and place students into jobs.",
  alternates: {
    canonical: "https://withwavelength.com/blog/community-college-program-development",
  },
  openGraph: {
    title: "Data-Driven Program Development for Community Colleges: A Practical Framework",
    description:
      "A rigorous framework for building community college programs grounded in regional demand, not intuition. Covers market scanning, validation, competitive analysis, and launch criteria.",
    url: "https://withwavelength.com/blog/community-college-program-development",
    type: "article",
    publishedTime: "2026-02-17T00:00:00Z",
    authors: ["Wavelength"],
    section: "Program Strategy",
    images: [
      {
        url: "https://withwavelength.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "Data-Driven Program Development for Community Colleges: A Practical Framework",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Data-Driven Community College Program Development",
    description:
      "Stop building programs on intuition. This framework uses labor market signals to build programs that enroll, complete, and place.",
    images: ["https://withwavelength.com/og-default.png"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Data-Driven Program Development for Community Colleges: A Practical Framework",
  description:
    "How to use labor market data and regional demand signals to build community college programs that enroll well, complete well, and place students into jobs.",
  url: "https://withwavelength.com/blog/community-college-program-development",
  datePublished: "2026-02-17",
  dateModified: "2026-02-17",
  author: { "@type": "Organization", name: "Wavelength", url: "https://withwavelength.com" },
  publisher: {
    "@type": "Organization",
    name: "Wavelength",
    url: "https://withwavelength.com",
    logo: { "@type": "ImageObject", url: "https://withwavelength.com/og-default.png" },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://withwavelength.com/blog/community-college-program-development",
  },
  image: "https://withwavelength.com/og-default.png",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://withwavelength.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://withwavelength.com/blog" },
    { "@type": "ListItem", position: 3, name: "Community College Program Development", item: "https://withwavelength.com/blog/community-college-program-development" },
  ],
};

export default function ProgramDevelopmentPage() {
  return (
    <div className="overflow-x-hidden bg-theme-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 pt-36 lg:pt-40 pb-16">
        {/* Cosmic accent bar */}
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 mb-10" />

        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity mb-6"
        >
          ← Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-tertiary"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              Program Strategy
            </span>
            <span className="text-theme-muted text-sm">February 17, 2026</span>
            <span className="text-theme-muted text-sm">· 8 min read</span>
          </div>
          <h1
            className="font-bold leading-tight mb-5 text-theme-primary"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            Data-Driven Program Development for Community Colleges:{" "}
            <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              A Practical Framework
            </span>
          </h1>
          <p className="text-theme-tertiary text-xl leading-relaxed">
            Most new community college programs are built on employer conversations, regional
            intuition, and the programs that peer institutions happen to be running. Some of those
            programs succeed. Many don't — and the difference usually comes down to whether the
            underlying demand was real or assumed. A rigorous, data-grounded approach changes
            the odds.
          </p>
        </header>

        {/* Table of Contents */}
        <nav
          className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-12"
          aria-label="Table of Contents"
        >
          <h2 className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-4">
            Table of Contents
          </h2>
          <ol className="space-y-2 text-theme-tertiary text-sm">
            <li>
              <a href="#problem" className="hover:text-blue-400 transition-colors">
                1. Why Intuition-Based Program Development Fails
              </a>
            </li>
            <li>
              <a href="#market-scanning" className="hover:text-blue-400 transition-colors">
                2. Stage One: Regional Market Scanning
              </a>
            </li>
            <li>
              <a href="#demand-signals" className="hover:text-blue-400 transition-colors">
                3. Reading Demand Signals Correctly
              </a>
            </li>
            <li>
              <a href="#competitive-analysis" className="hover:text-blue-400 transition-colors">
                4. Competitive Analysis: What Peer Institutions Reveal
              </a>
            </li>
            <li>
              <a href="#validation" className="hover:text-blue-400 transition-colors">
                5. Validation Before You Build
              </a>
            </li>
            <li>
              <a href="#launch-criteria" className="hover:text-blue-400 transition-colors">
                6. Launch Criteria: When to Move Forward
              </a>
            </li>
            <li>
              <a href="#portfolio-management" className="hover:text-blue-400 transition-colors">
                7. Managing the Program Portfolio Over Time
              </a>
            </li>
            <li>
              <a href="#tools" className="hover:text-blue-400 transition-colors">
                8. Tools and Resources
              </a>
            </li>
          </ol>
        </nav>

        {/* Section 1 */}
        <section id="problem" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-theme-primary">
            Why Intuition-Based Program Development Fails
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            The community college program development process has several structural weaknesses
            that make intuition-based decisions dangerous. Understanding these patterns is the
            first step toward building something better.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">The Employer Survey Problem</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Employer surveys consistently over-represent demand. When an HR director says "we
            could hire 30 people with these credentials," they're describing an aspirational
            scenario — not a confirmed hiring plan. Employers don't lose anything by expressing
            interest. They lose something only when they actually have to fill a position.
            Advisory board enthusiasm is meaningful context, not evidence.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">The Peer Institution Lag</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Watching what programs peer institutions are launching and replicating them sounds
            rational. In practice, it produces a two- to three-year lag. By the time you've
            identified that a peer is growing a program, gone through curriculum approval, and
            launched enrollment, the market window your peer was responding to may already be
            shifting. You're competing on their momentum, not yours.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">The Completion Assumption</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Programs built around the assumption that enrolled students will complete at high
            rates often don't account for the specific barriers that affect their target population.
            Labor market demand can be real and the program can still underperform if the
            structure — scheduling, support, prerequisite load, format — doesn't match what
            students actually need.
          </p>
        </section>

        {/* Section 2 */}
        <section id="market-scanning" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-theme-primary">
            Stage One: Regional Market Scanning
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Market scanning is the process of mapping what the regional labor market is asking
            for — before any program idea is on the table. Done well, it surfaces opportunities
            you wouldn't have found through advisory board conversations alone.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">What to Look For</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Effective market scanning focuses on several overlapping data streams:
          </p>
          <ul className="space-y-3 text-theme-tertiary mb-6">
            <li className="flex gap-3">
              <span className="text-teal-400 mt-1 flex-shrink-0">→</span>
              <span>
                <strong className="text-theme-primary">Job posting volume and velocity:</strong> How many
                positions with specific credential requirements are being posted in your region,
                and is that volume growing, stable, or declining? Job postings are a leading
                indicator of employer demand — more current than occupation projections.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 mt-1 flex-shrink-0">→</span>
              <span>
                <strong className="text-theme-primary">Median wages for target occupations:</strong> Does
                the wage for completers justify program costs and, if applicable, Workforce Pell
                gainful employment thresholds? High-demand occupations with suppressed wages are
                a structural trap.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 mt-1 flex-shrink-0">→</span>
              <span>
                <strong className="text-theme-primary">Credential specificity in job postings:</strong>
                Are employers asking for a general degree, a specific certification, or on-the-job
                training? Programs that align to specific employer credential requirements have
                clearer placement pathways.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 mt-1 flex-shrink-0">→</span>
              <span>
                <strong className="text-theme-primary">Employer concentration:</strong> Is demand spread
                across dozens of employers or concentrated in two or three? Concentrated demand
                means higher placement efficiency but also higher dependency risk.
              </span>
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">Defining Your Labor Market Region</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Your labor market region is not your county. It's the geographic area within which
            your typical completer will plausibly seek employment — usually defined by commute
            patterns, major employment centers, and regional industry clusters. For most community
            colleges, this is somewhere between 30 and 90 miles depending on population density
            and transportation infrastructure.
          </p>
          <p className="text-theme-tertiary leading-relaxed">
            Getting this wrong in either direction distorts your analysis. Too narrow, and you
            undercount demand. Too broad, and you include employers your graduates can't
            realistically reach. For{" "}
            <Link href="/pell" className="text-purple-400 underline hover:no-underline">
              Workforce Pell eligibility purposes
            </Link>
            , your LMA documentation needs to reflect your actual regional footprint —
            not a national or statewide average.
          </p>
        </section>

        {/* Section 3 */}
        <section id="demand-signals" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-theme-primary">
            Reading Demand Signals Correctly
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Not all demand signals point in the same direction, and learning to read them in
            combination is a core skill for anyone doing serious program development work.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: "Strong signals",
                items: [
                  "Rising job posting volume over 12+ months",
                  "Multiple distinct employers posting the same credential requirements",
                  "Wages above regional median for similar education levels",
                  "Industry expansion news (facility openings, headquarters relocations)",
                  "Specific credential requests in postings (not just degree-or-equivalent)",
                ],
                color: "border-teal-500/20 bg-teal-900/10",
                labelColor: "text-teal-400",
              },
              {
                title: "Weak or misleading signals",
                items: [
                  "Advisory board enthusiasm without hiring data",
                  "One large employer's expressed interest",
                  "National trend articles without regional data",
                  "Peer institutions expanding similar programs",
                  "Rising enrollment interest without job market validation",
                ],
                color: "border-amber-500/20 bg-amber-900/10",
                labelColor: "text-amber-400",
              },
            ].map((block) => (
              <div key={block.title} className={`border ${block.color} rounded-xl p-5`}>
                <p className={`font-semibold text-sm mb-3 ${block.labelColor}`}>{block.title}</p>
                <ul className="space-y-1 text-theme-tertiary text-sm">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className={`${block.labelColor} flex-shrink-0`}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-theme-tertiary leading-relaxed">
            The most reliable picture comes from combining job posting data with wage data and
            talking to actual hiring managers (not HR generalists) at the specific companies
            doing the most relevant hiring in your region. That combination — quantitative signal
            plus targeted qualitative verification — is harder to assemble than either alone, but
            it's far more defensible.
          </p>
        </section>

        {/* Section 4 */}
        <section id="competitive-analysis" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-theme-primary">
            Competitive Analysis: What Peer Institutions Reveal
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Understanding what programs are available within your labor market region — not just
            at your institution — is essential context for program development decisions. A market
            with genuine demand but no program supply is an opportunity. A market with demand and
            three competing programs with strong completion rates is a different calculation.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">What to Map</h3>
          <ul className="space-y-3 text-theme-tertiary mb-6">
            <li className="flex gap-3">
              <span className="text-blue-400 mt-1 flex-shrink-0">→</span>
              <span>
                <strong className="text-theme-primary">Program availability:</strong> Which institutions in
                your region offer programs in the target occupational area, at what credential
                level, and in what format (in-person, hybrid, online)?
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 mt-1 flex-shrink-0">→</span>
              <span>
                <strong className="text-theme-primary">Enrollment and completion patterns:</strong> Where
                available, completion rates at peer institutions in the same or adjacent programs
                tell you whether there's unmet demand or whether the market is being served
                adequately.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 mt-1 flex-shrink-0">→</span>
              <span>
                <strong className="text-theme-primary">Format and schedule gaps:</strong> A peer offering
                only day-time in-person instruction may not be serving working adult learners.
                Evening, weekend, and hybrid formats can create a real differentiation opportunity
                even in a "competitive" market.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 mt-1 flex-shrink-0">→</span>
              <span>
                <strong className="text-theme-primary">Cost and access gaps:</strong> Programs at
                four-year institutions or private training providers that carry significantly
                higher costs represent a genuine community college opportunity — particularly
                for short-term programs that qualify for Workforce Pell.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="validation" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-theme-primary">
            Validation Before You Build
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Market scanning tells you whether an opportunity exists. Validation tells you whether
            your institution can capture it. These are different questions, and collapsing them
            into one creates programs that should have been built differently or not at all.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">Demand Validation</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Demand validation means confirming, through direct employer contact, that your
            specific program concept — at the credential level and length you're considering —
            would lead to actual hiring decisions. This is different from employer enthusiasm.
            The right validation question isn't "would you hire our graduates?" It's "if we
            launched this program and produced 20 completers per year, how many could you
            realistically hire at the wage listed in your job postings, within 90 days of
            completion?"
          </p>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Our{" "}
            <Link href="/validate" className="text-teal-400 underline hover:no-underline">
              Feasibility Study tool
            </Link>{" "}
            structures this process — mapping your program concept against regional job postings
            and returning an evidence-based demand score before you commit to curriculum
            development.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">Student Pipeline Validation</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Employer demand is necessary but not sufficient. You also need to confirm that your
            institution can actually reach and enroll the students who would benefit from this
            program. Questions to answer before building:
          </p>
          <ul className="space-y-2 text-theme-tertiary mb-4">
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              Does your current student population include people who would enroll in this program?
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              What is the program format and schedule required to reach working adults in this
              field, and can you deliver it?
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              What barriers to completion exist for this student population, and how does the
              program design address them?
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              What channels exist to reach prospective students who aren't already in your
              enrollment pipeline?
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="launch-criteria" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-theme-primary">
            Launch Criteria: When to Move Forward
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            One of the most useful things a program development framework can do is establish
            clear criteria for when to launch — and when not to. Without pre-defined criteria,
            programs get approved on momentum, relationship dynamics, or the fact that someone
            already spent time developing the curriculum.
          </p>
          <p className="text-theme-tertiary leading-relaxed mb-6">
            A workable launch threshold requires all of the following:
          </p>
          <div className="space-y-3">
            {[
              {
                criterion: "Regional job posting volume is at least 2x projected annual completers",
                note: "If you plan to produce 25 completers per year, there should be at least 50 relevant job postings in your region annually. This leaves room for variation and competing graduates.",
              },
              {
                criterion: "Median wage supports debt-to-earnings (or program is low-cost enough to be safe)",
                note: "For Workforce Pell-eligible programs, this is a compliance requirement. For all programs, it's an ethical one. Students shouldn't take on debt for programs that don't pay off.",
              },
              {
                criterion: "At least three distinct employers have confirmed specific hiring interest",
                note: "Not advisory board members. Not general employer contacts. Specific hiring managers at specific companies who have described actual positions they would fill from this program.",
              },
              {
                criterion: "Program format and schedule match identified student population",
                note: "If your target students are working adults with family obligations, a daytime-only schedule is not a viable launch format, regardless of employer demand.",
              },
              {
                criterion: "Pathway to at least one longer-term credential is documented",
                note: "For Workforce Pell stackability — and for student outcomes generally — every short-term program should have a documented onramp to something longer if the student wants it.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="border border-theme-subtle rounded-xl p-5 bg-theme-surface"
              >
                <p className="text-theme-primary font-semibold mb-2 flex items-start gap-2">
                  <span className="text-teal-400 mt-0.5 flex-shrink-0">✓</span>
                  {item.criterion}
                </p>
                <p className="text-theme-tertiary text-sm leading-relaxed pl-6">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7 */}
        <section id="portfolio-management" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-theme-primary">
            Managing the Program Portfolio Over Time
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Program development doesn't end at launch. A portfolio managed well over time
            requires periodic re-validation — labor markets shift, employer demand evolves, and
            programs that were strong candidates three years ago may be at risk today.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">Annual Program Review</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Each year, run every program in your short-term portfolio through a simplified version
            of the same framework you used to build it. Key questions:
          </p>
          <ul className="space-y-2 text-theme-tertiary mb-6">
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              Is regional job posting volume for this program's target occupations stable or declining?
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              Are completion rates tracking at or above your launch projections?
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              What percentage of completers are placing into jobs in the target occupation within
              six months?
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              Have employer credential requirements shifted — new certifications, higher degree
              expectations, or reduced hiring?
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">→</span>
              Has the competitive landscape changed (new programs at peer institutions)?
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-theme-secondary">Sunsetting Programs</h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Sunsetting is the part of portfolio management that most institutions avoid too long.
            Discontinued programs create operational complexity, consume faculty and administrative
            attention, and dilute the brand signal you're trying to build with employers. The
            right time to close a program is before it fails enrollment minimums, not after.
          </p>
          <p className="text-theme-tertiary leading-relaxed">
            Establish a clear, pre-announced threshold: programs that fail to meet minimum
            enrollment for two consecutive terms are under review. Programs under review that
            don't have a documented remediation plan within one term are sunset. This removes
            the emotional and political friction from what should be an operational decision.
          </p>
        </section>

        {/* Section 8 */}
        <section id="tools" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-theme-primary">
            Tools and Resources
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            The framework described in this guide requires data that doesn't come from a single
            source. Assembling a complete picture typically involves job posting databases,
            regional wage surveys, IPEDS completions data, and direct employer outreach. That
            work is time-consuming when done manually.
          </p>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Wavelength's tools are designed to accelerate the most data-intensive parts of this
            process:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              {
                name: "Program Discovery",
                href: "/discover",
                desc: "Maps regional job posting data and wage information to program opportunities — surfacing occupational clusters where demand is high and current program supply is thin.",
                color: "border-teal-500/20 bg-teal-900/10",
                labelColor: "text-teal-400",
              },
              {
                name: "Feasibility Study",
                href: "/validate",
                desc: "Takes a specific program concept and returns an evidence-based demand score with supporting regional data — so you can validate before you invest in curriculum development.",
                color: "border-blue-500/20 bg-blue-900/10",
                labelColor: "text-blue-400",
              },
              {
                name: "Pell Readiness Check",
                href: "/pell",
                desc: "Reviews your program inventory against Workforce Pell eligibility criteria and returns a prioritized view of which programs are ready, close, or need significant work.",
                color: "border-purple-500/20 bg-purple-900/10",
                labelColor: "text-purple-400",
              },
              {
                name: "State-Mandated Program Gap Analysis",
                href: "/compliance-gap",
                desc: "A detailed written analysis of your institution's Workforce Pell compliance exposure, with specific remediation recommendations for each identified gap.",
                color: "border-indigo-500/20 bg-indigo-900/10",
                labelColor: "text-indigo-400",
              },
            ].map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className={`border ${tool.color} rounded-xl p-5 hover:opacity-90 transition-opacity block`}
              >
                <p className={`font-semibold mb-2 ${tool.labelColor}`}>{tool.name}</p>
                <p className="text-theme-tertiary text-sm leading-relaxed">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Posts */}
        <section className="mb-12 border-t border-theme-subtle pt-10">
          <h2 className="text-xl font-bold mb-6 text-theme-primary">Continue Reading</h2>
          <div className="grid md:grid-cols-1 gap-4">
            <Link
              href="/blog/workforce-pell-grant-eligibility"
              className="border border-theme-subtle rounded-xl p-5 hover:border-purple-500/30 transition-colors group bg-theme-surface"
            >
              <p className="text-xs text-purple-400 font-mono mb-2">Pell Readiness</p>
              <h3 className="font-bold text-theme-secondary group-hover:text-theme-primary transition-colors">
                Workforce Pell Grant Eligibility: What Community Colleges Need to Know Before July 2026
              </h3>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-900/30 via-teal-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3 text-theme-primary">
            Start with Your Regional Market Scan
          </h2>
          <p className="text-theme-tertiary mb-6 max-w-xl mx-auto">
            You've read the framework. Now apply it to your institution's specific region —
            with job posting data, wage information, and competitive analysis built in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/discover"
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-theme-primary px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Discover Programs in Your Region
            </Link>
            <Link
              href="/validate"
              className="border border-white/20 text-theme-primary hover:border-white/40 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Validate a Program Concept
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
