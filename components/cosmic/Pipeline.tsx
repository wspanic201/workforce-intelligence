'use client';

import { useState } from 'react';

interface Stage {
  number: number;
  name: string;
  short: string;
  detail: string;
  status: 'built' | 'coming';
}

const stages: Stage[] = [
  {
    number: 1,
    name: 'Discover',
    short: 'Scan your labor market across 74+ live data sources to surface the workforce programs your region actually needs — including hidden opportunities no one else finds.',
    detail:
      'Regional intelligence, employer demand signals, competitive landscape mapping, opportunity scoring, Blue Ocean scanning, and a fully cited 25-page Discovery Brief.',
    status: 'built',
  },
  {
    number: 2,
    name: 'Validate',
    short: 'Deep-dive market validation with financial projections, employer demand verification, and a clear GO or NO-GO recommendation before you invest.',
    detail:
      'Deep analysis across market size, competitive positioning, regulatory requirements, financial viability, learner demand, employer alignment, and institutional fit.',
    status: 'built',
  },
  {
    number: 3,
    name: 'Curriculum Design',
    short: 'Competency mapping, course architecture, and learning outcomes built from real occupation data — not generic templates.',
    detail:
      'Maps skills to occupations using live job posting data, industry certifications, and employer requirements. Produces program structure, credit hours, and prerequisite chains.',
    status: 'coming',
  },
  {
    number: 4,
    name: 'Pathway Dev',
    short: 'Stackable credentials and noncredit-to-credit pathways that give students a clear route from entry to advancement.',
    detail:
      'Articulation mapping, career lattice design, prior learning assessment frameworks, and credential stacking that connects certificates to degrees.',
    status: 'coming',
  },
  {
    number: 5,
    name: 'Content Creation',
    short: 'Syllabi, learning outcomes, assessments, and instructor guides mapped directly to industry competencies.',
    detail:
      'Generates course materials aligned to the curriculum architecture — assessment rubrics, OER-aligned content, lab exercises, and capstone project frameworks.',
    status: 'coming',
  },
  {
    number: 6,
    name: 'Marketing',
    short: 'Recruitment strategy, employer partnership templates, and enrollment campaign blueprints tailored to your region.',
    detail:
      'Demographic targeting, messaging frameworks, digital campaign blueprints, employer co-marketing templates, and ROI-driven enrollment projections.',
    status: 'coming',
  },
  {
    number: 7,
    name: 'Launch',
    short: 'A complete launch playbook — enrollment targets, faculty hiring, facility requirements, and a week-by-week implementation timeline.',
    detail:
      'Operational readiness checklist, technology stack recommendations, adjunct recruitment plan, advisory board formation guide, and go-live countdown.',
    status: 'coming',
  },
  {
    number: 8,
    name: 'Quality Control',
    short: 'Outcomes tracking, employer satisfaction, and continuous improvement loops tied back to the original market data.',
    detail:
      'KPI dashboards, completion and placement rate tracking, employer feedback surveys, re-validation triggers, and accreditation alignment reporting.',
    status: 'coming',
  },
];

export function Pipeline() {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  return (
    <div className="w-full">
      {/* Desktop: horizontal scroll */}
      <div className="hidden lg:block overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-stretch gap-0 min-w-max px-4">
          {stages.map((stage, i) => (
            <div key={stage.number} className="flex items-stretch">
              {/* Stage card */}
              <div
                className={`card-cosmic relative flex flex-col justify-between p-6 w-[220px] min-h-[200px] rounded-xl transition-all duration-500 cursor-pointer ${
                  hoveredStage === i
                    ? 'scale-105 z-10 min-h-[280px] w-[280px]'
                    : 'hover:scale-[1.02]'
                }`}
                onMouseEnter={() => setHoveredStage(i)}
                onMouseLeave={() => setHoveredStage(null)}
              >
                {/* Stage number */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gradient-cosmic font-heading font-bold text-2xl">
                    {String(stage.number).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      stage.status === 'built'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {stage.status === 'built' ? '✅ Built' : 'Coming Soon'}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-heading font-semibold text-white text-lg mb-2">
                  {stage.name}
                </h3>

                {/* Description */}
                <p className="text-white/50 text-sm leading-relaxed">
                  {hoveredStage === i ? stage.detail : stage.short}
                </p>
              </div>

              {/* Connector line */}
              {i < stages.length - 1 && (
                <div className="flex items-center px-1">
                  <div className="w-8 h-[2px] bg-gradient-to-r from-purple-500/50 to-blue-500/50 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-blue-500/50 border-y-[4px] border-y-transparent" />
                    {/* Glow */}
                    <div className="absolute inset-0 blur-sm bg-gradient-to-r from-purple-500/30 to-blue-500/30" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: stacked vertical */}
      <div className="lg:hidden space-y-4 px-4">
        {stages.map((stage, i) => (
          <div key={stage.number} className="relative">
            <div
              className="card-cosmic p-5 rounded-xl cursor-pointer"
              onClick={() =>
                setHoveredStage(hoveredStage === i ? null : i)
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-gradient-cosmic font-heading font-bold text-xl">
                    {String(stage.number).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading font-semibold text-white text-base">
                    {stage.name}
                  </h3>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    stage.status === 'built'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  {stage.status === 'built' ? '✅ Built' : 'Soon'}
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                {hoveredStage === i ? stage.detail : stage.short}
              </p>
            </div>
            {/* Vertical connector */}
            {i < stages.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-[2px] h-4 bg-gradient-to-b from-purple-500/50 to-blue-500/50" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
