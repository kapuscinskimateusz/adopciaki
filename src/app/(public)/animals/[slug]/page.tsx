import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { animalCompatibilityFields } from "@/features/admin/animals/schema";
import { AnimalArt } from "@/features/animals/animal-art";
import { AnimalStatusBadge, EnergyMeter } from "@/features/animals/animal-card";
import { formatAge } from "@/features/animals/catalog-query";
import { getAnimalBySlug, getFavoriteIds } from "@/features/animals/data";
import { FavoriteButton } from "@/features/favorites/favorite-button";
import {
  COMPATIBILITY_LABEL,
  FALLBACK_ART,
  SEX_LABEL,
  SIZE_LABEL,
  SPECIES_LABEL,
} from "@/features/animals/labels";

export async function generateMetadata({
  params,
}: PageProps<"/animals/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const animal = await getAnimalBySlug(slug);
  if (!animal) return { title: "Nie znaleziono zwierzęcia" };

  const description =
    animal.description.length > 160
      ? `${animal.description.slice(0, 157).trimEnd()}…`
      : animal.description;
  const image = animal.photos[0]?.url;

  return {
    title: `${animal.name} – ${SPECIES_LABEL[animal.species].toLowerCase()} do adopcji`,
    description,
    alternates: { canonical: `/animals/${animal.slug}` },
    openGraph: {
      title: `${animal.name} szuka domu`,
      description,
      type: "article",
      images: image ? [{ url: image, alt: animal.photos[0].alt }] : undefined,
    },
  };
}

export default async function AnimalProfilePage({
  params,
}: PageProps<"/animals/[slug]">) {
  const { slug } = await params;
  const animal = await getAnimalBySlug(slug);
  if (!animal) notFound();
  const favoriteIds = await getFavoriteIds();

  const art = FALLBACK_ART[animal.species];
  const [mainPhoto, ...otherPhotos] = animal.photos;
  const facts = [
    ["Gatunek", SPECIES_LABEL[animal.species]],
    ["Rasa", animal.breed],
    ["Wiek", formatAge(animal.age_months)],
    ["Płeć", SEX_LABEL[animal.sex]],
    ["Rozmiar", SIZE_LABEL[animal.size]],
  ];
  const compatibility = animalCompatibilityFields.flatMap((field) => {
    const value = animal[field];
    if (value === null) return [];
    // Wymóg doświadczenia jest ograniczeniem, więc „tak” oznaczamy jak pozostałe „nie”.
    const ok = field === "requires_experience" ? !value : value;
    return [{ field, ok, text: COMPATIBILITY_LABEL[field][value ? "yes" : "no"] }];
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <Link
        href="/animals"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Wróć do katalogu
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <section aria-label={`Zdjęcia: ${animal.name}`} className="space-y-3">
          <div
            className="relative flex aspect-[5/4] items-end justify-center overflow-hidden rounded-3xl"
            style={{ backgroundColor: art.tile }}
          >
            {mainPhoto ? (
              <Image
                src={mainPhoto.url}
                alt={mainPhoto.alt}
                fill
                unoptimized
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <AnimalArt
                species={animal.species}
                palette={art.palette}
                label={`Ilustracja: ${SPECIES_LABEL[animal.species].toLowerCase()} ${animal.name}`}
                className="h-[92%] w-auto"
              />
            )}
          </div>
          {otherPhotos.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {otherPhotos.map((photo) => (
                <li
                  key={photo.url}
                  className="bg-muted relative aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 18vw, 50vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <AnimalStatusBadge status={animal.adoption_status} />
          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              {animal.name}
            </h1>
            {favoriteIds && (
              <FavoriteButton
                animalId={animal.id}
                animalName={animal.name}
                isFavorite={favoriteIds.has(animal.id)}
                returnTo={`/animals/${animal.slug}`}
                className="shrink-0"
              />
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
            {facts.map(([term, value]) => (
              <div key={term}>
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {term}
                </dt>
                <dd className="mt-0.5 font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <EnergyMeter level={animal.energy_level} />
          </div>

          {animal.traits.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {animal.traits.map((trait) => (
                <li
                  key={trait}
                  className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium"
                >
                  {trait}
                </li>
              ))}
            </ul>
          )}

          {compatibility.length > 0 && (
            <ul className="mt-6 space-y-2" aria-label="Zgodność">
              {compatibility.map(({ field, ok, text }) => (
                <li key={field} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={
                      ok
                        ? "bg-forest text-forest-foreground grid size-5 shrink-0 place-items-center rounded-full"
                        : "bg-muted text-muted-foreground grid size-5 shrink-0 place-items-center rounded-full"
                    }
                  >
                    {ok ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : (
                      <X className="size-3.5" aria-hidden />
                    )}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          )}

          <h2 className="font-heading mt-8 text-2xl font-semibold">
            Poznaj {animal.name}
          </h2>
          <p className="text-foreground/80 mt-3 leading-relaxed whitespace-pre-line">
            {animal.description}
          </p>
        </section>
      </div>
    </div>
  );
}
