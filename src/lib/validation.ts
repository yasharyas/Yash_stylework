import { z } from "zod";

// Meta Ads lead-gen webhooks vary by form setup, so we validate loosely and keep
// the full payload in raw_payload rather than rejecting anything we don't recognize.
export const metaLeadWebhookSchema = z
  .object({
    full_name: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    campaign_name: z.string().optional(),
    ad_id: z.string().optional(),
    form_id: z.string().optional(),
  })
  .passthrough()
  .refine((data) => data.full_name || data.name, {
    message: "Payload must include full_name or name",
  });

export const statusUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "disqualified", "converted"]),
});
