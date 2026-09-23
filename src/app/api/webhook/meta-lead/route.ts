import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { metaLeadWebhookSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = metaLeadWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("create_lead_from_webhook", {
    payload: parsed.data,
  });

  if (error) {
    console.error("create_lead_from_webhook failed", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }

  return NextResponse.json({ lead: data }, { status: 201 });
}
