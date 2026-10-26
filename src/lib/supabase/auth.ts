import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (error.name === "AuthSessionMissingError") {
      return null;
    }
    throw new Error(`Nie udało się zweryfikować sesji użytkownika: ${error.message}`);
  }

  if (!data.user?.email_confirmed_at) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? "",
  };
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/account")}`);
  }
  return user;
}

export async function requireStaff() {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się sprawdzić roli użytkownika: ${error.message}`);
  }

  if (profile?.role !== "staff") {
    redirect("/account");
  }

  return user;
}
