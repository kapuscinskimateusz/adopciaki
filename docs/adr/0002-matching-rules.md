# ADR 0002: Reguły dopasowania adoptującego i zwierzęcia

Status: zaakceptowany

## Kontekst

Etap 6 wymaga rekomendacji z uzasadnieniem („nie czarna skrzynka”). Wcześniej zwierzę miało tylko gatunek, rozmiar, wiek, energię i cechy jako wolny tekst, a z takich danych nie da się wiarygodnie wnioskować o zgodności, np. z dziećmi.

## Decyzja

- **Dane zwierzęcia:** w `animals` dodano kolumny `boolean null`: `good_with_children`, `good_with_dogs`, `good_with_cats`, `can_stay_alone`, `suitable_for_apartment` i `requires_experience`. `NULL` oznacza „nie wiadomo” i jest wartością domyślną. Staff ustawia je w panelu.
- **Ankieta:** tabela `adopter_preferences` (jeden wiersz na użytkownika) zawiera gatunki (≥ 1), preferowane rozmiary (puste = dowolny), rodzaj domu, czas samotności, aktywność 1–5, dzieci, posiadane psy/koty i doświadczenie. RLS: właściciel ma pełny dostęp do swojego wiersza, staff tylko odczyt, gość brak dostępu. Ankieta jest dostępna wyłącznie dla zalogowanych.
- **Silnik:** czysta funkcja `matchAnimal` / `rankAnimals` w `src/features/matching/engine.ts`. Działa bez dostępu do bazy i jest pokryta testami jednostkowymi.
- **Twarde wykluczenia:** wykluczenie następuje tylko przy znanym „nie”:
  - gatunek spoza ankiety;
  - dzieci w domu i `good_with_children = false`;
  - pies lub kot w domu i odpowiednio `good_with_dogs` lub `good_with_cats = false`;
  - pierwsze zwierzę i `requires_experience = true`.
- **Score 0–100:** suma ważonych kryteriów miękkich:

  | Kryterium     | Waga | Zasada                                                                                        |
  | ------------- | ---- | --------------------------------------------------------------------------------------------- |
  | Energia       | 35   | różnica \|aktywność − energia\|: 0 → 100%, 1 → ~71%, 2 → ~29%, ≥ 3 → 0%                       |
  | Samotność     | 20   | do 4 h: pełna; dłużej: `true` → pełna, `NULL` → połowa, `false` → ¼ (4–8 h) lub 0 (> 8 h)     |
  | Dom           | 15   | dom: pełna; mieszkanie: `suitable_for_apartment` `true` → pełna, `NULL` → połowa, `false` → 0 |
  | Domownicy     | 10   | odsetek zgodnych wśród istotnych (dzieci, psy, koty); `NULL` nie daje punktów                 |
  | Rozmiar       | 10   | zgodny lub brak preferencji → pełna                                                           |
  | Doświadczenie | 10   | wymóg bez pełnego doświadczenia albo `NULL` u początkującego → połowa                         |

- **Powody:** kryteria, które coś rozróżniają, dodają powód „pasuje” lub „do omówienia” (neutralne przypadki, np. samotność do 4 h, nie dodają nic). `NULL` nigdy nie wyklucza; zawsze daje ostrzeżenie, żeby rozmowa ze schroniskiem rozstrzygnęła brakującą wiedzę.
- **Ranking:** wykluczone zwierzęta są pomijane (widok pokazuje tylko ich liczbę). Pozostałe są sortowane po score, potem po imieniu i id, więc wynik jest deterministyczny.
- **Bez przechowywania wyniku:** score jest liczony na serwerze przy każdym wyświetleniu. Zmiana ankiety lub danych zwierzęcia działa od razu, nie trzeba niczego przeliczać ani synchronizować.

## Konsekwencje

- Jakość rekomendacji zależy od uzupełnienia pól zgodności przez staff. Puste pola obniżają score i generują ostrzeżenia, ale nie ukrywają zwierząt.
- Ranking liczony w pamięci dla wszystkich opublikowanych, nieadoptowanych zwierząt (limit 500) wystarcza dla jednego schroniska. Przy większej skali trzeba będzie wstępnie filtrować w SQL.
- Wynik jest podpowiedzią. Decyzję o adopcji podejmuje pracownik schroniska.
