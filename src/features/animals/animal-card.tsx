import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimalArt } from "./animal-art";
import { formatAge } from "./catalog-query";
import type { PublicAnimal } from "./data";
import { ADOPTION_STATUS_LABEL, FALLBACK_ART, SIZE_LABEL, SPECIES_LABEL } from "./labels";

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

export function AnimalStatusBadge({
  status,
}: {
  status: PublicAnimal["adoption_status"];
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        status === "meeting"
          ? "bg-forest text-forest-foreground"
          : "bg-card text-foreground",
      )}
    >
      {ADOPTION_STATUS_LABEL[status]}
    </span>
  );
}

export function AnimalCard({ animal }: { animal: PublicAnimal }) {
  const photo = animal.photos[0];
  const art = FALLBACK_ART[animal.species];
  const excerpt =
    animal.description.length > 140
      ? `${animal.description.slice(0, 137).trimEnd()}…`
      : animal.description;

  return (
    <article className="group bg-card border-border/70 relative flex flex-col overflow-hidden rounded-3xl border shadow-[0_1px_0_rgba(43,33,24,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(43,33,24,0.35)]">
      <div
        className="relative flex aspect-[5/4] items-end justify-center overflow-hidden"
        style={{ backgroundColor: art.tile }}
      >
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            unoptimized
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <AnimalArt
            species={animal.species}
            palette={art.palette}
            label={`Ilustracja: ${SPECIES_LABEL[animal.species].toLowerCase()} ${animal.name}`}
            className="relative h-[92%] w-auto transition duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute top-3 left-3">
          <AnimalStatusBadge status={animal.adoption_status} />
        </span>
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
            {animal.breed} · {formatAge(animal.age_months)} ·{" "}
            {SIZE_LABEL[animal.size].toLowerCase()}
          </p>
        </div>

        <p className="text-foreground/80 text-sm leading-relaxed">{excerpt}</p>

        {animal.traits.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {animal.traits.slice(0, 3).map((t) => (
              <li
                key={t}
                className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs font-medium"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="border-border/70 mt-auto flex items-center justify-between border-t pt-4">
          <EnergyMeter level={animal.energy_level} />
          <Link
            href={`/animals/${animal.slug}`}
            className="text-primary focus-visible:ring-ring inline-flex items-center gap-1 rounded-md text-sm font-semibold after:absolute after:inset-0 focus-visible:ring-2 focus-visible:outline-none"
          >
            Poznaj
            <span className="sr-only">: {animal.name}</span>
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
