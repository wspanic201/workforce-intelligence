import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { BlogCTA } from '@/components/BlogCTA';

export const metadata: Metadata = {
  title: "Workforce Pell Grant Eligibility: What Community Colleges Need to Know in 2026",
  description:
    "The Workforce Pell Grant expansion unlocks federal aid for short-term credentials. Here's what qualifies, the July 2026 deadline, and how to get your institution ready before the window closes.",
  alternates: {
    canonical:
      "https://withwavelength.com/blog/workforce-pell-grant-eligibility",
  },
  openGraph: {
    title:
      "Workforce Pell Grant Eligibility: What Community Colleges Need to Know in 2026",
    description:
      "Workforce Pell Grant eligibility, July 2026 deadline, and how community colleges should prepare.",
    url: "https://withwavelength.com/blog/workforce-pell-grant-eligibility",
    type: "article",
    publishedTime: "2026-01-10T00:00:00Z",
    authors: ["Wavelength"],
    section: "Policy & Compliance",
    images: [
      {
        url: "https://withwavelength.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "Workforce Pell Grant Eligibility: What Community Colleges Need to Know in 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Workforce Pell Grant Eligibility: What Community Colleges Need to Know in 2026",
    description:
      "Workforce Pell Grant eligibility, July 2026 deadline, and how community colleges should prepare.",
    images: ["https://withwavelength.com/og-default.png"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Workforce Pell Grant Eligibility: What Community Colleges Need to Know in 2026",
  description:
    "Guide to Workforce Pell Grant eligibility, July 2026 deadline, and community college preparation steps.",
  url: "https://withwavelength.com/blog/workforce-pell-grant-eligibility",
  datePublished: "2026-01-10",
  dateModified: "2026-01-10",
  author: { "@type": "Organization", name: "Wavelength", url: "https://withwavelength.com" },
  publisher: {
    "@type": "Organization",
    name: "Wavelength",
    url: "https://withwavelength.com",
    logo: { "@type": "ImageObject", url: "https://withwavelength.com/og-default.png" },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://withwavelength.com/blog/workforce-pell-grant-eligibility",
  },
  image: "https://withwavelength.com/og-default.png",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://withwavelength.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://withwavelength.com/blog" },
    { "@type": "ListItem", position: 3, name: "Workforce Pell Grant Eligibility", item: "https://withwavelength.com/blog/workforce-pell-grant-eligibility" },
  ],
};

export default function WorkforcePellEligibilityPage() {
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
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-tertiary"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              Policy &amp; Compliance
            </span>
            <span className="text-theme-muted text-sm">January 10, 2026</span>
            <span className="text-theme-muted text-sm">·</span>
            <span className="text-theme-muted text-sm">8 min read</span>
          </div>
          <h1
            className="font-bold leading-tight mb-5 text-theme-primary"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            }}
          >
            Workforce Pell Grant Eligibility:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-400">
              What Community Colleges Need to Know in 2026
            </span>
          </h1>
          <p className="text-theme-tertiary text-xl leading-relaxed">
            The FAFSA Simplification Act's Workforce Pell provisions represent the largest
            expansion of Pell Grant eligibility in decades. For community colleges, the
            July 2026 implementation deadline isn't a distant policy date — it's a live
            operational challenge that requires action now.
          </p>
        </header>

        {/* TOC */}
        <nav
          className="bg-theme-surface border border-theme-subtle rounded-2xl p-6 mb-12"
          aria-label="Table of Contents"
        >
          <h2
            className="text-xs font-mono text-violet-400 uppercase tracking-wider mb-4"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Table of Contents
          </h2>
          <ol className="space-y-2 text-theme-tertiary text-sm">
            {[
              ["#what-is-workforce-pell", "1. What Is the Workforce Pell Grant?"],
              ["#who-qualifies", "2. Which Programs Qualify — and Which Don't"],
              ["#july-2026", "3. The July 2026 Deadline: What It Actually Means"],
              ["#requirements", "4. Federal Requirements Your Programs Must Meet"],
              ["#gaps", "5. Common State-Mandated Program Gaps We See at Community Colleges"],
              ["#action-steps", "6. Action Steps Before the Deadline"],
              ["#how-wavelength-helps", "7. How to Check Your Readiness Now"],
            ].map(([href, label]) => (
              <li key={String(href)}>
                <a href={String(href)} className="hover:text-violet-400 transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Section 1 */}
        <section id="what-is-workforce-pell" className="mb-12">
          <h2
            className="text-2xl font-bold mb-4 text-theme-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            What Is the Workforce Pell Grant?
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            The Workforce Pell Grant — formalized through the FAFSA Simplification Act —
            extends Pell Grant eligibility to short-term workforce training programs for the
            first time in the program's history. Previously, students in programs lasting
            fewer than two semesters (600 clock hours or equivalent) were categorically
            ineligible for Pell funding.
          </p>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            The expansion targets a specific category: short-term programs between 8 and 15
            weeks (150–600 clock hours) that lead to recognized industry credentials in
            high-demand fields. For community colleges, this is a substantial shift in how
            workforce education can be funded.
          </p>
          <div className="bg-theme-surface border-l-4 border-violet-500 p-5 rounded-r-xl mb-4">
            <p className="text-theme-secondary font-medium">
              What this means practically: Students in eligible short-term programs can
              now receive up to $2,500 in Pell funding per year — making workforce
              certificates financially accessible in a way they never were before.
            </p>
          </div>
          <p className="text-theme-tertiary leading-relaxed">
            This changes the enrollment calculus significantly. Programs that previously
            required full out-of-pocket payment (or relied entirely on employer sponsorship)
            can now recruit from a much broader pool of students who qualify for federal aid.
          </p>
        </section>

        {/* Section 2 */}
        <section id="who-qualifies" className="mb-12">
          <h2
            className="text-2xl font-bold mb-4 text-theme-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Which Programs Qualify — and Which Don't
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-6">
            Eligibility isn't automatic. Programs must meet a specific set of federal
            criteria to qualify. Here's the framework:
          </p>

          <div className="space-y-4 mb-8">
            <h3
              className="text-lg font-bold text-theme-primary"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Programs That Qualify
            </h3>
            {[
              {
                criterion: "Duration: 8–15 weeks (150–600 clock hours)",
                detail:
                  "Programs must fall within this window. Shorter programs don't qualify; programs over 600 hours likely already qualify under standard Pell rules.",
              },
              {
                criterion: "Leads to a recognized postsecondary credential",
                detail:
                  "The credential must be recognized by employers and/or a licensing body. Certificates of completion without industry recognition do not count.",
              },
              {
                criterion: "Aligned to high-demand, high-wage occupations",
                detail:
                  "The field must meet state or regional wage and demand thresholds. Your state workforce agency typically maintains the qualifying occupation list.",
              },
              {
                criterion: "Institution maintains accreditation through a recognized body",
                detail:
                  "Standard Title IV eligibility requirements still apply. Regional accreditation isn't required for the Workforce Pell specifically, but ACCJC, HLC, and similar bodies qualify.",
              },
            ].map((item) => (
              <div
                key={item.criterion}
                className="border border-theme-subtle rounded-xl p-5 bg-theme-surface"
              >
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-theme-primary font-semibold mb-1">{item.criterion}</p>
                    <p className="text-theme-tertiary text-sm">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3
              className="text-lg font-bold text-theme-primary"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Common Programs That Don't Qualify
            </h3>
            {[
              "Programs under 150 clock hours (8 weeks)",
              "Avocational or personal enrichment programs (cooking classes, arts, etc.)",
              "Programs not leading to an industry-recognized credential",
              "Programs in occupations not meeting your state's wage/demand threshold",
              "Programs where the institution hasn't filed the appropriate Title IV eligibility documentation",
            ].map((item) => (
              <div key={item} className="flex gap-3 text-theme-tertiary text-sm">
                <XCircle className="h-4 w-4 text-red-400/70 mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section id="july-2026" className="mb-12">
          <h2
            className="text-2xl font-bold mb-4 text-theme-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            The July 2026 Deadline: What It Actually Means
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            July 1, 2026 is the date the Department of Education has set for full
            implementation of Workforce Pell Grant provisions. For institutions, this
            creates a concrete operational timeline:
          </p>
          <div className="space-y-4">
            {[
              {
                date: "Now – March 2026",
                action: "Program audit and gap identification",
                detail:
                  "Review existing short-term programs for eligibility. Identify which are close to qualifying and what changes would be needed. Document credential outcomes and employer connections.",
                color: "border-teal-500/50",
              },
              {
                date: "March – May 2026",
                action: "Credential alignment and documentation",
                detail:
                  "For near-miss programs, work with your accreditor and state workforce agency to formalize credential recognition. Update catalog descriptions and student disclosures.",
                color: "border-blue-500/50",
              },
              {
                date: "May – June 2026",
                action: "Financial aid office readiness",
                detail:
                  "Your financial aid office needs to be ready to process Workforce Pell awards, handle SAP (satisfactory academic progress) for short-term programs, and manage disbursement timing.",
                color: "border-violet-500/50",
              },
              {
                date: "July 1, 2026",
                action: "Go-live: Workforce Pell disbursement eligible",
                detail:
                  "Students in qualifying programs can begin receiving Workforce Pell funding. Institutions need to be operationally ready before this date, not after.",
                color: "border-violet-400/50",
              },
            ].map((step) => (
              <div
                key={step.date}
                className={`border-l-2 ${step.color} pl-5`}
              >
                <p className="text-xs font-mono text-theme-muted mb-1">{step.date}</p>
                <p
                  className="text-theme-primary font-semibold mb-1"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {step.action}
                </p>
                <p className="text-theme-tertiary text-sm">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 */}
        <section id="requirements" className="mb-12">
          <h2
            className="text-2xl font-bold mb-4 text-theme-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Federal Requirements Your Programs Must Meet
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-6">
            Beyond duration and credential recognition, Workforce Pell eligibility requires
            compliance with several additional federal requirements that many institutions
            haven't had to navigate for short-term programs before:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                req: "Gainful Employment disclosure",
                detail:
                  "Programs must disclose debt-to-earnings ratios and job placement rates in a standardized format. GE rules apply to all short-term programs.",
              },
              {
                req: "Satisfactory Academic Progress (SAP) policy",
                detail:
                  "Your institution must have a SAP policy that applies to short-term programs — with appropriate timeframes and measurement intervals.",
              },
              {
                req: "Title IV Program Participation Agreement coverage",
                detail:
                  "Short-term programs must be explicitly covered under your institution's existing PPA, or you must amend it. This requires coordination with your Title IV servicer.",
              },
              {
                req: "Employer engagement documentation",
                detail:
                  "Federal guidance expects institutions to demonstrate employer demand for the credential — through advisory board minutes, employer letters, or hiring data.",
              },
              {
                req: "Clock-hour or credit-hour determination",
                detail:
                  "Short-term programs need a formal determination of whether they're measured in clock hours or credit hours, which affects disbursement timing and SAP measurement.",
              },
              {
                req: "State authorization",
                detail:
                  "Your state's higher education agency may have separate requirements for approving short-term programs as Workforce Pell eligible. Many states have not yet published their criteria.",
              },
            ].map((item) => (
              <div
                key={item.req}
                className="border border-theme-subtle rounded-xl p-5 bg-theme-surface"
              >
                <h3
                  className="text-theme-primary font-semibold mb-2 text-sm"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {item.req}
                </h3>
                <p className="text-theme-tertiary text-xs leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 */}
        <section id="gaps" className="mb-12">
          <h2
            className="text-2xl font-bold mb-4 text-theme-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Common State-Mandated Program Gaps We See at Community Colleges
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-6">
            Based on our institutional assessments, these are the most frequently
            encountered gaps between where community colleges currently stand and where
            they need to be for Workforce Pell:
          </p>
          <div className="space-y-4">
            {[
              {
                gap: "Credential recognition isn't formally documented",
                detail:
                  "Instructors and program directors know their certificate is respected by employers. But without formal documentation — an employer letter, a licensing board reference, or an industry association endorsement on file — it doesn't qualify.",
              },
              {
                gap: "SAP policy doesn't address short-term program timelines",
                detail:
                  "Most community college SAP policies were written for semester-based programs. Applying them to an 8-week certificate creates measurement problems that financial aid offices haven't had to solve before.",
              },
              {
                gap: "GE disclosures haven't been generated for short-term programs",
                detail:
                  "Gainful Employment disclosures require placement and earnings data that many workforce programs haven't been collecting systematically.",
              },
              {
                gap: "State occupational demand lists haven't been checked",
                detail:
                  "Many colleges assume their programs qualify because they're in healthcare or skilled trades generally. But your state's high-demand occupation list has specific occupations — and some sub-specialties don't make the cut.",
              },
            ].map((item) => (
              <div
                key={item.gap}
                className="border border-amber-500/20 rounded-xl p-5 bg-amber-500/[0.02]"
              >
                <p className="text-amber-400 font-semibold mb-2 inline-flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> {item.gap}</p>
                <p className="text-theme-tertiary text-sm leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6 */}
        <section id="action-steps" className="mb-12">
          <h2
            className="text-2xl font-bold mb-4 text-theme-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Action Steps Before the Deadline
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-6">
            With the July 2026 deadline approaching, here's a practical checklist for
            institutional leadership:
          </p>
          <div className="space-y-3">
            {[
              "Inventory all short-term programs (under 600 clock hours) currently offered",
              "Identify which programs already have industry-recognized credentials — and document that recognition formally",
              "Review state high-demand occupation list for your service area and cross-reference against your program catalog",
              "Pull your institution's Title IV PPA and verify short-term program coverage with your servicer",
              "Audit your existing SAP policy for applicability to short-term programs",
              "Engage your financial aid office early — Workforce Pell creates new disbursement timing complexity",
              "Collect or request Gainful Employment data for any programs you intend to make eligible",
              "Establish an employer advisory record system if you don't have one",
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-theme-primary shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-theme-tertiary">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7 */}
        <section id="how-wavelength-helps" className="mb-12">
          <h2
            className="text-2xl font-bold mb-4 text-theme-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            How to Check Your Readiness Now
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Mapping your institution's current programs against all of the requirements above
            is a significant project. Wavelength's{" "}
            <Link
              href="/pell"
              className="text-violet-400 underline hover:no-underline"
            >
              free Pell Readiness Check
            </Link>{" "}
            gives you a program-by-program assessment of your eligibility posture in about
            three minutes — identifying which programs are likely ready, which need work,
            and which have structural barriers that may prevent eligibility.
          </p>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            For institutions that want a deeper compliance review, our{" "}
            <Link
              href="/compliance-gap"
              className="text-violet-400 underline hover:no-underline"
            >
              State-Mandated Program Gap Analysis ($300)
            </Link>{" "}
            provides a line-by-line assessment against federal requirements, with specific
            remediation guidance for each gap identified.
          </p>
          <p className="text-theme-tertiary leading-relaxed">
            The July 2026 deadline is closer than it looks. Institutions that move early will
            have time to remediate gaps. Those that wait may find themselves operationally
            unprepared on day one.
          </p>
        </section>

        {/* Related Posts */}
        <section className="mb-12 border-t border-theme-subtle pt-10">
          <h2
            className="text-xl font-bold mb-6 text-theme-primary"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Continue Reading
          </h2>
          <Link
            href="/blog/community-college-program-development"
            className="block border border-theme-subtle rounded-xl p-5 hover:border-white/20 transition-all group"
          >
            <p className="text-xs text-blue-400 font-mono mb-2">Program Development</p>
            <h3
              className="font-bold text-theme-primary group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-teal-400 transition-all"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Community College Program Development: A Data-Driven Approach
            </h3>
          </Link>
        </section>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(59,130,246,0.10) 50%, rgba(20,184,166,0.10) 100%)",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.4) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <h2
              className="text-2xl font-bold mb-3 text-theme-primary"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Check Your Pell Readiness — Free
            </h2>
            <p className="text-theme-tertiary mb-6 max-w-xl mx-auto">
              A 3-minute assessment that tells you exactly where your institution stands
              against Workforce Pell requirements — before the July 2026 deadline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pell"
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-theme-primary px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Start Free Pell Check
              </Link>
              <Link
                href="/compliance-gap"
                className="border border-white/20 text-theme-primary hover:border-white/40 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Get State-Mandated Program Gap Analysis — $300
              </Link>
            </div>
          </div>
        </div>
        <BlogCTA category="Workforce Pell" />
      </article>
    </div>
  );
}
