import Link from "next/link";
import { AnimalCard } from "@/features/animals/animal-card";
import { getFavoriteIds, getFeaturedAnimals } from "@/features/animals/data";
import { Hero } from "@/features/landing/hero";
import { HowItWorks } from "@/features/landing/how-it-works";
import { MatchShowcase } from "@/features/landing/match-showcase";
import { VisitSection } from "@/features/landing/visit-section";

export default async function HomePage() {
  const [featured, favoriteIds] = await Promise.all([
    getFeaturedAnimals(4),
    getFavoriteIds(),
  ]);

  return (
    <>
      <Hero />

      <section id="zwierzaki" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            Czekają na dom
          </p>
          <h2 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Poznaj nasze zwierzaki
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Każde z nich ma swój charakter, historię i potrzeby.
          </p>
        </div>
        {featured.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((animal) => (
              <li key={animal.id} className="flex flex-col [&>article]:flex-1">
                <AnimalCard
                  animal={animal}
                  isFavorite={favoriteIds.has(animal.id)}
                  returnTo="/"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-10">
            Obecnie nie mamy opublikowanych zwierząt. Zajrzyj do nas wkrótce.
          </p>
        )}
        <Link
          href="/animals"
          className="bg-foreground text-background hover:bg-foreground/90 mt-10 inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold"
        >
          Zobacz wszystkie zwierzęta
        </Link>
      </section>

      <HowItWorks />
      <MatchShowcase />
      <VisitSection />
    </>
  );
}
