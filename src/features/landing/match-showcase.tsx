import { ArrowRight, Check, Info, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AnimalArt } from "@/features/animals/animal-art";
import { sampleAnimals } from "@/features/animals/sample-animals";
import { cn } from "@/lib/utils";

const PRINCIPLES = [
  "Jasne powody: widzisz, dlaczego dane zwierzę do Ciebie pasuje.",
  "Odpowiedzi z ankiety widzisz tylko Ty i pracownicy schroniska.",
  "Wynik to podpowiedź. Decyzję zawsze podejmuje człowiek.",
];

const REASONS = [
  { ok: true, text: "Masz doświadczenie z aktywnymi psami" },
  { ok: true, text: "Deklarujesz ponad 2 godziny spacerów dziennie" },
  { ok: true, text: "Mieszkasz w domu z ogrodem" },
  { ok: false, text: "Fasola nie lubi zostawać sama — warto omówić Twój plan dnia" },
];

export function MatchShowcase() {
  const dog = sampleAnimals.find((a) => a.id === "fasola")!;

  return (
    <section id="dopasowanie" className="mx-auto max-w-6xl px-5 py-20">
      <div className="bg-forest text-forest-foreground relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[2.5rem] p-6 sm:gap-12 sm:p-12 lg:grid-cols-2 lg:p-16">
        <span
          aria-hidden
          className="bg-sun/15 absolute -top-24 -left-24 size-72 rounded-full"
        />

        <div className="relative min-w-0">
          <p className="text-sun text-sm font-semibold tracking-widest uppercase">
            Dopasowanie
          </p>
          <h2 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Nie czarna skrzynka. Reguły, które się tłumaczą.
          </h2>
          <p className="text-forest-foreground/80 mt-5 max-w-lg text-lg leading-relaxed">
            Odpowiedz na kilka pytań o swoje życie, a pokażemy zwierzaki, które mogą do
            Ciebie pasować — razem z uzasadnieniem.
          </p>

          <ul className="mt-8 space-y-4">
            {PRINCIPLES.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="bg-sun text-forest mt-0.5 grid size-6 shrink-0 place-items-center rounded-full">
                  <Check className="size-4" aria-hidden />
                </span>
                <span className="text-forest-foreground/90">{p}</span>
              </li>
            ))}
          </ul>

          <a
            href="#konto"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-sun text-forest hover:bg-sun/90 mt-9 h-12 rounded-full px-7 text-base",
            )}
          >
            Wypełnij ankietę
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="relative min-w-0 lg:rotate-[1.5deg]">
          <div className="bg-card text-card-foreground min-w-0 rounded-3xl p-5 shadow-2xl sm:p-7">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="size-12 shrink-0 overflow-hidden rounded-2xl sm:size-16"
                style={{ backgroundColor: dog.tile }}
              >
                <AnimalArt
                  species={dog.species}
                  palette={dog.palette}
                  label="Ilustracja: pies Fasola"
                  className="h-full w-full translate-y-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                  Twoje dopasowanie
                </p>
                <p className="font-heading text-2xl font-semibold">Fasola</p>
              </div>
              <div
                role="img"
                aria-label="Dopasowanie: 92 procent"
                className="grid size-14 shrink-0 place-items-center rounded-full sm:size-16"
                style={{
                  background:
                    "conic-gradient(var(--primary) 0 92%, var(--border) 92% 100%)",
                }}
              >
                <span className="bg-card font-heading grid size-10 place-items-center rounded-full text-base font-semibold sm:size-12 sm:text-lg">
                  92%
                </span>
              </div>
            </div>

            <p className="bg-sage/60 mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold">
              Dopasowanie wysokie, ponieważ…
            </p>

            <ul className="mt-4 space-y-2.5 sm:space-y-3">
              {REASONS.map((r) => (
                <li key={r.text} className="flex gap-3 text-sm leading-snug">
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                      r.ok ? "bg-forest text-forest-foreground" : "bg-sun text-forest",
                    )}
                  >
                    {r.ok ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : (
                      <Info className="size-3.5" aria-hidden />
                    )}
                  </span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground border-border mt-6 flex items-center gap-2 border-t pt-4 text-xs">
              <ShieldCheck className="size-4 shrink-0" aria-hidden />
              Ostateczną decyzję o adopcji podejmuje pracownik schroniska.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
