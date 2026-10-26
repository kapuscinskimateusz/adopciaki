"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { AuthField } from "./auth-field";
import { AuthMessage } from "./auth-message";
import { requestPasswordResetAction } from "./actions";
import { initialAuthFormState } from "./form-state";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialAuthFormState,
  );

  return (
    <form action={action} className="space-y-5">
      <AuthField
        id="email"
        label="Adres e-mail"
        type="email"
        autoComplete="email"
        error={state.errors?.email}
      />
      <AuthMessage message={state.message} success={state.success} />
      <Button type="submit" className="h-11 w-full rounded-full" disabled={pending}>
        {pending ? "Wysyłanie…" : "Wyślij link do zmiany hasła"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
