"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/lib/database.types";
import { useIsDark } from "@/hooks/use-is-dark";

const COLOR: Record<LeadStatus, string> = {
  new: "#3b82f6",
  contacted: "#f59e0b",
  qualified: "#8b5cf6",
  disqualified: "#9ca3af",
  converted: "#10b981",
};

export function LeadsChart({ leads }: { leads: Lead[] }) {
  const isDark = useIsDark();
  const gridColor = isDark ? "#27272a" : "#e5e7eb";
  const textColor = isDark ? "#a1a1aa" : "#6b7280";
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb";
  const tooltipText = isDark ? "#f4f4f5" : "#111827";

  const data = LEAD_STATUSES.map((status) => ({
    status: status[0].toUpperCase() + status.slice(1),
    count: leads.filter((l) => l.status === status).length,
    fill: COLOR[status],
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Leads by status
      </p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="status"
              tick={{ fill: textColor, fontSize: 12 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: textColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: isDark ? "#27272a" : "#f3f4f6" }}
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 8,
                fontSize: 13,
                color: tooltipText,
              }}
              labelStyle={{ color: tooltipText }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
