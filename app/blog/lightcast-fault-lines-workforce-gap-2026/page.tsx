import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lightcast's 'Fault Lines' Report: What It Means for Community College Program Strategy",
  description:
    "Lightcast's 2026 Fault Lines report warns that labor scarcity is structural, not cyclical. 66% of jobs require degrees, 31% of workers have them. Here's what community college leaders should do next.",
  alternates: {
    canonical:
      "https://withwavelength.com/blog/lightcast-fault-lines-workforce-gap-2026",
  },
  openGraph: {
    title:
      "Lightcast's 'Fault Lines' Report: What It Means for Community College Program Strategy",
    description:
      "Lightcast's 2026 Fault Lines report warns that labor scarcity is structural, not cyclical. 66% of jobs require degrees, 31% of workers have them.",
    url: "https://withwavelength.com/blog/lightcast-fault-lines-workforce-gap-2026",
    type: "article",
    publishedTime: "2026-02-19T00:00:00Z",
    authors: ["Wavelength"],
    section: "Labor Market Intelligence",
    images: [
      {
        url: "https://withwavelength.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "Lightcast's 'Fault Lines' Report: What It Means for Community College Program Strategy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lightcast's 'Fault Lines' Report: What It Means for Community College Program Strategy",
    description:
      "Lightcast's 2026 Fault Lines report warns that labor scarcity is structural, not cyclical. 66% of jobs require degrees, 31% of workers have them.",
    images: ["https://withwavelength.com/og-default.png"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "Lightcast's 'Fault Lines' Report: What It Means for Community College Program Strategy",
  description:
    "Lightcast's 2026 Fault Lines report warns that labor scarcity is structural, not cyclical. 66% of jobs require post-secondary credentials, but only 31% of workers have them.",
  url: "https://withwavelength.com/blog/lightcast-fault-lines-workforce-gap-2026",
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
    "@id": "https://withwavelength.com/blog/lightcast-fault-lines-workforce-gap-2026",
  },
  image: "https://withwavelength.com/og-default.png",
  keywords: [
    "Lightcast Fault Lines",
    "labor shortage",
    "structural scarcity",
    "community college programs",
    "workforce credential gap",
    "program strategy 2026",
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://withwavelength.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://withwavelength.com/blog" },
    { "@type": "ListItem", position: 3, name: "Lightcast Fault Lines Report 2026", item: "https://withwavelength.com/blog/lightcast-fault-lines-workforce-gap-2026" },
  ],
};

export default function LightcastFaultLinesPage() {
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

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-tertiary"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              Labor Market Intelligence
            </span>
            <span className="text-theme-muted text-sm">February 19, 2026</span>
            <span className="text-theme-muted text-sm">·</span>
            <span className="text-theme-muted text-sm">7 min read</span>
          </div>
          <h1
            className="font-bold leading-tight mb-5 text-theme-primary"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            }}
          >
            Lightcast Just Called It: The Labor Shortage Is Permanent.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-violet-400">
              Here&apos;s What That Means for Your Programs.
            </span>
          </h1>
          <p className="text-theme-tertiary text-xl leading-relaxed">
            Lightcast dropped their 2026 &ldquo;Fault Lines&rdquo; report this week with a blunt
            assessment: labor scarcity is structural, not cyclical. The headline stat — 66%
            of job postings require post-secondary credentials, but only 31% of workers have
            them — isn&apos;t a gap that recovers with the economy. It&apos;s demographic,
            technological, and permanent. And for community colleges, that&apos;s not a warning.
            It&apos;s a mandate.
          </p>
        </header>

        {/* Stat callout grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5 text-center">
            <div
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              66%
            </div>
            <div className="text-theme-tertiary text-sm leading-snug">
              of job postings require post-secondary credentials
            </div>
          </div>
          <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5 text-center">
            <div
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              31%
            </div>
            <div className="text-theme-tertiary text-sm leading-snug">
              of the current workforce holds those credentials
            </div>
          </div>
          <div className="bg-white/5 border border-teal-500/20 rounded-xl p-5 text-center">
            <div
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              35 pts
            </div>
            <div className="text-theme-tertiary text-sm leading-snug">
              the credential gap Lightcast is calling structural
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
            What &ldquo;Structural Scarcity&rdquo; Actually Means
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Lightcast&apos;s core argument in the Fault Lines report is that the labor shortage
            most institutions have been treating as a post-pandemic hangover is, in fact, a
            permanent feature of the American economy. The convergence driving it: demographic
            decline (fewer workers entering the labor force than leaving it), AI-driven role
            redesign (employers are restructuring jobs faster than workers can retrain for
            them), and credential inflation (employers have steadily raised the bar on what
            qualifications they expect, often outpacing what the workforce can supply).
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The &ldquo;credential gap&rdquo; — that 35-point spread between what employers require and
            what workers hold — didn&apos;t happen overnight. Over the past two decades, employer
            job postings increasingly specified post-secondary credentials even for roles that
            previously didn&apos;t require them. Entry-level manufacturing positions now frequently
            list certificate requirements. Healthcare support roles that once hired on experience
            now require formal credentials. Employers upgraded their requirements faster than
            the workforce could respond, and the gap calcified.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Regionally, the picture is even more acute. Iowa is specifically called out in
            Lightcast&apos;s regional breakdowns as a rising advanced manufacturing market where
            skilled trade demand is accelerating. The state&apos;s mix of food processing, precision
            manufacturing, agricultural equipment, and logistics infrastructure is creating
            persistent demand for credentialed workers in CNC machining, industrial maintenance,
            welding, and supply chain management — fields where community colleges are
            uniquely positioned to fill the gap quickly.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <h2
            className="font-bold text-theme-primary mb-4"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
            }}
          >
            The Three Types of Programs That Win in a Scarcity Environment
          </h2>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h3
              className="font-bold text-theme-primary mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              1. Programs That Train for Roles With Acute Shortages
            </h3>
            <p className="text-theme-secondary leading-relaxed">
              The most durable programs in a structural scarcity environment are the ones
              that flow directly into fields where employers are desperate — healthcare,
              advanced manufacturing, and logistics top the list nationally, with regional
              variation. These programs don&apos;t just have demand; they have urgency. Employers
              will hire from 8–16 week programs, offer signing bonuses, and build ongoing
              pipelines with colleges that deliver reliably. The key: the program must
              actually lead to a credential that employers in your region recognize and
              prioritize.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h3
              className="font-bold text-theme-primary mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              2. Programs That Lead to Credentials Employers Can&apos;t Easily Automate
            </h3>
            <p className="text-theme-secondary leading-relaxed">
              Lightcast&apos;s analysis distinguishes between roles being automated and roles
              being augmented. Automation displaces; augmentation changes the skill mix but
              keeps humans in the loop. The programs that hold value long-term are those
              training for the latter — skilled trades with physical dexterity requirements,
              healthcare roles with patient interaction, cybersecurity roles that require
              human judgment under uncertainty. If a credential leads to work that requires
              presence, tactile skill, or complex human judgment, it has staying power.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h3
              className="font-bold text-theme-primary mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              3. Programs With Strong Employer Partnerships and Guaranteed Placement Pathways
            </h3>
            <p className="text-theme-secondary leading-relaxed">
              In a scarcity environment, the colleges that win employer relationships are
              the ones that function as reliable talent pipelines, not just education
              providers. Programs with formal employer co-design, guaranteed interview
              pathways, and tracked placement outcomes create a feedback loop that drives
              both enrollment (students come for job outcomes) and employer investment
              (employers fund and support programs that deliver). This is the sustainable
              model — and the one the Workforce Pell expansion is designed to reward.
            </p>
          </div>
        </section>

        {/* Mid-article CTA */}
        <div className="bg-gradient-to-r from-violet-900/40 to-teal-900/40 border border-white/10 rounded-2xl p-8 mt-2 mb-12 text-center">
          <h2
            className="text-xl font-bold text-theme-primary mb-3"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Find the programs your region is missing
          </h2>
          <p className="text-theme-tertiary mb-6 max-w-xl mx-auto">
            Wavelength&apos;s Market Scan delivers 7–10 vetted program opportunities for your
            region — scored, ranked, and backed by 50+ live data sources.
          </p>
          <Link
            href="https://withwavelength.com/discover"
            className="inline-block bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 text-theme-primary px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Order a Market Scan →
          </Link>
        </div>

        {/* Section 3 */}
        <section className="mb-12">
          <h2
            className="font-bold text-theme-primary mb-4"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
            }}
          >
            The Flip Side: Programs That Drift Into Irrelevance
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The Lightcast data contains an uncomfortable corollary to its scarcity thesis:
            in a market where employer skill requirements are shifting rapidly, a
            &ldquo;well-performing&rdquo; program can quietly become a mismatch without anyone noticing
            until the damage shows up in placement rates. When employers redesign roles
            faster than colleges update curriculum, graduates arrive credentialed for a
            version of the job that no longer exists. The credential is real. The job is
            real. But the alignment is gone — and employers know it before the college does.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Lightcast&apos;s occupational skill-shift analysis shows that requirements for stable
            occupations — jobs that aren&apos;t being eliminated, just changed — are shifting
            quarterly in some technology-adjacent sectors. An HVAC program built around
            traditional refrigerant systems may not cover smart building integration. A
            medical coding program that launched three years ago may not address AI-assisted
            documentation workflows that are now standard in employer job postings. The
            program exists. The enrollment is there. But without a systematic way to compare
            curriculum against live employer demand, drift is invisible until it&apos;s already a
            problem.
          </p>
        </section>

        {/* End CTA */}
        <div className="bg-gradient-to-r from-violet-900/40 to-teal-900/40 border border-white/10 rounded-2xl p-8 mt-12 text-center">
          <h2
            className="text-xl font-bold text-theme-primary mb-3"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Already have programs? Make sure they&apos;re keeping up.
          </h2>
          <p className="text-theme-tertiary mb-6 max-w-xl mx-auto">
            When labor markets shift this fast, curriculum falls behind before anyone
            notices. Wavelength Curriculum Drift Analysis runs quarterly scans of your existing
            programs against live employer demand — and tells you exactly where the gaps
            are.
          </p>
          <Link
            href="https://withwavelength.com/drift"
            className="inline-block bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 text-theme-primary px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Learn About Curriculum Drift Analysis →
          </Link>
        </div>
      </article>
    </div>
  );
}
