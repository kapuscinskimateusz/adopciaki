import { matchAnimal, type MatchableAnimal } from "@/features/matching/engine";
import type { AdopterPreferences } from "@/features/preferences/schema";

// Przykład na stronę główną liczony prawdziwym silnikiem, żeby powody i wynik
// zawsze zgadzały się z tym, co adoptujący zobaczy w „Dopasowaniach”.
export const EXAMPLE_PREFERENCES: AdopterPreferences = {
  preferred_species: ["dog"],
  preferred_sizes: [],
  housing: "house_with_garden",
  hours_alone: "4_to_8",
  activity_level: 4,
  children_at_home: "6_plus",
  has_dogs: false,
  has_cats: false,
  experience: "some",
};

export const EXAMPLE_ANIMAL: MatchableAnimal = {
  id: "fasola",
  name: "Fasola",
  species: "dog",
  size: "medium",
  energy_level: 4,
  good_with_children: true,
  good_with_dogs: null,
  good_with_cats: null,
  can_stay_alone: null,
  suitable_for_apartment: false,
  requires_experience: false,
};

export const EXAMPLE_MATCH = matchAnimal(EXAMPLE_PREFERENCES, EXAMPLE_ANIMAL);
