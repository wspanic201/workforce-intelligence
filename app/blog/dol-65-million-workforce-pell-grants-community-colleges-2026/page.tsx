import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '$65M DOL Workforce Pell Grants: What Community Colleges Need to Know | Wavelength',
  description: 'The U.S. Department of Labor announced $65 million in grants for community colleges developing Workforce Pell-eligible programs. Here\'s how to position your institution for funding and what the money really means for program strategy.',
  keywords: 'Workforce Pell grants, DOL community college funding, short-term credential programs, Pell-eligible workforce training, community college grants 2026',
  openGraph: {
    title: '$65M DOL Workforce Pell Grants: What Community Colleges Need to Know',
    description: 'DOL announces $65M in grants for Workforce Pell program development. Strategic analysis for community college leaders.',
    type: 'article',
    publishedTime: '2026-02-22T09:00:00Z',
    authors: ['Wavelength Team'],
    tags: ['Workforce Pell', 'Federal Funding', 'Program Development', 'Community Colleges', 'DOL Grants'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '$65M DOL Workforce Pell Grants: What Community Colleges Need to Know',
    description: 'Strategic analysis of DOL\'s $65M grant opportunity for Workforce Pell program development.',
  },
  alternates: {
    canonical: 'https://withwavelength.com/blog/dol-65-million-workforce-pell-grants-community-colleges-2026',
  },
}

