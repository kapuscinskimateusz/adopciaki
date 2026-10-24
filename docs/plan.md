# Adopciaki — plan projektu

Dokument jest źródłem prawdy dla zakresu i kolejności prac. Decyzje technologiczne: [adr/0001-stack.md](./adr/0001-stack.md).
Sekcje „Plan” opisują zamierzony stan. Sekcja [Status realizacji](#status-realizacji) opisuje, co faktycznie wykonano i zweryfikowano.

## Status realizacji

Stan na koniec etapu 0 (zmiany jeszcze nie zacommitowane).

| Etap         | Status                                 |
| ------------ | -------------------------------------- |
| 0. Fundament | Wykonany lokalnie, z wyjątkami poniżej |
| 1–9          | Nie rozpoczęte                         |

### Etap 0 — zweryfikowane lokalnie

- `npm run format:check`, `lint`, `typecheck`, `test` (1 test smoke) i `build` przechodzą.
- Aplikacja startuje bez konfiguracji Supabase; `GET /api/health` zwraca `{"app":"ok","supabase":"not_configured"}`.
- Niepoprawny `NEXT_PUBLIC_SUPABASE_URL` powoduje czytelny błąd walidacji Zod (odpowiedź 500); puste wartości są traktowane jak brak wartości.
- `.env.local` jest ignorowany przez Git, `.env.example` nie; w `.next/static` nie ma `service_role`.
- Nagłówki bezpieczeństwa są ustawione (m.in. `X-Frame-Options`, HSTS), `X-Powered-By` wyłączony.
- Obecne: struktura katalogów, README, ADR-0001, AGENTS.md.

### Etap 0 — nie wykonane lub niezweryfikowane

- **Supabase Cloud nie jest skonfigurowany.** Projekt nie został założony, `.env.local` nie istnieje, połączenie nie zostało potwierdzone (zweryfikowano tylko tryb `not_configured`).
- **`supabase init` i `supabase link` nie zostały wykonane**, więc `supabase/config.toml` nie istnieje. Ustawienia Auth (Site URL, adresy przekierowań) nie zostały skonfigurowane.
- **CI (GitHub Actions) nie zostało zweryfikowane.** Workflow `.github/workflows/ci.yml` istnieje, ale repozytorium nie ma zdalnego remote'a. Te same kroki przeszły lokalnie.
- **Husky i lint-staged pominięte** jako opcjonalne.
- Zmienne środowiskowe w CI nie są ustawiane; build działa, bo Supabase jest opcjonalny do etapu 1.

### Odchylenia od pierwotnego planu etapu 0

- Next.js 16 używa `src/proxy.ts` zamiast `middleware.ts`. Odświeżanie sesji Supabase jest w `src/lib/supabase/proxy.ts` (nie `middleware.ts`).
- `cacheComponents` wyłączone (scaffold włączał je domyślnie) dla prostoty; opisane w ADR-0001.
- `@types/node` podniesione do wersji 22 (zgodność z Vitest).
- Do etapu 1 aplikacja działa bez Supabase (konfiguracja opcjonalna).
- Dodano trasę `GET /api/health`.
- Domyślne pliki SVG w `public/` zostają na razie.

### Podjęte decyzje

- Supabase Cloud (bez lokalnego Supabase i Dockera).
- Next.js + TypeScript + Tailwind CSS + shadcn/ui.
- Podstawowe cechy zwierząt jako kolumny/enumy w `animals`; osobny model `traits` dopiero gdy będzie uzasadniony.
- Język MVP: wyłącznie polski; bez i18n.
- Samodzielna rejestracja zawsze tworzy użytkownika z rolą `adopter`. Rola `staff` jest nadawana ręcznie przez administratora projektu przez SQL; nie będzie systemu zaproszeń w MVP.
- Proponowane ustawienie Supabase Auth: wymagane potwierdzenie e-maila przed logowaniem. Szczegóły i konsekwencje opisano w sekcji [Uwierzytelnianie i potwierdzenie e-maila](#uwierzytelnianie-i-potwierdzenie-e-maila); ustawienie nie zostało jeszcze wdrożone.
- Hosting: Vercel + Supabase Cloud (zgodnie z planem; nie był przedmiotem osobnej rozmowy).

### Nadal do zatwierdzenia

- Zakres ankiety i ostateczna lista reguł dopasowania (do dopracowania w etapie 6).
- Wdrożenie potwierdzenia e-maila: propozycja to wymaganie potwierdzenia przed logowaniem. Należy skonfigurować ją w Supabase Auth po utworzeniu projektu; nie jest to jeszcze wykonane ani zweryfikowane.

## Problem i podejście

Platforma adopcyjna dla jednego schroniska: katalog zwierząt, konta adoptujących, rekomendacje regułowe, zgłoszenia adopcyjne ze statusami, panel pracownika. Supabase (Postgres + Auth + Storage + RLS). Budowa pionowymi przyrostami; bezpieczeństwo (RLS) i testy od pierwszego etapu.

Stan środowiska w chwili planowania: pusty katalog, Node 22 / npm 10, brak Dockera i Supabase CLI. Dlatego wybrano Supabase Cloud.

## Zakres MVP

**W zakresie:** polski interfejs bez i18n; katalog + filtry + profil zwierzęcia + galeria; rejestracja/logowanie/reset hasła z proponowanym wymaganiem potwierdzenia e-maila; ulubione; ankieta preferencji + rekomendacje regułowe z uzasadnieniem; zgłoszenie adopcyjne (statusy, wycofanie); panel staff: CRUD zwierząt, zdjęcia, obsługa zgłoszeń, notatki, historia statusów; RLS; testy. Samodzielnie rejestrujący się użytkownik zawsze jest adopterem. Administrator projektu nadaje rolę staff ręcznie przez SQL; bez zaproszeń w MVP.

**Poza MVP:** kalendarz wizyt, e-maile, przypisywanie pracowników, statystyki, wolontariat, darowizny, AI, wiele schronisk, wiele ról pracowniczych, prywatne załączniki, i18n.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui — SSR/SEO katalogu, Server Actions, popularne w portfolio.
- Supabase: Postgres, Auth (e-mail+hasło), Storage (publiczny bucket zdjęć), RLS; `@supabase/ssr`.
- Walidacja: Zod + React Hook Form. Typy z `supabase gen types`.
- Testy: Vitest (logika dopasowania), pgTAP/SQL lub testy integracyjne RLS, Playwright (E2E kluczowego przepływu).
- CI: GitHub Actions (lint, typecheck, testy). Hosting: Vercel + Supabase Cloud.
- Bez osobnego backendu — logika w SQL (constraints, RLS, funkcje) i Server Actions.

Stan zależności: zainstalowane są Next.js, Tailwind, shadcn/ui, `@supabase/ssr`, `@supabase/supabase-js`, Zod, `server-only`, Vitest, Prettier. React Hook Form i Playwright zostaną dodane, gdy będą potrzebne.

## Decyzje architektoniczne i model danych

- Rola w `profiles.role` (`adopter` | `staff`); rola `adopter` jest wartością domyślną nadawaną przez bazę przy tworzeniu profilu. Nie ufamy roli z user metadata ani danym wejściowym z klienta. Nadanie `staff` jest ręczne przez administratora projektu w SQL; nie ma systemu zaproszeń w MVP.
- `is_staff()` (security definer) może być helperem do polityk RLS, z ograniczonym `search_path` i minimalnymi uprawnieniami. Polityki muszą uniemożliwiać użytkownikowi samodzielną zmianę `profiles.role` i eskalację uprawnień; uprawnienia egzekwuje baza, nie ukrywanie elementów UI. Trigger tworzy profil z rolą `adopter` po rejestracji.
- Tabele: `profiles`, `animals` (cechy jako kolumny/enumy), `animal_photos`, `favorites`, `adopter_preferences`, `applications`, `application_status_history`, `staff_notes`. Osobne `traits` + `animal_traits` tylko gdy będzie uzasadnione.
- Statusy jako enumy Postgresa; zmiana statusu zgłoszenia przez funkcję RPC (walidacja przejść + wpis do historii w jednej transakcji).
- Unikalność: jedno aktywne zgłoszenie na parę (user, zwierzę) — partial unique index.
- Dopasowanie: czysta funkcja TypeScript (testowalna), zwraca score + powody; liczona po stronie serwera, nie przechowywana.
- Publiczny dostęp tylko przez RLS do zwierząt `published`; dane adoptujących i notatki nigdy publiczne. Widok/kolumny publiczne bez danych wewnętrznych.
- Storage: bucket `animal-photos` publiczny do odczytu, zapis tylko staff, limit rozmiaru i typów MIME.
- Soft-delete/archiwizacja zamiast usuwania zwierząt; zgoda na przetwarzanie danych zapisywana ze znacznikiem czasu.
- Migracje SQL w repo, seed z danymi demo.

## Uwierzytelnianie i potwierdzenie e-maila

**Proponowane najprostsze bezpieczne ustawienie:** w Supabase Auth włączyć potwierdzanie e-maila i wymagać potwierdzenia przed dopuszczeniem do logowania. Korzystamy z wbudowanych wiadomości Supabase Auth dla potwierdzenia i resetu hasła; MVP nie wymaga własnego systemu e-mail ani osobnej usługi powiadomień. Aplikacja nie uznaje konta za zweryfikowane na podstawie danych z formularza — stan weryfikacji pochodzi z Supabase Auth.

**Konsekwencje dla developmentu:** ponieważ wybrano Supabase Cloud, lokalna aplikacja korzysta z tego samego projektu dev w chmurze, a nie z lokalnego serwera Auth/Inbucket. Trzeba dodać `http://localhost:3000` i właściwe ścieżki callback/resetu do dozwolonych URL-i przekierowań Supabase. Każdy test rejestracji lub resetu wymaga dostępu do skrzynki testowej i kliknięcia otrzymanego linku. Nie należy osłabiać ustawienia potwierdzania w kodzie; testy automatyczne powinny korzystać z kontrolowanego konta testowego lub jawnie skonfigurowanego środowiska. Wbudowana wysyłka Supabase wystarcza do developmentu i wstępnej demonstracji, ale przed produkcją trzeba sprawdzić limity i dostarczalność oraz skonfigurować własny SMTP, jeśli tego wymagają. To ustawienie pozostaje propozycją do zastosowania po utworzeniu projektu; nie zostało jeszcze skonfigurowane.

## Etap 0 — fundament (plan)

Decyzje: Supabase Cloud (migracje przez `supabase` CLI uruchamiane z `npx`, `db push` do projektu), Next.js + TS + Tailwind + shadcn/ui, cechy jako kolumny.

Zakres:

1. `git init`, `.gitignore` (w tym `.env*` poza `.env.example`), README (licencja opcjonalnie).
2. `create-next-app` (App Router, TS strict, ESLint, Tailwind, `src/`, alias `@/`), `shadcn init`.
3. Struktura: `src/app/(public)`, `(auth)`, `(account)`, `admin`; `src/lib/supabase/{client,server,proxy}.ts` (`@supabase/ssr`; w Next.js 16 plik proxy zamiast middleware); `src/proxy.ts`; `src/lib/env.ts` (walidacja Zod, fail-fast); `src/features/*`; `supabase/migrations`; `docs/adr`.
4. Env: `.env.example` z `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (tylko serwer, opcjonalny w etapie 0; moduł z `import "server-only"`), `NEXT_PUBLIC_SITE_URL`. Sekrety tylko w `.env.local` i panelu Vercel; osobny projekt Supabase dev (prod później).
5. Supabase Cloud: założenie projektu (użytkownik, w panelu), `supabase init` + `link`, ustawienia Auth (Site URL, redirecty), RLS włączone w każdej migracji od etapu 1; hasło DB nigdzie w repo.
6. Jakość: Prettier, ESLint, `typecheck`, Vitest + test smoke, skrypty npm, Husky/lint-staged (opcjonalnie), nagłówki bezpieczeństwa w `next.config`.
7. CI: GitHub Actions (format, lint, typecheck, test, build) bez prawdziwych sekretów.
8. Dokumentacja: README (uruchomienie, env), `docs/adr/0001-stack.md`, `AGENTS.md` (konwencje, zasady bezpieczeństwa), `docs/plan.md`.
9. Strona startowa z placeholderem + kontrola połączenia z Supabase (health check).

Kryteria ukończenia (stan: patrz [Status realizacji](#status-realizacji)):

- `npm run dev` pokazuje stronę; `npm run lint`, `typecheck`, `test`, `build` przechodzą lokalnie i w CI.
- Aplikacja z brakującym/niepoprawnym env kończy się czytelnym błędem (dla wartości opcjonalnych: działa w trybie bez Supabase).
- `.env.local` nie jest śledzony; `service_role` nie trafia do bundla klienta (sprawdzone grepem po `.next/static`).
- Połączenie z projektem Supabase potwierdzone; `supabase link` działa.
- Struktura katalogów, README, ADR-0001, AGENTS.md i `docs/plan.md` są obecne.

## Etapy 1–9 (rezultat → kryteria akceptacji)

Etap 1 wymaga założonego projektu Supabase (URL i klucz anon w `.env.local`) oraz wykonania `supabase init` i `link`.

1. **Schemat i bezpieczeństwo:** migracje, enumy, RLS, trigger profili wymuszający rolę `adopter`, `is_staff()`, seed. Ręczne nadawanie staff przez SQL administratora projektu. → testy RLS: gość widzi tylko published; adopter nie widzi cudzych danych i nie może zmienić swojej roli; staff ma uprawnienia operacyjne; próba samodzielnej eskalacji roli jest zablokowana.
2. **Auth:** rejestracja, logowanie, reset hasła, potwierdzenie e-maila zgodnie z proponowanym ustawieniem, proxy sesji (rozszerzenie `src/proxy.ts`), guardy tras. → E2E rejestracji obejmuje stan przed i po potwierdzeniu; niepotwierdzony użytkownik nie uzyskuje dostępu do chronionych funkcji; panel niedostępny dla adopter.
3. **Panel staff — zwierzęta:** lista, formularz CRUD, publikacja/archiwizacja, upload i kolejność zdjęć. → staff dodaje zwierzę ze zdjęciem; walidacja pliku; adopter nie może uploadować.
4. **Katalog publiczny:** lista, filtry/sortowanie/paginacja, profil, galeria, SEO. → gość widzi tylko published; filtry w URL; Lighthouse/a11y bazowe.
5. **Konto i ulubione:** profil, ulubione. → toggle ulubionych; widoczne tylko własne.
6. **Ankieta i rekomendacje:** preferencje, silnik reguł, widok „dla Ciebie” z uzasadnieniem. → testy jednostkowe reguł (twarde wykluczenia, score, powody).
7. **Zgłoszenia (adopter):** formularz ze zgodą, lista, szczegóły, wycofanie. → brak duplikatów aktywnych; nie widać cudzych; zgoda zapisana.
8. **Panel staff — zgłoszenia:** lista/filtry, szczegóły, zmiana statusu przez RPC, notatki, historia. → niedozwolone przejścia odrzucane; notatki niewidoczne dla adoptującego.
9. **Hardening i wdrożenie:** przegląd RLS/security, rate limiting formularzy, nagłówki, a11y, E2E pełnego przepływu, deploy, dokumentacja portfolio. → checklista bezpieczeństwa, E2E zielone, działająca wersja demo.

## Testy i bezpieczeństwo (przekrojowo)

- Test RLS dla każdej tabeli: gość / adopter A / adopter B / staff.
- Vitest dla reguł i walidatorów; Playwright dla 2 przepływów (adopter, staff).
- Klucz `service_role` tylko serwerowo, nigdy w kliencie; sekrety w env; walidacja Zod po stronie serwera; uprawnienia egzekwowane w DB.
- Minimalizacja danych osobowych, brak dokumentów w MVP, polityka prywatności i retencja opisane w README.
