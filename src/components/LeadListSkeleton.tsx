export function LeadListSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="h-10 bg-gray-50/60" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-gray-100 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-gray-200" />
            <div className="h-3 w-44 rounded bg-gray-100" />
          </div>
          <div className="hidden h-3.5 w-28 rounded bg-gray-100 md:block" />
          <div className="h-5 w-16 rounded-full bg-gray-200" />
          <div className="hidden h-3.5 w-20 rounded bg-gray-100 sm:block" />
        </div>
      ))}
    </div>
  );
}
