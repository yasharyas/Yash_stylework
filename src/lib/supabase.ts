import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
  );
}

// All writes go through SECURITY DEFINER RPC functions (create_lead_from_webhook,
// update_lead_status), so the anon key is safe to use server-side here: it can only
// do what those functions allow, not arbitrary table writes. Types for rows returned
// from queries/RPCs are asserted at the call site via src/lib/database.types.ts rather
// than threaded through the client generic, which kept supabase-js's rpc() overloads
// from resolving cleanly against hand-written (non-generated) types.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
