import Link from "next/link";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  inverted,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "focus-visible:ring-ring inline-flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      aria-label="Adopciaki — strona główna"
    >
      <span className="bg-primary text-primary-foreground grid size-9 -rotate-6 place-items-center rounded-xl shadow-sm">
        <PawPrint className="size-5" aria-hidden />
      </span>
      <span
        className={cn(
          "font-heading text-2xl font-semibold tracking-tight",
          inverted ? "text-forest-foreground" : "text-foreground",
        )}
      >
        Adopciaki
      </span>
    </Link>
  );
}
