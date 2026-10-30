import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AnimalCard } from "@/features/animals/animal-card";
import { getFavoriteIds, getRecommendableAnimals } from "@/features/animals/data";
import { matchLevelLabel, rankAnimals } from "@/features/matching/engine";
import { MatchReasons, MatchScore } from "@/features/matching/match-summary";
import { getOwnPreferences } from "@/features/preferences/data";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dopasowania",
  robots: { index: false },
};

const linkClass = "text-primary underline-offset-4 hover:underline";

export default async function MatchesPage() {
  await requireCurrentUser("/account/matches");
  const preferences = await getOwnPreferences();

  if (!preferences) {
    return (
      <section className="bg-card border-border rounded-3xl border p-6 sm:p-10">
        <h2 className="font-heading text-2xl font-semibold">
          Nie wiesz, od kogo zacząć? Pomożemy wybrać.
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
          Odpowiedz na kilka pytań o swój dom, rytm dnia i doświadczenie. Pokażemy
          zwierzaki, które pasują najlepiej, i napiszemy dlaczego — co pasuje, a co warto
          omówić ze schroniskiem.
        </p>
        <Link
          href="/account/matches/survey"
          className={cn(buttonVariants(), "mt-6 h-11 rounded-full px-6")}
        >
          Wypełnij ankietę
          <ArrowRight className="size-4" />
        </Link>
        <p className="text-muted-foreground mt-6 flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          Odpowiedzi widzisz tylko Ty i pracownicy schroniska.
        </p>
      </section>
    );
  }

  const [animals, favoriteIds] = await Promise.all([
    getRecommendableAnimals(),
    getFavoriteIds(),
  ]);
  const { ranked, excludedCount } = rankAnimals(preferences, animals);

  return (
    <>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-semibold">
            Zwierzaki, które mogą do Ciebie pasować
          </h2>
          <Link href="/account/matches/survey" className={cn(linkClass, "text-sm")}>
            Zmień odpowiedzi
          </Link>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Kolejność wynika z Twojej ankiety. Przy każdym zwierzaku piszemy, co pasuje, a
          co warto omówić ze schroniskiem.
        </p>
        <p className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          To podpowiedź — o adopcji decydujecie razem ze schroniskiem.
        </p>
      </section>

      {ranked.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {ranked.map(({ animal, match }) => (
            <li key={animal.id} className="grid gap-5 sm:grid-cols-2 [&>article]:h-full">
              <AnimalCard
                animal={animal}
                isFavorite={favoriteIds.has(animal.id)}
                returnTo="/account/matches"
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
          <Link href="/account/matches/survey" className={linkClass}>
            Zmień odpowiedzi
          </Link>{" "}
          albo{" "}
          <Link href="/animals" className={linkClass}>
            przejrzyj wszystkie zwierzaki
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
