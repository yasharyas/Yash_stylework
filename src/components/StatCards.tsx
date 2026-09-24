import { Lead, LeadStatus, LEAD_STATUSES } from "@/lib/database.types";

const DOT: Record<LeadStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-amber-500",
  qualified: "bg-violet-500",
  disqualified: "bg-gray-400",
  converted: "bg-emerald-500",
};

export function StatCards({ leads }: { leads: Lead[] }) {
  const counts = LEAD_STATUSES.reduce<Record<LeadStatus, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<LeadStatus, number>);

  const conversionRate =
    leads.length === 0 ? 0 : Math.round((counts.converted / leads.length) * 100);

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total leads</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{leads.length}</p>
      </div>
      {LEAD_STATUSES.map((s) => (
        <div key={s} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="flex items-center gap-1.5 text-xs font-medium capitalize text-gray-500 dark:text-gray-400">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[s]}`} />
            {s}
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{counts[s]}</p>
        </div>
      ))}
      <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:col-span-1 lg:hidden">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Conversion rate</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{conversionRate}%</p>
      </div>
    </div>
  );
}
