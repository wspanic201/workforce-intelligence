import type { MetadataRoute } from "next";

const siteUrl = "https://withwavelength.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/pell`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/compliance-gap`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/discover`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/validate`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/drift`,
      lastModified: new Date("2026-02-19"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/market-research`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/program-analysis`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/program-development`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/grant-alignment`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/program-health`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Blog index
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    // Blog posts
    {
      url: `${siteUrl}/blog/workforce-pell-grant-eligibility`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/community-college-program-development`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/lightcast-fault-lines-workforce-gap-2026`,
      lastModified: new Date("2026-02-19"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/ai-changing-job-requirements-curriculum-alignment`,
      lastModified: new Date("2026-02-19"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/community-college-workforce-program-strategy-2026`,
      lastModified: new Date("2026-02-19"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/dol-65-million-workforce-pell-grants-community-colleges-2026`,
      lastModified: new Date("2026-02-20"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },

  ];
}
