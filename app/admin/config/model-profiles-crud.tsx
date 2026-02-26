'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ModelProfile {
  id: string;
  slug: string;
  display_name: string;
  model: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface FormState {
  id?: string;
  slug: string;
  display_name: string;
  model: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
}

const EMPTY_FORM: FormState = {
  slug: '',
  display_name: '',
  model: '',
  description: '',
  is_active: true,
  is_default: false,
};

function toForm(profile: ModelProfile): FormState {
  return {
    id: profile.id,
    slug: profile.slug,
    display_name: profile.display_name,
    model: profile.model,
    description: profile.description || '',
    is_active: profile.is_active,
    is_default: profile.is_default,
  };
}

export function ModelProfilesCrudPanel() {
  const [profiles, setProfiles] = useState<ModelProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const editing = Boolean(form.id);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return a.display_name.localeCompare(b.display_name);
    });
  }, [profiles]);

  async function loadProfiles() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/model-profiles');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load model profiles');
      setProfiles(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load model profiles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  async function saveProfile() {
    if (!form.display_name.trim() || !form.model.trim()) {
      setError('Display name and model are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        slug: form.slug,
        display_name: form.display_name,
        model: form.model,
        description: form.description,
        is_active: form.is_active,
        is_default: form.is_default,
      };

      const endpoint = form.id ? `/api/admin/model-profiles/${form.id}` : '/api/admin/model-profiles';
      const method = form.id ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to save model profile');

      await loadProfiles();
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save model profile');
    } finally {
      setSaving(false);
    }
  }

  async function removeProfile(profile: ModelProfile) {
    const ok = window.confirm(`Delete profile "${profile.display_name}"?`);
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/model-profiles/${profile.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to delete profile');
      await loadProfiles();
      if (form.id === profile.id) setForm(EMPTY_FORM);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Model Profiles (CRUD)</h2>
        <p className="text-sm text-gray-600 mt-1">Create, edit, and delete profiles used by run-time model selection.</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading model profiles...</p>
          ) : sortedProfiles.length === 0 ? (
            <p className="text-sm text-gray-500">No profiles yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedProfiles.map((profile) => (
                <div key={profile.id} className="rounded-lg border border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{profile.display_name}</p>
                        {profile.is_default && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Default</span>}
                        {!profile.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Inactive</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{profile.slug}</p>
                      <code className="text-[11px] mt-1 inline-block bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-gray-700">{profile.model}</code>
                      {profile.description && <p className="text-xs text-gray-500 mt-1">{profile.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setForm(toForm(profile))}>Edit</Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeProfile(profile)} disabled={saving}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">{editing ? 'Edit Profile' : 'New Profile'}</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Display Name</label>
            <Input value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} placeholder="Balanced (Sonnet 4.6)" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Slug</label>
            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="balanced-sonnet" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Model</label>
            <Input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="claude-sonnet-4-6" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Default quality/speed profile" />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_default} onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))} />
              Default
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="button" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Profile' : 'Create Profile'}</Button>
            {editing && (
              <Button type="button" variant="outline" onClick={() => setForm(EMPTY_FORM)} disabled={saving}>Cancel</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
