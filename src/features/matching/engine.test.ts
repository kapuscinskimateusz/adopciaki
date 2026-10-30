import { describe, expect, it } from "vitest";
import type { AdopterPreferences } from "@/features/preferences/schema";
import {
  matchAnimal,
  matchLevelLabel,
  rankAnimals,
  type MatchableAnimal,
} from "./engine";

const prefs: AdopterPreferences = {
  preferred_species: ["dog", "cat"],
  preferred_sizes: [],
  housing: "house_with_garden",
  hours_alone: "under_4",
  activity_level: 4,
  children_at_home: "none",
  has_dogs: false,
  has_cats: false,
  experience: "some",
};

const animal: MatchableAnimal = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Fasola",
  species: "dog",
  size: "medium",
  energy_level: 4,
  good_with_children: true,
  good_with_dogs: true,
  good_with_cats: true,
  can_stay_alone: true,
  suitable_for_apartment: true,
  requires_experience: false,
};

function texts(result: ReturnType<typeof matchAnimal>, kind: string) {
  return result.reasons.filter((reason) => reason.kind === kind).map((r) => r.text);
}

describe("matchAnimal: hard exclusions", () => {
  it.each<[string, Partial<AdopterPreferences>, Partial<MatchableAnimal>]>([
    ["species", { preferred_species: ["rabbit"] }, {}],
    ["children", { children_at_home: "6_plus" }, { good_with_children: false }],
    ["dogs", { has_dogs: true }, { good_with_dogs: false }],
    ["cats", { has_cats: true }, { good_with_cats: false }],
    ["experience", { experience: "first_time" }, { requires_experience: true }],
  ])("excludes on known %s incompatibility", (_name, prefPatch, animalPatch) => {
    const result = matchAnimal({ ...prefs, ...prefPatch }, { ...animal, ...animalPatch });

    expect(result.excluded).toBe(true);
    expect(result.score).toBe(0);
    expect(result.reasons[0].kind).toBe("exclusion");
  });

  it("treats unknown compatibility as a warning, not an exclusion", () => {
    const result = matchAnimal(
      { ...prefs, children_at_home: "under_6", has_dogs: true, experience: "first_time" },
      {
        ...animal,
        good_with_children: null,
        good_with_dogs: null,
        requires_experience: null,
      },
    );

    expect(result.excluded).toBe(false);
    expect(texts(result, "warning")).toEqual(
      expect.arrayContaining([
        "Nie wiemy jeszcze, jak reaguje na małe dzieci — do omówienia",
        "Nie wiemy, jak reaguje na psy — do omówienia",
        "Nie wiadomo, czy sprawdzi się u początkującego opiekuna",
      ]),
    );
  });

  it("does not apply household rules the adopter does not need", () => {
    const result = matchAnimal(prefs, {
      ...animal,
      good_with_children: false,
      good_with_dogs: false,
      good_with_cats: false,
    });

    expect(result.excluded).toBe(false);
    expect(result.score).toBe(100);
  });
});

describe("matchAnimal: score and reasons", () => {
  it("gives a perfect, explained score to a fully compatible animal", () => {
    const result = matchAnimal(prefs, animal);

    expect(result.score).toBe(100);
    expect(texts(result, "warning")).toEqual([]);
    expect(texts(result, "match")).toContain(
      "Poziom energii pasuje do Twojej aktywności",
    );
  });

  it("lowers the score as the energy gap grows", () => {
    const scores = [4, 3, 2, 1].map(
      (level) => matchAnimal(prefs, { ...animal, energy_level: level }).score,
    );

    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(new Set(scores).size).toBe(4);
    expect(
      texts(matchAnimal({ ...prefs, activity_level: 1 }, animal), "warning"),
    ).toContain("Potrzebuje więcej ruchu, niż deklarujesz");
  });

  it("penalizes long time alone unless the animal copes with it", () => {
    const longDay = { ...prefs, hours_alone: "over_8" as const };
    const copes = matchAnimal(longDay, animal);
    const unknown = matchAnimal(longDay, { ...animal, can_stay_alone: null });
    const struggles = matchAnimal(longDay, { ...animal, can_stay_alone: false });

    expect(copes.score).toBeGreaterThan(unknown.score);
    expect(unknown.score).toBeGreaterThan(struggles.score);
    expect(texts(struggles, "warning")).toContain(
      "Źle znosi samotność, a w ciągu dnia będzie długo bez opieki",
    );
  });

  it("checks apartment suitability only for apartments", () => {
    const apartment = { ...prefs, housing: "apartment" as const };
    const unsuitable = { ...animal, suitable_for_apartment: false };

    expect(matchAnimal(apartment, unsuitable).score).toBe(85);
    expect(texts(matchAnimal(apartment, unsuitable), "warning")).toContain(
      "Potrzebuje domu zamiast mieszkania",
    );
    expect(matchAnimal(prefs, unsuitable).score).toBe(100);
  });

  it("scores household compatibility proportionally", () => {
    const busyHome = { ...prefs, children_at_home: "6_plus" as const, has_cats: true };

    expect(matchAnimal(busyHome, animal).score).toBe(100);
    expect(matchAnimal(busyHome, { ...animal, good_with_cats: null }).score).toBe(95);
  });

  it("respects preferred sizes and treats an empty list as any size", () => {
    const small = { ...prefs, preferred_sizes: ["small" as const] };

    expect(matchAnimal(small, animal).score).toBe(90);
    expect(texts(matchAnimal(small, animal), "warning")).toContain(
      "Rozmiar inny, niż preferujesz",
    );
    expect(matchAnimal(prefs, animal).score).toBe(100);
  });

  it("orders reasons: matches before warnings", () => {
    const result = matchAnimal({ ...prefs, preferred_sizes: ["small"] }, animal);
    const kinds = result.reasons.map((reason) => reason.kind);

    expect(kinds.indexOf("warning")).toBeGreaterThan(kinds.lastIndexOf("match"));
  });
});

describe("rankAnimals", () => {
  const calm = {
    ...animal,
    id: "00000000-0000-4000-8000-000000000002",
    name: "Bob",
    energy_level: 1,
  };
  const twin = { ...animal, id: "00000000-0000-4000-8000-000000000003", name: "Azor" };
  const rabbit = {
    ...animal,
    id: "00000000-0000-4000-8000-000000000004",
    name: "Klara",
    species: "rabbit" as const,
  };

  it("sorts by score, then name, and drops excluded animals", () => {
    const { ranked, excludedCount } = rankAnimals(prefs, [calm, animal, rabbit, twin]);

    expect(ranked.map(({ animal: a }) => a.name)).toEqual(["Azor", "Fasola", "Bob"]);
    expect(excludedCount).toBe(1);
  });

  it("is deterministic regardless of input order", () => {
    const forward = rankAnimals(prefs, [calm, animal, twin]).ranked;
    const backward = rankAnimals(prefs, [twin, animal, calm]).ranked;

    expect(backward).toEqual(forward);
  });
});

describe("matchLevelLabel", () => {
  it("maps score ranges to labels", () => {
    expect(matchLevelLabel(92)).toBe("wysokie");
    expect(matchLevelLabel(60)).toBe("dobre");
    expect(matchLevelLabel(30)).toBe("częściowe");
  });
});
