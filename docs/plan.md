# Adopciaki — plan projektu

Dokument jest źródłem prawdy dla zakresu i kolejności prac. Decyzje technologiczne: [adr/0001-stack.md](./adr/0001-stack.md).
Sekcje „Plan” opisują zamierzony stan. Sekcja [Status realizacji](#status-realizacji) opisuje, co faktycznie wykonano i zweryfikowano.

## Status realizacji

Stan na 29.10.2026. Projekt Supabase Cloud dev istnieje, `.env.local` jest skonfigurowany, a lokalne połączenie zweryfikowane. CLI jest zalogowane i repo podlinkowane.

| Etap         | Status                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------- |
| 0. Fundament | Gotowy; połączenie z Supabase Cloud dev zweryfikowane lokalnie                                    |
| 1. Schemat   | Gotowy; profile, zwierzęta, zdjęcia i RLS wdrożone, testy integracyjne zdane                      |
| 2. Auth      | Gotowy; implementacja i ręczne testy E2E przepływu e-mailowego potwierdzone przez użytkownika     |
| 3. Panel     | Gotowy; zarządzanie zwierzętami i zdjęciami wdrożone do Supabase dev, ręczny test UI potwierdzony |
| 4. Katalog   | Gotowy; dane z Supabase, filtry w URL, profil i galeria, ręczny test UI potwierdzony              |
| 5. Ulubione  | Gotowy; migracja i testy RLS zdane, ręczny test UI potwierdzony                                   |
| 6–9          | Nie rozpoczęte                                                                                    |

### Etap 0 — wykonane i zweryfikowane

- Użytkownik potwierdził, że projekt Supabase Cloud dev istnieje i ma do niego dostęp. Na tym komputerze skonfigurowano `.env.local` (ignorowany przez Git; klucz `service_role` nie jest potrzebny), a Supabase CLI jest zalogowany i repo podlinkowane do projektu.
- `GET /api/health` zwraca lokalnie `{"app":"ok","supabase":"ok"}` (zweryfikowane 26.10.2026).
- Środowisko uruchomieniowe: Node 22 (`.nvmrc`). Na Node 17 Next.js nie startuje (wymaga ≥ 20.9). Uszkodzone binarki SWC w `node_modules` powodowały ciche zakończenie `next dev` po `Ready` (SIGBUS); naprawione przez `npm ci`.
- W `supabase/config.toml` automatyczne wystawianie nowych tabel przez lokalne Data API jest wyłączone. To ustawienie nie zmienia konfiguracji Supabase Cloud.
- Tryb bez konfiguracji Supabase, walidacja Zod, nagłówki bezpieczeństwa i wyłączenie `X-Powered-By` pozostają obsługiwane.
- `.env.example`, `.env.rls.example`, README, ADR-0001, AGENTS.md, plan, struktura aplikacji i workflow CI są obecne.

### Do wykonania przed kolejnymi etapami

- **Kolejne tabele i zasoby:** każda nowa tabela i polityka Storage musi otrzymać jawne uprawnienia, RLS i testy dla gościa/adopterów/staff; testy profili, zwierząt i zdjęć przechodzą na Supabase dev.
- **Supabase Auth:** Site URL, dozwolone adresy przekierowań i wymagane potwierdzanie e-maila sprawdzono w Dashboardzie 27.10.2026. Użytkownik potwierdził 28.10.2026, że rejestracja, potwierdzenie e-maila, logowanie i reset hasła działają z domyślną wysyłką Supabase. Własny SMTP nie jest obecnie potrzebny. Callback aplikacji to `/auth/callback`; pełny adres musi odpowiadać `NEXT_PUBLIC_SITE_URL` (lokalnie port 3000 lub faktyczny port dev).
- **GitHub Actions:** workflow jest przygotowany; jego wykonanie zdalne będzie można potwierdzić po wypchnięciu commita. Lokalna walidacja projektu jest wykonywana przed commitem.
- **Husky i lint-staged pominięte** jako opcjonalne.
- Zmienne środowiskowe w CI nie są ustawiane; build musi działać bez konfiguracji Supabase. Trasy zależne od sesji są dynamiczne, bo `createClient()` wywołuje `cookies()` przed odczytem konfiguracji (poprawka błędu prerenderu `/account` w CI).

### Odchylenia od pierwotnego planu etapu 0

- Next.js 16 używa `src/proxy.ts` zamiast `middleware.ts`. Odświeżanie sesji Supabase jest w `src/lib/supabase/proxy.ts` (nie `middleware.ts`).
- `cacheComponents` wyłączone (scaffold włączał je domyślnie) dla prostoty; opisane w ADR-0001.
- `@types/node` podniesione do wersji 22 (zgodność z Vitest).
- Do etapu 1 aplikacja działa bez Supabase (konfiguracja opcjonalna).
- Dodano trasę `GET /api/health`.
- Domyślne pliki SVG w `public/` zostają na razie.

### Etap 1 — zakończony

- Przyrost profili: migracja `20261026213000_create_profiles.sql` definiuje role i profile, tworzy brakujące profile istniejących użytkowników, ustawia nowe profile jako `adopter`, dodaje helper `is_staff()` i politykę odczytu. Migracja została wdrożona do Supabase Cloud dev 26.10.2026.
- Testy RLS profili dla gościa, adopterów A/B i staff przeszły przeciwko Supabase dev 26.10.2026.
- Przyrost zwierząt: migracja `20261026230000_create_animals.sql` tworzy zwierzęta i metadane zdjęć, osobne statusy publikacji i adopcji oraz polityki RLS; wdrożona do Supabase Cloud dev 26.10.2026. Testy gościa, adopterów i staff przeszły. Przykładowe dane dla lokalnego środowiska są w `supabase/seed.sql`.
- Migracja `20261026231800_archive_animals_instead_of_deleting.sql` odbiera staffowi możliwość fizycznego usuwania zwierząt; została wdrożona do Supabase Cloud dev 26.10.2026. Zwierzęta można archiwizować przez `publication_status`.
- Pełny zestaw integracyjny profili, zwierząt i zdjęć: 12 testów przeszło przeciwko Supabase dev 26.10.2026. `supabase/seed.sql` zawiera dane przykładowe dla lokalnego środowiska.

### Etap 2 — zakończony

- Formularze rejestracji, logowania, resetu i zmiany hasła używają Server Actions oraz walidacji Zod po stronie serwera.
- Callback wymienia jednorazowy kod na sesję. Serwerowy helper weryfikuje sesję przez `auth.getUser()` i odrzuca konta bez potwierdzonego e-maila; proxy odświeża sesję.
- Chroniona trasa `/account` i helper roli staff korzystają z serwerowej weryfikacji. Testy walidacji formularzy i bezpiecznych przekierowań przechodzą.
- Użytkownik ręcznie zweryfikował pełny przepływ rejestracji, potwierdzenia, logowania i resetu hasła z domyślną wysyłką Supabase 28.10.2026. Wcześniejszy błąd `over_email_send_rate_limit` (HTTP 429) nie wystąpił ponownie; własny SMTP odłożono.
- Po zalogowaniu aplikacja odczytuje rolę z `profiles`: adopter trafia domyślnie do `/account`, a staff do `/admin`. Dozwolony lokalny parametr `next` ma pierwszeństwo, a chronione strony ponownie sprawdzają rolę.

### Etap 3 — panel staff: zwierzęta i zdjęcia (zakończony)

- `/admin` jest wspólną powłoką panelu pracownika i na razie przekierowuje do pierwszej gotowej sekcji `/admin/animals`. Nawigacja zawiera tylko dostępny moduł „Zwierzęta”; zgłoszenia i metryki pojawią się, gdy będą wspierane przez kolejne funkcje.
- Staff może wyświetlać listę zwierząt i tworzyć/edytować podstawowe dane oraz statusy publikacji i adopcji. Archiwizacja zmienia `publication_status`; panel nie wykonuje fizycznych usunięć. Użytkownik potwierdził ręczny test panelu 29.10.2026.
- Każda strona i Server Action w panelu sprawdza rolę staff po stronie serwera; zapis korzysta z sesji użytkownika i istniejącego RLS, bez `service_role`.
- Formularz waliduje dane Zod po stronie serwera. Użytkownik potwierdził ręczne sprawdzenie panelu i pełnego przepływu zdjęć na koncie staff 29.10.2026.
- Migracja `20261029150000_add_animal_photo_storage.sql` tworzy publiczny bucket `animal-photos`, polityki Storage dla staff, limit 5 MiB i whitelistę JPEG/PNG/WebP; wymusza limit 10 metadanych zdjęć na zwierzę przez trigger i udostępnia transakcyjną funkcję zmiany kolejności. Migracja `20261029152900_fix_animal_photo_storage_policies.sql` kwalifikuje nazwę obiektu w politykach, aby ograniczenie ścieżki sprawdzało ID zwierzęcia, a nie kolumnę `animals.name`. Obie migracje wdrożono do Supabase Cloud dev 29.10.2026.
- Staff może dodawać zdjęcia z walidacją typu MIME, sygnatury pliku, rozmiaru i tekstu alternatywnego, ustawiać kolejność, edytować tekst alternatywny i usuwać plik wraz z metadanymi. Po utworzeniu zwierzęcia panel przechodzi do jego edycji. Pliki publicznego bucketu są dostępne po poznaniu URL także dla szkiców; dostęp do listowania i mutacji Storage pozostaje ograniczony RLS.
- 29 testów, w tym integracyjne testy RLS Storage i metadanych na Supabase dev, przeszło 29.10.2026. Lint, typecheck, format check i build przechodzą.

### Etap 4 — katalog publiczny (zakończony)

- `/animals` (lista) i `/animals/[slug]` (profil z galerią) czytają dane z Supabase sesją użytkownika; gość widzi wyłącznie zwierzęta `published` (RLS plus jawny filtr). Domyślnie lista pomija zwierzęta adoptowane; profil adoptowanego zwierzęcia pozostaje dostępny pod bezpośrednim adresem.
- Filtry (gatunek, rozmiar, płeć, status, szukanie po imieniu), sortowanie i paginacja (12 na stronę) żyją w URL; parametry waliduje Zod, nieprawidłowe wartości są ignorowane, a strona poza zakresem przekierowuje na ostatnią. Zapytania są dynamiczne, więc build nadal działa bez konfiguracji Supabase.
- Strona główna pokazuje cztery najnowsze dostępne zwierzęta i link do katalogu. Zwierzęta bez zdjęć mają ilustrację zastępczą. Metadane SEO: tytuł, opis, canonical, Open Graph; strony z filtrami i dalsze strony mają `noindex`.
- Nagłówek publiczny odczytuje sesję (`getCurrentViewer()`): zalogowany widzi „Moje konto” i „Wyloguj się”, staff także „Panel”; gość widzi „Zaloguj się” i „Załóż konto”. Błąd Supabase degraduje widok do gościa. To tylko UX, dostęp egzekwują strony i RLS.
- Serduszka na kartach usunięto z prototypu; ulubione wrócą w etapie 5. Dane przykładowe zostają wyłącznie dla ilustracji w hero i sekcji dopasowania.

### Etap 5 — ulubione (zakończony)

- Tabela `favorites` (`user_id`, `animal_id`, `created_at`, klucz główny `(user_id, animal_id)`) z RLS: użytkownik widzi, dodaje i usuwa wyłącznie własne wpisy; dodać można tylko zwierzę `published`; brak `update` i brak dostępu dla gościa. Wpis można usunąć także po cofnięciu publikacji zwierzęcia.
- Serduszko (formularz z Server Action `toggleFavoriteAction`, walidacja Zod) na kartach i profilu; gość po kliknięciu trafia do logowania i wraca na tę samą stronę (ulubione nie jest dodawane automatycznie). Lista ulubionych (najnowsze pierwsze) jest w `/account`; niepublikowane zwierzęta znikają z niej dzięki RLS.
- Świadomie pominięte: limit liczby ulubionych i rate limiting (etap 9). Profil adoptującego przeniesiono do etapu 7.

### Podjęte decyzje

- Supabase Cloud (bez lokalnego Supabase i Dockera).
- Next.js + TypeScript + Tailwind CSS + shadcn/ui.
- Podstawowe cechy zwierząt jako kolumny/enumy w `animals`; osobny model `traits` dopiero gdy będzie uzasadniony.
- Język MVP: wyłącznie polski; bez i18n.
- Samodzielna rejestracja zawsze tworzy użytkownika z rolą `adopter`. Rola `staff` jest nadawana ręcznie przez administratora projektu przez SQL; nie będzie systemu zaproszeń w MVP.
- Wymagane potwierdzenie e-maila przed logowaniem jest włączone w Supabase Auth (sprawdzone 27.10.2026). Szczegóły i konsekwencje opisano w sekcji [Uwierzytelnianie i potwierdzenie e-maila](#uwierzytelnianie-i-potwierdzenie-e-maila).
- Staff i adopter logują się przez te same formularze Auth. Rola `profiles.role` kieruje staff domyślnie do wspólnego `/admin`, a adopterów do `/account`; role z user metadata nie są używane do autoryzacji.
- Panel `/admin` rozwija się modułowo. Pierwszą sekcją są zwierzęta; kolejne pozycje nawigacji dodajemy wraz z gotowymi funkcjami, zamiast pokazywać niedziałające zakładki.
- Hosting: Vercel + Supabase Cloud (zgodnie z planem; nie był przedmiotem osobnej rozmowy).

### Otwarte kwestie i konfiguracja

- Zakres ankiety i ostateczna lista reguł dopasowania (do dopracowania w etapie 6).

## Problem i podejście

Platforma jednego schroniska, która prowadzi od poznania zwierzęcia do odpowiedzialnej obsługi adopcji: publiczny katalog, konto adoptującego, rekomendacje regułowe, zgłoszenie ze statusami i panel pracownika. Supabase (Postgres + Auth + Storage + RLS). Budowa pionowymi przyrostami; bezpieczeństwo (RLS) i testy od pierwszego etapu.

### Mapa produktu i główne ścieżki

- **Publicznie:** strona główna i katalog (`/animals`) → profil zwierzęcia (`/animals/[slug]`) → rejestracja/logowanie, ulubione lub zgłoszenie adopcyjne. Katalog czyta dane z Supabase.
- **Adopter:** `/account` jest przestrzenią konta; profil, ulubione, preferencje i zgłoszenia są dodawane przyrostowo.
- **Staff:** ten sam system logowania, ale domyślne wejście do wspólnego `/admin`. Panel ma nawigację modułową; początkowo dostępna jest sekcja „Zwierzęta”, później dojdą „Zgłoszenia”. `/admin` kieruje do pierwszej dostępnej sekcji, a strona publiczna pozostaje dostępna przez link z panelu.
- **Zasada bezpieczeństwa:** menu i przekierowanie po zalogowaniu są UX-em, nie kontrolą dostępu. Każda chroniona strona i Server Action sprawdza rolę po stronie serwera, a uprawnienia do danych egzekwuje RLS. Staff nie uzyskuje roli przez rejestrację ani user metadata.

Stan środowiska w chwili planowania: pusty katalog, Node 22 / npm 10, brak Dockera i Supabase CLI. Dlatego wybrano Supabase Cloud.

## Zakres MVP

**W zakresie:** polski interfejs bez i18n; katalog + filtry + profil zwierzęcia + galeria; rejestracja/logowanie/reset hasła z wymaganym potwierdzeniem e-maila; ulubione; ankieta preferencji + rekomendacje regułowe z uzasadnieniem; zgłoszenie adopcyjne (statusy, wycofanie); panel staff: CRUD zwierząt, zdjęcia, obsługa zgłoszeń, notatki, historia statusów; RLS; testy. Samodzielnie rejestrujący się użytkownik zawsze jest adopterem. Administrator projektu nadaje rolę staff ręcznie przez SQL; bez zaproszeń w MVP.

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
- `animals` rozdziela `publication_status` (`draft`, `published`, `archived`) od `adoption_status` (`available`, `meeting`, `adopted`); publiczne role widzą tylko opublikowane rekordy. `animal_photos` przechowuje metadane i ścieżkę obiektu; upload i polityki Storage są częścią panelu staff.
- Statusy jako enumy Postgresa; zmiana statusu zgłoszenia przez funkcję RPC (walidacja przejść + wpis do historii w jednej transakcji).
- Unikalność: jedno aktywne zgłoszenie na parę (user, zwierzę) — partial unique index.
- Dopasowanie: czysta funkcja TypeScript (testowalna), zwraca score + powody; liczona po stronie serwera, nie przechowywana.
- Publiczny dostęp tylko przez RLS do zwierząt `published`; dane adoptujących i notatki nigdy publiczne. Widok/kolumny publiczne bez danych wewnętrznych.
- Storage: bucket `animal-photos` publiczny do odczytu, zapis tylko staff, limit rozmiaru i typów MIME.
- Soft-delete/archiwizacja zamiast usuwania zwierząt; zgoda na przetwarzanie danych zapisywana ze znacznikiem czasu.
- Migracje SQL w repo, seed z danymi demo.

## Uwierzytelnianie i potwierdzenie e-maila

**Przyjęte ustawienie:** Supabase Auth wymaga potwierdzenia e-maila przed dopuszczeniem do logowania; ustawienie sprawdzono w Dashboardzie 27.10.2026. Aplikacja nie uznaje konta za zweryfikowane na podstawie danych z formularza — stan weryfikacji pochodzi z Supabase Auth.

**Konsekwencje dla developmentu:** ponieważ wybrano Supabase Cloud, lokalna aplikacja korzysta z projektu dev w chmurze, a nie z lokalnego serwera Auth/Inbucket. Site URL i dozwolone adresy callback/resetu sprawdzono w Dashboardzie. Ręczne testy rejestracji, potwierdzenia, logowania i resetu hasła zostały potwierdzone 28.10.2026 przy użyciu domyślnej wysyłki Supabase. Nie należy osłabiać potwierdzania e-maila; przyszłe testy automatyczne powinny korzystać z kontrolowanego konta lub jawnie skonfigurowanego środowiska. Własny SMTP nie jest obecnie wymagany.

## Etap 0 — fundament (plan)

Decyzje: Supabase Cloud (migracje przez `supabase` CLI uruchamiane z `npx`, `db push` do projektu), Next.js + TS + Tailwind + shadcn/ui, cechy jako kolumny.

Zakres:

1. `git init`, `.gitignore` (w tym `.env*` poza `.env.example` i `.env.rls.example`), README (licencja opcjonalnie).
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

Etap 1 wymaga projektu Supabase dev (potwierdzony, `.env.local` skonfigurowany) oraz połączenia CLI (`supabase link`). Plik `supabase/config.toml` już istnieje; nie trzeba ponownie wykonywać `supabase init`.

1. **Schemat i bezpieczeństwo:** migracje, enumy, RLS, trigger profili wymuszający rolę `adopter`, `is_staff()`, seed. Ręczne nadawanie staff przez SQL administratora projektu. Projektem docelowym jest Supabase Cloud dev; migracje wdrażamy po przeglądzie przez `supabase db push`, nigdy przez `db reset` na projekcie zdalnym. Przed wdrożeniem ustalamy powtarzalny sposób testowania RLS na rolach gościa, adopter A/B i staff. → testy RLS: gość widzi tylko published; adopter nie widzi cudzych danych i nie może zmienić swojej roli; staff ma uprawnienia operacyjne; próba samodzielnej eskalacji roli jest zablokowana.
2. **Auth:** rejestracja, logowanie, reset hasła, wymagane potwierdzenie e-maila, proxy sesji (rozszerzenie `src/proxy.ts`), guardy tras. → E2E rejestracji obejmuje stan przed i po potwierdzeniu; niepotwierdzony użytkownik nie uzyskuje dostępu do chronionych funkcji; panel niedostępny dla adopter.
3. **Panel staff — zwierzęta:** wspólny shell `/admin`, lista oraz formularz tworzenia/edycji, statusy publikacji/adopcji, archiwizacja istniejących rekordów oraz zdjęcia w Storage z kolejnością i politykami bucketu. → staff zarządza zwierzętami i zdjęciami; adopter nie może wejść do panelu ani mutować rekordów; archiwizacja działa bez fizycznego usunięcia.
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

### Testy RLS profili i zwierząt — konfiguracja lokalna

Testy w `src/lib/supabase/rls.test.ts` łączą się z Supabase Cloud dev przez publiczny klucz API i konta testowe; nie używają `service_role`. Po wdrożeniu migracji utwórz w Auth trzech użytkowników testowych: adopter A, adopter B i staff. Profil A można utworzyć z user metadata `{"role":"staff"}` — test potwierdzi, że metadata nie nadaje uprawnień. Nadaj rolę staff dla trzeciego profilu ręcznie w SQL Editor jako administrator projektu:

```sql
update public.profiles
set role = 'staff'
where id = (
  select id from auth.users where email = 'staff-test@example.com'
);
```

Skopiuj `.env.rls.example` do ignorowanego `.env.rls.local` i uzupełnij URL, klucz publiczny oraz adresy i hasła kont (testy nie czytają `.env.local`).

Uruchom `npm test`. Testy sprawdzają brak dostępu gościa do profili, prywatność profili adopterów, blokadę eskalacji roli, odczyt profili przez staff oraz widoczność wyłącznie opublikowanych zwierząt i ich zdjęć dla gościa/adoptera. Testy ponownie wykorzystują rekordy o stałych identyfikatorach: tworzą lub aktualizują zwierzęta i metadane zdjęć, a po sprawdzeniu archiwizują zwierzęta. Rekordy metadanych zdjęć pozostają w bazie dev. Bez wymaganych zmiennych w `.env.rls.local` testy RLS są pomijane. Przykładowe dane dla lokalnego środowiska są w `supabase/seed.sql`; nigdy nie używaj `supabase db reset` na projekcie Cloud.
