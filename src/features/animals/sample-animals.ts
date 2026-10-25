// Dane przykładowe na potrzeby prototypu wizualnego.
// Docelowo zastąpi je odczyt z Supabase (etap 4 planu).

export type Species = "dog" | "cat" | "rabbit";
export type AdoptionStatus = "available" | "meeting";

export type SampleAnimal = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;
  sex: "samiec" | "samica";
  size: "mały" | "średni" | "duży";
  energy: 1 | 2 | 3 | 4 | 5;
  blurb: string;
  traits: string[];
  status: AdoptionStatus;
  tile: string;
  palette: { base: string; ear: string; light: string; accent: string };
};

export const SPECIES_LABEL: Record<Species, string> = {
  dog: "Pies",
  cat: "Kot",
  rabbit: "Królik",
};

export const STATUS_LABEL: Record<AdoptionStatus, string> = {
  available: "Czeka na dom",
  meeting: "W trakcie poznawania",
};

export const sampleAnimals: SampleAnimal[] = [
  {
    id: "fasola",
    name: "Fasola",
    species: "dog",
    breed: "Mieszaniec",
    age: "3 lata",
    sex: "samica",
    size: "średni",
    energy: 4,
    blurb: "Uwielbia długie spacery i aportowanie. Z dziećmi dogaduje się świetnie.",
    traits: ["Lubi dzieci", "Aktywna"],
    status: "available",
    tile: "#f6d3c4",
    palette: { base: "#c9884a", ear: "#8a5528", light: "#f3dfc0", accent: "#c23e22" },
  },
  {
    id: "pepe",
    name: "Pepe",
    species: "cat",
    breed: "Europejski krótkowłosy",
    age: "2 lata",
    sex: "samiec",
    size: "mały",
    energy: 3,
    blurb: "Ciekawski towarzysz kanapowy. Zna już swoje imię i przychodzi na zawołanie.",
    traits: ["Domowy", "Towarzyski"],
    status: "available",
    tile: "#cfe0d0",
    palette: { base: "#8d8a86", ear: "#5a5753", light: "#e9e4dc", accent: "#1f3d36" },
  },
  {
    id: "klara",
    name: "Klara",
    species: "rabbit",
    breed: "Królik miniaturka",
    age: "1 rok",
    sex: "samica",
    size: "mały",
    energy: 2,
    blurb: "Spokojna i delikatna. Najlepiej odnajdzie się w cichym domu.",
    traits: ["Spokojna", "Cicha"],
    status: "meeting",
    tile: "#f6e3b4",
    palette: { base: "#e9dfd0", ear: "#c9b79a", light: "#fffaf0", accent: "#c23e22" },
  },
  {
    id: "maks",
    name: "Maks",
    species: "dog",
    breed: "Owczarek mieszaniec",
    age: "5 lat",
    sex: "samiec",
    size: "duży",
    energy: 5,
    blurb: "Rasowy sportowiec. Szuka opiekuna z doświadczeniem i dużą ilością czasu.",
    traits: ["Wymaga ruchu", "Dla doświadczonych"],
    status: "available",
    tile: "#d9e4f0",
    palette: { base: "#4a4038", ear: "#2b2118", light: "#d9b78a", accent: "#f2b84b" },
  },
  {
    id: "tofik",
    name: "Tofik",
    species: "cat",
    breed: "Dachowiec",
    age: "6 lat",
    sex: "samiec",
    size: "mały",
    energy: 1,
    blurb: "Dostojny senior, który marzy o ciepłym kocu i spokojnym domu.",
    traits: ["Senior", "Spokojny"],
    status: "available",
    tile: "#f6d3c4",
    palette: { base: "#d98b3a", ear: "#a85d1a", light: "#fbe6c6", accent: "#c23e22" },
  },
  {
    id: "luna",
    name: "Luna",
    species: "dog",
    breed: "Beagle",
    age: "8 miesięcy",
    sex: "samica",
    size: "średni",
    energy: 4,
    blurb: "Szczeniak pełen energii. Dopiero uczy się komend i bardzo chce się podobać.",
    traits: ["Szczenię", "Uczy się"],
    status: "meeting",
    tile: "#cfe0d0",
    palette: { base: "#e8e0d0", ear: "#a8693a", light: "#fffaf0", accent: "#1f3d36" },
  },
  {
    id: "kropka",
    name: "Kropka",
    species: "rabbit",
    breed: "Królik baranek",
    age: "2 lata",
    sex: "samica",
    size: "mały",
    energy: 3,
    blurb: "Lubi towarzystwo ludzi i chrupanie świeżego siana. Z dziećmi — pod opieką.",
    traits: ["Towarzyska", "Ciekawska"],
    status: "available",
    tile: "#e6dcf0",
    palette: { base: "#b9a58c", ear: "#8a7358", light: "#f3ead9", accent: "#f2b84b" },
  },
  {
    id: "gucio",
    name: "Gucio",
    species: "cat",
    breed: "Mieszaniec",
    age: "4 lata",
    sex: "samiec",
    size: "średni",
    energy: 3,
    blurb: "Łowca zabawek i mistrz mruczenia. Dogaduje się z innymi kotami.",
    traits: ["Lubi koty", "Zabawowy"],
    status: "available",
    tile: "#f6e3b4",
    palette: { base: "#3d3833", ear: "#221e1a", light: "#e9e4dc", accent: "#c23e22" },
  },
];
