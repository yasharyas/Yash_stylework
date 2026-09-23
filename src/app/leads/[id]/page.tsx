import Link from "next/link";
import { LeadDetail } from "@/components/LeadDetail";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="mb-6 inline-block text-sm text-blue-600 hover:underline">
        ← Back to all leads
      </Link>
      <LeadDetail leadId={id} />
    </main>
  );
}
