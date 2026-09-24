import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { relativeTime } from "@/lib/relative-time";

describe("relativeTime", () => {
  const now = new Date("2026-09-24T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for timestamps under a minute old", () => {
    expect(relativeTime(new Date(now.getTime() - 30_000).toISOString())).toBe(
      "just now"
    );
  });

  it("formats minutes ago", () => {
    expect(relativeTime(new Date(now.getTime() - 5 * 60_000).toISOString())).toBe(
      "5 minutes ago"
    );
  });

  it("formats hours ago", () => {
    expect(
      relativeTime(new Date(now.getTime() - 3 * 3600_000).toISOString())
    ).toBe("3 hours ago");
  });

  it("formats days ago", () => {
    expect(
      relativeTime(new Date(now.getTime() - 2 * 86400_000).toISOString())
    ).toBe("2 days ago");
  });
});
