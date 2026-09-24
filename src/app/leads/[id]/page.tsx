import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadDetail } from "@/components/LeadDetail";
import { supabase } from "@/lib/supabase";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Guard against non-UUID ids before querying — Postgres raises an error (not just
  // an empty result) for a malformed uuid literal, which would otherwise 500 instead
  // of rendering the not-found boundary.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) {
    notFound();
  }

  // Existence check happens server-side so a bad/old lead link renders Next's
  // not-found boundary instead of a client-side error flash after the page loads.
  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!lead) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to all leads
      </Link>
      <LeadDetail leadId={id} />
    </main>
  );
}
