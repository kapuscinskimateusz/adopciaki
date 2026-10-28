import { describe, expect, it } from "vitest";
import { defaultPathForRole, safeRedirectPath } from "./redirect";

describe("defaultPathForRole", () => {
  it("sends staff to the admin panel and adopters to their account", () => {
    expect(defaultPathForRole("staff")).toBe("/admin");
    expect(defaultPathForRole("adopter")).toBe("/account");
  });
});

describe("safeRedirectPath", () => {
  it("keeps local paths and query parameters", () => {
    expect(safeRedirectPath("/account?tab=profile")).toBe("/account?tab=profile");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeRedirectPath("https://example.com")).toBe("/account");
    expect(safeRedirectPath("//example.com")).toBe("/account");
  });

  it("allows role-based defaults when no safe next path is provided", () => {
    expect(safeRedirectPath(undefined, "")).toBe("");
    expect(safeRedirectPath("https://example.com", "")).toBe("");
  });
});
