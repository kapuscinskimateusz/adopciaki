import type {
  AnimalCompatibilityField,
  animalSizes,
  animalSpecies,
} from "@/features/admin/animals/schema";
import type { AdopterPreferences } from "@/features/preferences/schema";

// Czyste reguły dopasowania (bez Supabase). Wynik liczy serwer przy każdym wyświetleniu
// i go nie zapisuje. Opis reguł i wag: docs/adr/0002-matching-rules.md.

export type MatchableAnimal = {
  id: string;
  name: string;
  species: (typeof animalSpecies)[number];
  size: (typeof animalSizes)[number];
  energy_level: number;
} & Record<AnimalCompatibilityField, boolean | null>;

export type MatchReason = {
  kind: "match" | "warning" | "exclusion";
  text: string;
};

export type MatchResult = {
  excluded: boolean;
  score: number;
  reasons: MatchReason[];
};

export const MATCH_WEIGHTS = {
  energy: 35,
  timeAlone: 20,
  housing: 15,
  household: 10,
  size: 10,
  experience: 10,
} as const;

const ENERGY_POINTS_BY_DIFFERENCE = [1, 5 / 7, 2 / 7, 0];

const REASON_ORDER: Record<MatchReason["kind"], number> = {
  exclusion: 0,
  match: 1,
  warning: 2,
};

