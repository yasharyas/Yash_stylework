"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Lead, LeadStatus } from "@/lib/database.types";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusSelect } from "@/components/StatusSelect";
import { Avatar } from "@/components/Avatar";
import { CopyableText } from "@/components/CopyableText";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { Toast } from "@/components/Toast";
import { apiFetch } from "@/lib/api-client";
import { relativeTime } from "@/lib/relative-time";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}

export function LeadDetail({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

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
      setToast({ message: `Status changed to ${newStatus}`, tone: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setToast({ message: "Couldn't update status", tone: "error" });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LeadDetailSkeleton />;
  if (error && !lead) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!lead) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {toast && <Toast message={toast.message} tone={toast.tone} />}

      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={lead.full_name} />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {lead.full_name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lead.email ? <CopyableText value={lead.email} /> : "No email"}
                  {" · "}
                  {lead.phone ? <CopyableText value={lead.phone} /> : "No phone"}
                </p>
              </div>
            </div>
            <StatusBadge status={lead.status} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-gray-100 pt-5 dark:border-gray-800 sm:grid-cols-4">
            <InfoField label="Campaign" value={lead.campaign_name ?? "—"} />
            <InfoField label="Ad ID" value={lead.ad_id ?? "—"} />
            <InfoField label="Form ID" value={lead.form_id ?? "—"} />
            <InfoField label="Received" value={relativeTime(lead.created_at)} />
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Update status
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <StatusSelect
              value={lead.status}
              onChange={handleStatusChange}
              disabled={updating}
            />
            {updating && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300" />
                Saving…
              </span>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
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
        <div className="h-36 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
        <div className="h-24 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
      </div>
      <div className="h-48 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
    </div>
  );
}
