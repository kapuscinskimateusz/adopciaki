"use server";

import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "./form-state";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "./schema";
import { defaultPathForRole, safeRedirectPath } from "./redirect";

function authCallbackUrl(next: string) {
  const callback = new URL("/auth/callback", publicEnv.NEXT_PUBLIC_SITE_URL);
  callback.searchParams.set("next", safeRedirectPath(next));
  return callback.toString();
}

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

function logAuthError(
  operation: string,
  error: { code?: string; status?: number; message: string },
) {
  console.error(`Supabase auth ${operation} failed`, {
    code: error.code,
    status: error.status,
    message: error.message,
  });
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: authCallbackUrl("/account") },
  });

  if (error) {
    logAuthError("sign-up", error);
    return {
      message: "Nie udało się rozpocząć rejestracji. Sprawdź dane i spróbuj ponownie.",
    };
  }

  if (data.session && data.user?.email_confirmed_at) {
    redirect("/account");
  }

  if (data.session) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(
        `Nie udało się zamknąć niepotwierdzonej sesji: ${signOutError.message}`,
      );
    }
  }

  return {
    success:
      "Jeśli rejestracja dla tego adresu jest możliwa, wyślemy wiadomość z linkiem potwierdzającym.",
  };
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      message:
        error.code === "email_not_confirmed"
          ? "Potwierdź adres e-mail z wiadomości, którą otrzymałeś po rejestracji."
          : "Nieprawidłowy adres e-mail lub hasło.",
    };
  }

  if (!data.user?.email_confirmed_at) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(
        `Nie udało się zamknąć niepotwierdzonej sesji: ${signOutError.message}`,
      );
    }
    return {
      message: "Potwierdź adres e-mail z wiadomości, którą otrzymałeś po rejestracji.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `Nie udało się odczytać roli po zalogowaniu: ${profileError.message}`,
    );
  }
  if (!profile) {
    throw new Error("Zalogowany użytkownik nie ma utworzonego profilu.");
  }

  if (profile.role !== "staff" && profile.role !== "adopter") {
    throw new Error(`Profil ma nieobsługiwaną rolę: ${profile.role}`);
  }
  redirect(
    safeRedirectPath(formString(formData, "next"), defaultPathForRole(profile.role)),
  );
}

export async function requestPasswordResetAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: authCallbackUrl("/update-password"),
  });

  if (error) {
    logAuthError("password reset email", error);
    return {
      message: "Nie udało się wysłać wiadomości. Spróbuj ponownie później.",
    };
  }

  return {
    success:
      "Jeśli konto z tym adresem istnieje, wyślemy wiadomość z linkiem do zmiany hasła.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError) {
    if (userError.name === "AuthSessionMissingError") {
      redirect("/login");
    }
    throw new Error(
      `Nie udało się zweryfikować sesji przed zmianą hasła: ${userError.message}`,
    );
  }
  if (!data.user?.email_confirmed_at) {
    redirect("/login");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    logAuthError("password update", error);
    return { message: "Nie udało się zmienić hasła. Spróbuj ponownie." };
  }

  redirect("/login?notice=password-updated");
}

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Nie udało się wylogować: ${error.message}`);
  }

  redirect("/login");
}
