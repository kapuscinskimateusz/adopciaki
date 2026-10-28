"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { initialAnimalFormState, type AnimalFormAction } from "./form-state";
import {
  animalAdoptionStatuses,
  animalPublicationStatuses,
  animalSexes,
  animalSizes,
  animalSpecies,
  type AnimalRecord,
} from "./schema";
import {
  animalAdoptionStatusLabels,
  animalPublicationStatusLabels,
  animalSexLabels,
  animalSizeLabels,
  animalSpeciesLabels,
} from "./labels";

function fieldClass(invalid: boolean) {
  return [
    "border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2",
    invalid ? "border-destructive" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function FieldError({ id, error }: { id: string; error?: string[] }) {
  const message = error?.[0];
  if (!message) return null;

  return (
    <p id={`${id}-error`} className="text-destructive text-sm" role="alert">
      {message}
    </p>
  );
}

export function AnimalForm({
  action,
  animal,
}: {
  action: AnimalFormAction;
  animal?: AnimalRecord;
}) {
  const [state, formAction, pending] = useActionState(action, initialAnimalFormState);
  const errors = state.errors;

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Imię
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={80}
            defaultValue={animal?.name ?? ""}
            aria-invalid={Boolean(errors?.name?.length)}
            aria-describedby={errors?.name?.length ? "name-error" : undefined}
            className={fieldClass(Boolean(errors?.name?.length))}
          />
          <FieldError id="name" error={errors?.name} />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Adres (slug)
          </label>
          <input
            id="slug"
            name="slug"
            required
            maxLength={100}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Małe litery bez polskich znaków, cyfry i łączniki."
            defaultValue={animal?.slug ?? ""}
            aria-invalid={Boolean(errors?.slug?.length)}
            aria-describedby={errors?.slug?.length ? "slug-error" : "slug-hint"}
            className={fieldClass(Boolean(errors?.slug?.length))}
          />
          <p id="slug-hint" className="text-muted-foreground text-xs">
            Unikalny adres profilu, np. „luna”.
          </p>
          <FieldError id="slug" error={errors?.slug} />
        </div>

        <div className="space-y-2">
          <label htmlFor="species" className="text-sm font-medium">
            Gatunek
          </label>
          <select
            id="species"
            name="species"
            required
            defaultValue={animal?.species ?? ""}
            aria-invalid={Boolean(errors?.species?.length)}
            aria-describedby={errors?.species?.length ? "species-error" : undefined}
            className={fieldClass(Boolean(errors?.species?.length))}
          >
            <option value="" disabled>
              Wybierz gatunek
            </option>
            {animalSpecies.map((species) => (
              <option key={species} value={species}>
                {animalSpeciesLabels[species]}
              </option>
            ))}
          </select>
          <FieldError id="species" error={errors?.species} />
        </div>

        <div className="space-y-2">
          <label htmlFor="breed" className="text-sm font-medium">
            Rasa
          </label>
          <input
            id="breed"
            name="breed"
            required
            maxLength={120}
            defaultValue={animal?.breed ?? ""}
            aria-invalid={Boolean(errors?.breed?.length)}
            aria-describedby={errors?.breed?.length ? "breed-error" : undefined}
            className={fieldClass(Boolean(errors?.breed?.length))}
          />
          <FieldError id="breed" error={errors?.breed} />
        </div>

        <div className="space-y-2">
          <label htmlFor="age_months" className="text-sm font-medium">
            Wiek w miesiącach
          </label>
          <input
            id="age_months"
            name="age_months"
            type="number"
            min={0}
            step={1}
            defaultValue={animal?.age_months ?? ""}
            aria-invalid={Boolean(errors?.age_months?.length)}
            aria-describedby={
              errors?.age_months?.length ? "age_months-error" : "age_months-hint"
            }
            className={fieldClass(Boolean(errors?.age_months?.length))}
          />
          <p id="age_months-hint" className="text-muted-foreground text-xs">
            Pozostaw puste, jeśli wiek nie jest znany.
          </p>
          <FieldError id="age_months" error={errors?.age_months} />
        </div>

        <div className="space-y-2">
          <label htmlFor="sex" className="text-sm font-medium">
            Płeć
          </label>
          <select
            id="sex"
            name="sex"
            required
            defaultValue={animal?.sex ?? ""}
            aria-invalid={Boolean(errors?.sex?.length)}
            aria-describedby={errors?.sex?.length ? "sex-error" : undefined}
            className={fieldClass(Boolean(errors?.sex?.length))}
          >
            <option value="" disabled>
              Wybierz płeć
            </option>
            {animalSexes.map((sex) => (
              <option key={sex} value={sex}>
                {animalSexLabels[sex]}
              </option>
            ))}
          </select>
          <FieldError id="sex" error={errors?.sex} />
        </div>

        <div className="space-y-2">
          <label htmlFor="size" className="text-sm font-medium">
            Wielkość
          </label>
          <select
            id="size"
            name="size"
            required
            defaultValue={animal?.size ?? ""}
            aria-invalid={Boolean(errors?.size?.length)}
            aria-describedby={errors?.size?.length ? "size-error" : undefined}
            className={fieldClass(Boolean(errors?.size?.length))}
          >
            <option value="" disabled>
              Wybierz wielkość
            </option>
            {animalSizes.map((size) => (
              <option key={size} value={size}>
                {animalSizeLabels[size]}
              </option>
            ))}
          </select>
          <FieldError id="size" error={errors?.size} />
        </div>

        <div className="space-y-2">
          <label htmlFor="energy_level" className="text-sm font-medium">
            Poziom energii (1–5)
          </label>
          <select
            id="energy_level"
            name="energy_level"
            required
            defaultValue={animal?.energy_level ?? ""}
            aria-invalid={Boolean(errors?.energy_level?.length)}
            aria-describedby={
              errors?.energy_level?.length ? "energy_level-error" : undefined
            }
            className={fieldClass(Boolean(errors?.energy_level?.length))}
          >
            <option value="" disabled>
              Wybierz poziom
            </option>
            {[1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <FieldError id="energy_level" error={errors?.energy_level} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={5000}
          rows={6}
          defaultValue={animal?.description ?? ""}
          aria-invalid={Boolean(errors?.description?.length)}
          aria-describedby={errors?.description?.length ? "description-error" : undefined}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
        />
        <FieldError id="description" error={errors?.description} />
      </div>

      <div className="space-y-2">
        <label htmlFor="traits" className="text-sm font-medium">
          Cechy
        </label>
        <textarea
          id="traits"
          name="traits"
          rows={3}
          maxLength={1000}
          defaultValue={animal?.traits.join("\n") ?? ""}
          aria-invalid={Boolean(errors?.traits?.length)}
          aria-describedby={errors?.traits?.length ? "traits-error" : "traits-hint"}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
        />
        <p id="traits-hint" className="text-muted-foreground text-xs">
          Jedna cecha w każdym wierszu, maksymalnie 20.
        </p>
        <FieldError id="traits" error={errors?.traits} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="publication_status" className="text-sm font-medium">
            Widoczność
          </label>
          <select
            id="publication_status"
            name="publication_status"
            required
            defaultValue={animal?.publication_status ?? "draft"}
            aria-invalid={Boolean(errors?.publication_status?.length)}
            aria-describedby={
              errors?.publication_status?.length ? "publication_status-error" : undefined
            }
            className={fieldClass(Boolean(errors?.publication_status?.length))}
          >
            {animalPublicationStatuses.map((status) => (
              <option key={status} value={status}>
                {animalPublicationStatusLabels[status]}
              </option>
            ))}
          </select>
          <FieldError id="publication_status" error={errors?.publication_status} />
        </div>

        <div className="space-y-2">
          <label htmlFor="adoption_status" className="text-sm font-medium">
            Status adopcji
          </label>
          <select
            id="adoption_status"
            name="adoption_status"
            required
            defaultValue={animal?.adoption_status ?? "available"}
            aria-invalid={Boolean(errors?.adoption_status?.length)}
            aria-describedby={
              errors?.adoption_status?.length ? "adoption_status-error" : undefined
            }
            className={fieldClass(Boolean(errors?.adoption_status?.length))}
          >
            {animalAdoptionStatuses.map((status) => (
              <option key={status} value={status}>
                {animalAdoptionStatusLabels[status]}
              </option>
            ))}
          </select>
          <FieldError id="adoption_status" error={errors?.adoption_status} />
        </div>
      </div>

      {state.message && (
        <p
          className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : animal ? "Zapisz zmiany" : "Dodaj zwierzę"}
        </Button>
        <Link
          href="/admin/animals"
          className="border-border hover:bg-muted inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium"
        >
          Anuluj
        </Link>
      </div>
    </form>
  );
}
