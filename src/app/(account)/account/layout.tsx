import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { signOutAction } from "@/features/auth/actions";

const ACCOUNT_LINKS = [
  { href: "/account", label: "Konto" },
  { href: "/account/recommendations", label: "Dla Ciebie" },
  { href: "/account/preferences", label: "Ankieta" },
  { href: "/animals", label: "Katalog" },
] as const;

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:py-16">
      <div className="flex items-center justify-between">
        <Logo />
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="rounded-full">
            Wyloguj się
          </Button>
        </form>
      </div>
      <nav aria-label="Konto" className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {ACCOUNT_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="border-border hover:bg-muted inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {children}
    </main>
  );
}
