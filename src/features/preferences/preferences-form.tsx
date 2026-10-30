"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { animalSizes, animalSpecies } from "@/features/admin/animals/schema";
import { animalSizeLabels, animalSpeciesLabels } from "@/features/admin/animals/labels";
import { AuthMessage } from "@/features/auth/auth-message";
import { savePreferencesAction } from "./actions";
import {
  initialPreferencesFormState,
  toFormValues,
  type PreferencesFormValues,
} from "./form-state";
import {
  ACTIVITY_LEVEL_LABEL,
  CHILDREN_AT_HOME_LABEL,
  EXPERIENCE_LABEL,
  HOURS_ALONE_LABEL,
  HOUSING_LABEL,
} from "./labels";
import {
  childrenAtHomeOptions,
  experienceLevels,
  hoursAloneOptions,
  housingTypes,
  type AdopterPreferences,
  type PreferencesFormField,
} from "./schema";

const optionClass =
  "border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-ring flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm has-[:focus-visible]:ring-2";

function Question({
  field,
  legend,
  hint,
  error,
  children,
}: {
  field: PreferencesFormField;
  legend: string;
  hint?: string;
  error?: string[];
  children: ReactNode;
}) {
  const message = error?.[0];
  return (
    <fieldset
      className="space-y-3"
      aria-invalid={Boolean(message)}
      aria-describedby={message ? `${field}-error` : hint ? `${field}-hint` : undefined}
    >
      <legend className="font-heading text-lg font-semibold">{legend}</legend>
      {hint && (
        <p id={`${field}-hint`} className="text-muted-foreground -mt-1 text-sm">
          {hint}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
      {message && (
        <p id={`${field}-error`} className="text-destructive text-sm" role="alert">
          {message}
        </p>
      )}
    </fieldset>
  );
}

export function PreferencesForm({
  preferences,
}: {
  preferences: AdopterPreferences | null;
}) {
  const [state, formAction, pending] = useActionState(
    savePreferencesAction,
    initialPreferencesFormState,
  );
  const errors = state.errors;
  const values: PreferencesFormValues =
    state.values ?? (preferences ? toFormValues(preferences) : {});
  const isChecked = (field: PreferencesFormField, value: string) =>
    values[field]?.includes(value) ?? false;

  const choice = (
    type: "radio" | "checkbox",
    field: PreferencesFormField,
    value: string,
    label: string,
  ) => (
    <label key={value} className={optionClass}>
      <input
        type={type}
        name={field}
        value={value}
        required={type === "radio"}
        defaultChecked={isChecked(field, value)}
        className="accent-primary size-4"
      />
      {label}
    </label>
  );

  return (
    <form action={formAction} className="space-y-9">
      <Question
        field="preferred_species"
        legend="Jakiego zwierzaka szukasz?"
        hint="Możesz wybrać kilka gatunków."
        error={errors?.preferred_species}
      >
        {animalSpecies.map((species) =>
          choice("checkbox", "preferred_species", species, animalSpeciesLabels[species]),
        )}
      </Question>

      <Question
        field="preferred_sizes"
        legend="Jaki rozmiar Ci odpowiada?"
        hint="Nie zaznaczaj niczego, jeśli rozmiar nie ma znaczenia."
        error={errors?.preferred_sizes}
      >
        {animalSizes.map((size) =>
          choice("checkbox", "preferred_sizes", size, animalSizeLabels[size]),
        )}
      </Question>

      <Question field="housing" legend="Gdzie mieszkasz?" error={errors?.housing}>
        {housingTypes.map((housing) =>
          choice("radio", "housing", housing, HOUSING_LABEL[housing]),
        )}
      </Question>

      <Question
        field="hours_alone"
        legend="Jak długo w ciągu dnia zwierzę będzie samo?"
        error={errors?.hours_alone}
      >
        {hoursAloneOptions.map((hours) =>
          choice("radio", "hours_alone", hours, HOURS_ALONE_LABEL[hours]),
        )}
      </Question>

      <Question
        field="activity_level"
        legend="Jak aktywny jest Twój tryb życia?"
        error={errors?.activity_level}
      >
        {[1, 2, 3, 4, 5].map((level) =>
          choice("radio", "activity_level", String(level), ACTIVITY_LEVEL_LABEL[level]),
        )}
      </Question>

      <Question
        field="children_at_home"
        legend="Czy w domu są dzieci?"
        error={errors?.children_at_home}
      >
        {childrenAtHomeOptions.map((option) =>
          choice("radio", "children_at_home", option, CHILDREN_AT_HOME_LABEL[option]),
        )}
      </Question>

      <Question
        field="has_dogs"
        legend="Czy masz już inne zwierzęta?"
        hint="Zaznacz wszystkie, które mieszkają z Tobą."
        error={errors?.has_dogs ?? errors?.has_cats}
      >
        {choice("checkbox", "has_dogs", "on", "Mam psa")}
        {choice("checkbox", "has_cats", "on", "Mam kota")}
      </Question>

      <Question
        field="experience"
        legend="Jakie masz doświadczenie?"
        error={errors?.experience}
      >
        {experienceLevels.map((level) =>
          choice("radio", "experience", level, EXPERIENCE_LABEL[level]),
        )}
      </Question>

      <AuthMessage message={state.message} />

      <Button type="submit" className="h-11 rounded-full px-7" disabled={pending}>
        {pending ? "Zapisywanie…" : "Zapisz i zobacz dopasowania"}
      </Button>
    </form>
  );
}
