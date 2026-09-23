export function LeadListSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200">
      <div className="h-9 bg-gray-50" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-t border-gray-100 px-4 py-4">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
