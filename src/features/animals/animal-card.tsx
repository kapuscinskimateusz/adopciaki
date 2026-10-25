"use client";

import { ArrowRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimalArt } from "./animal-art";
import { SPECIES_LABEL, STATUS_LABEL, type SampleAnimal } from "./sample-animals";

type Props = {
  animal: SampleAnimal;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function EnergyMeter({ level }: { level: number }) {
  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={`Poziom energii: ${level} z 5`}
    >
      <span className="text-muted-foreground text-xs font-medium">Energia</span>
      <span className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn("size-2 rounded-full", i <= level ? "bg-primary" : "bg-border")}
          />
        ))}
      </span>
    </div>
  );
}

export function AnimalCard({ animal, favorite, onToggleFavorite }: Props) {
  const meeting = animal.status === "meeting";

  return (
    <article className="group bg-card border-border/70 relative flex flex-col overflow-hidden rounded-3xl border shadow-[0_1px_0_rgba(43,33,24,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(43,33,24,0.35)]">
      <div
        className="relative flex aspect-[5/4] items-end justify-center overflow-hidden"
        style={{ backgroundColor: animal.tile }}
      >
        <span
          aria-hidden
          className="absolute -top-10 -right-10 size-40 rounded-full bg-white/35"
        />
        <AnimalArt
          species={animal.species}
          palette={animal.palette}
          label={`Ilustracja: ${SPECIES_LABEL[animal.species].toLowerCase()} ${animal.name}`}
          className="relative h-[92%] w-auto transition duration-500 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold",
            meeting ? "bg-forest text-forest-foreground" : "bg-card text-foreground",
          )}
        >
          {STATUS_LABEL[animal.status]}
        </span>
        <button
          type="button"
          onClick={() => onToggleFavorite(animal.id)}
          aria-pressed={favorite}
          aria-label={
            favorite
              ? `Usuń ${animal.name} z obserwowanych`
              : `Dodaj ${animal.name} do obserwowanych`
          }
          className="bg-card/95 text-foreground focus-visible:ring-ring absolute top-2 right-2 grid size-11 place-items-center rounded-full shadow-sm transition hover:scale-105 focus-visible:ring-2 focus-visible:outline-none active:scale-95"
        >
          <Heart
            className={cn(
              "size-5 transition",
              favorite ? "fill-primary text-primary scale-110" : "text-foreground/70",
            )}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-heading text-2xl font-semibold tracking-tight">
              {animal.name}
            </h3>
            <span className="text-muted-foreground text-sm">
              {SPECIES_LABEL[animal.species]}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {animal.breed} · {animal.age} · {animal.size}
          </p>
        </div>

        <p className="text-foreground/80 text-sm leading-relaxed">{animal.blurb}</p>

        <ul className="flex flex-wrap gap-1.5">
          {animal.traits.map((t) => (
            <li
              key={t}
              className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs font-medium"
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="border-border/70 mt-auto flex items-center justify-between border-t pt-4">
          <EnergyMeter level={animal.energy} />
          <a
            href="#zwierzaki"
            className="text-primary focus-visible:ring-ring inline-flex items-center gap-1 rounded-md text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
          >
            Poznaj
            <span className="sr-only">: {animal.name}</span>
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
