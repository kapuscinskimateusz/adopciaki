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
