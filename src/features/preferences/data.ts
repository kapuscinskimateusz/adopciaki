import "server-only";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  adopterPreferencesSchema,
  PREFERENCES_COLUMNS,
  type AdopterPreferences,
} from "./schema";

// Staff może czytać wszystkie ankiety (RLS), dlatego zawsze filtrujemy po własnym id.
export async function getOwnPreferences(): Promise<AdopterPreferences | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("adopter_preferences")
    .select(PREFERENCES_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się pobrać preferencji: ${error.message}`);
  }
  if (!data) return null;

  const parsed = adopterPreferencesSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Supabase zwrócił nieprawidłowe preferencje: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}
