'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface PipelineRun {
  id: string;
  project_id: string;
  created_at: string;
  pipeline_version: string;
  model: string;
  report_id: string | null;
  prompt_version: string | null;
  report_template: string;
  config: Record<string, any>;
  runtime_seconds: number | null;
  total_tokens: number | null;
  estimated_cost_usd: number | null;
  agents_run: string[];
  agent_scores: Record<string, number>;
  composite_score: number | null;
  recommendation: string | null;
  citation_corrections: number;
  citation_warnings: number;
  intel_tables_used: number;
  tiger_team_enabled: boolean;
  review_scores: ReviewScores | null;
  review_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  report_version: number;
  report_markdown_hash: string | null;
  report_page_count: number | null;
  report_size_kb: number | null;
  validation_projects: {
    program_name: string;
    client_name: string;
    status: string;
  } | null;
}

interface ReviewScores {
  accuracy: number;
  narrative: number;
  actionability: number;
  citations: number;
  formatting: number;
  overall: number;
}

interface ResearchComponent {
  id: string;
  project_id: string;
  component_type: string;
  agent_persona: string;
  markdown_output: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface ProjectMeta {
  program_name: string | null;
  client_name: string | null;
  status: string;
  created_at: string;
}

interface RunEvent {
  id: string;
  pipeline_run_id: string | null;
  project_id: string;
  event_type: string;
  stage_key: string | null;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata: Record<string, any>;
  created_at: string;
}

const REVIEW_DIMENSIONS = [
  { key: 'accuracy', label: 'Data Accuracy', help: 'Were BLS/IPEDS/O*NET numbers correct?' },
  { key: 'narrative', label: 'Narrative Quality', help: 'Did the exec summary read like a consultant wrote it?' },
  { key: 'actionability', label: 'Actionability', help: 'Were recommendations specific and useful?' },
  { key: 'citations', label: 'Citation Quality', help: 'Were sources real, specific, and verifiable?' },
  { key: 'formatting', label: 'Formatting', help: 'Did the PDF look professional?' },
  { key: 'overall', label: 'Overall', help: 'Would you send this to a client as-is?' },
] as const;

const AGENT_LABELS: Record<string, string> = {
  labor_market: 'Labor Market',
  competitive_landscape: 'Competitive',
  learner_demand: 'Learner Demand',
  financial_viability: 'Financial',
  institutional_fit: 'Institutional Fit',
  regulatory_compliance: 'Regulatory',
  employer_demand: 'Employer Demand',
  tiger_team_synthesis: 'Tiger Team Synthesis',
  citation_verification: 'Citation Verification',
};

type ModelProfileOption = {
  id: string;
  label: string;
  model: string;
  help: string;
};

const FALLBACK_MODEL_PROFILE_OPTIONS: ModelProfileOption[] = [
  {
    id: 'balanced-sonnet',
    label: 'Balanced (Sonnet 4.6)',
    model: 'claude-sonnet-4-6',
    help: 'Default quality/speed tradeoff for production runs.',
  },
  {
    id: 'deep-opus',
    label: 'Deep Reasoning (Opus 4.6)',
    model: 'claude-opus-4-6',
    help: 'Higher-depth analysis, slower and costlier.',
  },
  {
    id: 'fast-haiku',
    label: 'Fast Draft (Haiku 3.5)',
    model: 'claude-3-5-haiku-20241022',
    help: 'Cheapest/faster checks and dry runs.',
  },
  {
    id: 'custom',
    label: 'Custom model',
    model: '',
    help: 'Use a custom model string.',
  },
];

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-slate-400 text-sm">--</span>;
  const color = score >= 4 ? 'bg-emerald-100 text-emerald-700' :
                score >= 3 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>{score}/5</span>;
}

function CompositeScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-slate-400">--</span>;
  const color = score >= 7 ? 'bg-emerald-100 text-emerald-700' :
                score >= 5 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700';
  return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${color}`}>{score}/10</span>;
}

function RecommendationBadge({ rec }: { rec: string | null }) {
  if (!rec) return null;
  const lower = rec.toLowerCase();
  const color = lower.includes('strong') && lower.includes('proceed') ? 'bg-emerald-100 text-emerald-700' :
                lower.includes('proceed') ? 'bg-blue-100 text-blue-700' :
                lower.includes('caution') ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700';
  return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${color}`}>{rec}</span>;
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [allRuns, setAllRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [scores, setScores] = useState<ReviewScores>({
    accuracy: 3, narrative: 3, actionability: 3, citations: 3, formatting: 3, overall: 3,
  });
  const [notes, setNotes] = useState('');
  const [components, setComponents] = useState<ResearchComponent[]>([]);
  const [projectMeta, setProjectMeta] = useState<ProjectMeta | null>(null);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeStatus, setResumeStatus] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>('balanced-sonnet');
  const [selectedModel, setSelectedModel] = useState<string>('claude-sonnet-4-6');
  const [profileOptions, setProfileOptions] = useState<ModelProfileOption[]>(FALLBACK_MODEL_PROFILE_OPTIONS);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!run?.id) {
      setEvents([]);
      return;
    }
    fetchEvents(run.id);
  }, [run?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadModelProfiles = async () => {
      try {
        const res = await fetch('/api/admin/model-profiles');
        const data = await res.json().catch(() => []);
        if (!res.ok || !Array.isArray(data)) return;

        const mapped: ModelProfileOption[] = data
          .filter((p: any) => p?.is_active)
          .map((p: any) => ({
            id: p.slug,
            label: p.display_name,
            model: p.model,
            help: p.description || `Profile ${p.slug}`,
          }));

        const custom = FALLBACK_MODEL_PROFILE_OPTIONS.find((p) => p.id === 'custom');
        const next = [...mapped, ...(custom ? [custom] : [])];
        if (!cancelled && next.length > 0) {
          setProfileOptions(next);
        }
      } catch {
        // Keep fallback options
      }
    };

    loadModelProfiles();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!run) return;

    const runProfile = typeof run.config?.modelProfile === 'string' ? run.config.modelProfile : '';
    const runModel = typeof run.config?.model === 'string' ? run.config.model : run.model;

    if (runProfile) {
      setSelectedProfile(runProfile);
    } else {
      const matched = profileOptions.find((p) => p.model === runModel);
      setSelectedProfile(matched?.id || 'custom');
    }

    setSelectedModel(runModel || 'claude-sonnet-4-6');
  }, [run, profileOptions]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch latest pipeline run for this project
      const runsRes = await fetch(`/api/admin/pipeline-runs?project_id=${id}&limit=20`);
      let hasRuns = false;
      if (runsRes.ok) {
        const runs: PipelineRun[] = await runsRes.json();
        setAllRuns(runs);
        if (runs.length > 0) {
          hasRuns = true;
          const latest = runs[0];
          setRun(latest);
          if (latest.review_scores) {
            setScores(latest.review_scores);
          }
          setNotes(latest.review_notes || '');
        }
      } else {
        const errText = await runsRes.text();
        console.error('[Detail] API error:', runsRes.status, errText);
        setError(`API returned ${runsRes.status}: ${errText}`);
      }

      // If no pipeline runs, fall back to research_components
      if (!hasRuns) {
        const compRes = await fetch(`/api/admin/research-components?project_id=${id}`);
        if (compRes.ok) {
          const result = await compRes.json();
          setComponents(result.components || []);
          if (result.project) setProjectMeta(result.project);
        }
      }

      // Check if a report exists for this project
      const reportRes = await fetch(`/api/admin/pipeline-runs/${id}/report-token`);
      if (reportRes.ok) {
        const { hasReport } = await reportRes.json();
        if (hasReport) setReportToken(id as string); // Use project ID as token for admin view
      }
    } catch (e: any) {
      console.error('[Detail] Fetch error:', e);
      setError(e.message);
    }

    setLoading(false);
  };

  const fetchEvents = async (runId: string) => {
    setEventsLoading(true);
    try {
      const res = await fetch(`/api/admin/pipeline-runs/${runId}/events?limit=200`);
      if (res.ok) {
        const data: RunEvent[] = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const selectRun = (r: PipelineRun) => {
    setRun(r);
    if (r.review_scores) {
      setScores(r.review_scores);
    } else {
      setScores({ accuracy: 3, narrative: 3, actionability: 3, citations: 3, formatting: 3, overall: 3 });
    }
    setNotes(r.review_notes || '');
  };

  const submitReview = async () => {
    if (!run) return;
    setSaving(true);

    const res = await fetch(`/api/admin/pipeline-runs/${run.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        review_scores: scores,
        review_notes: notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'matt',
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setRun(updated);
      setAllRuns(prev => prev.map(r => r.id === updated.id ? updated : r));
    }

    setSaving(false);
  };

  const onProfileChange = (profileId: string) => {
    setSelectedProfile(profileId);
    const profile = profileOptions.find((p) => p.id === profileId);
    if (profile && profile.model) {
      setSelectedModel(profile.model);
    }
  };

  const resumeFromCheckpoint = async () => {
    if (!run) return;
    setResumeLoading(true);
    setResumeStatus(null);

    try {
      const res = await fetch(`/api/admin/pipeline-runs/${run.id}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          modelProfile: selectedProfile,
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResumeStatus(payload?.error || 'Failed to start resume');
      } else {
        const activeModel = payload?.model || selectedModel;
        setRun((prev) => prev
          ? {
              ...prev,
              model: activeModel,
              config: {
                ...(prev.config || {}),
                model: activeModel,
                modelProfile: selectedProfile,
              },
            }
          : prev
        );
        setResumeStatus(`Resume started with ${activeModel}. Refresh in ~20–30s to see new events.`);
        fetchEvents(run.id);
      }
    } catch (error) {
      setResumeStatus(error instanceof Error ? error.message : 'Failed to start resume');
    } finally {
      setResumeLoading(false);
    }
  };

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>;
  }

  const project = run?.validation_projects;
  const displayName = project?.program_name || projectMeta?.program_name || 'Report';
  const displayClient = project?.client_name || projectMeta?.client_name || 'Unknown';

  const failedStages = new Set(events.filter(e => e.event_type.includes('failed')).map(e => e.stage_key).filter(Boolean));
  const recoveredStages = new Set(
    events
      .filter(e => e.event_type.includes('completed') && e.stage_key && failedStages.has(e.stage_key))
      .map(e => e.stage_key)
  );
  const retryEvents = events.filter(e => e.event_type === 'stage_retry_scheduled').length;

  const toggleComponent = (compId: string) => {
    setExpandedComponents(prev => {
      const next = new Set(prev);
      if (next.has(compId)) next.delete(compId);
      else next.add(compId);
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/reports" className="hover:text-slate-900">Reports</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{displayName}</span>
      </div>

      {error && (
        <Card>
          <CardContent className="py-6 text-center text-red-500 text-sm">
            Error loading pipeline data: {error}
          </CardContent>
        </Card>
      )}

      {!run && !error && components.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No pipeline runs found for this project. Run the validation pipeline first.
            <div className="text-xs mt-2 text-slate-300">Project ID: {id}</div>
          </CardContent>
        </Card>
      ) : !run && components.length > 0 ? (
        <>
          {/* Partial report banner */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-amber-600 text-lg">&#9888;</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Pipeline incomplete — showing raw agent outputs</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {components.filter(c => c.status === 'completed').length} of {components.length} agents completed.
                  No final report was generated.
                </p>
              </div>
            </div>
            <a
              href={`/api/admin/reports/${id}/export-raw`}
              className="text-sm font-medium text-amber-700 px-4 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 transition-colors whitespace-nowrap"
            >
              ↓ Export Raw
            </a>
          </div>

          {/* Project header */}
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">{displayName}</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {displayClient}
              {projectMeta?.created_at && <> &middot; {new Date(projectMeta.created_at).toLocaleDateString()}</>}
              {projectMeta?.status && (
                <span className="ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                  {projectMeta.status}
                </span>
              )}
            </p>
          </div>

          {/* Agent output cards */}
          <div className="space-y-3">
            {components.map((comp) => (
              <Card key={comp.id} className="overflow-hidden">
                <button
                  onClick={() => toggleComponent(comp.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      comp.status === 'completed' ? 'bg-emerald-500' :
                      comp.status === 'error' ? 'bg-red-500' :
                      'bg-slate-300'
                    }`} />
                    <div>
                      <span className="text-sm font-medium text-slate-900">
                        {AGENT_LABELS[comp.component_type] || comp.component_type}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">{comp.agent_persona}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      comp.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      comp.status === 'error' ? 'bg-red-50 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {comp.status}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {expandedComponents.has(comp.id) ? '▾' : '▸'}
                    </span>
                  </div>
                </button>
                {expandedComponents.has(comp.id) && (
                  <CardContent className="border-t border-slate-100 pt-4">
                    {comp.error_message && (
                      <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">
                        {comp.error_message}
                      </div>
                    )}
                    {comp.markdown_output ? (
                      <div className="prose prose-sm prose-slate max-w-none text-sm whitespace-pre-wrap">
                        {comp.markdown_output}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No markdown output available</p>
                    )}
                    {comp.completed_at && (
                      <p className="text-xs text-slate-400 mt-3">
                        Completed {new Date(comp.completed_at).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </>
      ) : run ? (
        <>
          {/* Top: Report Overview */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-slate-900">
                {project?.program_name || 'Report'}
              </h1>
              {run.report_id && (
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded ml-3 align-middle">
                  {run.report_id}
                </span>
              )}
              <p className="text-slate-500 mt-1 text-sm">
                {project?.client_name || 'Unknown'} &middot; {new Date(run.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CompositeScoreBadge score={run.composite_score} />
              <RecommendationBadge rec={run.recommendation} />
              {reportToken && (
                <>
                  <Link
                    href={`/admin/reports/${id}/view`}
                    target="_blank"
                    className="text-sm font-medium text-slate-700 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    View Report ↗
                  </Link>
                  <a
                    href={`/api/admin/pipeline-runs/${id}/download-pdf`}
                    className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 inline-block"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #14b8a6 100%)' }}
                  >
                    ↓ Download PDF
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content — 2 cols */}
            <div className="lg:col-span-2 space-y-6">

              {/* Pipeline Run Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-500">Pipeline Run Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Model</p>
                      <p className="text-slate-900 font-medium">{run.model}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Pipeline</p>
                      <p className="text-slate-900 font-medium">{run.pipeline_version}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Template</p>
                      <p className="text-slate-900 font-medium">{run.report_template}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Runtime</p>
                      <p className="text-slate-900 font-medium">
                        {run.runtime_seconds ? `${Math.round(run.runtime_seconds)}s` : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Tokens</p>
                      <p className="text-slate-900 font-medium">
                        {run.total_tokens ? run.total_tokens.toLocaleString() : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Est. Cost</p>
                      <p className="text-slate-900 font-medium">
                        {run.estimated_cost_usd ? `$${run.estimated_cost_usd}` : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Intel Sources</p>
                      <p className="text-slate-900 font-medium">{run.intel_tables_used}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Tiger Team</p>
                      <p className="text-slate-900 font-medium">{run.tiger_team_enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>

                  {/* Agent Scores */}
                  {run.agent_scores && Object.keys(run.agent_scores).length > 0 && (
                    <div className="mt-6">
                      <p className="text-slate-400 text-xs uppercase font-semibold mb-3">Agent Scores</p>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(run.agent_scores).map(([agent, score]) => (
                            <div key={agent} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
                              <span className="text-xs text-slate-600">{AGENT_LABELS[agent] || agent}</span>
                              <span className={`text-xs font-bold ${
                                (score as number) >= 7 ? 'text-emerald-600' :
                                (score as number) >= 5 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>{score as number}/10</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Citation Stats */}
                  <div className="mt-6 flex gap-6 text-sm">
                    <div>
                      <span className="text-slate-400">Citations corrected:</span>{' '}
                      <span className="font-medium text-slate-700">{run.citation_corrections}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Citation warnings:</span>{' '}
                      <span className="font-medium text-slate-700">{run.citation_warnings}</span>
                    </div>
                    {run.prompt_version && (
                      <div>
                        <span className="text-slate-400">Prompt version:</span>{' '}
                        <span className="font-medium text-slate-700">{run.prompt_version}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Run Trace */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-500">Run Trace</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">
                      Failures: {failedStages.size} • Recovered: {recoveredStages.size} • Retries: {retryEvents}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={selectedProfile}
                      onChange={(e) => onProfileChange(e.target.value)}
                      className="h-10 sm:h-8 rounded-md border border-slate-200 bg-white px-2 text-sm sm:text-[11px] text-slate-600"
                    >
                      {profileOptions.map((profile) => (
                        <option key={profile.id} value={profile.id}>{profile.label}</option>
                      ))}
                    </select>
                    <input
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        setSelectedProfile('custom');
                      }}
                      placeholder="Model (e.g. claude-sonnet-4-6)"
                      className="h-10 sm:h-8 w-full sm:w-56 rounded-md border border-slate-200 px-2 text-sm sm:text-[11px] text-slate-700"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resumeFromCheckpoint}
                      disabled={resumeLoading || !run || !selectedModel}
                      className="h-10 sm:h-8 text-sm sm:text-xs"
                    >
                      {resumeLoading ? 'Resuming…' : 'Resume from checkpoint'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {resumeStatus && (
                    <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {resumeStatus}
                    </div>
                  )}
                  <p className="mb-3 text-[11px] text-slate-400">
                    Profile: {profileOptions.find((p) => p.id === selectedProfile)?.help || 'Custom model override for this resume run.'}
                  </p>
                  {eventsLoading ? (
                    <p className="text-sm text-slate-400">Loading trace...</p>
                  ) : events.length === 0 ? (
                    <p className="text-sm text-slate-400">No telemetry events found for this run.</p>
                  ) : (
                    <div className="space-y-2">
                      {events.map((event) => {
                        const status = event.event_type.includes('failed')
                          ? 'failed'
                          : event.event_type.includes('skipped')
                            ? 'skipped'
                            : event.event_type.includes('started')
                              ? 'started'
                              : 'completed';
                        const statusClass =
                          status === 'failed'
                            ? 'bg-red-50 text-red-700'
                            : status === 'skipped'
                              ? 'bg-amber-50 text-amber-700'
                              : status === 'started'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-emerald-50 text-emerald-700';
                        return (
                          <div key={event.id} className="border border-slate-100 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${statusClass}`}>
                                  {status}
                                </span>
                                <span className="text-xs text-slate-500 truncate">
                                  {event.stage_key || event.event_type}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                {new Date(event.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mt-1">{event.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Citation Details — Internal Only */}
              {run.config?.citationDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-500">
                      Citation Review <span className="text-xs text-red-400 ml-2">INTERNAL ONLY</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {run.config.citationDetails.corrections?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-amber-600 uppercase mb-2">Corrections Applied ({run.config.citationDetails.corrections.length})</h4>
                        <div className="space-y-2">
                          {run.config.citationDetails.corrections.map((c: any, i: number) => (
                            <div key={i} className="text-xs bg-amber-50 border border-amber-100 rounded-lg p-3">
                              <div className="font-medium text-slate-700 mb-1">[{c.componentType}] {c.reason}</div>
                              <div className="text-slate-400"><span className="line-through">{c.original?.slice(0, 100)}...</span></div>
                              <div className="text-slate-600 mt-1">→ {c.corrected?.slice(0, 100)}...</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {run.config.citationDetails.warnings?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-red-600 uppercase mb-2">Warnings ({run.config.citationDetails.warnings.length})</h4>
                        <div className="space-y-1">
                          {run.config.citationDetails.warnings.map((w: string, i: number) => (
                            <div key={i} className="text-xs text-red-700 bg-red-50 border border-red-100 rounded p-2">
                              {w}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quality Review Form */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-500">Quality Review</CardTitle>
                  {run.reviewed_at && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs">
                      Reviewed {new Date(run.reviewed_at).toLocaleDateString()}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-5">
                  {REVIEW_DIMENSIONS.map(dim => (
                    <div key={dim.key}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-slate-700">{dim.label}</span>
                          <span className="text-xs text-slate-400 ml-2">{dim.help}</span>
                        </div>
                        <ScoreBadge score={scores[dim.key as keyof ReviewScores]} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={1}
                          max={5}
                          step={1}
                          value={scores[dim.key as keyof ReviewScores]}
                          onChange={(e) => setScores(prev => ({ ...prev, [dim.key]: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex gap-1 text-xs text-slate-400 min-w-[120px] justify-between">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What stood out? What needs improvement?"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={submitReview}
                    disabled={saving}
                    className="w-full"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #14b8a6 100%)' }}
                  >
                    {saving ? 'Saving...' : run.reviewed_at ? 'Update Review' : 'Submit Review'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar — Version History */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Version History ({allRuns.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {allRuns.length === 0 && (
                    <p className="text-sm text-slate-400">No runs yet</p>
                  )}
                  {allRuns.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectRun(r)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                        r.id === run.id
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700">
                          {r.report_id ? (
                            <span className="font-mono">{r.report_id}</span>
                          ) : (
                            <>{r.pipeline_version} &middot; {r.model.replace('claude-', '')}</>
                          )}
                        </span>
                        {r.reviewed_at ? (
                          <QualityBadge score={r.review_scores?.overall ?? null} />
                        ) : (
                          <span className="text-xs text-slate-400">Unreviewed</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-400">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {r.runtime_seconds ? `${Math.round(r.runtime_seconds)}s` : ''}
                        </span>
                      </div>
                      {r.composite_score != null && (
                        <div className="mt-1">
                          <span className={`text-xs font-semibold ${
                            r.composite_score >= 7 ? 'text-emerald-600' :
                            r.composite_score >= 5 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>{r.composite_score}/10</span>
                        </div>
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-500">Report Output</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Version</span>
                    <span className="text-slate-700 font-medium">{run.report_version}</span>
                  </div>
                  {run.report_page_count && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pages</span>
                      <span className="text-slate-700 font-medium">{run.report_page_count}</span>
                    </div>
                  )}
                  {run.report_size_kb && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Size</span>
                      <span className="text-slate-700 font-medium">{run.report_size_kb} KB</span>
                    </div>
                  )}
                  {run.report_markdown_hash && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hash</span>
                      <span className="text-slate-700 font-mono text-xs">{run.report_markdown_hash.slice(0, 12)}...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile sticky actions */}
          <div className="md:hidden fixed bottom-14 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-3 py-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resumeFromCheckpoint}
                disabled={resumeLoading || !selectedModel}
                className="flex-1 h-11"
              >
                {resumeLoading ? 'Resuming…' : 'Resume'}
              </Button>
              <Button
                onClick={submitReview}
                disabled={saving}
                className="flex-1 h-11"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #14b8a6 100%)' }}
              >
                {saving ? 'Saving…' : 'Save Review'}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function QualityBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-xs text-slate-400">--</span>;
  const color = score >= 4 ? 'bg-emerald-100 text-emerald-700' :
                score >= 3 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700';
  return <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${color}`}>{score}/5</span>;
}
