import type { Metadata } from "next";
import Link from "next/link";
import { AnimalCard } from "@/features/animals/animal-card";
import { getFavoriteAnimals } from "@/features/animals/data";
import { requireAdopter } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Ulubione",
  robots: { index: false },
};

export default async function FavoritesPage() {
  await requireAdopter("/account/favorites");
  const favorites = await getFavoriteAnimals();
  const favoriteIds = new Set(favorites.map((animal) => animal.id));

  return (
    <section aria-labelledby="favorites-heading">
      <h2 id="favorites-heading" className="font-heading text-2xl font-semibold">
        Ulubione
      </h2>
      {favorites.length > 0 ? (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((animal) => (
            <li key={animal.id} className="flex flex-col [&>article]:flex-1">
              <AnimalCard
                animal={animal}
                favoriteIds={favoriteIds}
                returnTo="/account/favorites"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-3">
          Nie masz jeszcze ulubionych zwierzaków. Kliknij serduszko przy zwierzaku, żeby
          go tu zapisać.{" "}
          <Link
            href="/animals"
            className="text-primary underline-offset-4 hover:underline"
          >
            Przeglądaj zwierzaki
          </Link>
          .
        </p>
      )}
    </section>
  );
}
