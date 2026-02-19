import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Is Rewriting Job Requirements Faster Than Colleges Can Update Curriculum",
  description:
    "Burning Glass Institute research shows AI is causing employers to rapidly redesign roles. For community colleges, this means curriculum that was aligned last year may already be drifting — and most institutions won't know until placement rates drop.",
  alternates: {
    canonical:
      "https://withwavelength.com/blog/ai-changing-job-requirements-curriculum-alignment",
  },
  openGraph: {
    title:
      "AI Is Rewriting Job Requirements Faster Than Colleges Can Update Curriculum",
    description:
      "Burning Glass Institute research shows AI is causing employers to rapidly redesign roles. For community colleges, curriculum drift is an existential risk.",
    url: "https://withwavelength.com/blog/ai-changing-job-requirements-curriculum-alignment",
    type: "article",
    publishedTime: "2026-02-19T00:00:00Z",
    authors: ["Wavelength"],
    section: "Curriculum Strategy",
    images: [
      {
        url: "https://withwavelength.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "AI Is Rewriting Job Requirements Faster Than Colleges Can Update Curriculum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Is Rewriting Job Requirements Faster Than Colleges Can Update Curriculum",
    description:
      "Burning Glass Institute research shows AI is causing employers to rapidly redesign roles. For community colleges, curriculum drift is an existential risk.",
    images: ["https://withwavelength.com/og-default.png"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "AI Is Rewriting Job Requirements Faster Than Colleges Can Update Curriculum",
  description:
    "Burning Glass Institute research documents how AI is reshaping occupational skill requirements faster than traditional curriculum review cycles can keep pace. Community colleges risk curriculum drift without a systematic monitoring approach.",
  url: "https://withwavelength.com/blog/ai-changing-job-requirements-curriculum-alignment",
  datePublished: "2026-02-19",
  dateModified: "2026-02-19",
  author: { "@type": "Organization", name: "Wavelength", url: "https://withwavelength.com" },
  publisher: {
    "@type": "Organization",
    name: "Wavelength",
    url: "https://withwavelength.com",
    logo: { "@type": "ImageObject", url: "https://withwavelength.com/og-default.png" },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://withwavelength.com/blog/ai-changing-job-requirements-curriculum-alignment",
  },
  image: "https://withwavelength.com/og-default.png",
  keywords: [
    "AI curriculum alignment",
    "job requirements AI",
    "curriculum drift",
    "Burning Glass Institute",
    "Workforce Pell placement rate",
    "community college curriculum review",
    "drift score",
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://withwavelength.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://withwavelength.com/blog" },
    { "@type": "ListItem", position: 3, name: "AI Changing Job Requirements & Curriculum Alignment", item: "https://withwavelength.com/blog/ai-changing-job-requirements-curriculum-alignment" },
  ],
};

export default function AiCurriculumAlignmentPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Cosmic accent bar */}
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 mb-10" />

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-mono text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full">
              Curriculum Strategy
            </span>
            <span className="text-theme-muted text-sm">February 19, 2026</span>
            <span className="text-theme-muted text-sm">·</span>
            <span className="text-theme-muted text-sm">6 min read</span>
          </div>
          <h1
            className="font-bold leading-tight mb-5 text-theme-primary"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            }}
          >
            AI Is Rewriting Job Requirements.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Is Your Curriculum Keeping Up?
            </span>
          </h1>
          <p className="text-theme-tertiary text-xl leading-relaxed">
            New research from the Burning Glass Institute documents what workforce educators
            have been sensing: AI isn&apos;t just creating new jobs — it&apos;s fundamentally reshaping
            what existing jobs require. Skills that were core to an occupation two years ago
            are being displaced. New technical and adaptive competencies are becoming
            essential. And the pace of change is faster than any traditional curriculum
            review cycle is designed to handle.
          </p>
        </header>

        {/* Stat callout grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-amber-500/20 rounded-xl p-5 text-center">
            <div
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              3–5 yrs
            </div>
            <div className="text-theme-tertiary text-sm leading-snug">
              average curriculum review cycle at community colleges
            </div>
          </div>
          <div className="bg-white/5 border border-amber-500/20 rounded-xl p-5 text-center">
            <div
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              12–18 mo
            </div>
            <div className="text-theme-tertiary text-sm leading-snug">
              for employer skill requirements to shift in tech-adjacent fields
            </div>
          </div>
          <div className="bg-white/5 border border-amber-500/20 rounded-xl p-5 text-center">
            <div
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              70%
            </div>
            <div className="text-theme-tertiary text-sm leading-snug">
              job placement requirement for Workforce Pell eligibility (within 180 days)
            </div>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-12">
          <h2
            className="font-bold text-theme-primary mb-4"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
            }}
          >
            How AI Is Changing Occupational Skill Requirements
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The Burning Glass Institute&apos;s research on AI and occupational skill demand reveals
            a structural disruption in the way employers define jobs. Traditional job
            taxonomy — the idea that a &ldquo;Pharmacy Technician&rdquo; or &ldquo;HVAC Technician&rdquo; job
            has a stable and predictable skill profile — has become a live infrastructure
            problem. Employers are no longer posting to fill the same role they filled
            three years ago. They&apos;re posting for a redesigned role with a meaningfully
            different skill profile, often without changing the job title.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The shift moves in two directions simultaneously. In the first direction, AI is
            handling routine tasks — data entry, basic pattern recognition, standardized
            documentation — so those skills are dropping out of job postings. An employer
            who used to screen for manual records management experience no longer needs it;
            the AI handles it. In the second direction, employers are now adding requirements
            that didn&apos;t exist in previous job postings: AI tool proficiency, human-AI
            collaboration, data interpretation, and the ability to validate and correct
            AI-generated outputs.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The occupational examples are concrete. Pharmacy technician postings now
            increasingly cite automation system operation and robotic dispensing familiarity
            as requirements — skills that weren&apos;t in 2021 job postings for the same role.
            Cybersecurity technician roles are shifting toward AI-assisted threat detection
            workflows. Medical coding postings are adding AI-assisted documentation
            competencies. HVAC postings in commercial buildings are incorporating smart
            building systems and IoT integration requirements. These aren&apos;t edge cases — they&apos;re
            becoming the mainstream.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-12">
          <h2
            className="font-bold text-theme-primary mb-4"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
            }}
          >
            The Curriculum Lag Problem
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Community college curriculum review runs on a 3-to-5-year cycle in most
            institutions — committee-driven, documentation-heavy, and built for a world
            where occupational skill requirements changed slowly. That cycle made sense
            when it was designed. It no longer maps to how fast employer requirements move.
            In technology-adjacent fields, meaningful skill shifts are happening in 12 to 18
            months. The gap between those two timelines is where curriculum drift lives.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The practical result: a program that was well-aligned to employer demand when
            it launched can drift 15–20 skill points in 18 months without anyone catching
            it. The courses haven&apos;t changed. The competencies listed in the catalog are still
            accurate — they&apos;re just no longer what employers are hiring for. And the
            institution typically doesn&apos;t discover the misalignment through any systematic
            process. They discover it when:
          </p>
          <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
            <li>Employer partners start mentioning that graduates seem underprepared for the current version of the role</li>
            <li>Job placement rates begin declining — slowly at first, then faster</li>
            <li>An accreditor or state agency asks for employer feedback data and the numbers don&apos;t support the program&apos;s stated outcomes</li>
          </ul>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <p className="text-theme-secondary leading-relaxed">
              <strong className="text-amber-400">The Workforce Pell stakes:</strong> The
              Workforce Pell Grant expansion requires participating programs to demonstrate
              70% job placement within 180 days of completion. For programs experiencing
              curriculum drift, that threshold isn&apos;t just a compliance requirement — it&apos;s
              an existential risk. A program can lose Pell eligibility if placement rates
              fall below the threshold, which means losing the primary funding mechanism
              for your most price-sensitive students at exactly the moment when enrollment
              demand is highest.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-12">
          <h2
            className="font-bold text-theme-primary mb-4"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
            }}
          >
            What a &ldquo;Drift Score&rdquo; Actually Reveals
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            A Drift Score measures the gap between what your curriculum currently teaches
            and what employers are actively hiring for in your target occupation — expressed
            as a 0–100 scale where lower scores indicate greater misalignment. The
            measurement isn&apos;t based on a single employer&apos;s opinion or a survey; it&apos;s a
            systematic comparison of your program&apos;s learning objectives and competency
            statements against a live corpus of 30+ current job postings for the target role
            in your labor market. When skill requirements diverge — when employers are asking
            for things your curriculum doesn&apos;t cover — the gap shows up quantifiably.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            A concrete example: a community college Pharmacy Technician program recently
            scored 60/100 — Moderate Drift. The top gaps identified weren&apos;t in core pharmacy
            knowledge, which the program covered well. They were in patient interaction
            skills (now expected even in automated dispensing environments), pharmacy
            automation systems (robotic dispensers and automated verification), and
            collaborative healthcare teamwork (interdisciplinary coordination that employers
            now explicitly require). None of these were core requirements in the job postings
            when the program was last reviewed three years ago. They are now — and a score
            of 60 means roughly 40% of what employers are looking for isn&apos;t being covered.
          </p>
        </section>

        {/* End CTA */}
        <div className="bg-gradient-to-r from-violet-900/40 to-teal-900/40 border border-white/10 rounded-2xl p-8 mt-12 text-center">
          <h2
            className="text-xl font-bold text-theme-primary mb-3"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Know before your students do.
          </h2>
          <p className="text-theme-tertiary mb-6 max-w-xl mx-auto">
            Wavelength Curriculum Drift Analysis analyzes live job postings for your programs&apos; target
            occupations every quarter — and tells you exactly which skills employers want
            that your curriculum isn&apos;t covering. Run a free baseline scan for one program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://withwavelength.com/drift"
              className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-theme-primary px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Run a Free Drift Scan →
            </Link>
            <Link
              href="https://withwavelength.com/drift"
              className="inline-block border border-white/20 text-theme-primary hover:border-white/40 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Learn how the Drift Score works
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
