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
};

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
  const [scores, setScores] = useState<ReviewScores>({
    accuracy: 3, narrative: 3, actionability: 3, citations: 3, formatting: 3, overall: 3,
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch latest pipeline run for this project
    const runsRes = await fetch(`/api/admin/pipeline-runs?project_id=${id}&limit=20`);
    if (runsRes.ok) {
      const runs: PipelineRun[] = await runsRes.json();
      setAllRuns(runs);
      if (runs.length > 0) {
        const latest = runs[0];
        setRun(latest);
        if (latest.review_scores) {
          setScores(latest.review_scores);
        }
        setNotes(latest.review_notes || '');
      }
    }

    setLoading(false);
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

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>;
  }

  const project = run?.validation_projects;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/reports" className="hover:text-slate-900">Reports</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{project?.program_name || 'Report'}</span>
      </div>

      {!run ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No pipeline runs found for this project. Run the validation pipeline first.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top: Report Overview */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-slate-900">
                {project?.program_name || 'Report'}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                {project?.client_name || 'Unknown'} &middot; {new Date(run.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CompositeScoreBadge score={run.composite_score} />
              <RecommendationBadge rec={run.recommendation} />
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
                          {r.pipeline_version} &middot; {r.model.replace('claude-', '')}
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
        </>
      )}
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
