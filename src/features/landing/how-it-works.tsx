import { CalendarHeart, ClipboardList, PawPrint, Search } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Poznaj",
    text: "Przeglądaj zwierzaki i filtruj według wielkości, energii i charakteru.",
  },
  {
    icon: ClipboardList,
    title: "Opowiedz o sobie",
    text: "Krótka ankieta: mieszkanie, doświadczenie i ile masz czasu na spacery.",
  },
  {
    icon: CalendarHeart,
    title: "Złóż zgłoszenie",
    text: "Wybierz ulubieńca, zaproponuj termin i śledź status w swoim koncie.",
  },
  {
    icon: PawPrint,
    title: "Spotkajcie się",
    text: "Pracownik schroniska kontaktuje się z Tobą, a Ty poznajesz zwierzaka na żywo.",
  },
];

export function HowItWorks() {
  return (
    <section id="jak-to-dziala" className="bg-secondary/60 border-border/60 border-y">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            Jak to działa
          </p>
          <h2 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Od „cześć” do „witaj w domu” w czterech krokach
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
