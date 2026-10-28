import { z } from "zod";

export const animalSpecies = ["dog", "cat", "rabbit"] as const;
export const animalSexes = ["male", "female", "unknown"] as const;
export const animalSizes = ["small", "medium", "large"] as const;
export const animalPublicationStatuses = ["draft", "published", "archived"] as const;
export const animalAdoptionStatuses = ["available", "meeting", "adopted"] as const;

const ageMonthsSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return null;
    return typeof value === "string" ? Number(value) : value;
  },
  z.number({ error: "Podaj prawidłowy wiek w miesiącach." }).int().min(0).nullable(),
);

const energyLevelSchema = z.preprocess(
  (value) => (typeof value === "string" ? Number(value) : value),
  z
    .number({ error: "Wybierz poziom energii." })
    .int()
    .min(1, { error: "Poziom energii musi być w zakresie 1–5." })
    .max(5, { error: "Poziom energii musi być w zakresie 1–5." }),
);

const traitsSchema = z
  .string()
  .max(1000, { error: "Cechy mogą łącznie zajmować maksymalnie 1000 znaków." })
  .superRefine((value, context) => {
    const traits = value
      .split(/\r?\n/)
      .map((trait) => trait.trim())
      .filter(Boolean);

    if (traits.length > 20) {
      context.addIssue({
        code: "custom",
        message: "Możesz podać maksymalnie 20 cech.",
      });
    }

    if (traits.some((trait) => trait.length > 80)) {
      context.addIssue({
        code: "custom",
        message: "Każda cecha może mieć maksymalnie 80 znaków.",
      });
    }
  })
  .transform((value) =>
    value
      .split(/\r?\n/)
      .map((trait) => trait.trim())
      .filter(Boolean),
  );

export const animalFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, { error: "Podaj adres zwierzęcia." })
    .max(100, { error: "Adres może mieć maksymalnie 100 znaków." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Użyj małych liter bez polskich znaków, cyfr i łączników.",
    }),
  name: z
    .string()
    .trim()
    .min(1, { error: "Podaj imię zwierzęcia." })
    .max(80, { error: "Imię może mieć maksymalnie 80 znaków." }),
  species: z.enum(animalSpecies, { error: "Wybierz gatunek." }),
  breed: z
    .string()
    .trim()
    .min(1, { error: "Podaj rasę lub wpisz „Mieszaniec”." })
    .max(120, { error: "Rasa może mieć maksymalnie 120 znaków." }),
  age_months: ageMonthsSchema,
  sex: z.enum(animalSexes, { error: "Wybierz płeć." }),
  size: z.enum(animalSizes, { error: "Wybierz rozmiar." }),
  energy_level: energyLevelSchema,
  description: z
    .string()
    .trim()
    .min(1, { error: "Dodaj krótki opis zwierzęcia." })
    .max(5000, { error: "Opis może mieć maksymalnie 5000 znaków." }),
  traits: traitsSchema,
  publication_status: z.enum(animalPublicationStatuses, {
    error: "Wybierz status publikacji.",
  }),
  adoption_status: z.enum(animalAdoptionStatuses, {
    error: "Wybierz status adopcji.",
  }),
});

export type AnimalFormField = keyof z.input<typeof animalFormSchema>;
export type AnimalFormValues = z.output<typeof animalFormSchema>;

export const animalRecordSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  species: z.enum(animalSpecies),
  breed: z.string(),
  age_months: z.number().int().nullable(),
  sex: z.enum(animalSexes),
  size: z.enum(animalSizes),
  energy_level: z.number().int(),
  description: z.string(),
  traits: z.array(z.string()),
  publication_status: z.enum(animalPublicationStatuses),
  adoption_status: z.enum(animalAdoptionStatuses),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AnimalRecord = z.infer<typeof animalRecordSchema>;

export const animalListItemSchema = animalRecordSchema.pick({
  id: true,
  slug: true,
  name: true,
  species: true,
  publication_status: true,
  adoption_status: true,
  created_at: true,
});

export type AnimalListItem = z.infer<typeof animalListItemSchema>;
