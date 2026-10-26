"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { AuthField } from "./auth-field";
import { AuthMessage } from "./auth-message";
import { signInAction } from "./actions";
import { initialAuthFormState } from "./form-state";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInAction, initialAuthFormState);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <AuthField
        id="email"
        label="Adres e-mail"
        type="email"
        autoComplete="email"
        error={state.errors?.email}
      />
      <AuthField
        id="password"
        label="Hasło"
        type="password"
        autoComplete="current-password"
        error={state.errors?.password}
      />
      <AuthMessage message={state.message} success={state.success} />
      <Button type="submit" className="h-11 w-full rounded-full" disabled={pending}>
        {pending ? "Logowanie…" : "Zaloguj się"}
      </Button>
      <div className="flex flex-col gap-2 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-primary underline-offset-4 hover:underline"
        >
          Nie pamiętasz hasła?
        </Link>
        <p className="text-muted-foreground">
          Nie masz konta?{" "}
          <Link
            href="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            Załóż konto
          </Link>
        </p>
      </div>
    </form>
  );
}
