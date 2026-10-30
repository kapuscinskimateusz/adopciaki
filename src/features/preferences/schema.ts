import { z } from "zod";
import { animalSizes, animalSpecies } from "@/features/admin/animals/schema";

export const housingTypes = ["apartment", "house", "house_with_garden"] as const;
export const hoursAloneOptions = ["under_4", "4_to_8", "over_8"] as const;
export const childrenAtHomeOptions = ["none", "under_6", "6_plus"] as const;
export const experienceLevels = ["first_time", "some", "experienced"] as const;

const activityLevelSchema = z.preprocess(
  (value) => (typeof value === "string" ? Number(value) : value),
  z
    .number({ error: "Wybierz poziom aktywności." })
    .int()
    .min(1, { error: "Poziom aktywności musi być w zakresie 1–5." })
    .max(5, { error: "Poziom aktywności musi być w zakresie 1–5." }),
);

// Pola wielokrotnego wyboru przychodzą z formData.getAll(); duplikaty usuwamy.
function uniqueList<T extends readonly [string, ...string[]]>(values: T) {
  return z.array(z.enum(values)).transform((list) => [...new Set(list)]);
}

// Niezaznaczony checkbox nie trafia do formularza, więc brak wartości oznacza „nie”.
const checkboxSchema = z
  .union([z.literal("on"), z.null()])
  .transform((value) => value === "on");

export const preferencesFormSchema = z.object({
  preferred_species: uniqueList(animalSpecies).refine((list) => list.length > 0, {
    error: "Wybierz co najmniej jeden gatunek.",
  }),
  preferred_sizes: uniqueList(animalSizes),
  housing: z.enum(housingTypes, { error: "Wybierz rodzaj domu." }),
  hours_alone: z.enum(hoursAloneOptions, {
    error: "Określ, jak długo zwierzę będzie samo.",
  }),
  activity_level: activityLevelSchema,
  children_at_home: z.enum(childrenAtHomeOptions, {
    error: "Określ, czy w domu są dzieci.",
  }),
  has_dogs: checkboxSchema,
  has_cats: checkboxSchema,
  experience: z.enum(experienceLevels, { error: "Określ swoje doświadczenie." }),
});

export type PreferencesFormField = keyof z.input<typeof preferencesFormSchema>;
export const preferencesFields = Object.keys(
  preferencesFormSchema.shape,
) as PreferencesFormField[];

export const adopterPreferencesSchema = z.object({
  preferred_species: z.array(z.enum(animalSpecies)).min(1),
  preferred_sizes: z.array(z.enum(animalSizes)),
  housing: z.enum(housingTypes),
  hours_alone: z.enum(hoursAloneOptions),
  activity_level: z.number().int().min(1).max(5),
  children_at_home: z.enum(childrenAtHomeOptions),
  has_dogs: z.boolean(),
  has_cats: z.boolean(),
  experience: z.enum(experienceLevels),
});

export type AdopterPreferences = z.infer<typeof adopterPreferencesSchema>;

export const PREFERENCES_COLUMNS =
  "preferred_species, preferred_sizes, housing, hours_alone, activity_level, children_at_home, has_dogs, has_cats, experience";
