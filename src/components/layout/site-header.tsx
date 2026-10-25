import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="bg-background/85 border-border/60 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />

        <nav aria-label="Menu główne" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-foreground/80 hover:bg-secondary hover:text-foreground focus-visible:ring-ring rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition focus-visible:ring-2 focus-visible:outline-none"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="#konto"
            className={cn(buttonVariants({ variant: "ghost" }), "h-10 rounded-full px-4")}
          >
            Zaloguj się
          </a>
          <a href="#konto" className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
            Załóż konto
          </a>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
