"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { AuthField } from "./auth-field";
import { AuthMessage } from "./auth-message";
import { initialAuthFormState } from "./form-state";
import { updatePasswordAction } from "./actions";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(
    updatePasswordAction,
    initialAuthFormState,
  );

  return (
    <form action={action} className="space-y-5">
      <AuthField
        id="password"
        label="Nowe hasło (co najmniej 8 znaków)"
        type="password"
        autoComplete="new-password"
        error={state.errors?.password}
      />
      <AuthField
        id="confirmPassword"
        label="Powtórz nowe hasło"
        type="password"
        autoComplete="new-password"
        error={state.errors?.confirmPassword}
      />
      <AuthMessage message={state.message} success={state.success} />
      <Button type="submit" className="h-11 w-full rounded-full" disabled={pending}>
        {pending ? "Zapisywanie…" : "Zmień hasło"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
