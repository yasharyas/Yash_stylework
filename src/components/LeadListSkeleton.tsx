export function LeadListSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="h-10 bg-gray-50/60 dark:bg-gray-800/40" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-44 rounded bg-gray-100 dark:bg-gray-800/60" />
          </div>
          <div className="hidden h-3.5 w-28 rounded bg-gray-100 dark:bg-gray-800/60 md:block" />
          <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="hidden h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800/60 sm:block" />
        </div>
      ))}
    </div>
  );
}
