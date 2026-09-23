import Link from "next/link";

export default function LeadNotFound() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="mb-6 inline-block text-sm text-blue-600 hover:underline">
        ← Back to all leads
      </Link>
      <p className="text-sm text-gray-600">
        This lead doesn&apos;t exist, or its link is incorrect.
      </p>
    </main>
  );
}