export function matchAnimal(
  prefs: AdopterPreferences,
  animal: MatchableAnimal,
): MatchResult {
  const reasons: MatchReason[] = [];
  const add = (kind: MatchReason["kind"], text: string) => reasons.push({ kind, text });

  // Twarde wykluczenia: tylko znane „nie”. Brak wiedzy (null) to temat do rozmowy.
  if (!prefs.preferred_species.includes(animal.species)) {
    add("exclusion", "To inny gatunek, niż szukasz");
  }
  if (prefs.children_at_home !== "none" && animal.good_with_children === false) {
    add("exclusion", "Nie do domu z dziećmi");
  }
  if (prefs.has_dogs && animal.good_with_dogs === false) {
    add("exclusion", "Nie dogaduje się z psami, a masz psa");
  }
  if (prefs.has_cats && animal.good_with_cats === false) {
    add("exclusion", "Nie dogaduje się z kotami, a masz kota");
  }
  if (prefs.experience === "first_time" && animal.requires_experience === true) {
    add("exclusion", "Wymaga doświadczonego opiekuna");
  }

  let score = 0;

  const energyDifference = Math.abs(prefs.activity_level - animal.energy_level);
  score +=
    MATCH_WEIGHTS.energy * ENERGY_POINTS_BY_DIFFERENCE[Math.min(energyDifference, 3)];
  if (energyDifference <= 1) {
    add("match", "Poziom energii pasuje do Twojej aktywności");
  } else if (animal.energy_level > prefs.activity_level) {
    add("warning", "Potrzebuje więcej ruchu, niż deklarujesz");
  } else {
    add("warning", "Potrzebuje mniej ruchu, niż deklarujesz");
  }

  if (prefs.hours_alone === "under_4") {
    score += MATCH_WEIGHTS.timeAlone;
  } else if (animal.can_stay_alone === true) {
    score += MATCH_WEIGHTS.timeAlone;
    add("match", "Dobrze znosi samotność w domu");
  } else if (animal.can_stay_alone === null) {
    score += MATCH_WEIGHTS.timeAlone / 2;
    add("warning", "Nie wiemy, jak znosi samotność — omów plan dnia ze schroniskiem");
  } else {
    score += prefs.hours_alone === "4_to_8" ? MATCH_WEIGHTS.timeAlone / 4 : 0;
    add("warning", "Źle znosi samotność, a w ciągu dnia będzie długo bez opieki");
  }

  if (prefs.housing !== "apartment") {
    score += MATCH_WEIGHTS.housing;
    if (
      prefs.housing === "house_with_garden" &&
      (animal.size === "large" || animal.energy_level >= 4)
    ) {
      add("match", "Ogród to duży atut dla tego zwierzaka");
    }
  } else if (animal.suitable_for_apartment === true) {
    score += MATCH_WEIGHTS.housing;
    add("match", "Odnajdzie się w mieszkaniu");
  } else if (animal.suitable_for_apartment === null) {
    score += MATCH_WEIGHTS.housing / 2;
    add("warning", "Nie wiadomo, czy odnajdzie się w mieszkaniu");
  } else {
    add("warning", "Potrzebuje domu zamiast mieszkania");
  }

  const household: { known: boolean | null; match: string; unknown: string }[] = [];
  if (prefs.children_at_home !== "none") {
    household.push({
      known: animal.good_with_children,
      match: "Dogaduje się z dziećmi",
      unknown:
        prefs.children_at_home === "under_6"
          ? "Nie wiemy jeszcze, jak reaguje na małe dzieci — do omówienia"
          : "Nie wiemy jeszcze, jak reaguje na dzieci — do omówienia",
    });
  }
  if (prefs.has_dogs) {
    household.push({
      known: animal.good_with_dogs,
      match: "Dogaduje się z psami",
      unknown: "Nie wiemy, jak reaguje na psy — do omówienia",
    });
  }
  if (prefs.has_cats) {
    household.push({
      known: animal.good_with_cats,
      match: "Dogaduje się z kotami",
      unknown: "Nie wiemy, jak reaguje na koty — do omówienia",
    });
  }
  if (household.length === 0) {
    score += MATCH_WEIGHTS.household;
  } else {
    const compatible = household.filter((item) => item.known === true).length;
    score += (MATCH_WEIGHTS.household * compatible) / household.length;
    for (const item of household) {
      if (item.known === true) add("match", item.match);
      if (item.known === null) add("warning", item.unknown);
    }
  }

  if (prefs.preferred_sizes.length === 0) {
    score += MATCH_WEIGHTS.size;
  } else if (prefs.preferred_sizes.includes(animal.size)) {
    score += MATCH_WEIGHTS.size;
    add("match", "Rozmiar zgodny z Twoimi preferencjami");
  } else {
    add("warning", "Rozmiar inny, niż preferujesz");
  }

  if (animal.requires_experience === true) {
    if (prefs.experience === "experienced") {
      score += MATCH_WEIGHTS.experience;
      add("match", "Masz doświadczenie, którego potrzebuje");
    } else {
      score += MATCH_WEIGHTS.experience / 2;
      if (prefs.experience === "some") {
        add("warning", "Wymaga doświadczonego opiekuna — porozmawiaj ze schroniskiem");
      }
    }
  } else if (animal.requires_experience === null && prefs.experience === "first_time") {
    score += MATCH_WEIGHTS.experience / 2;
    add("warning", "Nie wiadomo, czy sprawdzi się u początkującego opiekuna");
  } else {
    score += MATCH_WEIGHTS.experience;
    if (prefs.experience === "first_time") {
      add("match", "Dobry wybór dla początkujących");
    }
  }

  const excluded = reasons.some((reason) => reason.kind === "exclusion");
  return {
    excluded,
    score: excluded ? 0 : Math.round(score),
    reasons: reasons
      .map((reason, index) => ({ reason, index }))
      .sort(
        (a, b) =>
          REASON_ORDER[a.reason.kind] - REASON_ORDER[b.reason.kind] || a.index - b.index,
      )
      .map(({ reason }) => reason),
  };
}

export type RankedAnimal<T extends MatchableAnimal> = { animal: T; match: MatchResult };

// Pomija wykluczone zwierzęta; przy równym wyniku kolejność ustala imię, potem id.
export function rankAnimals<T extends MatchableAnimal>(
  prefs: AdopterPreferences,
  animals: readonly T[],
): { ranked: RankedAnimal<T>[]; excludedCount: number } {
  const results = animals.map((animal) => ({
    animal,
    match: matchAnimal(prefs, animal),
  }));
  const ranked = results
    .filter(({ match }) => !match.excluded)
    .sort(
      (a, b) =>
        b.match.score - a.match.score ||
        a.animal.name.localeCompare(b.animal.name, "pl") ||
        a.animal.id.localeCompare(b.animal.id),
    );
  return { ranked, excludedCount: results.length - ranked.length };
}

export function matchLevelLabel(score: number) {
  if (score >= 75) return "wysokie";
  if (score >= 50) return "dobre";
  return "częściowe";
}
