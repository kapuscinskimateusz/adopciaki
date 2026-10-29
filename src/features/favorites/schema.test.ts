import { describe, expect, it } from "vitest";
import { toggleFavoriteSchema } from "./schema";

const id = "70000000-0000-4000-8000-000000000001";

describe("toggleFavoriteSchema", () => {
  it("parses a valid request", () => {
    expect(toggleFavoriteSchema.parse({ animalId: id, favorite: "true" })).toEqual({
      animalId: id,
      favorite: true,
    });
    expect(toggleFavoriteSchema.parse({ animalId: id, favorite: "false" }).favorite).toBe(
      false,
    );
  });

  it("rejects invalid ids and flags", () => {
    expect(
      toggleFavoriteSchema.safeParse({ animalId: "x", favorite: "true" }).success,
    ).toBe(false);
    expect(
      toggleFavoriteSchema.safeParse({ animalId: id, favorite: "yes" }).success,
    ).toBe(false);
    expect(toggleFavoriteSchema.safeParse({ animalId: id }).success).toBe(false);
  });
});
