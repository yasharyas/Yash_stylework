import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { statusUpdateSchema } from "@/lib/validation";
import type { Lead } from "@/lib/database.types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid status", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .rpc("update_lead_status", {
      p_lead_id: id,
      p_new_status: parsed.data.status,
    })
    .returns<Lead>();

  if (error) {
    console.error("PATCH /api/leads/[id]/status failed", error);
    const status = error.message === "Lead not found" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ lead: data });
}
