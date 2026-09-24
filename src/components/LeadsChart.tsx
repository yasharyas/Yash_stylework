"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/lib/database.types";
import { useIsDark } from "@/hooks/use-is-dark";

const COLOR: Record<LeadStatus, string> = {
  new: "#3b82f6",
  contacted: "#f59e0b",
  qualified: "#8b5cf6",
  disqualified: "#9ca3af",
  converted: "#10b981",
};

// A small "extra value" widget, not a centerpiece: a compact donut plus a
// text legend, sized to match the stat cards it sits next to.
export function LeadsChart({ leads }: { leads: Lead[] }) {
  const isDark = useIsDark();
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb";
  const tooltipText = isDark ? "#f4f4f5" : "#111827";

  const data = LEAD_STATUSES.map((status) => ({
    status: status[0].toUpperCase() + status.slice(1),
    count: leads.filter((l) => l.status === status).length,
    fill: COLOR[status],
  })).filter((d) => d.count > 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={20}
                outerRadius={32}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: 8,
                  fontSize: 12,
                  padding: "4px 8px",
                  color: tooltipText,
                }}
                labelStyle={{ color: tooltipText }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            By status
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {data.map((entry) => (
              <li
                key={entry.status}
                className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                {entry.status} {entry.count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
