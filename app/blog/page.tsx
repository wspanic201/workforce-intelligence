import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Workforce Intelligence Blog | Wavelength",
  description:
    "Practical guides on Workforce Pell eligibility, community college program strategy, compliance gaps, and labor market data. For higher education leaders who move fast.",
  alternates: { canonical: "https://withwavelength.com/blog" },
  openGraph: {
    title: "Workforce Intelligence Blog | Wavelength",
    description:
      "Guides on Workforce Pell, compliance, and program development for community college leaders.",
    url: "https://withwavelength.com/blog",
    type: "website",
  },
};

const posts = [
  {
    slug: "lightcast-fault-lines-workforce-gap-2026",
    title: "Lightcast Just Called It: The Labor Shortage Is Permanent. Here's What That Means for Your Programs.",
    excerpt:
      "Lightcast's 2026 'Fault Lines' report documents a structural credential gap — 66% of job postings require credentials, but only 31% of workers have them. For community colleges, this is less a warning and more a mandate. Here's how to position your programs to win in a scarcity environment.",
    date: "February 19, 2026",
    readTime: "7 min read",
    category: "Labor Market Intelligence",
    accent: "from-teal-500/20 to-green-500/10",
    border: "border-teal-500/30",
    dot: "bg-teal-400",
  },
  {
    slug: "ai-changing-job-requirements-curriculum-alignment",
    title: "AI Is Rewriting Job Requirements Faster Than Colleges Can Update Curriculum",
    excerpt:
      "Burning Glass Institute research shows AI is causing employers to rapidly redesign roles — displacing old skills and adding new ones at a pace that traditional 3–5 year curriculum review cycles can't match. Most institutions won't discover the misalignment until placement rates start dropping.",
    date: "February 19, 2026",
    readTime: "6 min read",
    category: "Curriculum Strategy",
    accent: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  {
    slug: "community-college-workforce-program-strategy-2026",
    title: "Building the Right Programs in 2026: A Data-Driven Guide for Community College Leaders",
    excerpt:
      "2.1M unfilled manufacturing jobs by 2030. 3.5M cybersecurity vacancies globally. Workforce Pell launching July 1, 2026. The market conditions are unusually clear — but acting on them requires more than instinct. Here's the decision framework for getting it right.",
    date: "February 19, 2026",
    readTime: "9 min read",
    category: "Program Strategy",
    accent: "from-blue-500/20 to-indigo-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  {
    slug: "workforce-pell-grant-eligibility",
    title: "Workforce Pell Grant Eligibility: What Community Colleges Need to Know Before July 2026",
    excerpt:
      "The Workforce Pell expansion opens Pell Grant funding to short-term programs for the first time in decades. But the July 2026 deadline is firm — and the eligibility requirements are narrower than most institutions expect. Here's what you need to audit now.",
    date: "February 10, 2026",
    readTime: "8 min read",
    category: "Pell Readiness",
    accent: "from-purple-500/20 to-blue-500/10",
    border: "border-purple-500/30",
    dot: "bg-violet-400",
  },
  {
    slug: "community-college-program-development",
    title: "Data-Driven Program Development for Community Colleges: A Practical Framework",
    excerpt:
      "Too many new programs are built on intuition and employer anecdotes. A rigorous, data-grounded approach to program development reduces launch risk, improves enrollment outcomes, and aligns your offerings to what regional labor markets actually need.",
    date: "February 17, 2026",
    readTime: "8 min read",
    category: "Program Strategy",
    accent: "from-blue-500/20 to-teal-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
];

export default function BlogIndexPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 px-4 border-b border-theme-subtle relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-teal-900/20 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <span className="text-xs font-mono tracking-widest uppercase bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            The Wavelength Blog
          </span>
          <h1 className="mt-3 font-bold leading-tight text-theme-primary" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Intelligence for{" "}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Higher Ed Leaders
            </span>
          </h1>
          <p className="mt-4 text-theme-tertiary text-lg max-w-2xl">
            Practical guides on Workforce Pell, compliance strategy, and program development.
            No fluff — just frameworks that hold up under scrutiny.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className={`group border ${post.border} rounded-xl p-8 hover:bg-white/[0.03] transition-colors bg-gradient-to-br ${post.accent}`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-tertiary">
                  <span className={`w-1.5 h-1.5 rounded-full ${post.dot} shrink-0`} />
                  {post.category}
                </span>
                <span className="text-theme-muted text-sm">{post.date}</span>
                <span className="text-theme-muted text-sm">·</span>
                <span className="text-theme-muted text-sm">{post.readTime}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-theme-primary transition-colors text-theme-primary">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-theme-tertiary leading-relaxed mb-5">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-teal-300 transition-all"
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-theme-subtle">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-theme-primary">
            Ready to Check Your Pell Readiness?
          </h2>
          <p className="text-theme-tertiary mb-8">
            The July 2026 deadline doesn't move. Get a free Pell Readiness Check and know
            exactly where your programs stand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pell"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-theme-primary px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Free Pell Readiness Check
            </Link>
            <Link
              href="/discover"
              className="border border-theme-strong text-theme-primary hover:border-theme-strong px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Discover Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
