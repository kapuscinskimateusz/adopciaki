"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/supabase/auth";
import type { AnimalFormState } from "./form-state";
import { animalCompatibilityFields, animalFormSchema } from "./schema";

const animalIdSchema = z.uuid();

function parseAnimalForm(formData: FormData) {
  return animalFormSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed"),
    age_months: formData.get("age_months"),
    sex: formData.get("sex"),
    size: formData.get("size"),
    energy_level: formData.get("energy_level"),
    description: formData.get("description"),
    traits: formData.get("traits"),
    ...Object.fromEntries(
      animalCompatibilityFields.map((field) => [field, formData.get(field)]),
    ),
    publication_status: formData.get("publication_status"),
    adoption_status: formData.get("adoption_status"),
  });
}

function databaseErrorState(
  operation: string,
  error: { code?: string; message: string },
): AnimalFormState {
  console.error(`Animal ${operation} failed`, {
    code: error.code,
    message: error.message,
  });

  if (error.code === "23505") {
    return { message: "Ten adres zwierzęcia jest już używany. Wybierz inny." };
  }

  return {
    message: "Nie udało się zapisać zwierzęcia. Spróbuj ponownie.",
  };
}

export async function createAnimalAction(
  _previousState: AnimalFormState,
  formData: FormData,
): Promise<AnimalFormState> {
  await requireStaff("/admin/animals/new");

  const parsed = parseAnimalForm(formData);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Sprawdź oznaczone pola i popraw formularz.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animals")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return databaseErrorState("creation", error);
  }

  revalidatePath("/admin/animals");
  redirect(`/admin/animals/${data.id}/edit`);
}

export async function updateAnimalAction(
  animalId: string,
  _previousState: AnimalFormState,
  formData: FormData,
): Promise<AnimalFormState> {
  await requireStaff(`/admin/animals/${animalId}/edit`);

  const parsedId = animalIdSchema.safeParse(animalId);
  if (!parsedId.success) {
    return { message: "Nieprawidłowy identyfikator zwierzęcia." };
  }

  const parsed = parseAnimalForm(formData);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Sprawdź oznaczone pola i popraw formularz.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animals")
    .update(parsed.data)
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error) {
    return databaseErrorState("update", error);
  }
  if (!data) {
    return { message: "Nie znaleziono zwierzęcia do edycji." };
  }

  revalidatePath("/admin/animals");
  revalidatePath(`/admin/animals/${parsedId.data}/edit`);
  redirect("/admin/animals");
}
