import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { signOutAction } from "@/features/auth/actions";
import { requireCurrentUser } from "@/lib/supabase/auth";

export default async function AccountPage() {
  const user = await requireCurrentUser();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:py-16">
      <div className="flex items-center justify-between">
        <Logo />
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="rounded-full">
            Wyloguj się
          </Button>
        </form>
      </div>
      <section className="bg-card border-border mt-10 rounded-3xl border p-6 sm:mt-16 sm:p-10">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Twoje konto
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight">
          Witaj w Adopciakach
        </h1>
        <p className="text-muted-foreground mt-3">
          Zalogowano jako <strong className="text-foreground">{user.email}</strong>.
        </p>
        <p className="text-muted-foreground mt-6 text-sm">
          Funkcje profilu i ulubionych pojawią się w kolejnych etapach projektu.
        </p>
        <Link
          href="/"
          className="text-primary mt-6 inline-block text-sm underline-offset-4 hover:underline"
        >
          Wróć do katalogu zwierząt
        </Link>
      </section>
    </main>
  );
}
