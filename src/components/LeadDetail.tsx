"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Lead, LeadStatus, LEAD_STATUSES } from "@/lib/database.types";
import { StatusBadge } from "@/components/StatusBadge";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { apiFetch } from "@/lib/api-client";

export function LeadDetail({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLead = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch<{ lead: Lead; activities: Activity[] }>(
        `/api/leads/${leadId}`
      );
      setLead(json.lead);
      setActivities(json.activities ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!lead || newStatus === lead.status) return;
    setUpdating(true);
    setError(null);
    try {
      await apiFetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchLead();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error && !lead) return <p className="text-sm text-red-600">{error}</p>;
  if (!lead) return null;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {lead.full_name}
            </h1>
            <p className="text-sm text-gray-500">
              {lead.email ?? "No email"} · {lead.phone ?? "No phone"}
            </p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <dl className="mb-8 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4 text-sm">
          <div>
            <dt className="text-gray-500">Campaign</dt>
            <dd className="font-medium text-gray-900">
              {lead.campaign_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Ad ID</dt>
            <dd className="font-medium text-gray-900">{lead.ad_id ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Form ID</dt>
            <dd className="font-medium text-gray-900">{lead.form_id ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Received</dt>
            <dd className="font-medium text-gray-900">
              {new Date(lead.created_at).toLocaleString()}
            </dd>
          </div>
        </dl>

        <div className="mb-8">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Update status
          </label>
          <select
            value={lead.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Activity Timeline
        </h2>
        <ActivityTimeline activities={activities} />
      </div>
    </div>
  );
}
