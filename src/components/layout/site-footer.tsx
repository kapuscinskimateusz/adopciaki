import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";

export function SiteFooter() {
  return (
    <footer className="bg-forest text-forest-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="text-forest-foreground/75 mt-4 text-sm leading-relaxed">
            Platforma adopcyjna schroniska dla zwierząt. Pomagamy znaleźć dom i
            porządkujemy cały proces — od pierwszego spojrzenia po spotkanie.
          </p>
        </div>

        <nav aria-label="Nawigacja w stopce">
          <h2 className="text-forest-foreground/60 text-xs font-semibold tracking-widest uppercase">
            Na stronie
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-forest-foreground/60 text-xs font-semibold tracking-widest uppercase">
            Kontakt
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>kontakt@adopciaki.example</li>
            <li>+48 123 456 789</li>
            <li>ul. Przykładowa 12, Miasto</li>
          </ul>
        </div>
      </div>

      <div className="border-forest-foreground/15 border-t">
        <p className="text-forest-foreground/60 mx-auto max-w-6xl px-5 py-5 text-xs">
          Prototyp wizualny — wszystkie zwierzęta, liczby i dane kontaktowe są
          przykładowe. Ilustracje wygenerowane w kodzie.
        </p>
      </div>
    </footer>
  );
}
