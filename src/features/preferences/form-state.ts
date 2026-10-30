import type { AdopterPreferences, PreferencesFormField } from "./schema";

// Surowe odpowiedzi jako listy tekstów: pozwalają odtworzyć formularz po błędzie walidacji.
export type PreferencesFormValues = Partial<Record<PreferencesFormField, string[]>>;

export type PreferencesFormState = {
  errors?: Partial<Record<PreferencesFormField, string[] | undefined>>;
  message?: string;
  values?: PreferencesFormValues;
};

export const initialPreferencesFormState: PreferencesFormState = {};

export function toFormValues(prefs: AdopterPreferences): PreferencesFormValues {
  return {
    preferred_species: prefs.preferred_species,
    preferred_sizes: prefs.preferred_sizes,
    housing: [prefs.housing],
    hours_alone: [prefs.hours_alone],
    activity_level: [String(prefs.activity_level)],
    children_at_home: [prefs.children_at_home],
    has_dogs: prefs.has_dogs ? ["on"] : [],
    has_cats: prefs.has_cats ? ["on"] : [],
    experience: [prefs.experience],
  };
}
