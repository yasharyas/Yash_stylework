import { LeadList } from "@/components/LeadList";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        Leads
      </h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Leads received from the Meta Ads webhook, newest first.
      </p>
      <LeadList />
    </main>
  );
}
