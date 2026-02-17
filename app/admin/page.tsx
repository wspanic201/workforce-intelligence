'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Order {
  id: string;
  created_at: string;
  contact_name: string;
  contact_email: string;
  institution_name: string;
  service_tier: string;
  amount_cents: number;
  payment_status: string;
  order_status: string;
  admin_created: boolean;
  delivered_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  intake: 'bg-gray-100 text-gray-700',
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-700',
  queued: 'bg-indigo-100 text-indigo-700',
  running: 'bg-purple-100 text-purple-700',
  complete: 'bg-emerald-100 text-emerald-700',
  review: 'bg-amber-100 text-amber-800',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  intake: 'Intake',
  pending_payment: 'Awaiting Payment',
  paid: 'Paid — Ready',
  queued: 'Queued',
  running: 'Pipeline Running',
  complete: 'Complete',
  review: 'Under Review',
  delivered: 'Delivered ✓',
  cancelled: 'Cancelled',
};

const TIER_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  validation: 'Validation',
  discovery_validation: 'Discovery + Validation',
  full_lifecycle: 'Full Lifecycle',
};

function formatMoney(cents: number): string {
  if (cents === 0) return '—';
  return `$${(cents / 100).toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    const res = await fetch(`/api/admin/orders${params}`);
    if (res.ok) {
      setOrders(await res.json());
    }
    setLoading(false);
  };

  // Stats
  const totalRevenue = orders.reduce((sum, o) => 
    o.payment_status === 'paid' || o.payment_status === 'waived' ? sum + o.amount_cents : sum, 0
  );
  const activeOrders = orders.filter(o => ['paid', 'queued', 'running', 'review'].includes(o.order_status));
  const deliveredOrders = orders.filter(o => o.order_status === 'delivered');

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Ready' },
    { key: 'running', label: 'Running' },
    { key: 'review', label: 'Review' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage client orders and pipeline runs</p>
        </div>
        <Link href="/admin/intake">
          <Button>+ New Order</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{deliveredOrders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filterButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === btn.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <p className="text-slate-500 text-center py-12">Loading orders...</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No orders yet.</p>
            <Link href="/admin/intake" className="text-blue-600 hover:underline text-sm mt-2 block">
              Create your first order →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Order</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Institution</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Tier</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-500">
                      WOS-{shortId(order.id)}
                    </span>
                    {order.admin_created && (
                      <span className="ml-1 text-xs text-slate-400" title="Admin-created">⚙️</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {order.institution_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.contact_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-600">
                      {TIER_LABELS[order.service_tier] || order.service_tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatMoney(order.amount_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_COLORS[order.order_status] || 'bg-gray-100'} border-0 text-xs`}>
                      {STATUS_LABELS[order.order_status] || order.order_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View →
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
