"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { PreferencesFormState } from "./form-state";
import { preferencesFields, preferencesFormSchema } from "./schema";

export async function savePreferencesAction(
  _previousState: PreferencesFormState,
  formData: FormData,
): Promise<PreferencesFormState> {
  const user = await requireCurrentUser("/account/matches/survey");

  const parsed = preferencesFormSchema.safeParse({
    preferred_species: formData.getAll("preferred_species"),
    preferred_sizes: formData.getAll("preferred_sizes"),
    housing: formData.get("housing"),
    hours_alone: formData.get("hours_alone"),
    activity_level: formData.get("activity_level"),
    children_at_home: formData.get("children_at_home"),
    has_dogs: formData.get("has_dogs"),
    has_cats: formData.get("has_cats"),
    experience: formData.get("experience"),
  });
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Sprawdź oznaczone pytania i popraw odpowiedzi.",
      values: Object.fromEntries(
        preferencesFields.map((field) => [
          field,
          formData.getAll(field).filter((value) => typeof value === "string"),
        ]),
      ),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("adopter_preferences")
    .upsert(
      { ...parsed.data, user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) {
    console.error("Saving preferences failed", {
      code: error.code,
      message: error.message,
    });
    return { message: "Nie udało się zapisać ankiety. Spróbuj ponownie." };
  }

  revalidatePath("/account", "layout");
  redirect("/account/matches");
}
