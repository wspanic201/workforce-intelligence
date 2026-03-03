import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Healthcare Workforce Shortages Hit Crisis Levels: Program Expansion Strategies for Community Colleges | Wavelength',
  description: 'BLS projects 1.9M new healthcare jobs by 2033. Community colleges must expand nursing, allied health, and behavioral health programs to meet demand. Data-driven strategies inside.',
  alternates: {
    canonical: 'https://withwavelength.com/blog/healthcare-workforce-shortage-community-college-program-expansion-2026'
  },
  openGraph: {
    type: 'article',
    title: 'Healthcare Workforce Shortages Hit Crisis Levels: Program Expansion Strategies for Community Colleges',
    description: 'BLS projects 1.9M new healthcare jobs by 2033. Community colleges must expand nursing, allied health, and behavioral health programs to meet demand.',
    url: 'https://withwavelength.com/blog/healthcare-workforce-shortage-community-college-program-expansion-2026',
    publishedTime: '2026-03-03T00:00:00Z',
    authors: ['Wavelength'],
    tags: ['Healthcare Workforce', 'Nursing Programs', 'Allied Health', 'Program Expansion', 'Community Colleges', 'Workforce Development'],
    images: [
      {
        url: 'https://withwavelength.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Wavelength - Healthcare Workforce Shortage Analysis'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Workforce Shortages Hit Crisis Levels: Program Expansion Strategies for Community Colleges',
    description: 'BLS projects 1.9M new healthcare jobs by 2033. Community colleges must expand nursing, allied health, and behavioral health programs to meet demand.',
    images: ['https://withwavelength.com/og-image.png']
  }
}

export default function BlogPost() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Healthcare Workforce Shortages Hit Crisis Levels: Program Expansion Strategies for Community Colleges',
        description: 'BLS projects 1.9M new healthcare jobs by 2033. Community colleges must expand nursing, allied health, and behavioral health programs to meet demand. Data-driven strategies inside.',
        datePublished: '2026-03-03T00:00:00Z',
        dateModified: '2026-03-03T00:00:00Z',
        author: {
          '@type': 'Organization',
          name: 'Wavelength',
          url: 'https://withwavelength.com'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Wavelength',
          url: 'https://withwavelength.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://withwavelength.com/logo.png'
          }
        },
        image: 'https://withwavelength.com/og-image.png',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://withwavelength.com/blog/healthcare-workforce-shortage-community-college-program-expansion-2026'
        },
        keywords: 'healthcare workforce, nursing programs, allied health, program expansion, community colleges, workforce development, behavioral health, medical assistants, nursing shortage',
        articleSection: 'Workforce Development',
        wordCount: 2100
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@id': 'https://withwavelength.com',
              name: 'Home'
            }
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': 'https://withwavelength.com/blog',
              name: 'Blog'
            }
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': 'https://withwavelength.com/blog/healthcare-workforce-shortage-community-college-program-expansion-2026',
              name: 'Healthcare Workforce Shortages Hit Crisis Levels: Program Expansion Strategies for Community Colleges'
            }
          }
        ]
      }
    ]
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

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs font-mono text-violet-400 border border-violet-400/30 px-3 py-1 rounded-full">
            HEALTHCARE WORKFORCE
          </span>
          <span className="text-theme-muted text-sm">March 3, 2026</span>
          <span className="text-theme-muted text-sm">•</span>
          <span className="text-theme-muted text-sm">9 min read</span>
        </div>

        <div className="h-1 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-teal-500 mb-10" />

        <h1 
          className="font-bold leading-tight mb-5 text-theme-primary" 
          style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.8rem, 3.5vw, 2.8rem)"}}
        >
          Healthcare Workforce Shortages Hit Crisis Levels: Program Expansion Strategies for Community Colleges
        </h1>

        <p className="text-theme-tertiary text-xl leading-relaxed mb-8">
          The U.S. Bureau of Labor Statistics projects healthcare will add 1.9 million new jobs by 2033—representing 13% of all new employment nationwide. Yet community colleges, which train the majority of frontline healthcare workers, face enrollment caps, clinical placement shortages, and faculty shortages that prevent them from scaling programs to meet demand.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The gap between labor market need and institutional capacity is widening. In February 2026, the <a href="https://www.bls.gov" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">Bureau of Labor Statistics</a> released updated employment projections showing healthcare occupations growing at more than double the rate of the overall economy. Registered nursing alone will need 193,100 new workers annually through 2033—not from growth alone, but from turnover and retirements.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          For community college leaders, the question isn't whether to expand healthcare programs. It's how to expand strategically when resources are constrained, Workforce Pell eligibility is uncertain, and labor market signals change faster than accreditation timelines allow.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-8">
          This post examines the data behind the healthcare workforce crisis, identifies which programs represent the highest-ROI expansion opportunities for community colleges, and outlines a framework for scaling capacity without compromising quality.
        </p>

        <h2 
          className="font-bold text-theme-primary mb-4 mt-12" 
          style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}
        >
          The Numbers: Healthcare Job Growth Through 2033
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          According to the latest BLS Employment Projections, healthcare occupations will grow 9% from 2023 to 2033—significantly faster than the 4% average for all occupations. But these topline numbers obscure critical variation by credential level and occupation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">1.9M</div>
            <div className="text-theme-secondary text-sm">New healthcare jobs by 2033</div>
          </div>
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">193,100</div>
            <div className="text-theme-secondary text-sm">Annual RN openings (growth + replacement)</div>
          </div>
          <div className="bg-theme-surface border border-teal-500/20 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-teal-400 mb-2">9%</div>
            <div className="text-theme-secondary text-sm">Healthcare occupation growth rate vs. 4% overall</div>
          </div>
        </div>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Community colleges train workers across the entire healthcare credential spectrum—from short-term certificates in phlebotomy to associate degrees in nursing and radiologic technology. But not all programs face equal demand or offer equal return on institutional investment.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-8">
          The highest-volume opportunities for community colleges fall into three categories: nursing and direct care roles, allied health technical positions, and behavioral health. Each requires different expansion strategies.
        </p>

        <h2 
          className="font-bold text-theme-primary mb-4 mt-12" 
          style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}
        >
          Nursing: The Highest-Demand, Highest-Constraint Opportunity
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Registered nursing remains the single largest occupation in healthcare, with 3.2 million employed workers in 2023. The BLS projects 193,100 annual job openings through 2033—combining 177,400 replacement openings (retirements, career changes) with 15,700 growth openings annually.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Community colleges confer approximately 60% of associate degrees in nursing (ADN) nationwide, making them the primary pipeline for entry-level RN positions. But ADN programs face three structural constraints that limit expansion:
        </p>

        <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
          <li><strong>Clinical placement shortages:</strong> Hospital systems and long-term care facilities can only accommodate a finite number of students per semester. Expanding cohort size requires negotiating new clinical partnerships—a process that takes 12–18 months.</li>
          <li><strong>Faculty shortages:</strong> Nursing faculty positions require MSN or higher credentials plus clinical experience. The American Association of Colleges of Nursing (AACN) reports that nursing schools turned away 66,000 qualified applicants in 2023 due to faculty shortages.</li>
          <li><strong>Enrollment caps:</strong> NCLEX pass rates and accreditation standards pressure programs to maintain small cohorts. Expanding enrollment without expanding faculty, simulation labs, and clinical sites risks pass rate declines—which trigger accreditation scrutiny.</li>
        </ul>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Despite these constraints, ADN programs represent a critical expansion priority. Median wages for RNs reached $81,220 in 2023, and every nursing graduate creates immediate labor market value. But expansion requires capital investment, not just enrollment increases.
        </p>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <h3 className="font-bold text-theme-primary mb-3" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"1.1rem"}}>
            Strategic Approach: Increase Nursing Capacity Through Simulation and Partnerships
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Rather than simply admitting more students into the same program structure, colleges should invest in:
          </p>
          <ul className="list-disc list-outside pl-6 space-y-2 text-theme-tertiary">
            <li>High-fidelity simulation labs that reduce clinical placement hours (per state BON approval)</li>
            <li>Joint faculty hiring agreements with hospital systems (dual appointments)</li>
            <li>LPN-to-RN bridge programs that leverage existing clinical licenses</li>
            <li>Accelerated second-degree programs for career changers with bachelor's degrees in other fields</li>
          </ul>
        </div>

        <p className="text-theme-secondary leading-relaxed mb-8">
          Before launching new nursing cohorts, use <Link href="/validate" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">Wavelength's Program Validation</Link> to model local demand, wage premiums, and competitive saturation. The analysis includes employer hiring patterns, clinical placement capacity in your region, and Workforce Pell eligibility projections—critical for programs considering accelerated formats.
        </p>

        <h2 
          className="font-bold text-theme-primary mb-4 mt-12" 
          style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}
        >
          Allied Health: Faster to Scale, Equally High Demand
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          While nursing programs face structural enrollment caps, many allied health programs can scale more rapidly. Medical assistants, diagnostic technicians, and health information specialists require shorter training timelines, fewer clinical hours, and less specialized faculty.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The BLS projects particularly strong growth in these allied health occupations through 2033:
        </p>

        <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
          <li><strong>Medical assistants:</strong> 15% growth (114,600 annual openings), median wage $38,270</li>
          <li><strong>Physician assistants:</strong> 27% growth (12,900 annual openings), median wage $130,020</li>
          <li><strong>Diagnostic medical sonographers:</strong> 10% growth (8,000 annual openings), median wage $80,680</li>
          <li><strong>Health information technologists:</strong> 15% growth (17,900 annual openings), median wage $48,780</li>
          <li><strong>Respiratory therapists:</strong> 13% growth (11,600 annual openings), median wage $70,540</li>
        </ul>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Medical assistant programs, typically 30–60 credits, represent the fastest-scaling opportunity. These programs require minimal clinical placements (120–240 hours vs. 1,000+ for nursing), can be taught by faculty with bachelor's + certification rather than advanced degrees, and face strong employer demand across ambulatory care, urgent care, and specialty practices.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Sonography and respiratory therapy programs offer higher wage outcomes but require more specialized equipment and longer clinical rotations. They're ideal expansion targets for colleges that already operate imaging or allied health departments and can leverage existing clinical partnerships.
        </p>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <h3 className="font-bold text-theme-primary mb-3" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"1.1rem"}}>
            Why Allied Health Programs Are Workforce Pell-Friendly
          </h3>
          <p className="text-theme-tertiary leading-relaxed">
            Many allied health credentials fall into the 8–15 week or 150–600 hour range that makes them eligible for the upcoming Workforce Pell Grant pilot. Medical assistant, phlebotomy, and EKG technician certificates can be redesigned as stackable credentials that meet the "high-quality" criteria DOL will use to approve programs. Colleges expanding allied health should design programs with Workforce Pell in mind from day one—not retrofit existing curricula later. Use <Link href="/pell" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">Wavelength's free Pell Readiness Check</Link> to scan your portfolio.
          </p>
        </div>

        <h2 
          className="font-bold text-theme-primary mb-4 mt-12" 
          style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}
        >
          Behavioral Health: The Underserved High-Growth Segment
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Substance abuse, behavioral disorder, and mental health counselors represent one of the fastest-growing occupational categories in healthcare, projected to grow 19% through 2033—nearly five times the national average. Yet community colleges remain significantly underrepresented in this training pipeline.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The BLS projects 38,000 annual openings for substance abuse and behavioral disorder counselors, with median wages of $53,710. These positions typically require a bachelor's degree plus supervised clinical hours for licensure—but many states allow associate-degree holders to work as counselor assistants or peer support specialists while completing their bachelor's requirements.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Community colleges have three viable program models in behavioral health:
        </p>

        <ul className="list-disc list-outside pl-6 space-y-2 text-theme-secondary mb-6">
          <li><strong>Peer support specialist certificates:</strong> Short-term (8–12 weeks) credentials for individuals with lived experience in recovery. High demand in opioid crisis regions. Typically eligible for Workforce Pell.</li>
          <li><strong>Associate degrees in human services or addiction studies:</strong> Transfer pathways to bachelor's programs in counseling or social work. These programs can articulate with state university systems to create seamless 2+2 pathways.</li>
          <li><strong>Mental health first aid and crisis intervention certificates:</strong> Embedded credentials for healthcare workers in other roles (medical assistants, CNAs, patient navigators) who encounter behavioral health crises.</li>
        </ul>

        <p className="text-theme-secondary leading-relaxed mb-8">
          Behavioral health programs require less capital investment than clinical health programs—no simulation labs, limited equipment costs—but do require faculty with LCSW, LPC, or equivalent credentials and strong partnerships with community mental health centers, recovery organizations, and integrated care clinics.
        </p>

        <h2 
          className="font-bold text-theme-primary mb-4 mt-12" 
          style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}
        >
          The Program Expansion Playbook: Where to Start
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Not every community college should expand every healthcare program. Strategic expansion requires analyzing local labor market demand, institutional capacity, competitive positioning, and funding sustainability.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Here's a decision framework for VP-level leaders evaluating healthcare program expansion in 2026:
        </p>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <h3 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"1.1rem"}}>
            Step 1: Audit Current Capacity and Constraints
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Before launching new programs, understand where existing programs are constrained:
          </p>
          <ul className="list-disc list-outside pl-6 space-y-2 text-theme-tertiary mb-4">
            <li>Are nursing programs turning away qualified applicants? By how many?</li>
            <li>What is clinical placement capacity across your partner network?</li>
            <li>Where do you have faculty shortages vs. faculty underutilization?</li>
            <li>Which programs have waitlists longer than one semester?</li>
          </ul>
          <p className="text-theme-tertiary leading-relaxed">
            Colleges often assume they need new programs when the real bottleneck is capacity in existing high-demand programs. Sometimes the highest ROI move is doubling nursing enrollment, not launching a new allied health credential.
          </p>
        </div>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <h3 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"1.1rem"}}>
            Step 2: Analyze Local Labor Market Demand—Not National Trends
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            BLS national projections are useful context, but program decisions must be grounded in regional data. A college in a rural area with one critical access hospital has different expansion priorities than a college in a metro region with multiple hospital systems, ambulatory surgery centers, and specialty clinics.
          </p>
          <p className="text-theme-tertiary leading-relaxed">
            Analyze job postings, employer hiring patterns, and wage trends within a 50-mile radius. Look for occupations with rising postings, declining time-to-fill, and wage premiums above state medians. <Link href="/discover" className="text-teal-400 underline underline-offset-2 hover:text-teal-300">Wavelength's Market Scan</Link> provides exactly this analysis—7–10 vetted program opportunities ranked by local demand intensity, employer concentration, and competitive gaps. It's designed specifically for community college program teams who need to move faster than traditional environmental scans allow.
          </p>
        </div>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <h3 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"1.1rem"}}>
            Step 3: Design for Stackability and Workforce Pell Eligibility
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            New healthcare programs launched in 2026 should be designed with two criteria in mind:
          </p>
          <ul className="list-disc list-outside pl-6 space-y-2 text-theme-tertiary mb-4">
            <li><strong>Stackable credentials:</strong> Short-term certificates that ladder into associate degrees. This allows students to enter the workforce quickly while continuing education part-time.</li>
            <li><strong>Workforce Pell eligibility:</strong> Programs in the 8–15 week or 150–600 hour range that meet quality standards (post-completion earnings, completion rates, employer partnerships) will be eligible for Workforce Pell funding starting in 2027–28. Design programs to meet these criteria from launch—don't retrofit later.</li>
          </ul>
          <p className="text-theme-tertiary leading-relaxed">
            For example: A medical assistant program could be structured as a 12-week certificate (Workforce Pell-eligible) that stacks into a 30-credit allied health AAS degree. Students earn credentials and income at multiple exit points.
          </p>
        </div>

        <div className="bg-theme-surface border border-theme-subtle rounded-xl p-6 mb-8">
          <h3 className="font-bold text-theme-primary mb-4" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"1.1rem"}}>
            Step 4: Build Employer Partnerships Before Enrollment Opens
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-4">
            Healthcare programs live or die based on clinical placements and employer hiring commitments. Before submitting accreditation paperwork, secure:
          </p>
          <ul className="list-disc list-outside pl-6 space-y-2 text-theme-tertiary mb-4">
            <li>MOUs with clinical sites specifying student placement capacity per semester</li>
            <li>Letters of support from employers committing to interview/hire graduates</li>
            <li>Advisory board members from regional health systems who will advocate internally</li>
          </ul>
          <p className="text-theme-tertiary leading-relaxed">
            Colleges that launch programs without employer validation waste 12–18 months building curricula that miss the mark on skills, certifications, or clinical hour requirements.
          </p>
        </div>

        <h2 
          className="font-bold text-theme-primary mb-4 mt-12" 
          style={{fontFamily:"var(--font-space-grotesk)",fontSize:"clamp(1.3rem, 2vw, 1.6rem)"}}
        >
          The Bottom Line: Healthcare Expansion Requires Strategy, Not Just Urgency
        </h2>

        <p className="text-theme-secondary leading-relaxed mb-6">
          The healthcare workforce shortage is real, worsening, and represents the single largest opportunity for community colleges to serve regional labor markets. But expanding healthcare programs is capital-intensive, faculty-constrained, and accreditation-regulated in ways that other workforce programs are not.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-6">
          Strategic expansion means choosing programs where local demand is strongest, institutional capacity is sufficient, and return on investment is measurable. It means designing stackable credentials with Workforce Pell eligibility in mind. And it means building employer partnerships that guarantee clinical placements and graduate hiring before enrollment opens.
        </p>

        <p className="text-theme-secondary leading-relaxed mb-8">
          Colleges that approach healthcare expansion reactively—launching programs because "we need more nurses"—will waste resources and miss market opportunities. Colleges that use labor market intelligence to identify the right programs, at the right scale, in the right sequence will build sustainable pipelines that serve students, employers, and their regions for decades.
        </p>

        <div className="bg-gradient-to-r from-violet-900/40 to-teal-900/40 border border-theme-subtle rounded-2xl p-8 mt-12 text-center">
          <h3 className="font-bold text-theme-primary mb-3" style={{fontFamily:"var(--font-space-grotesk)",fontSize:"1.3rem"}}>
            Need Data to Support Healthcare Program Decisions?
          </h3>
          <p className="text-theme-tertiary leading-relaxed mb-6 max-w-2xl mx-auto">
            Wavelength's Market Scan analyzes local demand for 500+ healthcare and allied health occupations, identifies competitive gaps, and delivers 7–10 vetted program opportunities in 2 weeks. Perfect for VP-level teams preparing program proposals, budget requests, or accreditation documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/discover"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Explore Market Scan ($1,500)
            </Link>
            <Link 
              href="/pell"
              className="inline-flex items-center justify-center px-6 py-3 border border-theme-subtle text-theme-primary font-semibold rounded-lg hover:bg-theme-surface transition-colors"
            >
              Free Pell Readiness Check
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-theme-subtle">
          <p className="text-theme-muted text-sm">
            <strong>Sources:</strong> U.S. Bureau of Labor Statistics Employment Projections 2023–2033, American Association of Colleges of Nursing Faculty Shortage Report 2023, Health Resources and Services Administration Workforce Projections.
          </p>
        </div>
      </article>
    </div>
  )
}