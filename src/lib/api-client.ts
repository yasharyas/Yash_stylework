// Small wrapper so LeadList and LeadDetail don't each re-implement
// "fetch, check ok, extract error message" for every API call.
export async function apiFetch<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request to ${input} failed (${res.status})`);
  }
  return res.json();
}
