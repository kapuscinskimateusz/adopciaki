import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirect";

describe("safeRedirectPath", () => {
  it("keeps local paths and query parameters", () => {
    expect(safeRedirectPath("/account?tab=profile")).toBe("/account?tab=profile");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeRedirectPath("https://example.com")).toBe("/account");
    expect(safeRedirectPath("//example.com")).toBe("/account");
  });
});
