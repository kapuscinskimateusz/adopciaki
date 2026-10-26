"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { AuthField } from "./auth-field";
import { AuthMessage } from "./auth-message";
import { signUpAction } from "./actions";
import { initialAuthFormState } from "./form-state";

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUpAction, initialAuthFormState);

  return (
    <form action={action} className="space-y-5">
      <AuthField
        id="email"
        label="Adres e-mail"
        type="email"
        autoComplete="email"
        error={state.errors?.email}
      />
      <AuthField
        id="password"
        label="Hasło (co najmniej 8 znaków)"
        type="password"
        autoComplete="new-password"
        error={state.errors?.password}
      />
      <AuthField
        id="confirmPassword"
        label="Powtórz hasło"
        type="password"
        autoComplete="new-password"
        error={state.errors?.confirmPassword}
      />
      <AuthMessage message={state.message} success={state.success} />
      <Button type="submit" className="h-11 w-full rounded-full" disabled={pending}>
        {pending ? "Zakładanie konta…" : "Załóż konto"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Masz już konto?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
