import { ClipboardList, Heart, PawPrint, Search } from "lucide-react";

// Kroki opisują tylko działające funkcje (docs/product.md). Zgłoszenie adopcyjne
// zastąpi krok „Zapisz ulubione” w etapie 7.
const STEPS = [
  {
    icon: Search,
    title: "Poznaj zwierzaki",
    text: "Przeglądaj zwierzaki ze schroniska i filtruj je według gatunku, wielkości i płci.",
  },
  {
    icon: ClipboardList,
    title: "Wypełnij ankietę",
    text: "Kilka pytań o Twój dom, rytm dnia i doświadczenie. Pokażemy, kto pasuje najlepiej.",
  },
  {
    icon: Heart,
    title: "Zapisz ulubione",
    text: "Kliknij serduszko przy zwierzaku, a znajdziesz go później na swoim koncie.",
  },
  {
    icon: PawPrint,
    title: "Poznajcie się",
    text: "Skontaktuj się ze schroniskiem i umów wizytę, żeby poznać zwierzaka na żywo.",
  },
];

export function HowItWorks() {
  return (
    <section id="jak-to-dziala" className="bg-secondary/60 border-border/60 border-y">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            Jak adoptować
          </p>
          <h2 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Cztery kroki do spotkania ze zwierzakiem
          </h2>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="bg-card border-border/70 relative rounded-3xl border p-6"
            >
              <span
                aria-hidden
                className="font-heading text-sun absolute top-3 right-5 text-6xl leading-none font-semibold"
              >
                {i + 1}
              </span>
              <span className="bg-blush text-primary grid size-12 place-items-center rounded-2xl">
                <step.icon className="size-6" aria-hidden />
              </span>
              <h3 className="font-heading mt-5 text-xl font-semibold">
                <span className="sr-only">Krok {i + 1}: </span>
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
