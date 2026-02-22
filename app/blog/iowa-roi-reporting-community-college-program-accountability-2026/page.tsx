import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Iowa's New ROI Reporting Requirements: What CE Directors Need to Know | Wavelength`,
  description: `Iowa legislation would require unit-level wage data sharing and ROI reporting for community college programs. Here's what continuing education directors should prepare for — and how to turn compliance into competitive advantage.`,
  alternates: {
    canonical: 'https://withwavelength.com/blog/iowa-roi-reporting-community-college-program-accountability-2026',
  },
  openGraph: {
    title: `Iowa's New ROI Reporting Requirements: What CE Directors Need to Know`,
    description: `Iowa legislation would require unit-level wage data sharing and ROI reporting for community college programs. What CE directors should prepare for.`,
    url: 'https://withwavelength.com/blog/iowa-roi-reporting-community-college-program-accountability-2026',
    type: 'article',
    publishedTime: '2026-02-22T00:00:00Z',
    authors: ['Wavelength'],
    tags: ['Iowa', 'ROI Reporting', 'Program Accountability', 'Community College', 'Workforce Data'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Iowa's New ROI Reporting Requirements: What CE Directors Need to Know`,
    description: `Iowa legislation would require unit-level wage data and ROI reporting for community college programs. Here's how to prepare.`,
  },
}

