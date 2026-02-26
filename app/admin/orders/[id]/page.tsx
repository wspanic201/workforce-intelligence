'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  contact_title: string | null;
  institution_name: string;
  institution_data: {
    primaryCity?: string;
    state?: string;
    additionalCities?: string[];
    counties?: string;
    metroArea?: string;
    focusAreas?: string;
    additionalContext?: string;
    specificProgram?: string;
  };
  service_tier: string;
  amount_cents: number;
  currency: string;
  payment_status: string;
  order_status: string;
  pipeline_started_at: string | null;
  pipeline_completed_at: string | null;
  pipeline_metadata: any;
  discovery_cache_key: string | null;
  report_storage_path: string | null;
  report_markdown: string | null;
  delivery_token: string;
  admin_created: boolean;
  validation_project_id: string | null;
  pipeline_run_id: string | null;
  admin_notes: string | null;
  delivered_at: string | null;
}

const STATUS_FLOW: Record<string, string[]> = {
  intake: ['paid', 'cancelled'],
  pending_payment: ['paid', 'cancelled'],
  paid: ['queued', 'running', 'cancelled'],
  queued: ['running', 'cancelled'],
  running: ['complete', 'review'],
  complete: ['review', 'delivered'],
  review: ['delivered', 'running'], // can re-run
  delivered: [], // terminal
  cancelled: ['intake'], // can reopen
};

const TIER_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  validation: 'Validation',
  discovery_validation: 'Discovery + Validation',
  full_lifecycle: 'Full Lifecycle',
};

function formatMoney(cents: number): string {
  if (cents === 0) return 'Waived';
  return `$${(cents / 100).toLocaleString()}`;
}

