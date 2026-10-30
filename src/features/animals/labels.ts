import type { AnimalCompatibilityField } from "@/features/admin/animals/schema";
import type { PublicAnimal } from "./data";

export const SPECIES_LABEL: Record<PublicAnimal["species"], string> = {
  dog: "Pies",
  cat: "Kot",
  rabbit: "Królik",
};

export const SEX_LABEL: Record<PublicAnimal["sex"], string> = {
  male: "Samiec",
  female: "Samica",
  unknown: "Płeć nieznana",
};

export const SIZE_LABEL: Record<PublicAnimal["size"], string> = {
  small: "Mały",
  medium: "Średni",
  large: "Duży",
};

export const ADOPTION_STATUS_LABEL: Record<PublicAnimal["adoption_status"], string> = {
  available: "Czeka na dom",
  meeting: "W trakcie poznawania",
  adopted: "Adoptowane",
};

// Publiczny opis znanych wartości zgodności; NULL nie jest pokazywany.
export const COMPATIBILITY_LABEL: Record<
  AnimalCompatibilityField,
  { yes: string; no: string }
> = {
  good_with_children: { yes: "Dogaduje się z dziećmi", no: "Nie do domu z dziećmi" },
  good_with_dogs: { yes: "Dogaduje się z psami", no: "Nie dogaduje się z psami" },
  good_with_cats: { yes: "Dogaduje się z kotami", no: "Nie dogaduje się z kotami" },
  can_stay_alone: { yes: "Spokojnie zostaje sam", no: "Nie lubi zostawać sam" },
  suitable_for_apartment: {
    yes: "Odnajdzie się w mieszkaniu",
    no: "Potrzebuje domu zamiast mieszkania",
  },
  requires_experience: {
    yes: "Dla doświadczonego opiekuna",
    no: "Dobry wybór dla początkujących",
  },
};

// Ilustracja zastępcza dla zwierząt bez zdjęć.
export const FALLBACK_ART: Record<
  PublicAnimal["species"],
  { tile: string; palette: { base: string; ear: string; light: string; accent: string } }
> = {
  dog: {
    tile: "#f6d3c4",
    palette: { base: "#c9884a", ear: "#8a5528", light: "#f3dfc0", accent: "#c23e22" },
  },
  cat: {
    tile: "#cfe0d0",
    palette: { base: "#8d8a86", ear: "#5a5753", light: "#e9e4dc", accent: "#1f3d36" },
  },
  rabbit: {
    tile: "#f6e3b4",
    palette: { base: "#e9dfd0", ear: "#c9b79a", light: "#fffaf0", accent: "#c23e22" },
  },
};
