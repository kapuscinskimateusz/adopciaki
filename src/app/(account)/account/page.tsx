import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AnimalCard } from "@/features/animals/animal-card";
import { getFavoriteAnimals } from "@/features/animals/data";
import { getOwnPreferences } from "@/features/preferences/data";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

export default async function AccountPage() {
  const user = await requireCurrentUser();
  const [favorites, preferences] = await Promise.all([
    getFavoriteAnimals(),
    getOwnPreferences(),
  ]);

  return (
    <>
      <section className="bg-card border-border mt-8 rounded-3xl border p-6 sm:p-10">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Twoje konto
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight">
          Witaj w Adopciakach
        </h1>
        <p className="text-muted-foreground mt-3">
          Zalogowano jako <strong className="text-foreground">{user.email}</strong>.
        </p>
        <p className="text-muted-foreground mt-6">
          {preferences
            ? "Twoja ankieta jest zapisana. Zobacz zwierzaki, które mogą do Ciebie pasować."
            : "Odpowiedz na kilka pytań, a pokażemy zwierzaki, które mogą do Ciebie pasować."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={preferences ? "/account/recommendations" : "/account/preferences"}
            className={cn(buttonVariants(), "h-11 rounded-full px-6")}
          >
            {preferences ? "Zobacz dopasowania" : "Wypełnij ankietę"}
            <ArrowRight className="size-4" />
          </Link>
          {preferences && (
            <Link
              href="/account/preferences"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-full px-6",
              )}
            >
              Zmień odpowiedzi
            </Link>
          )}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="favorites-heading">
        <h2 id="favorites-heading" className="font-heading text-2xl font-semibold">
          Ulubione
        </h2>
        {favorites.length > 0 ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {favorites.map((animal) => (
              <li key={animal.id} className="flex flex-col [&>article]:flex-1">
                <AnimalCard animal={animal} isFavorite returnTo="/account" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-3">
            Nie masz jeszcze ulubionych zwierząt.{" "}
            <Link
              href="/animals"
              className="text-primary underline-offset-4 hover:underline"
            >
              Przeglądaj katalog
            </Link>
            .
          </p>
        )}
      </section>
    </>
  );
}
