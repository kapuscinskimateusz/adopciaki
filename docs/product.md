# Adopciaki — produkt, nawigacja i treści

Źródło prawdy dla tego, **co użytkownik widzi**: role, trasy, nawigacja, nazwy i zasady pisania treści. Zakres i kolejność prac opisuje [plan.md](./plan.md), decyzje techniczne [adr/](./adr). Każda zmiana funkcji widocznej dla użytkownika aktualizuje ten dokument w tym samym przyroście.

## Role

| Rola       | Gdzie jest „u siebie”         | Nagłówek strony (prawa strona)                                  |
| ---------- | ----------------------------- | --------------------------------------------------------------- |
| Gość       | strona publiczna              | „Zaloguj się”, „Załóż konto”                                    |
| Adoptujący | strona publiczna i `/account` | menu „Moje konto”: zakładki konta, „Zmień hasło”, „Wyloguj się” |
| Staff      | panel `/admin`                | „Panel pracownika”                                              |

- Staff korzysta wyłącznie z panelu. `/account` przekierowuje staff do `/admin`, a staff nie ma ulubionych ani ankiety.
- Po zalogowaniu adoptujący trafia do `/account`, a staff do `/admin`.
- Widoczność linków to UX, nie zabezpieczenie: dostęp egzekwują strony, Server Actions i RLS.

## Mapa tras

**Strona publiczna** (wspólny nagłówek i stopka):

- `/`: strona główna z sekcjami „Czekają na dom”, „Jak adoptować” (`#jak-to-dziala`), „Dopasowanie” (`#dopasowanie`) i „Odwiedź nas” (`#wizyta`).
- `/animals`: katalog z filtrami w URL.
- `/animals/[slug]`: profil zwierzęcia.
- Menu główne: „Zwierzaki” (`/animals`), „Jak adoptować” (`/#jak-to-dziala`), „Kontakt” (`/#wizyta`).

**Konto adoptującego** (w szablonie strony publicznej, zakładki pod nagłówkiem):

| Zakładka    | Trasa                                         | Zawartość                                                                              |
| ----------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Przegląd    | `/account`                                    | powitanie, następne kroki (ankieta, ulubione), dane konta i „Zmień hasło”              |
| Dopasowania | `/account/matches`, `/account/matches/survey` | bez ankiety: wyjaśnienie i „Wypełnij ankietę”; z ankietą: ranking i „Zmień odpowiedzi” |
| Ulubione    | `/account/favorites`                          | zapisane zwierzęta                                                                     |
| Zgłoszenia  | `/account/applications`                       | dochodzi w etapie 7                                                                    |

**Panel pracownika** (`/admin`, osobna powłoka):

- Zakładki: „Zwierzęta” (`/admin/animals`), „Zgłoszenia” od etapu 8.
- Menu użytkownika: e-mail, „Zobacz stronę”, „Wyloguj się”.

**Auth:** `/login`, `/register`, `/forgot-password`, `/update-password` (także „Zmień hasło” z konta), `/auth/callback`.

## Słownik

Używamy tych nazw konsekwentnie w menu, nagłówkach i przyciskach:

- **Zwierzaki**: potocznie w menu i nagłówkach; „zwierzę/zwierzęta” w treści formalnej i komunikatach.
- **Dopasowania**: ranking zwierząt na podstawie ankiety. **Ankieta**: pytania, które go zasilają. Nie używamy nazw „rekomendacje” ani „Dla Ciebie”.
- **Ulubione**: zwierzęta oznaczone serduszkiem.
- **Zgłoszenie**: zgłoszenie chęci adopcji (od etapu 7).
- **Panel pracownika**: obszar staff. W UI nie używamy słowa „admin”.

## Zasady

1. **Menu tylko dla działających funkcji.** Nie pokazujemy zakładek ani przycisków „wkrótce”.
2. **Treść opisuje tylko to, co działa.** Nowa funkcja aktualizuje teksty na stronie głównej i ten dokument w tym samym przyroście.
3. **Każda akcja ma jedno miejsce.** Wylogowanie jest w menu konta w nagłówku, a w panelu w menu użytkownika.
4. **Język**
   - prosty i konkretny, w drugiej osobie („Ty”), bez żargonu i metafor marketingowych;
   - neutralny płciowo: zamiast form typu „miałem/miałam” piszemy „mam już za sobą…”.
5. **Liczby i przykłady albo są prawdziwe, albo jawnie oznaczone jako „Przykład”.** Statystyki liczymy z bazy. Przykład dopasowania na stronie głównej liczy prawdziwy silnik reguł, żeby powody zgadzały się z produktem.
6. **Zalogowanym nie pokazujemy zachęt dla gościa** (np. „Załóż konto”), tylko odpowiedni następny krok.
