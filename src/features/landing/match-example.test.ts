import { describe, expect, it } from "vitest";
import { EXAMPLE_MATCH } from "./match-example";

describe("landing match example", () => {
  it("shows a high match with real engine reasons", () => {
    expect(EXAMPLE_MATCH).toEqual({
      excluded: false,
      score: 90,
      reasons: [
        { kind: "match", text: "Poziom energii pasuje do Twojej aktywności" },
        { kind: "match", text: "Ogród to duży atut dla tego zwierzaka" },
        { kind: "match", text: "Dogaduje się z dziećmi" },
        {
          kind: "warning",
          text: "Nie wiemy, jak znosi samotność — omów plan dnia ze schroniskiem",
        },
      ],
    });
  });
});
