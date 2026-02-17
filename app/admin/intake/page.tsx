'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

const FOCUS_OPTIONS = [
  'Healthcare', 'Manufacturing', 'Technology', 'Skilled Trades',
  'Business & Finance', 'Transportation & Logistics', 'Education',
  'Agriculture', 'Energy', 'Public Safety', 'Hospitality',
];

const TIER_OPTIONS = [
  { value: 'discovery', label: 'Discovery — Program opportunity scan', price: '$2,500' },
  { value: 'validation', label: 'Validation — Deep-dive on specific program', price: '$2,500' },
  { value: 'discovery_validation', label: 'Discovery + Validation (top 3)', price: '$5,000' },
  { value: 'full_lifecycle', label: 'Full Lifecycle', price: '$7,500+' },
];

export default function AdminIntakePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Contact
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_title: '',
    // Institution
    institution_name: '',
    primaryCity: '',
    state: '',
    additionalCities: '',
    counties: '',
    metroArea: '',
    focusAreas: [] as string[],
    additionalContext: '',
    specificProgram: '',
    // Order
    service_tier: 'discovery',
    amount_cents: 0,
    admin_notes: '',
  });

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleFocus = (area: string) => {
    setForm(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone || null,
          contact_title: form.contact_title || null,
          institution_name: form.institution_name,
          institution_data: {
            primaryCity: form.primaryCity,
            state: form.state,
            additionalCities: form.additionalCities
              ? form.additionalCities.split(',').map(c => c.trim()).filter(Boolean)
              : [],
            counties: form.counties,
            metroArea: form.metroArea,
            focusAreas: form.focusAreas.join(', '),
            additionalContext: form.additionalContext,
            specificProgram: form.specificProgram || undefined,
          },
          service_tier: form.service_tier,
          amount_cents: form.amount_cents,
          admin_notes: form.admin_notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const order = await res.json();
      router.push(`/admin/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">New Order</h1>
        <p className="text-sm text-slate-500 mt-1">Create an order manually (payment waived)</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Service Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Service Tier</CardTitle>
          <CardDescription>What are we delivering?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {TIER_OPTIONS.map(tier => (
              <button
                key={tier.value}
                type="button"
                onClick={() => set('service_tier', tier.value)}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  form.service_tier === tier.value
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-medium text-sm">{tier.label.split('—')[0].trim()}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tier.label.split('—')[1]?.trim()}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">{tier.price}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-sm whitespace-nowrap">Custom amount ($):</Label>
            <Input
              type="number"
              placeholder="0 = waived"
              value={form.amount_cents ? form.amount_cents / 100 : ''}
              onChange={e => set('amount_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              required
              value={form.contact_name}
              onChange={e => set('contact_name', e.target.value)}
              placeholder="Jane Smith"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input
              required
              type="email"
              value={form.contact_email}
              onChange={e => set('contact_email', e.target.value)}
              placeholder="jane@college.edu"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.contact_phone}
              onChange={e => set('contact_phone', e.target.value)}
              placeholder="(555) 555-5555"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.contact_title}
              onChange={e => set('contact_title', e.target.value)}
              placeholder="VP of Instruction"
            />
          </div>
        </CardContent>
      </Card>

      {/* Institution Info */}
      <Card>
        <CardHeader>
          <CardTitle>Institution</CardTitle>
          <CardDescription>Details about the college and service area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Institution Name *</Label>
            <Input
              required
              value={form.institution_name}
              onChange={e => set('institution_name', e.target.value)}
              placeholder="Kirkwood Community College"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Primary City *</Label>
              <Input
                required
                value={form.primaryCity}
                onChange={e => set('primaryCity', e.target.value)}
                placeholder="Cedar Rapids"
              />
            </div>
            <div className="space-y-1.5">
              <Label>State *</Label>
              <Select value={form.state} onValueChange={v => set('state', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Additional Cities</Label>
              <Input
                value={form.additionalCities}
                onChange={e => set('additionalCities', e.target.value)}
                placeholder="Iowa City, Coralville, Marion"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Metro Area Label</Label>
              <Input
                value={form.metroArea}
                onChange={e => set('metroArea', e.target.value)}
                placeholder="Cedar Rapids-Iowa City Corridor"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Service Area Counties</Label>
            <Input
              value={form.counties}
              onChange={e => set('counties', e.target.value)}
              placeholder="Linn, Johnson, Benton, Iowa, Jones, Cedar, Washington"
            />
          </div>

          <div className="space-y-2">
            <Label>Focus Areas</Label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleFocus(area)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.focusAreas.includes(area)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {(form.service_tier === 'validation') && (
            <div className="space-y-1.5">
              <Label>Specific Program to Validate</Label>
              <Input
                value={form.specificProgram}
                onChange={e => set('specificProgram', e.target.value)}
                placeholder="e.g., Sterile Processing Technician Certificate"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Additional Context</Label>
            <Textarea
              value={form.additionalContext}
              onChange={e => set('additionalContext', e.target.value)}
              placeholder="Strategic priorities, known gaps, enrollment trends, recent program closures..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.admin_notes}
            onChange={e => set('admin_notes', e.target.value)}
            placeholder="How did this client find us? Any special requirements?"
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={submitting} className="px-8">
          {submitting ? 'Creating...' : 'Create Order'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
