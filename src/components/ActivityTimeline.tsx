import { Activity } from "@/lib/database.types";

const TYPE_LABEL: Record<Activity["type"], string> = {
  lead_created: "Lead created",
  lead_updated: "Lead updated",
  status_changed: "Status changed",
};

const TYPE_ICON: Record<Activity["type"], string> = {
  lead_created: "bg-blue-500",
  lead_updated: "bg-gray-400",
  status_changed: "bg-amber-500",
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {activities.map((activity, i) => (
        <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i !== activities.length - 1 && (
            <span className="absolute left-[7px] top-4 h-full w-px bg-gray-200" />
          )}
          <span
            className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${TYPE_ICON[activity.type]}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {TYPE_LABEL[activity.type]}
            </p>
            <p className="text-sm text-gray-600">{activity.message}</p>
            <time className="text-xs text-gray-400">
              {new Date(activity.created_at).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
