import Link from "next/link";
import { buildCatalogHref, type CatalogParams } from "./catalog-query";

export function CatalogPagination({
  params,
  totalPages,
}: {
  params: CatalogParams;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "focus-visible:ring-ring inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none";
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - params.page) <= 1,
  );

  return (
    <nav aria-label="Paginacja" className="mt-10">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {params.page > 1 && (
          <li>
            <Link
              href={buildCatalogHref(params, { page: params.page - 1 })}
              rel="prev"
              className={`${linkClass} bg-card border-border hover:border-foreground/40`}
            >
              Poprzednia
            </Link>
          </li>
        )}
        {pages.map((p, index) => (
          <li key={p} className="flex items-center gap-2">
            {index > 0 && pages[index - 1] !== p - 1 && (
              <span aria-hidden className="text-muted-foreground">
                …
              </span>
            )}
            <Link
              href={buildCatalogHref(params, { page: p })}
              aria-current={p === params.page ? "page" : undefined}
              aria-label={`Strona ${p}`}
              className={`${linkClass} ${
                p === params.page
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border hover:border-foreground/40"
              }`}
            >
              {p}
            </Link>
          </li>
        ))}
        {params.page < totalPages && (
          <li>
            <Link
              href={buildCatalogHref(params, { page: params.page + 1 })}
              rel="next"
              className={`${linkClass} bg-card border-border hover:border-foreground/40`}
            >
              Następna
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
