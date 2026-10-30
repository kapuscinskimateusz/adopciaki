"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ACCOUNT_LINKS, isActiveAccountLink } from "./account-links";

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Zakładki konta" className="border-border border-b">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {ACCOUNT_LINKS.map((link) => {
          const active = isActiveAccountLink(link.href, pathname);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring inline-flex min-h-12 items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "border-primary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
