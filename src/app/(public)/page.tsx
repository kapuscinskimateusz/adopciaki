import { AnimalCatalog } from "@/features/animals/animal-catalog";
import { Hero } from "@/features/landing/hero";
import { HowItWorks } from "@/features/landing/how-it-works";
import { MatchShowcase } from "@/features/landing/match-showcase";
import { VisitSection } from "@/features/landing/visit-section";

export default function HomePage() {
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
            Każde z nich ma swój charakter, historię i potrzeby. Kliknij serce, żeby
            zapamiętać ulubieńców.
          </p>
        </div>
        <div className="mt-10">
          <AnimalCatalog />
        </div>
      </section>

      <HowItWorks />
      <MatchShowcase />
      <VisitSection />
    </>
  );
}
