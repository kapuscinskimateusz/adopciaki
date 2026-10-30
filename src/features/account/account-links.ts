// Jedno źródło zakładek konta dla zakładek pod nagłówkiem i menu „Moje konto”.
// Nową pozycję dodajemy dopiero razem z działającą funkcją (docs/product.md).
export const ACCOUNT_LINKS = [
  { href: "/account", label: "Przegląd" },
  { href: "/account/matches", label: "Dopasowania" },
  { href: "/account/favorites", label: "Ulubione" },
] as const;

export function isActiveAccountLink(href: string, pathname: string) {
  return href === "/account"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
