import type { Metadata } from "next";
import BlogClient from "./BlogClient";

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

export const posts = [
  {
    slug: "leadership-occupation-growth-community-college-management-programs-2026",
    title: "Leadership Job Growth in 2026: Why Community Colleges Need Management Programs Now",
    excerpt: "BLS data shows 9 of 10 fastest-growing leadership occupations pay above $67,920. Here's why community colleges should be building management credential programs right now.",
    date: "February 22, 2026",
    readTime: "7 min read",
    category: "Workforce Intelligence",
    dot: "bg-teal-400",
  },
  {
    slug: "reshoring-immigration-structural-workforce-shortages-2026",
    title: "Reshoring + Immigration Restrictions = Structural Workforce Shortages",
    excerpt:
      "Why community colleges can't afford to treat labor market 'demand' as a simple trend line anymore. The macro forces creating permanent talent gaps — and what your institution needs to do about it.",
    date: "February 20, 2026",
    readTime: "8 min read",
    category: "Workforce Strategy",
    dot: "bg-purple-400",
  },
  {
    slug: "lightcast-fault-lines-workforce-gap-2026",
    title: "Lightcast Just Called It: The Labor Shortage Is Permanent. Here's What That Means for Your Programs.",
    excerpt:
      "Lightcast's 2026 'Fault Lines' report documents a structural credential gap — 66% of job postings require credentials, but only 31% of workers have them. For community colleges, this is less a warning and more a mandate. Here's how to position your programs to win in a scarcity environment.",
    date: "February 19, 2026",
    readTime: "7 min read",
    category: "Labor Market Intelligence",
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
    dot: "bg-blue-400",
  },
];

export default function BlogIndexPage() {
  return <BlogClient posts={posts} />;
}
