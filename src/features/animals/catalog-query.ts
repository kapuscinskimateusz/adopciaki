import { z } from "zod";
import { animalSexes, animalSizes, animalSpecies } from "@/features/admin/animals/schema";

export const CATALOG_PAGE_SIZE = 12;

export const catalogSorts = ["newest", "name", "youngest", "oldest"] as const;
export const catalogStatuses = ["available", "meeting"] as const;

export const catalogSortLabels: Record<(typeof catalogSorts)[number], string> = {
  newest: "Najnowsze",
  name: "Imię (A–Z)",
  youngest: "Najmłodsze",
  oldest: "Najstarsze",
};

// Nieprawidłowe wartości z URL są ignorowane zamiast kończyć się błędem strony.
const catalogParamsSchema = z.object({
  species: z.enum(animalSpecies).optional().catch(undefined),
  size: z.enum(animalSizes).optional().catch(undefined),
  sex: z.enum(animalSexes).optional().catch(undefined),
  status: z.enum(catalogStatuses).optional().catch(undefined),
  q: z
    .string()
    .trim()
    .max(80)
    .optional()
    .catch(undefined)
    .transform((value) => value || undefined),
  sort: z.enum(catalogSorts).catch("newest"),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});

export type CatalogParams = Omit<z.output<typeof catalogParamsSchema>, "q"> & {
  q?: string;
};
export type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseCatalogParams(raw: RawSearchParams): CatalogParams {
  const first = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  return catalogParamsSchema.parse(first);
}

export function buildCatalogHref(
  params: CatalogParams,
  overrides: Partial<CatalogParams> = {},
): string {
  // Zmiana filtrów zawsze wraca na pierwszą stronę, chyba że podano page wprost.
  const next: CatalogParams = { ...params, ...overrides, page: overrides.page ?? 1 };

  const search = new URLSearchParams();
  if (next.species) search.set("species", next.species);
  if (next.size) search.set("size", next.size);
  if (next.sex) search.set("sex", next.sex);
  if (next.status) search.set("status", next.status);
  if (next.q) search.set("q", next.q);
  if (next.sort !== "newest") search.set("sort", next.sort);
  if (next.page > 1) search.set("page", String(next.page));

  const query = search.toString();
  return query ? `/animals?${query}` : "/animals";
}

export function hasActiveFilters(params: CatalogParams): boolean {
  return Boolean(
    params.species || params.size || params.sex || params.status || params.q,
  );
}

export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export function formatAge(months: number | null): string {
  if (months === null) return "Wiek nieznany";
  if (months < 12) return `${months} mies.`;

  const years = Math.floor(months / 12);
  const rest = months % 12;
  const lastDigit = years % 10;
  const lastTwo = years % 100;
  const unit =
    years === 1
      ? "rok"
      : lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)
        ? "lata"
        : "lat";

  return rest === 0 ? `${years} ${unit}` : `${years} ${unit} ${rest} mies.`;
}
