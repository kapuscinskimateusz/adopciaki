import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema, updatePasswordSchema } from "./schema";

describe("authentication form validation", () => {
  it("normalizes e-mail addresses", () => {
    const result = signInSchema.safeParse({
      email: "  adopter@example.com ",
      password: "pass",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("adopter@example.com");
    }
  });

  it("rejects invalid e-mail addresses", () => {
    expect(
      signInSchema.safeParse({ email: "not-an-email", password: "pass" }).success,
    ).toBe(false);
  });

  it("requires a sufficiently long password for account creation", () => {
    expect(
      signUpSchema.safeParse({
        email: "adopter@example.com",
        password: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });

  it("requires matching password confirmation", () => {
    expect(
      updatePasswordSchema.safeParse({
        password: "valid-password",
        confirmPassword: "different-password",
      }).success,
    ).toBe(false);
  });
});
