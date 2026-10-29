import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AnimalCard } from "@/features/animals/animal-card";
import { CatalogFilters, describeFilters } from "@/features/animals/catalog-filters";
import { CatalogPagination } from "@/features/animals/catalog-pagination";
import {
  buildCatalogHref,
  hasActiveFilters,
  parseCatalogParams,
} from "@/features/animals/catalog-query";
import { getCatalogPage } from "@/features/animals/data";

export async function generateMetadata({
  searchParams,
}: PageProps<"/animals">): Promise<Metadata> {
  const params = parseCatalogParams(await searchParams);
  const filters = describeFilters(params);
  const title = filters ? `Zwierzęta do adopcji: ${filters}` : "Zwierzęta do adopcji";

  return {
    title,
    description:
      "Poznaj psy, koty i króliki ze schroniska, które czekają na dom. Filtruj według gatunku, rozmiaru i płci.",
    alternates: { canonical: "/animals" },
    robots: hasActiveFilters(params) || params.page > 1 ? { index: false } : undefined,
  };
}

export default async function AnimalsPage({ searchParams }: PageProps<"/animals">) {
  const params = parseCatalogParams(await searchParams);
  const { animals, total, totalPages } = await getCatalogPage(params);

  if (params.page > totalPages) {
    redirect(buildCatalogHref(params, { page: totalPages }));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <p className="text-primary text-sm font-semibold tracking-widest uppercase">
        Czekają na dom
      </p>
      <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Zwierzęta do adopcji
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        Każde z nich ma swój charakter, historię i potrzeby. Wybierz filtry, żeby szybciej
        znaleźć swojego przyszłego towarzysza.
      </p>

      <div className="mt-10">
        <CatalogFilters params={params} />
      </div>

      <p className="text-muted-foreground mt-8 text-sm" aria-live="polite">
        Znaleziono: <strong className="text-foreground">{total}</strong>
      </p>

      {animals.length === 0 ? (
        <div className="bg-card border-border mt-6 rounded-3xl border p-8">
          <h2 className="font-heading text-2xl font-semibold">Brak wyników</h2>
          <p className="text-muted-foreground mt-2">
            {hasActiveFilters(params)
              ? "Żadne zwierzę nie pasuje do wybranych filtrów. Spróbuj je zmienić lub wyczyścić."
              : "Obecnie nie mamy opublikowanych zwierząt. Zajrzyj do nas wkrótce."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {animals.map((animal) => (
            <li key={animal.id} className="flex flex-col [&>article]:flex-1">
              <AnimalCard animal={animal} />
            </li>
          ))}
        </ul>
      )}

      <CatalogPagination params={params} totalPages={totalPages} />
    </div>
  );
}
