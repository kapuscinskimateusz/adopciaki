import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AnimalCard } from "@/features/animals/animal-card";
import { getFavoriteIds, getRecommendableAnimals } from "@/features/animals/data";
import { matchLevelLabel, rankAnimals } from "@/features/matching/engine";
import { MatchReasons, MatchScore } from "@/features/matching/match-summary";
import { getOwnPreferences } from "@/features/preferences/data";
import { requireCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Dla Ciebie",
  robots: { index: false },
};

export default async function RecommendationsPage() {
  await requireCurrentUser("/account/recommendations");
  const preferences = await getOwnPreferences();
  if (!preferences) redirect("/account/preferences");

  const [animals, favoriteIds] = await Promise.all([
    getRecommendableAnimals(),
    getFavoriteIds(),
  ]);
  const { ranked, excludedCount } = rankAnimals(preferences, animals);

  return (
    <>
      <section className="mt-8">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Dla Ciebie
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight">
          Zwierzaki, które mogą do Ciebie pasować
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Kolejność wynika z Twojej{" "}
          <Link
            href="/account/preferences"
            className="text-primary underline-offset-4 hover:underline"
          >
            ankiety
          </Link>
          . Przy każdym zwierzaku piszemy, co pasuje, a co warto omówić ze schroniskiem.
        </p>
        <p className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          Wynik to podpowiedź. Decyzję o adopcji podejmuje pracownik schroniska.
        </p>
      </section>

      {ranked.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {ranked.map(({ animal, match }) => (
            <li key={animal.id} className="grid gap-5 sm:grid-cols-2 [&>article]:h-full">
              <AnimalCard
                animal={animal}
                isFavorite={favoriteIds.has(animal.id)}
                returnTo="/account/recommendations"
              />
              <div className="bg-card border-border rounded-3xl border p-5 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                      Twoje dopasowanie
                    </p>
                    <p className="font-heading text-2xl font-semibold">{animal.name}</p>
                  </div>
                  <MatchScore score={match.score} />
                </div>
                <p className="bg-sage/60 mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold">
                  Dopasowanie {matchLevelLabel(match.score)}, ponieważ…
                </p>
                <MatchReasons reasons={match.reasons} className="mt-4" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-8">
          Teraz żaden zwierzak nie spełnia Twoich kryteriów.{" "}
          <Link
            href="/account/preferences"
            className="text-primary underline-offset-4 hover:underline"
          >
            Zmień odpowiedzi
          </Link>{" "}
          albo{" "}
          <Link
            href="/animals"
            className="text-primary underline-offset-4 hover:underline"
          >
            przejrzyj cały katalog
          </Link>
          .
        </p>
      )}

      {excludedCount > 0 && (
        <p className="text-muted-foreground mt-8 text-sm">
          Pominęliśmy zwierzaki, które według schroniska nie pasują do Twoich odpowiedzi
          (np. inny gatunek albo brak zgodności z dziećmi czy innymi zwierzętami):{" "}
          {excludedCount}.
        </p>
      )}
    </>
  );
}
