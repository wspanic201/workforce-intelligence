'use client';

import { useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/cosmic/Stars";
import { Aurora } from "@/components/cosmic/Aurora";
import { AnimateOnScroll, StaggerChildren } from "@/components/motion";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  dot: string;
};

const CATEGORY_ORDER = [
  "Program Strategy",
  "Pell Readiness",
  "Labor Market Intelligence",
  "Curriculum Strategy",
];

export default function BlogClient({ posts }: { posts: Post[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const categories = CATEGORY_ORDER.filter((cat) =>
    posts.some((p) => p.category === cat)
  );

  const filteredPosts =
    activeFilter === "All"
      ? posts
      : posts.filter((p) => p.category === activeFilter);

  const countFor = (cat: string) =>
    posts.filter((p) => p.category === cat).length;

  return (
    <div className="overflow-x-hidden bg-theme-page">
      {/* Hero */}
      <section className="pt-36 lg:pt-40 pb-16 px-4 border-b border-theme-subtle relative overflow-hidden">
        <Stars count={160} />
        <Aurora />

        <div className="max-w-5xl mx-auto relative z-10">
          <AnimateOnScroll variant="fade-down" duration={600}>
            <p className="overline mb-3">The Wavelength Blog</p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={80} duration={700}>
            <h1
              className="font-bold leading-tight text-theme-primary font-heading"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Intelligence for{" "}
              <span className="text-gradient-cosmic">Higher Ed Leaders</span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={180} duration={700}>
            <p className="mt-4 text-theme-tertiary text-lg max-w-2xl">
              Practical guides on Workforce Pell, compliance strategy, and program
              development. No fluff — just frameworks that hold up under scrutiny.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Category filter row */}
          <AnimateOnScroll variant="fade-up" duration={600} className="mb-8">
            <div className="flex flex-wrap gap-2">
              {/* All */}
              <button
                onClick={() => setActiveFilter("All")}
                className={[
                  "text-sm px-4 py-2 rounded-lg border transition-colors cursor-pointer",
                  activeFilter === "All"
                    ? "bg-theme-card border-theme-strong text-theme-primary font-semibold"
                    : "bg-transparent border-theme-subtle text-theme-tertiary hover:text-theme-secondary hover:border-theme-base",
                ].join(" ")}
              >
                All ({posts.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={[
                    "text-sm px-4 py-2 rounded-lg border transition-colors cursor-pointer",
                    activeFilter === cat
                      ? "bg-theme-card border-theme-strong text-theme-primary font-semibold"
                      : "bg-transparent border-theme-subtle text-theme-tertiary hover:text-theme-secondary hover:border-theme-base",
                  ].join(" ")}
                >
                  {cat} ({countFor(cat)})
                </button>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Post grid */}
          <StaggerChildren className="grid gap-8" stagger={80}>
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                className="group card-cosmic rounded-xl p-8 hover:border-purple-500/30 transition-colors"
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

                <h2 className="text-xl md:text-2xl font-bold font-heading mb-3 group-hover:text-theme-primary transition-colors text-theme-primary">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-theme-tertiary leading-relaxed mb-5">{post.excerpt}</p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-gradient-cosmic hover:opacity-80 transition-opacity"
                >
                  Read article →
                </Link>
              </article>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-theme-subtle">
        <AnimateOnScroll variant="fade-up" duration={700}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 text-theme-primary">
              Ready to Check Your Pell Readiness?
            </h2>
            <p className="text-theme-tertiary mb-8">
              The July 2026 deadline doesn't move. Get a free Pell Readiness Check and know
              exactly where your programs stand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pell" className="btn-cosmic btn-cosmic-primary">
                Free Pell Readiness Check
              </Link>
              <Link href="/discover" className="btn-cosmic btn-cosmic-ghost">
                Discover Programs
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </section>
    </div>
  );
}
