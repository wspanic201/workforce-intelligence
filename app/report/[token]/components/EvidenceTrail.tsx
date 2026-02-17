'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink, Building2, TrendingUp, GraduationCap, Newspaper, Database, MapPin } from 'lucide-react';
import type { EvidencePoint } from '../types';

type SourceType = 'government' | 'employer' | 'economic_development' | 'academic' | 'news' | 'other';

function classifySource(source: string): SourceType {
  const s = source.toLowerCase();
  if (s.includes('bls') || s.includes('census') || s.includes('labor') || s.includes('workforce') || s.includes('government') || s.includes('department')) return 'government';
  if (s.includes('employer') || s.includes('hiring') || s.includes('linkedin') || s.includes('indeed') || s.includes('job posting')) return 'employer';
  if (s.includes('economic development') || s.includes('wake county') || s.includes('durham') || s.includes('rtp') || s.includes('nccommerce') || s.includes('nc booked') || s.includes('triangle')) return 'economic_development';
  if (s.includes('university') || s.includes('college') || s.includes('academic') || s.includes('research') || s.includes('ncsu') || s.includes('unc')) return 'academic';
  if (s.includes('news') || s.includes('article') || s.includes('press') || s.includes('report') || s.includes('announcement')) return 'news';
  return 'other';
}

const SOURCE_CONFIG: Record<SourceType, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge: string;
  dot: string;
}> = {
  government: {
    icon: Database,
    label: 'Gov / BLS Data',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    dot: 'bg-blue-400',
  },
  employer: {
    icon: Building2,
    label: 'Employer Signal',
    badge: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    dot: 'bg-violet-400',
  },
  economic_development: {
    icon: TrendingUp,
    label: 'Economic Development',
    badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    dot: 'bg-teal-400',
  },
  academic: {
    icon: GraduationCap,
    label: 'Academic / Research',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    dot: 'bg-amber-400',
  },
  news: {
    icon: Newspaper,
    label: 'News / Media',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    dot: 'bg-rose-400',
  },
  other: {
    icon: MapPin,
    label: 'Regional Data',
    badge: 'bg-white/10 text-white/50 border border-white/20',
    dot: 'bg-white/40',
  },
};

interface EvidenceItemProps {
  item: EvidencePoint;
  index: number;
}

function EvidenceItem({ item, index }: EvidenceItemProps) {
  const [open, setOpen] = useState(false);
  const sourceType = classifySource(item.source);
  const config = SOURCE_CONFIG[sourceType];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border transition-all duration-200 overflow-hidden ${
        open
          ? 'border-white/12 bg-white/[0.04]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03]'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-3 flex items-start gap-3"
      >
        <span className="mt-0.5 shrink-0">
          <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1 ${config.dot}`} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/80 leading-relaxed line-clamp-2 group-hover:line-clamp-none">
            {item.point}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-white/30 transition-transform duration-200 mt-0.5 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-0">
          <div className="pl-4 border-l-2 border-white/10">
            <p className="text-sm text-white/80 leading-relaxed mb-2">{item.point}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                <Icon className="w-3 h-3" />
                {config.label}
              </span>
              <span className="text-xs text-white/40">{item.source}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EvidenceTrailProps {
  evidence: EvidencePoint[];
  title?: string;
}

export function EvidenceTrail({ evidence, title = 'Evidence Trail' }: EvidenceTrailProps) {
  if (!evidence?.length) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
        <span className="inline-block w-4 h-px bg-white/20" />
        {title}
        <span className="text-white/20 font-normal">({evidence.length} signals)</span>
      </h4>
      <div className="space-y-1.5">
        {evidence.map((item, i) => (
          <EvidenceItem key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

// Source type badge for use in other components
export function SourceBadge({ source }: { source: string }) {
  const type = classifySource(source);
  const config = SOURCE_CONFIG[type];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Export classifySource for use in AuditTrail
export { classifySource, SOURCE_CONFIG };
export type { SourceType };
