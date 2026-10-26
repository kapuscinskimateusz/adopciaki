"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { NAV_LINKS } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-mobilne"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        onClick={() => setOpen((v) => !v)}
        className="border-border bg-card focus-visible:ring-ring grid size-11 place-items-center rounded-full border focus-visible:ring-2 focus-visible:outline-none"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <nav
          id="menu-mobilne"
          aria-label="Menu główne"
          className="bg-background border-border absolute inset-x-0 top-full border-b shadow-lg"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="hover:bg-secondary block rounded-xl px-3 py-3 text-base font-medium"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="mt-2 flex gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 flex-1 rounded-full text-base",
                )}
              >
                Zaloguj się
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants(), "h-11 flex-1 rounded-full text-base")}
              >
                Załóż konto
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
