'use client';

import { useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/cosmic/Stars";
import { Aurora } from "@/components/cosmic/Aurora";
import { AnimateOnScroll, StaggerChildren } from "@/components/motion";
import { Check, Mail, Radio } from "lucide-react";
import { InstitutionTypeahead } from "@/components/ui/InstitutionTypeahead";

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
                    : "bg-theme-surface border-theme-base text-theme-tertiary hover:text-theme-secondary hover:border-theme-strong hover:bg-theme-card",
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
                      : "bg-theme-surface border-theme-base text-theme-tertiary hover:text-theme-secondary hover:border-theme-strong hover:bg-theme-card",
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

      {/* Tune In — Newsletter */}
      <section id="tune-in" className="py-16 px-4 border-t border-theme-subtle">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll variant="fade-up" duration={700}>
            <div className="card-cosmic rounded-2xl p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
                  <Radio className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Tune In</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3 text-theme-primary">
                  Workforce intelligence, delivered.
                </h2>
                <p className="text-theme-tertiary max-w-lg mx-auto">
                  The essential briefing for CE and workforce development teams.
                  Labor market signals, industry spotlights, and actionable intel — 3× a week. Free.
                </p>
              </div>

              {/* Sample items */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-theme-surface rounded-lg p-4 border border-theme-subtle">
                  <div className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-2">📊 Labor Market Signal</div>
                  <p className="text-theme-tertiary text-sm leading-relaxed">One key data point shaping workforce demand this week.</p>
                </div>
                <div className="bg-theme-surface rounded-lg p-4 border border-theme-subtle">
                  <div className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-2">📰 Workforce News</div>
                  <p className="text-theme-tertiary text-sm leading-relaxed">Headlines your team needs to know, with context on why they matter.</p>
                </div>
                <div className="bg-theme-surface rounded-lg p-4 border border-theme-subtle">
                  <div className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-2">🏭 Industry Spotlight</div>
                  <p className="text-theme-tertiary text-sm leading-relaxed">One sector in focus — what&apos;s growing and what it means for programs.</p>
                </div>
              </div>

              <TuneInForm />
            </div>
          </AnimateOnScroll>
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
              The July 2026 deadline doesn&apos;t move. Get a free Pell Readiness Check and know
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

/* ─── Tune In Newsletter Form ─────────────────────────────────────────── */

function TuneInForm() {
  const [formData, setFormData] = useState({ email: '', firstName: '', institution: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Something went wrong. Try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error — please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
          <Check className="h-6 w-6 text-teal-400" />
        </div>
        <h3 className="font-heading font-bold text-theme-primary text-lg mb-1">You&apos;re tuned in.</h3>
        <p className="text-theme-tertiary text-sm">Your first edition arrives Monday, Wednesday, or Friday — whichever comes first.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="First name"
          value={formData.firstName}
          onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
          className="flex-1 bg-theme-input border border-theme-base rounded-lg px-4 py-2.5 text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        <InstitutionTypeahead
          value={formData.institution}
          onChange={(val) => setFormData(p => ({ ...p, institution: val }))}
          placeholder="Institution"
        />
      </div>
      <div className="flex gap-3">
        <input
          type="email"
          required
          placeholder="Work email *"
          value={formData.email}
          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
          className="flex-1 bg-theme-input border border-theme-base rounded-lg px-4 py-2.5 text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn-cosmic btn-cosmic-primary text-sm py-2.5 px-6 disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'submitting' ? 'Subscribing…' : (
            <>
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Subscribe
            </>
          )}
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-red-400">{errorMsg}</p>}
      <p className="text-theme-muted text-xs text-center">Free. No spam. Unsubscribe anytime.</p>
    </form>
  );
}
