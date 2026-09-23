import { describe, it, expect } from "vitest";
import { metaLeadWebhookSchema, statusUpdateSchema } from "@/lib/validation";

describe("metaLeadWebhookSchema", () => {
  it("accepts a payload with full_name", () => {
    const result = metaLeadWebhookSchema.safeParse({
      full_name: "Jane Doe",
      email: "jane@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a payload with name instead of full_name (Meta's own field naming)", () => {
    const result = metaLeadWebhookSchema.safeParse({ name: "Jane Doe" });
    expect(result.success).toBe(true);
  });

  it("rejects a payload with neither full_name nor name", () => {
    const result = metaLeadWebhookSchema.safeParse({ email: "jane@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = metaLeadWebhookSchema.safeParse({
      full_name: "Jane Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("keeps unrecognized Meta fields via passthrough for raw_payload storage", () => {
    const result = metaLeadWebhookSchema.safeParse({
      full_name: "Jane Doe",
      platform: "instagram",
      lead_id: "abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.platform).toBe("instagram");
    }
  });
});

describe("statusUpdateSchema", () => {
  it("accepts each valid lead status", () => {
    for (const status of [
      "new",
      "contacted",
      "qualified",
      "disqualified",
      "converted",
    ]) {
      expect(statusUpdateSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects an unknown status value", () => {
    const result = statusUpdateSchema.safeParse({ status: "spam" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing status field", () => {
    const result = statusUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