export default function IowaROIReportingPost() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `Iowa's New ROI Reporting Requirements: What CE Directors Need to Know`,
        description: `Iowa legislation would require unit-level wage data sharing and ROI reporting for community college programs.`,
        datePublished: '2026-02-22T00:00:00Z',
        dateModified: '2026-02-22T00:00:00Z',
        author: { '@type': 'Organization', name: 'Wavelength', url: 'https://withwavelength.com' },
        publisher: { '@type': 'Organization', name: 'Wavelength', url: 'https://withwavelength.com' },
        image: 'https://withwavelength.com/og-image.png',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://withwavelength.com/blog/iowa-roi-reporting-community-college-program-accountability-2026',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Blog', item: 'https://withwavelength.com/blog' },
          { '@type': 'ListItem', position: 2, name: `Iowa's New ROI Reporting Requirements`, item: 'https://withwavelength.com/blog/iowa-roi-reporting-community-college-program-accountability-2026' },
        ],
      },
    ],
  }

  return (
    <div className="overflow-x-hidden bg-theme-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 pt-36 lg:pt-40 pb-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity mb-6">
          ← Back to Blog
        </Link>

        <div className="h-1 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 mb-10" />

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-violet-400 border border-violet-400/30 px-3 py-1 rounded-full">State Policy</span>
            <span className="text-theme-muted text-sm">February 22, 2026 · 7 min read</span>
          </div>
          <h1 className="font-bold leading-tight mb-5 text-theme-primary" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.8rem, 3.5vw, 2.8rem)"}}>
            Iowa&apos;s New ROI Reporting Requirements: What CE Directors Need to Know
          </h1>
          <p className="text-theme-tertiary text-xl leading-relaxed">
            Legislation moving through the Iowa statehouse would fundamentally change how community colleges report program outcomes. Unit-level wage data, ROI metrics by program, retention and completion rates — the era of &ldquo;trust us, it&apos;s working&rdquo; is ending. Here&apos;s what that means for continuing education leaders, and why it might be the best thing that ever happened to your programs.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            What the Bill Requires
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            <a href="https://iowacapitaldispatch.com/2026/02/18/bill-requires-accommodation-for-unvaccinated-students-in-clinical-rotations/" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">Legislation advancing in the Iowa statehouse</a> includes provisions that would require Iowa Workforce Development (IWD) to share unit-level wage data with the Iowa Department of Education for evaluating program outcomes — at both the secondary and postsecondary level.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The bill goes further. The Iowa College Student Aid Commission would be responsible for a new reporting system covering return on investment data from community colleges and public universities, including:
          </p>
          <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
            <li><strong className="text-theme-primary">Costs of attendance</strong> — what students actually pay per program</li>
            <li><strong className="text-theme-primary">Retention and completion rates</strong> — how many finish what they start</li>
            <li><strong className="text-theme-primary">Time to completion</strong> — how long programs actually take</li>
            <li><strong className="text-theme-primary">Post-completion outcomes</strong> — employment rates and wage data tied to specific programs</li>
          </ul>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The Future Ready Iowa Last-Dollar Scholarship report would also be incorporated into the commission&apos;s annual reporting — creating a single, comprehensive view of how well Iowa&apos;s workforce education pipeline is actually working.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-1">15</div>
            <div className="text-theme-muted text-sm">Iowa community colleges affected</div>
          </div>
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-1">4</div>
            <div className="text-theme-muted text-sm">New reporting metrics required</div>
          </div>
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-1">Unit-Level</div>
            <div className="text-theme-muted text-sm">Wage data granularity</div>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            Why This Matters More Than Previous Accountability Pushes
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Community colleges have faced accountability requirements before. What makes this different is the specificity. Unit-level wage data means outcomes will be traceable to individual programs — not rolled up into institutional averages that let underperforming programs hide behind strong ones.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Consider what happens when you can see that graduates of your welding program earn a median of $52,000 within two years, but graduates of your office administration certificate earn $28,000 — below the living wage in most Iowa counties. That level of transparency creates uncomfortable but necessary conversations about program portfolio decisions.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            It also creates powerful ammunition for your best programs. When a dean can walk into a board meeting with wage data showing that a $3,000 program generates $45,000+ starting salaries, the case for investment practically makes itself.
          </p>
        </section>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <p className="text-theme-tertiary leading-relaxed">
            <strong className="text-theme-primary">The broader Iowa context:</strong> This legislation is moving alongside a bill that would <a href="https://www.3newsnow.com/southwest-iowa/iowa-western-could-soon-offer-4-year-degrees-as-legislature-advances-community-college-bill" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">allow Iowa Western Community College to offer 4-year degrees</a> in high-demand fields like nursing and business management. The statehouse is simultaneously expanding what community colleges can do and tightening how they prove it works. More authority, more accountability.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            The CE Director&apos;s Challenge
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Here&apos;s the thing most continuing education leaders already know: the credit side of the house has been tracking these metrics for years through IPEDS and state reporting systems. The noncredit side? Not so much.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            If you&apos;re running a CE division at one of Iowa&apos;s 15 community colleges, this bill likely means you need to:
          </p>
          <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
            <li><strong className="text-theme-primary">Connect enrollment systems to outcome tracking.</strong> If students complete a noncredit program and you can&apos;t follow up on employment outcomes, you&apos;re invisible in the new reporting framework.</li>
            <li><strong className="text-theme-primary">Establish SSN-linked wage matching.</strong> Unit-level wage data from IWD means matching your completers to UI wage records. That requires proper data sharing agreements and student consent processes.</li>
            <li><strong className="text-theme-primary">Define &ldquo;completion&rdquo; for noncredit programs.</strong> What counts as completing a 40-hour safety cert? Attendance? Assessment? Credential earned? The definitions matter when they&apos;re going into state reports.</li>
            <li><strong className="text-theme-primary">Justify program costs against outcomes.</strong> ROI reporting means your $800 forklift certification needs to show a measurable wage premium. If it doesn&apos;t, the data will say so — publicly.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            Turning Compliance Into Competitive Advantage
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The instinct is to treat ROI reporting as a burden. But the CE directors who thrive in this environment will be the ones who flip the script: use outcomes data as a strategic tool, not just a compliance obligation.
          </p>

          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            Use It for Enrollment Marketing
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            &ldquo;Graduates of our industrial maintenance program earn a median of $54,000 within 18 months&rdquo; is the most powerful marketing message you can put on a program page. When you have verified wage data, you don&apos;t need testimonials — you have proof. Students making $35,000 decisions about their career want to see numbers, not promises.
          </p>

          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            Use It for Portfolio Decisions
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Every CE division has programs that run because they&apos;ve always run. Outcomes data gives you the evidence to sunset underperforming programs and invest in ones that actually move the needle for students. It&apos;s not personal — it&apos;s data. And it makes hard conversations much easier.
          </p>

          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            Use It for Employer Partnerships
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            When you can show an employer that completers of your program have an 85% employment rate in-field at an average wage of $22/hour, you&apos;re not pitching — you&apos;re negotiating. Outcomes data transforms the employer conversation from &ldquo;please hire our students&rdquo; to &ldquo;here&apos;s what our pipeline delivers.&rdquo;
          </p>

          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            Use It for Funding
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            With <a href="https://workforce.iowa.gov" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">Iowa Workforce Development</a> pushing laborshed studies and the Future Ready Iowa initiative continuing to expand, the colleges that can demonstrate ROI will be first in line for state investment. Grant applications with verified wage outcomes beat grant applications with anecdotal evidence every single time.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            This Is National, Not Just Iowa
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Iowa isn&apos;t alone. The push for program-level accountability is a national trend accelerated by Workforce Pell requirements, federal flexibility signals from the Department of Education, and a bipartisan consensus that workforce education needs to prove its value.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Pennsylvania&apos;s governor proposed <a href="https://www.citizensvoice.com/2026/02/16/community-colleges-alarmed-over-flat-funding-in-governors-budget-proposal/" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">new funding for vocational and CTE programs</a> alongside apprenticeship expansions and workforce development partnerships — with an implicit expectation of outcomes data to justify the investment. Bucks County Community College just celebrated <a href="https://www.buckscountyherald.com/community/education/bucks-county-community-college-celebrates-center-for-workforce-development-graduation-milestone/article_4ef28415-489e-47f3-b466-15cded61023b.html" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">600 graduates from its pre-apprenticeship programs</a> — the kind of milestone that only happens when you&apos;re tracking completions rigorously.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Whether your state has passed similar legislation or not, building the outcomes tracking infrastructure now positions your institution ahead of inevitable requirements.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            The Bottom Line
          </h2>
          <p className="text-theme-secondary leading-relaxed mb-6">
            Iowa&apos;s ROI reporting push is part of a larger story: the workforce education sector is being held to the same standard as every other industry — show your work, prove your value, and let the data drive decisions. Community colleges that embrace this will thrive. The ones that resist will find themselves explaining why their programs deserve continued investment without any evidence to back it up.
          </p>
          <p className="text-theme-secondary leading-relaxed mb-6">
            The good news? You probably already have great programs producing real results. You just haven&apos;t been measuring them properly. Start now, and the data will tell the story your programs deserve.
          </p>
        </section>

        <div className="bg-gradient-to-r from-violet-900/40 to-teal-900/40 border border-theme-subtle rounded-2xl p-8 mt-12 text-center">
          <h2 className="font-bold text-theme-primary mb-3" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
            Know Which Programs to Invest In
          </h2>
          <p className="text-theme-tertiary leading-relaxed mb-6">
            Wavelength&apos;s Feasibility Study validates program concepts against real labor market data — BLS wage projections, employer demand signals, and competitive landscape analysis. Build the evidence base for your best programs before the reporting requirements hit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/validate" className="inline-block bg-gradient-to-r from-violet-600 to-teal-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
              Explore Feasibility Study →
            </Link>
            <Link href="/discover" className="inline-block border border-theme-subtle text-theme-primary font-semibold px-6 py-3 rounded-xl hover:bg-theme-surface transition-colors">
              Market Scan →
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