export default function BlogPost() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: '$65M DOL Workforce Pell Grants: What Community Colleges Need to Know',
        description: 'The U.S. Department of Labor announced $65 million in grants for community colleges developing Workforce Pell-eligible programs. Strategic analysis for program leaders.',
        datePublished: '2026-02-22T09:00:00Z',
        dateModified: '2026-02-22T09:00:00Z',
        author: {
          '@type': 'Organization',
          name: 'Wavelength',
          url: 'https://withwavelength.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Wavelength',
          url: 'https://withwavelength.com',
        },
        keywords: 'Workforce Pell grants, DOL community college funding, short-term credential programs',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://withwavelength.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://withwavelength.com/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: '$65M DOL Workforce Pell Grants',
            item: 'https://withwavelength.com/blog/dol-65-million-workforce-pell-grants-community-colleges-2026',
          },
        ],
      },
    ],
  }

  return (
    <div className="overflow-x-hidden bg-theme-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-4xl mx-auto px-4 pt-36 lg:pt-40 pb-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity mb-6"
        >
          ← Back to Blog
        </Link>
        <div className="mb-8">
          <span className="text-xs font-mono text-violet-400 border border-violet-400/30 px-3 py-1 rounded-full">
            Federal Funding
          </span>
        </div>

        <div className="h-1 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 mb-10" />

        <h1 className="font-bold leading-tight mb-5 text-theme-primary" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.8rem, 3.5vw, 2.8rem)"}}>
          DOL Announces $65M in Workforce Pell Grants: What Community Colleges Need to Know Right Now
        </h1>

        <div className="flex items-center gap-4 mb-8">
          <span className="text-theme-muted text-sm">February 22, 2026</span>
          <span className="text-theme-muted text-sm">•</span>
          <span className="text-theme-muted text-sm">9 min read</span>
        </div>

        <p className="text-theme-tertiary text-xl leading-relaxed mb-8">
          On February 17, 2026, the U.S. Department of Labor announced the availability of $65 million in competitive grants specifically designed to help community colleges develop short-term training programs eligible for Workforce Pell funding. Individual institutions can receive awards up to $11 million. This isn't just another federal funding announcement—it's the clearest signal yet that DOL is betting on community colleges as the primary delivery vehicle for high-quality, labor-market-aligned credential programs under the expanded Pell framework.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          But here's what most institutions are missing: the availability of funding doesn't solve the strategic question of <em>which programs to develop</em>. With Workforce Pell eligibility tied to occupation-specific criteria, labor market demand thresholds, and wage outcomes, community colleges face a portfolio strategy problem before they face a funding problem. This post breaks down what the DOL announcement really means, what it reveals about federal priorities, and how to position your institution for both grant success and sustainable program growth.
        </p>

        <h2 className="font-bold text-white mb-4 mt-12" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
          The $65M Breakdown: What DOL Is Actually Funding
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          According to the <a href="https://www.dol.gov/newsroom/releases/eta/eta20260217" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">official DOL press release</a>, the $65 million allocation is structured through the Employment and Training Administration (ETA) to support programs that help community colleges meet the Workforce Pell eligibility requirements established in the most recent federal budget appropriations. The grants are designed to fund:
        </p>

        <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
          <li><strong>Curriculum development and alignment</strong> for programs between 150 and 600 clock hours that lead to recognized postsecondary credentials</li>
          <li><strong>Labor market analysis and employer partnership development</strong> to demonstrate demand and wage outcomes meet Workforce Pell thresholds</li>
          <li><strong>Institutional capacity building</strong> including data systems, credential tracking infrastructure, and compliance documentation</li>
          <li><strong>Student support services</strong> tailored to short-term credential seekers, including advising, wraparound services, and job placement assistance</li>
        </ul>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The upper limit of $11 million per institution is significant. For context, that's enough to fund comprehensive program portfolio redesign, multi-year employer engagement strategies, and the data infrastructure necessary to maintain compliance across multiple credential pathways. DOL is not funding pilot projects—they're funding institutional transformation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">$65M</div>
            <div className="text-theme-tertiary text-sm">Total DOL Allocation</div>
          </div>
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">$11M</div>
            <div className="text-theme-tertiary text-sm">Max Award Per Institution</div>
          </div>
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">150-600</div>
            <div className="text-theme-tertiary text-sm">Clock Hours for Eligibility</div>
          </div>
        </div>

        <h2 className="font-bold text-white mb-4 mt-12" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
          What This Reveals About Federal Workforce Strategy
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The timing and structure of this funding tells us three important things about where federal workforce policy is headed:
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>1. Short-term credentials are now infrastructure, not innovation.</strong> The grant language doesn't treat 150-600 hour programs as experimental pilot initiatives. DOL is funding at scale because the federal government has decided that stackable, short-term credentials aligned to in-demand occupations are the primary pathway for workforce development. Community colleges that continue to think of these programs as "non-credit" or "continuing education" are misreading the policy environment.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>2. Labor market alignment is now a compliance requirement.</strong> Workforce Pell eligibility hinges on demonstrable demand and wage outcomes. DOL isn't funding program creation in a vacuum—they're funding the institutional capacity to prove ongoing alignment. This means community colleges need real-time labor market intelligence, not annual environmental scans. The grant application will almost certainly require evidence of demand verification methodology.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>3. The federal government expects institutional capacity gaps.</strong> The inclusion of funding for data systems, compliance infrastructure, and employer partnership development signals that DOL knows most community colleges aren't operationally ready for Workforce Pell at scale. This is a capacity-building investment, which means institutions that can demonstrate readiness—or a clear plan to achieve it—have a competitive advantage in the application process.
        </p>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <h3 className="font-bold text-white mb-3" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.1rem, 1.5vw, 1.3rem)"}}>
            The Portfolio Strategy Problem
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Here's the strategic tension: Most community colleges have dozens of existing certificate and diploma programs, some of which might already fall within the 150-600 hour range. But Workforce Pell eligibility isn't just about clock hours—it requires programs to align with occupations that meet specific labor market demand and wage thresholds.
          </p>
          <p className="text-theme-tertiary leading-relaxed">
            That means institutions need to answer two questions simultaneously: (1) Which of our existing programs can be modified to meet Workforce Pell criteria? and (2) Which new programs should we develop in occupational areas with unmet demand? The $65M grants are designed to fund both, but the application will require a coherent portfolio strategy, not a list of program ideas.
          </p>
        </div>

        <h2 className="font-bold text-white mb-4 mt-12" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
          What Makes a Competitive Grant Application
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          While the full Request for Proposals (RFP) hasn't been published yet, we can reverse-engineer what DOL will prioritize based on the grant's stated objectives and the broader Workforce Pell framework. Strong applications will demonstrate:
        </p>

        <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
          <li><strong>Evidence-based program selection.</strong> Applications will need to show that proposed programs target occupations with verified demand, not historical enrollment patterns or faculty expertise. Expect DOL to favor institutions that can cite Bureau of Labor Statistics occupational projections, state-level labor market data, and employer surveys or letters of commitment.</li>
          <li><strong>Existing employer partnerships.</strong> The grant announcement emphasizes employer engagement and job placement. Institutions with established advisory boards, apprenticeship partnerships, or work-based learning infrastructure have a material advantage. If you're starting from zero on employer relationships, your application needs to explain how grant funds will build that capacity quickly.</li>
          <li><strong>Clear compliance infrastructure.</strong> Workforce Pell requires ongoing documentation of outcomes, including credential attainment rates, job placement in related fields, and wage gains. DOL will want to see that you have—or can build—the data systems to track these metrics at the program level, not just institutional aggregates.</li>
          <li><strong>Equity and access strategies.</strong> Federal workforce grants increasingly require explicit attention to underserved populations. Your application should address how proposed programs will serve students from low-income backgrounds, communities of color, rural areas, or other populations with historical barriers to credential attainment.</li>
          <li><strong>Sustainability plans.</strong> Grant funding is temporary. DOL will favor applications that demonstrate how new or redesigned programs will be sustained after grant funds expire, including tuition models, ongoing employer partnerships, and integration into the institution's academic planning cycle.</li>
        </ul>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The most common mistake institutions make with large federal grants is treating the application as a funding request rather than a strategic plan. DOL wants to see institutional transformation, not project execution.
        </p>

        <h2 className="font-bold text-white mb-4 mt-12" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
          The Pre-Application Strategic Questions
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Before you can write a competitive grant application, your institution needs to answer five strategic questions. These aren't RFP requirements—they're the foundational decisions that determine whether you have a coherent case for funding:
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>1. Which of our existing programs are already Workforce Pell-eligible or could be modified to qualify?</strong> Many institutions have certificate programs in healthcare, IT, advanced manufacturing, or business that fall within the 150-600 hour range but haven't been mapped against Workforce Pell occupation and wage criteria. Before proposing new programs, you need an audit of what's already in your portfolio and where the gaps exist.
        </p>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <p className="text-theme-tertiary leading-relaxed mb-4">
            This is exactly what Wavelength's <Link href="/pell" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">free Pell Readiness Check</Link> does—it scans your existing program portfolio against Workforce Pell eligibility criteria and identifies which programs are ready, which need modification, and which occupational areas have unmet demand in your labor market. Most institutions discover they're closer to Workforce Pell readiness than they realized, but they have blind spots in 2-3 high-demand occupational clusters.
          </p>
        </div>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>2. What are the highest-demand occupational areas in our regional labor market that we're not currently serving with short-term credentials?</strong> This is the program development opportunity. DOL grants fund new program creation, but only if those programs align with verified demand. You need occupation-specific data on projected job openings, wage thresholds, and employer hiring patterns—not just industry sector trends.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>3. Do we have the institutional capacity to manage Workforce Pell compliance at scale?</strong> Compliance isn't just about meeting eligibility criteria once—it's about maintaining ongoing documentation of outcomes, wage data, and employer partnerships. If your institution doesn't have automated credential tracking, integrated student information and financial aid systems, or dedicated staff for outcomes reporting, your grant application needs to allocate significant resources to capacity building.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>4. Which employer partnerships can we leverage or develop to support job placement and wage outcome verification?</strong> DOL will prioritize institutions with letters of commitment from regional employers. If you don't have those relationships yet, your application needs a concrete plan for building them, including specific employer targets, partnership models, and timelines.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>5. How does Workforce Pell program development fit into our broader institutional strategy?</strong> This is the question most institutions skip. If your strategic plan emphasizes bachelor's degree completion, but you're applying for grants to develop 300-hour certificates, you have a coherence problem. DOL wants to fund institutions that see short-term workforce credentials as central to their mission, not as a side project or revenue diversification strategy.
        </p>

        <h2 className="font-bold text-white mb-4 mt-12" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
          The Timing Challenge: Workforce Pell Launch vs. Grant Funding
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          According to recent reporting in <a href="https://workforcepell.substack.com/p/workforce-pell-funding-opportunities" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">Workforce Pell newsletters</a>, the formal launch of Workforce Pell as a federal financial aid program faces continued uncertainty around appropriations and regulatory finalization. That creates a strategic timing question for community colleges: Do you wait for full Workforce Pell implementation to develop programs, or do you use DOL grants to build capacity now?
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The answer is obvious: build capacity now. Here's why:
        </p>

        <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
          <li>Program development takes 12-18 months even with dedicated funding. Curriculum design, faculty recruitment, employer partnership development, and state approval processes don't happen quickly.</li>
          <li>Institutions that have Workforce Pell-eligible programs ready at launch will capture first-mover enrollment advantages. Students don't wait for institutional readiness—they go where programs exist.</li>
          <li>DOL grants provide non-dilutive funding for strategic investments your institution needs to make anyway. Even if Workforce Pell implementation is delayed, short-term workforce credentials aligned to labor market demand remain a core institutional mission.</li>
          <li>Grant-funded capacity building creates operational infrastructure—data systems, employer partnerships, compliance processes—that benefits all workforce programs, not just Workforce Pell-eligible credentials.</li>
        </ul>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The institutions that will succeed with Workforce Pell are the ones positioning themselves now, not waiting for regulatory clarity. The $65M DOL grants are designed to de-risk that timing problem by funding the transition period.
        </p>

        <h2 className="font-bold text-white mb-4 mt-12" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
          What Happens If You Don't Pursue Grant Funding?
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Not every institution will pursue the DOL grants, and that's a strategic choice. But it's important to understand the competitive implications. Community colleges that receive these grants will have:
        </p>

        <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
          <li>Portfolio of Workforce Pell-eligible programs ready at launch</li>
          <li>Established employer partnerships and job placement pipelines</li>
          <li>Proven compliance infrastructure and outcomes tracking systems</li>
          <li>Marketing head start and regional brand recognition for workforce credentials</li>
          <li>Data-driven program development processes that enable faster iteration</li>
        </ul>

        <p className="text-theme-secondary leading-relaxed mb-6">
          If your institution doesn't pursue DOL funding, you're not just forgoing $11M in grant support—you're ceding first-mover advantage to regional competitors who are using federal dollars to build operational capacity you'll eventually need to fund from institutional budgets or tuition revenue.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The strategic alternative isn't "wait and see"—it's to build Workforce Pell readiness through other means, whether that's reallocating institutional resources, partnering with third-party curriculum providers, or using state workforce development funds. The timeline doesn't change; only the funding source does.
        </p>

        <div className="bg-gradient-to-r from-violet-900/40 to-teal-900/40 border border-theme-subtle rounded-2xl p-8 mt-12 text-center">
          <h3 className="font-bold text-white mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.2rem, 1.8vw, 1.5rem)"}}>
            Need to Identify Your Workforce Pell Program Gaps?
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-6 max-w-2xl mx-auto">
            Before writing a grant application, you need to know which programs in your portfolio are already Workforce Pell-eligible and which occupational areas represent the biggest opportunities in your regional labor market. Wavelength's <strong>Compliance Gap Report</strong> ($295) provides a comprehensive scan of your existing program portfolio against Workforce Pell criteria, identifies modification opportunities, and highlights 3-5 high-priority occupational areas with unmet demand. It's the foundation for a data-driven grant strategy.
          </p>
          <Link 
            href="/compliance-gap" 
            className="inline-block bg-gradient-to-r from-violet-500 to-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Learn More About Compliance Gap Report →
          </Link>
        </div>

        <h2 className="font-bold text-white mb-4 mt-12" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
          Three Strategic Moves to Make This Month
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Whether you pursue DOL grant funding or not, February 2026 marks an inflection point for community college workforce strategy. Here are three moves your institution should make before the end of the month:
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>1. Audit your existing program portfolio for Workforce Pell readiness.</strong> You can't make strategic decisions about new program development until you know what's already in your portfolio and where the gaps exist. Map every certificate and diploma program between 150-600 hours against CIP codes, associated SOC occupations, and your regional labor market demand data. Identify quick wins—programs that are 80% aligned and could be modified to meet full eligibility criteria with minor curriculum adjustments.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>2. Convene your academic leadership team for a Workforce Pell strategy session.</strong> This isn't a task force or committee—it's a working session with VPs of Academic Affairs, Workforce Development Directors, Department Chairs, and Institutional Research leads in the same room. The agenda: What is our portfolio strategy for Workforce Pell? Which occupational clusters do we prioritize? What institutional capacity do we need to build? Who owns program development, employer partnerships, and outcomes tracking? Strategic clarity now determines execution success later.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          <strong>3. Identify 3-5 high-value employer partners in your region and schedule meetings.</strong> DOL grants will prioritize institutions with employer commitments. Even if you're not pursuing the grant, employer partnerships are foundational to any short-term workforce credential strategy. Target employers in sectors with high projected demand: healthcare systems, advanced manufacturing firms, tech companies, logistics operations, skilled trades contractors. Ask one question: If we could develop a 300-400 hour credential program that produces job-ready graduates in [specific occupation], would you commit to interviewing every graduate for open positions?
        </p>

        <h2 className="font-bold text-white mb-4 mt-12" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}>
          The Bigger Picture: What This Means for Community College Strategy
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The $65M DOL announcement is significant not because of the dollar amount—$65M spread across the entire community college system isn't transformational funding at scale—but because it reveals the federal government's theory of change for workforce development. That theory is:
        </p>

        <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
          <li>Short-term, stackable credentials aligned to in-demand occupations are the primary pathway for workforce training</li>
          <li>Community colleges are the institutions best positioned to deliver those credentials at scale</li>
          <li>Most community colleges need capacity-building support to transition from traditional academic program models to data-driven, employer-aligned workforce program portfolios</li>
          <li>Labor market alignment must be provable and ongoing, not aspirational or historical</li>
        </ul>

        <p className="text-theme-secondary leading-relaxed mb-6">
          This theory of change has implications far beyond Workforce Pell. It signals that federal and state workforce funding will increasingly flow to institutions that can demonstrate real-time alignment between programs offered and labor market demand. It suggests that traditional metrics like enrollment trends and completion rates will be supplemented—or replaced—by job placement rates, wage outcomes, and employer satisfaction measures. And it clarifies that community colleges with sophisticated labor market intelligence, employer partnership infrastructure, and outcomes tracking systems have a structural competitive advantage.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The institutions that understand this shift aren't just preparing for Workforce Pell—they're repositioning their entire academic strategy around labor market responsiveness as a core institutional competency. That's the opportunity the $65M grants represent, and it's the strategic question every community college leadership team needs to answer in 2026.
        </p>

        <div className="bg-gradient-to-r from-violet-900/40 to-teal-900/40 border border-theme-subtle rounded-2xl p-8 mt-12 text-center">
          <h3 className="font-bold text-white mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.2rem, 1.8vw, 1.5rem)"}}>
            Ready to Build Your Workforce Program Portfolio?
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-6 max-w-2xl mx-auto">
            Wavelength's <strong>Market Scan</strong> ($1,500) identifies 7-10 vetted new program opportunities in your regional labor market, each with verified demand data, wage thresholds, employer insights, and Workforce Pell eligibility assessment. It's the strategic foundation for grant applications, academic planning, and portfolio development. Get the data you need to make confident program decisions.
          </p>
          <Link 
            href="/discover" 
            className="inline-block bg-gradient-to-r from-violet-500 to-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Explore Market Scan →
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-theme-subtle">
          <p className="text-theme-muted text-sm leading-relaxed">
            <strong>About Wavelength:</strong> We help community colleges develop and maintain workforce programs aligned to labor market demand. Our platform provides real-time labor market intelligence, Workforce Pell eligibility scanning, and program validation tools designed specifically for community college academic leaders. Learn more at <Link href="/" className="text-teal-400 hover:text-teal-300">withwavelength.com</Link>.
          </p>
        </div>
      </article>
    </div>
  )
}