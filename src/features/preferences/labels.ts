import type {
  childrenAtHomeOptions,
  experienceLevels,
  hoursAloneOptions,
  housingTypes,
} from "./schema";

export const HOUSING_LABEL: Record<(typeof housingTypes)[number], string> = {
  apartment: "Mieszkanie",
  house: "Dom bez ogrodu",
  house_with_garden: "Dom z ogrodem",
};

export const HOURS_ALONE_LABEL: Record<(typeof hoursAloneOptions)[number], string> = {
  under_4: "Do 4 godzin",
  "4_to_8": "Od 4 do 8 godzin",
  over_8: "Ponad 8 godzin",
};

export const CHILDREN_AT_HOME_LABEL: Record<
  (typeof childrenAtHomeOptions)[number],
  string
> = {
  none: "Nie",
  under_6: "Tak, poniżej 6 lat",
  "6_plus": "Tak, 6 lat lub starsze",
};

export const EXPERIENCE_LABEL: Record<(typeof experienceLevels)[number], string> = {
  first_time: "To będzie moje pierwsze zwierzę",
  some: "Mam już za sobą opiekę nad zwierzęciem",
  experienced: "Mam duże doświadczenie, także z trudniejszymi zwierzętami",
};

export const ACTIVITY_LEVEL_LABEL: Record<number, string> = {
  1: "1 — głównie domator",
  2: "2 — krótkie spacery",
  3: "3 — umiarkowanie aktywny tryb życia",
  4: "4 — codzienne długie spacery",
  5: "5 — bieganie, góry, dużo ruchu",
};
