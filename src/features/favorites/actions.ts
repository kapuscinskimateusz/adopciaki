"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/features/auth/redirect";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { toggleFavoriteSchema } from "./schema";

export async function toggleFavoriteAction(formData: FormData) {
  const returnTo = safeRedirectPath(formData.get("returnTo")?.toString(), "/animals");
  // Gość trafia do logowania i wraca na stronę, z której kliknął serce.
  const user = await requireCurrentUser(returnTo);

  const parsed = toggleFavoriteSchema.safeParse({
    animalId: formData.get("animalId"),
    favorite: formData.get("favorite"),
  });
  if (!parsed.success) {
    redirect(returnTo);
  }

  const supabase = await createClient();
  if (parsed.data.favorite) {
    const { error } = await supabase
      .from("favorites")
      .upsert(
        { user_id: user.id, animal_id: parsed.data.animalId },
        { onConflict: "user_id,animal_id", ignoreDuplicates: true },
      );
    if (error) {
      throw new Error(`Nie udało się dodać do ulubionych: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("animal_id", parsed.data.animalId);
    if (error) {
      throw new Error(`Nie udało się usunąć z ulubionych: ${error.message}`);
    }
  }

  revalidatePath("/", "layout");
}
