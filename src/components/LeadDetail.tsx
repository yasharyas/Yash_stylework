"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Lead, LeadStatus, LEAD_STATUSES } from "@/lib/database.types";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { apiFetch } from "@/lib/api-client";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

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

  if (loading) return <LeadDetailSkeleton />;
  if (error && !lead) return <p className="text-sm text-red-600">{error}</p>;
  if (!lead) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={lead.full_name} />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {lead.full_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {lead.email ?? "No email"} · {lead.phone ?? "No phone"}
                </p>
              </div>
            </div>
            <StatusBadge status={lead.status} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-gray-100 pt-5 sm:grid-cols-4">
            <InfoField label="Campaign" value={lead.campaign_name ?? "—"} />
            <InfoField label="Ad ID" value={lead.ad_id ?? "—"} />
            <InfoField label="Form ID" value={lead.form_id ?? "—"} />
            <InfoField
              label="Received"
              value={new Date(lead.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            />
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="lead-status"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Update status
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                id="lead-status"
                value={lead.status}
                disabled={updating}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium capitalize text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {updating && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                Saving…
              </span>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Activity Timeline
        </h2>
        <ActivityTimeline activities={activities} />
      </div>
    </div>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-36 rounded-xl border border-gray-200 bg-gray-50" />
        <div className="h-24 rounded-xl border border-gray-200 bg-gray-50" />
      </div>
      <div className="h-48 rounded-xl border border-gray-200 bg-gray-50" />
    </div>
  );
}
