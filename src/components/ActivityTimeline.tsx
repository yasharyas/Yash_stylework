import { Activity } from "@/lib/database.types";

const TYPE_LABEL: Record<Activity["type"], string> = {
  lead_created: "Created",
  lead_updated: "Updated",
  status_changed: "Status changed",
};

const TYPE_DOT: Record<Activity["type"], string> = {
  lead_created: "bg-blue-500",
  lead_updated: "bg-gray-400",
  status_changed: "bg-amber-500",
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-gray-200 pl-4">
      {activities.map((activity) => (
        <li key={activity.id} className="mb-6 ml-2 last:mb-0">
          <span
            className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${TYPE_DOT[activity.type]}`}
          />
          <p className="text-sm font-medium text-gray-900">
            {TYPE_LABEL[activity.type]}
          </p>
          <p className="text-sm text-gray-600">{activity.message}</p>
          <time className="text-xs text-gray-400">
            {new Date(activity.created_at).toLocaleString()}
          </time>
        </li>
      ))}
    </ol>
  );
}
