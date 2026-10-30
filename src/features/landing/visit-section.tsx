import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INFO = [
  { icon: MapPin, title: "Adres", text: "ul. Przykładowa 12, Miasto" },
  { icon: Clock, title: "Godziny wizyt", text: "wt–pt 10:00–17:00, sob 10:00–14:00" },
  { icon: Phone, title: "Kontakt", text: "+48 123 456 789" },
];

// Zalogowanym nie pokazujemy zachęt dla gościa (docs/product.md, zasada 6).
const ACCOUNT_CARD = {
  guest: {
    title: "Załóż konto",
    text: "Na koncie zapiszesz ulubione zwierzaki i zobaczysz, które pasują do Ciebie najlepiej.",
    primary: { href: "/register", label: "Załóż konto" },
    secondary: { href: "/login", label: "Mam już konto" },
  },
  adopter: {
    title: "Twoje konto",
    text: "Ulubione zwierzaki i Twoje dopasowania czekają na koncie.",
    primary: { href: "/account", label: "Przejdź do konta" },
    secondary: null,
  },
  staff: {
    title: "Panel pracownika",
    text: "Dodawaj zwierzaki, aktualizuj ich opisy i zdjęcia.",
    primary: { href: "/admin", label: "Przejdź do panelu" },
    secondary: null,
  },
} as const;

export type VisitAudience = keyof typeof ACCOUNT_CARD;

export function VisitSection({ audience }: { audience: VisitAudience }) {
  const card = ACCOUNT_CARD[audience];
  return (
    <section id="wizyta" className="mx-auto max-w-6xl px-5 pb-24">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border-border/70 rounded-[2rem] border p-8 sm:p-10">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            Odwiedź nas
          </p>
          <h2 className="font-heading mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Najlepiej poznać się na żywo
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Wizyty odbywają się po wcześniejszym umówieniu — dzięki temu możemy poświęcić
            Ci tyle czasu, ile potrzeba.
          </p>
          <ul className="mt-7 space-y-5">
            {INFO.map((i) => (
              <li key={i.title} className="flex items-center gap-4">
                <span className="bg-secondary grid size-11 shrink-0 place-items-center rounded-2xl">
                  <i.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    {i.title}
                  </span>
                  <span className="font-medium">{i.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-primary text-primary-foreground relative flex flex-col justify-between gap-8 overflow-hidden rounded-[2rem] p-8 sm:p-10">
          <span
            aria-hidden
            className="bg-sun/25 absolute -right-16 -bottom-16 size-64 rounded-full"
          />
          <div className="relative">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {card.title}
            </h2>
            <p className="text-primary-foreground/85 mt-3 max-w-md leading-relaxed">
              {card.text}
            </p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row">
            <Link
              href={card.primary.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-card text-foreground hover:bg-card/90 h-12 rounded-full px-7 text-base",
              )}
            >
              {card.primary.label}
              <ArrowRight className="size-4" />
            </Link>
            {card.secondary && (
              <Link
                href={card.secondary.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground h-12 rounded-full px-7 text-base",
                )}
              >
                {card.secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