function buildCLICommand(order: Order): string {
  const d = order.institution_data;
  const tier = order.service_tier;

  let cmd = 'npx tsx cli.ts';

  if (tier === 'discovery') {
    cmd += ' discover';
  } else if (tier === 'validation') {
    cmd += ' validate';
    if (order.discovery_cache_key) {
      cmd += ` \\\n  --cache "${order.discovery_cache_key}"`;
    }
    if (d.specificProgram) {
      cmd += ` \\\n  --program "${d.specificProgram}"`;
    }
    return cmd;
  } else if (tier === 'discovery_validation') {
    cmd += ' pipeline';
  } else {
    cmd += ' pipeline';
  }

  cmd += ` \\\n  --college "${order.institution_name}"`;
  if (d.primaryCity) cmd += ` \\\n  --city "${d.primaryCity}"`;
  if (d.state) cmd += ` \\\n  --state "${d.state}"`;
  if (d.additionalCities?.length) cmd += ` \\\n  --cities "${d.additionalCities.join(',')}"`;
  if (d.counties) cmd += ` \\\n  --counties "${d.counties}"`;
  if (d.metroArea) cmd += ` \\\n  --metro "${d.metroArea}"`;
  if (d.focusAreas) cmd += ` \\\n  --focus "${d.focusAreas}"`;

  if (tier === 'discovery_validation' || tier === 'full_lifecycle') {
    cmd += ' \\\n  --top 3';
  }

  cmd += ' \\\n  --json';

  return cmd;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [startingRun, setStartingRun] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
      setNotes(data.admin_notes || '');
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    const updates: Record<string, any> = { order_status: newStatus };

    if (newStatus === 'running') {
      updates.pipeline_started_at = new Date().toISOString();
    } else if (newStatus === 'complete' || newStatus === 'review') {
      updates.pipeline_completed_at = new Date().toISOString();
    } else if (newStatus === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      await fetchOrder();
    }
    setUpdating(false);
  };

  const saveNotes = async () => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes }),
    });
    await fetchOrder();
  };

  const startPipelineRun = async () => {
    setStartingRun(true);
    setRunMessage(null);

    const res = await fetch(`/api/admin/orders/${id}/run`, { method: 'POST' });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setRunMessage(`Pipeline started. Project ID: ${data.projectId}`);
      await fetchOrder();
    } else {
      setRunMessage(data?.error || 'Failed to start pipeline');
    }

    setStartingRun(false);
  };

  const copyCommand = () => {
    if (!order) return;
    navigator.clipboard.writeText(buildCLICommand(order));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteOrder = async () => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    router.push('/admin');
  };

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>;
  }

  if (!order) {
    return <p className="text-red-500 text-center py-12">Order not found</p>;
  }

  const nextStatuses = STATUS_FLOW[order.order_status] || [];
  const d = order.institution_data;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-900">Orders</Link>
        <span>/</span>
        <span className="font-mono">WOS-{order.id.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            {order.institution_name}
          </h1>
          <p className="text-slate-500 mt-1">
            {TIER_LABELS[order.service_tier]} • {formatMoney(order.amount_cents)} • {order.payment_status}
          </p>
        </div>
        <Badge className={`text-sm px-3 py-1 ${
          order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
          order.order_status === 'running' ? 'bg-purple-100 text-purple-700' :
          order.order_status === 'paid' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        } border-0`}>
          {order.order_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      </div>

      {/* Execution State */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">Execution State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {order.validation_project_id ? (
            <div className="space-y-1">
              <p><strong>Pipeline project:</strong> <span className="font-mono">{order.validation_project_id}</span></p>
              <p className="text-emerald-700">This order has been linked to a real validation pipeline project.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-amber-700"><strong>No pipeline project linked yet.</strong> Status changes alone do not start the pipeline.</p>
              <Button
                size="sm"
                onClick={startPipelineRun}
                disabled={startingRun || updating}
              >
                {startingRun ? 'Starting…' : '▶ Run Pipeline Now'}
              </Button>
              <p className="text-xs text-slate-500">This creates a validation project and starts the orchestrator from admin.</p>
            </div>
          )}
          {runMessage && (
            <p className="text-xs text-slate-600">{runMessage}</p>
          )}
        </CardContent>
      </Card>

      {/* Status Actions */}
      {nextStatuses.length > 0 && (
        <Card>
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-slate-600 sm:mr-2">Move to:</span>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map(status => (
                <Button
                  key={status}
                  variant={status === 'delivered' ? 'default' : status === 'cancelled' ? 'destructive' : 'outline'}
                  size="sm"
                  disabled={updating}
                  onClick={() => updateStatus(status)}
                >
                  {status === 'running' ? 'Status: Running' :
                   status === 'delivered' ? '📧 Deliver' :
                   status === 'cancelled' ? '✗ Cancel' :
                   status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>{order.contact_name}</strong></p>
            <p>
              <a href={`mailto:${order.contact_email}`} className="text-blue-600 hover:underline">
                {order.contact_email}
              </a>
            </p>
            {order.contact_phone && <p>{order.contact_phone}</p>}
            {order.contact_title && <p className="text-slate-500">{order.contact_title}</p>}
          </CardContent>
        </Card>

        {/* Institution Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Institution Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {d.primaryCity && <p><strong>City:</strong> {d.primaryCity}, {d.state}</p>}
            {d.additionalCities?.length ? <p><strong>Also:</strong> {d.additionalCities.join(', ')}</p> : null}
            {d.metroArea && <p><strong>Metro:</strong> {d.metroArea}</p>}
            {d.counties && <p><strong>Counties:</strong> {d.counties}</p>}
            {d.focusAreas && <p><strong>Focus:</strong> {d.focusAreas}</p>}
            {d.additionalContext && <p className="text-slate-500 mt-2">{d.additionalContext}</p>}
            {d.specificProgram && <p><strong>Program:</strong> {d.specificProgram}</p>}
          </CardContent>
        </Card>
      </div>

      {/* CLI Command */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-500">CLI Command</CardTitle>
          <Button variant="outline" size="sm" onClick={copyCommand}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap">
            {buildCLICommand(order)}
          </pre>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>📝 Created: {new Date(order.created_at).toLocaleString()}</p>
          {order.pipeline_started_at && (
            <p>▶️ Pipeline started: {new Date(order.pipeline_started_at).toLocaleString()}</p>
          )}
          {order.pipeline_completed_at && (
            <p>✅ Pipeline complete: {new Date(order.pipeline_completed_at).toLocaleString()}</p>
          )}
          {order.delivered_at && (
            <p>📧 Delivered: {new Date(order.delivered_at).toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      {/* Report */}
      {order.report_markdown && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Report Preview</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                window.open(`/api/admin/orders/${order.id}/pdf`, '_blank');
              }}>
                📄 Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const link = `${window.location.origin}/report/${order.delivery_token}`;
                navigator.clipboard.writeText(link);
              }}>
                🔗 Copy Client Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto prose prose-sm">
              <pre className="whitespace-pre-wrap text-xs">{order.report_markdown.slice(0, 2000)}...</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">Admin Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Internal notes about this order..."
            rows={3}
          />
          <Button variant="outline" size="sm" onClick={saveNotes}>
            Save Notes
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardContent className="py-4 flex items-center justify-between">
          <span className="text-sm text-red-600">Delete this order permanently</span>
          <Button variant="destructive" size="sm" onClick={deleteOrder}>
            Delete Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
