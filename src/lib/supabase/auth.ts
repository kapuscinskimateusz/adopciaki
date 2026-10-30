import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/features/auth/redirect";
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

export async function requireCurrentUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeRedirectPath(next))}`);
  }
  return user;
}

// Rola zawsze z tabeli profiles (RLS), nigdy z user metadata.
const getRole = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się sprawdzić roli użytkownika: ${error.message}`);
  }
  return profile?.role === "staff" ? "staff" : "adopter";
});

export type Viewer = { email: string; isStaff: boolean } | null;

// Dla nagłówka publicznego: awaria Supabase degraduje do widoku gościa zamiast psuć stronę.
export const getCurrentViewer = cache(async (): Promise<Viewer> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    return { email: user.email, isStaff: (await getRole(user.id)) === "staff" };
  } catch {
    return null;
  }
});

export async function requireStaff(next = "/admin") {
  const user = await requireCurrentUser(next);
  if ((await getRole(user.id)) !== "staff") {
    redirect("/account");
  }
  return user;
}

// Konto adoptującego (ankieta, ulubione) nie jest dostępne dla staff: staff pracuje w panelu.
export async function requireAdopter(next = "/account") {
  const user = await requireCurrentUser(next);
  if ((await getRole(user.id)) === "staff") {
    redirect("/admin");
  }
  return user;
}
