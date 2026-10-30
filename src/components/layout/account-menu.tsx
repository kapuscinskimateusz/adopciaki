"use client";

import { useRef } from "react";
import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export type AccountMenuItem = { href: string; label: string };

const itemClass =
  "data-[highlighted]:bg-secondary flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm outline-none select-none";

// Jedyne miejsce wylogowania w nagłówku strony i panelu (docs/product.md, zasada 3).
export function AccountMenu({
  label,
  email,
  items,
  className,
}: {
  label: string;
  email: string;
  items: readonly AccountMenuItem[];
  className?: string;
}) {
  const signOutForm = useRef<HTMLFormElement>(null);

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 gap-1.5 rounded-full px-4",
            className,
          )}
        >
          {label}
          <ChevronDown className="size-4" aria-hidden />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={8} align="end" className="z-50">
            <Menu.Popup className="bg-card border-border min-w-56 rounded-2xl border p-1.5 shadow-xl outline-none">
              <p className="text-muted-foreground truncate px-3 pt-1.5 pb-2 text-xs">
                {email}
              </p>
              {items.map((item) => (
                <Menu.LinkItem
                  key={item.href}
                  closeOnClick
                  className={itemClass}
                  render={<Link href={item.href} />}
                >
                  {item.label}
                </Menu.LinkItem>
              ))}
              <Menu.Separator className="bg-border my-1.5 h-px" />
              <Menu.Item
                className={itemClass}
                onClick={() => signOutForm.current?.requestSubmit()}
              >
                Wyloguj się
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <form ref={signOutForm} action={signOutAction} hidden />
    </>
  );
}
