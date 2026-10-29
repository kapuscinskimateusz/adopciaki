import Link from "next/link";
import { Cat, Dog, PawPrint, Rabbit } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildCatalogHref,
  catalogSortLabels,
  catalogSorts,
  catalogStatuses,
  hasActiveFilters,
  type CatalogParams,
} from "./catalog-query";
import { ADOPTION_STATUS_LABEL, SEX_LABEL, SIZE_LABEL, SPECIES_LABEL } from "./labels";

const SPECIES_FILTERS = [
  { value: undefined, label: "Wszystkie", icon: PawPrint },
  { value: "dog", label: "Psy", icon: Dog },
  { value: "cat", label: "Koty", icon: Cat },
  { value: "rabbit", label: "Króliki", icon: Rabbit },
] as const;

const selectClass =
  "bg-card border-border focus-visible:ring-ring h-11 w-full rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none";

export function CatalogFilters({ params }: { params: CatalogParams }) {
  return (
    <div className="space-y-5">
      <nav aria-label="Filtruj według gatunku">
        <ul className="flex flex-wrap gap-2">
          {SPECIES_FILTERS.map(({ value, label, icon: Icon }) => {
            const active = params.species === value;
            return (
              <li key={label}>
                <Link
                  href={buildCatalogHref(params, { species: value })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none",
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card border-border hover:border-foreground/40",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form
        action="/animals"
        method="get"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
      >
        {params.species && <input type="hidden" name="species" value={params.species} />}

        <label className="block text-sm font-medium lg:col-span-2">
          Imię
          <input
            type="search"
            name="q"
            maxLength={80}
            defaultValue={params.q ?? ""}
            placeholder="Szukaj po imieniu"
            className={cn(selectClass, "mt-1")}
          />
        </label>

        <label className="block text-sm font-medium">
          Rozmiar
          <select
            name="size"
            defaultValue={params.size ?? ""}
            className={cn(selectClass, "mt-1")}
          >
            <option value="">Dowolny</option>
            {Object.entries(SIZE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Płeć
          <select
            name="sex"
            defaultValue={params.sex ?? ""}
            className={cn(selectClass, "mt-1")}
          >
            <option value="">Dowolna</option>
            {Object.entries(SEX_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className={cn(selectClass, "mt-1")}
          >
            <option value="">Wszystkie</option>
            {catalogStatuses.map((value) => (
              <option key={value} value={value}>
                {ADOPTION_STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Sortuj
          <select
            name="sort"
            defaultValue={params.sort}
            className={cn(selectClass, "mt-1")}
          >
            {catalogSorts.map((value) => (
              <option key={value} value={value}>
                {catalogSortLabels[value]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
          >
            Zastosuj
          </button>
          {hasActiveFilters(params) && (
            <Link
              href="/animals"
              className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
            >
              Wyczyść filtry
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

export function describeFilters(params: CatalogParams): string {
  const parts: string[] = [];
  if (params.species) parts.push(SPECIES_LABEL[params.species]);
  if (params.size) parts.push(`rozmiar: ${SIZE_LABEL[params.size].toLowerCase()}`);
  if (params.sex) parts.push(SEX_LABEL[params.sex].toLowerCase());
  return parts.join(", ");
}
