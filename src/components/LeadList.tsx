"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/lib/database.types";
import { StatusBadge } from "@/components/StatusBadge";
import { LeadListSkeleton } from "@/components/LeadListSkeleton";
import { apiFetch } from "@/lib/api-client";

export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
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

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name, email or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-80"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <LeadListSkeleton />
      ) : leads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-12 text-center">
          <p className="text-sm font-medium text-gray-900">No leads found</p>
          <p className="mt-1 text-sm text-gray-500">
            {search || statusFilter !== "all"
              ? "Try a different search term or status filter."
              : "New leads from the Meta Ads webhook will show up here."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-2 text-xs text-gray-500">
            {leads.length} lead{leads.length === 1 ? "" : "s"}
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                    Contact
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                    Campaign
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {leads.map((lead) => (
                  <tr key={lead.id} className="relative hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="after:absolute after:inset-0 hover:text-blue-600"
                      >
                        {lead.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {lead.email ?? lead.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {lead.campaign_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleString()}
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
