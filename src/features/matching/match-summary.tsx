import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchReason } from "./engine";

export function MatchScore({ score, className }: { score: number; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Dopasowanie: ${score} procent`}
      className={cn(
        "grid size-14 shrink-0 place-items-center rounded-full sm:size-16",
        className,
      )}
      style={{
        background: `conic-gradient(var(--primary) 0 ${score}%, var(--border) ${score}% 100%)`,
      }}
    >
      <span className="bg-card font-heading grid size-10 place-items-center rounded-full text-base font-semibold sm:size-12 sm:text-lg">
        {score}%
      </span>
    </div>
  );
}

export function MatchReasons({
  reasons,
  className,
}: {
  reasons: readonly Pick<MatchReason, "kind" | "text">[];
  className?: string;
}) {
  return (
    <ul className={cn("space-y-2.5 sm:space-y-3", className)}>
      {reasons.map((reason) => (
        <li key={reason.text} className="flex gap-3 text-sm leading-snug">
          <span
            className={cn(
              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
              reason.kind === "match"
                ? "bg-forest text-forest-foreground"
                : "bg-sun text-forest",
            )}
          >
            {reason.kind === "match" ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Info className="size-3.5" aria-hidden />
            )}
          </span>
          <span>{reason.text}</span>
        </li>
      ))}
    </ul>
  );
}
