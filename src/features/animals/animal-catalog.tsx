"use client";

import { useState } from "react";
import { Cat, Dog, Heart, PawPrint, Rabbit } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimalCard } from "./animal-card";
import { sampleAnimals, type Species } from "./sample-animals";

type Filter = "all" | Species;

const FILTERS: { value: Filter; label: string; icon: typeof Dog }[] = [
  { value: "all", label: "Wszystkie", icon: PawPrint },
  { value: "dog", label: "Psy", icon: Dog },
  { value: "cat", label: "Koty", icon: Cat },
  { value: "rabbit", label: "Króliki", icon: Rabbit },
];

export function AnimalCatalog() {
  const [filter, setFilter] = useState<Filter>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const visible =
    filter === "all" ? sampleAnimals : sampleAnimals.filter((a) => a.species === filter);

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filtruj według gatunku"
          className="flex flex-wrap gap-2"
        >
          {FILTERS.map(({ value, label, icon: Icon }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(value)}
                className={cn(
                  "focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border hover:border-foreground/40",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        <p
          className="text-muted-foreground flex items-center gap-2 text-sm"
          aria-live="polite"
        >
          <Heart className="text-primary size-4" aria-hidden />
          Obserwujesz: <strong className="text-foreground">{favorites.size}</strong>
          <span aria-hidden>·</span>
          Pokazano: <strong className="text-foreground">{visible.length}</strong>
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            favorite={favorites.has(animal.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
