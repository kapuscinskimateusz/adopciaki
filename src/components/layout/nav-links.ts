export const NAV_LINKS = [
  { href: "/animals", label: "Zwierzaki" },
  { href: "/#jak-to-dziala", label: "Jak adoptować" },
  { href: "/#wizyta", label: "Kontakt" },
] as const;

// Pozycje menu „Moje konto”: zakładki konta i zmiana hasła.
export const ACCOUNT_MENU_EXTRA_LINKS = [
  { href: "/update-password", label: "Zmień hasło" },
] as const;
