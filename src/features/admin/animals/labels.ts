import type {
  AnimalCompatibilityField,
  animalAdoptionStatuses,
  animalPublicationStatuses,
  animalSexes,
  animalSizes,
  animalSpecies,
} from "./schema";

export const animalSpeciesLabels: Record<(typeof animalSpecies)[number], string> = {
  dog: "Pies",
  cat: "Kot",
  rabbit: "Królik",
};

export const animalSexLabels: Record<(typeof animalSexes)[number], string> = {
  male: "Samiec",
  female: "Samica",
  unknown: "Nieznana",
};

export const animalSizeLabels: Record<(typeof animalSizes)[number], string> = {
  small: "Mały",
  medium: "Średni",
  large: "Duży",
};

export const animalPublicationStatusLabels: Record<
  (typeof animalPublicationStatuses)[number],
  string
> = {
  draft: "Szkic",
  published: "Opublikowane",
  archived: "Zarchiwizowane",
};

export const animalAdoptionStatusLabels: Record<
  (typeof animalAdoptionStatuses)[number],
  string
> = {
  available: "Dostępne",
  meeting: "W trakcie poznawania",
  adopted: "Adoptowane",
};

export const animalCompatibilityLabels: Record<AnimalCompatibilityField, string> = {
  good_with_children: "Dogaduje się z dziećmi",
  good_with_dogs: "Dogaduje się z psami",
  good_with_cats: "Dogaduje się z kotami",
  can_stay_alone: "Może zostawać sam w domu",
  suitable_for_apartment: "Odnajdzie się w mieszkaniu",
  requires_experience: "Wymaga doświadczonego opiekuna",
};
