"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/lib/database.types";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { StatCards } from "@/components/StatCards";
import { LeadListSkeleton } from "@/components/LeadListSkeleton";
import { apiFetch } from "@/lib/api-client";
import { relativeTime } from "@/lib/relative-time";

const FILTERS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "All", value: "all" },
  ...LEAD_STATUSES.map((s) => ({
    label: s[0].toUpperCase() + s.slice(1),
    value: s,
  })),
];

export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [search, setSearch] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());

      const json = await apiFetch<{ leads: Lead[] }>(
        `/api/leads?${params.toString()}`
      );
      setLeads(json.leads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  // Unfiltered snapshot for the summary cards, kept separate from the filtered
  // table fetch so switching a filter doesn't make the totals jump around.
  const fetchAllLeads = useCallback(async () => {
    try {
      const json = await apiFetch<{ leads: Lead[] }>("/api/leads");
      setAllLeads(json.leads ?? []);
    } catch {
      // Non-critical: the summary cards just stay at their last known counts.
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads, leads.length]);

  return (
    <div>
      {allLeads.length > 0 && <StatCards leads={allLeads} />}

      <div className="mb-5 flex flex-col gap-4">
        <div className="relative w-full sm:w-96">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="-mx-1 flex flex-wrap gap-1.5 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <LeadListSkeleton />
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">No leads found</p>
          <p className="mt-1 text-sm text-gray-500">
            {search || statusFilter !== "all"
              ? "Try a different search term or status filter."
              : "New leads from the Meta Ads webhook will show up here."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-2 text-xs font-medium text-gray-500">
            {leads.length} lead{leads.length === 1 ? "" : "s"}
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Lead
                  </th>
                  <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 md:table-cell">
                    Campaign
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="relative hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="flex items-center gap-3 after:absolute after:inset-0"
                      >
                        <Avatar name={lead.full_name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {lead.full_name}
                          </span>
                          <span className="block truncate text-xs text-gray-500">
                            {lead.email ?? lead.phone ?? "No contact info"}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-600 md:table-cell">
                      {lead.campaign_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td
                      className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-500 sm:table-cell"
                      title={new Date(lead.created_at).toLocaleString()}
                    >
                      {relativeTime(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
