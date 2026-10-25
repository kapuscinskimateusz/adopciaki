import { ArrowRight, Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AnimalArt } from "@/features/animals/animal-art";
import { sampleAnimals } from "@/features/animals/sample-animals";
import { cn } from "@/lib/utils";

const byId = (id: string) => sampleAnimals.find((a) => a.id === id)!;

const STATS = [
  { value: "126", label: "zwierząt szuka domu" },
  { value: "48", label: "adopcji w tym roku" },
  { value: "4", label: "kroki do zgłoszenia" },
];

export function Hero() {
  const dog = byId("fasola");
  const cat = byId("pepe");
  const rabbit = byId("klara");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(43,33,24,0.09)_1px,transparent_0)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] [background-size:22px_22px]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-16 lg:pb-24">
        <div>
          <p className="bg-card border-border inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium">
            <span className="bg-primary size-2 rounded-full" aria-hidden />
            Adopcje online w schronisku Adopciaki
          </p>

          <h1 className="font-heading mt-6 text-[2.6rem] leading-[1.04] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]">
            Znajdź domownika, który już{" "}
            <span className="relative inline-block whitespace-nowrap">
              na Ciebie
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="text-sun absolute -bottom-1.5 left-0 h-3 w-full"
              >
                <path
                  d="M2 8 Q25 0 50 7 T100 7 T150 7 T198 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            czeka.
          </h1>

          <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
            Poznaj zwierzaki z naszego schroniska, sprawdź, kto pasuje do Twojego życia, i
            zgłoś się po adopcję — bez telefonów i papierowych kolejek.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#zwierzaki"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full px-7 text-base shadow-[0_10px_24px_-10px_rgba(194,62,34,0.7)]",
              )}
            >
              Zobacz zwierzaki
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#dopasowanie"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full px-7 text-base",
              )}
            >
              Sprawdź dopasowanie
            </a>
          </div>

          <dl className="border-border mt-10 grid max-w-lg grid-cols-3 gap-4 border-t pt-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="font-heading block text-3xl font-semibold sm:text-4xl">
                    {s.value}
                  </span>
                  <span className="text-muted-foreground text-sm leading-snug">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div className="bg-blush absolute inset-x-[9%] top-[8%] bottom-[5%] overflow-hidden rounded-[2.75rem]">
            <span
              aria-hidden
              className="bg-sun absolute top-[14%] left-1/2 size-[64%] -translate-x-1/2 rounded-full"
            />
            <AnimalArt
              species={dog.species}
              palette={dog.palette}
              label="Ilustracja: pies Fasola"
              className="absolute bottom-0 left-1/2 h-[90%] w-auto -translate-x-1/2"
            />
          </div>

          <div className="border-background bg-sage motion-safe:animate-float absolute bottom-[4%] left-0 aspect-square w-[34%] rotate-[-6deg] overflow-hidden rounded-3xl border-4 shadow-lg">
            <AnimalArt
              species={cat.species}
              palette={cat.palette}
              label="Ilustracja: kot Pepe"
              className="absolute inset-x-0 bottom-0 h-[92%] w-full"
            />
          </div>

          <div className="border-background bg-accent motion-safe:animate-float absolute top-0 right-0 aspect-square w-[30%] rotate-[5deg] overflow-hidden rounded-3xl border-4 shadow-lg [animation-delay:-3s]">
            <AnimalArt
              species={rabbit.species}
              palette={rabbit.palette}
              label="Ilustracja: królik Klara"
              className="absolute inset-x-0 bottom-0 h-[92%] w-full"
            />
          </div>

          <div className="bg-card absolute right-[-1%] bottom-[14%] flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl">
            <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-full">
              <Heart className="size-5 fill-current" aria-hidden />
            </span>
            <span className="text-sm leading-tight">
              <strong className="font-heading block text-lg">92% zgodności</strong>
              <span className="text-muted-foreground">Fasola i Twój styl życia</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
