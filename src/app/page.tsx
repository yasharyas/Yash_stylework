import { LeadList } from "@/components/LeadList";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">
        Lead Intake
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Leads received from the Meta Ads webhook.
      </p>
      <LeadList />
    </main>
  );
}
