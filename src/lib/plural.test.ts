import { describe, expect, it } from "vitest";
import { polishPlural } from "./plural";

describe("polishPlural", () => {
  it.each([
    [1, "zwierzak"],
    [2, "zwierzaki"],
    [4, "zwierzaki"],
    [5, "zwierzaków"],
    [12, "zwierzaków"],
    [14, "zwierzaków"],
    [22, "zwierzaki"],
    [0, "zwierzaków"],
  ])("uses the right form for %i", (count, expected) => {
    expect(polishPlural(count, "zwierzak", "zwierzaki", "zwierzaków")).toBe(expected);
  });
});
