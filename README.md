# Adopciaki

Platforma adopcyjna dla jednego schroniska: katalog zwierząt, konta adoptujących, rekomendacje oparte na regułach, zgłoszenia adopcyjne i panel pracownika.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres, Auth, Storage, RLS). Plan i status etapów: [docs/plan.md](docs/plan.md). Decyzje: [docs/adr](docs/adr).

**Status:** Etapy 1 (schemat i RLS), 2 (Auth) i 3 (panel staff — zwierzęta i zdjęcia) są zakończone. Użytkownik potwierdził ręczne testy przepływu e-mailowego oraz pełny test panelu i zarządzania zdjęciami 29.10.2026. Wszystkie 46 testów, w tym integracyjne testy RLS na Supabase dev, przeszły. Etap 4 (publiczny katalog z Supabase: filtry w URL, sortowanie, paginacja, profil i galeria) jest zaimplementowany i czeka na ręczny test UI.

## Uruchomienie

Wymagany Node.js 22 (Next.js wymaga co najmniej 20.9; wersja projektu jest w `.nvmrc`).

```bash
nvm use                      # Node 22 z .nvmrc
npm ci                       # instalacja zgodna z package-lock.json
cp .env.example .env.local   # opcjonalnie do czasu podłączenia Supabase
npm run dev                  # http://localhost:3000 (przy zajętym porcie Next wybierze kolejny, np. 3001)
```

Po zmianie wersji Node lub przeniesieniu projektu na inny komputer usuń `node_modules` i uruchom `npm ci`. Nie kopiuj `node_modules` między środowiskami: uszkodzone binarki natywne (SWC) powodują, że `next dev` wypisuje `Ready`, po czym proces cicho się kończy.

Skrypty: `lint`, `typecheck`, `test`, `format`, `format:check`, `build`.
Health check: `GET /api/health` (`supabase: not_configured | ok | error`).

## Zmienne środowiskowe

| Zmienna                         | Gdzie            | Opis                                                             |
| ------------------------------- | ---------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | publiczna        | adres aplikacji                                                  |
| `NEXT_PUBLIC_SUPABASE_URL`      | publiczna        | URL projektu Supabase                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publiczna        | klucz anon (bezpieczny dzięki RLS)                               |
| `SUPABASE_SERVICE_ROLE_KEY`     | **tylko serwer** | omija RLS; nigdy w kodzie klienta ani z prefiksem `NEXT_PUBLIC_` |

Wartości aplikacji trzymaj w `.env.local` (ignorowany przez Git) i w ustawieniach hostingu. Repo zawiera szablony `.env.example` oraz `.env.rls.example`; drugi dotyczy wyłącznie testów RLS.

## Konfiguracja Supabase

Projekt Supabase dev jest skonfigurowany, CLI zalogowane i repo podlinkowane; `GET /api/health` zwraca `supabase: ok`. Ustawienia Auth — Site URL, dozwolone przekierowania i potwierdzanie e-maila — zostały sprawdzone w Dashboardzie 27.10.2026.

## Testy RLS

Testy integracyjne łączą się z Supabase Cloud dev przez klucz publiczny i osobne konta testowe; nie używają `service_role`. Utwórz dwa konta adopter i jedno konto staff w Supabase Auth. Profil adopter A można utworzyć z user metadata `{"role":"staff"}` — test sprawdzi, że rola w bazie nadal pozostaje `adopter`. Nadaj trzeciemu użytkownikowi rolę `staff` ręcznie w SQL Editor:

```sql
update public.profiles
set role = 'staff'
where id = (
  select id from auth.users where email = 'staff-test@example.com'
);
```

Konfigurację testów trzymaj w osobnym, ignorowanym przez Git pliku `.env.rls.local`:

```bash
cp .env.rls.example .env.rls.local   # uzupełnij URL, klucz publiczny i dane trzech kont
```

Testy nie czytają `.env.local`. Używaj wyłącznie projektu dev i nie dodawaj klucza `service_role`. Test uruchomisz przez `npm test`. Gdy `.env.rls.local` lub jego zmiennych brakuje, testy RLS są pomijane. Zestaw 29 testów, w tym integracyjne testy RLS, przeszedł na Supabase dev 29.10.2026. Test zwierząt i zdjęć wymaga wdrożonych migracji `create_animals`, `archive_animals_instead_of_deleting`, `add_animal_photo_storage` oraz `fix_animal_photo_storage_policies`. Testy sprawdzają widoczność opublikowanych zwierząt i metadanych zdjęć, staff-only zapis/zmianę/usuwanie plików Storage, publiczny odczyt obiektów, ograniczenie liczby zdjęć i kolejność. Testowe rekordy metadanych są usuwane, a testowe zwierzęta archiwizowane. Nie uruchamiaj `supabase db reset` na projekcie Cloud.

Przykładowe dane zwierząt są w `supabase/seed.sql` i są ładowane przez lokalne `supabase db reset`.

## Panel pracownika

Personel używa tego samego formularza logowania co adoptujący. Po zalogowaniu aplikacja odczytuje rolę z `profiles`: staff trafia domyślnie do `/admin`, a adopter do `/account`. `/admin` jest wspólną powłoką panelu i przekierowuje do pierwszej dostępnej sekcji `/admin/animals`. Kolejne moduły, np. obsługa zgłoszeń, pojawią się wraz z implementacją tych funkcji.

Widoczność linków i przekierowania służą nawigacji, nie autoryzacji. Każda strona i Server Action panelu weryfikuje rolę staff na serwerze, a dostęp do danych dodatkowo ogranicza RLS. Rejestracja publiczna zawsze tworzy rolę `adopter`.

W edycji zwierzęcia staff może dodać do 10 zdjęć JPEG/PNG/WebP (maks. 5 MiB każde), ustawić ich kolejność i tekst alternatywny oraz usunąć zdjęcia. Nowe zwierzę po zapisie przechodzi do edycji, gdzie można dodać zdjęcia. Bucket `animal-photos` jest publiczny: sam plik jest dostępny dla każdego, kto zna jego URL, również przed publikacją zwierzęcia. Upload i usuwanie wymagają roli staff po stronie serwera i polityk Storage; metadane podlegają RLS. Migracje bucketu i polityk znajdują się w `supabase/migrations/`.

## Uwierzytelnianie

Formularze są dostępne pod `/register`, `/login`, `/forgot-password` i `/update-password`; linki e-mail obsługuje `/auth/callback`. Chronione strony korzystają z serwerowego `auth.getUser()` i wymagają potwierdzonego adresu e-mail. Site URL, dozwolone przekierowania (w tym callback zgodny z `NEXT_PUBLIC_SITE_URL`, np. `http://localhost:3000/auth/callback`) i potwierdzanie e-maila sprawdzono w Dashboardzie 27.10.2026. Użytkownik potwierdził 28.10.2026, że rejestracja, potwierdzenie, logowanie i reset hasła działają z domyślną wysyłką Supabase; własny SMTP nie jest obecnie potrzebny.

## Struktura

- `src/app/(public|auth|account)`, `src/app/admin` – trasy publiczne, konta i panel staff
- `src/features/` – logika domenowa per funkcja
- `src/features/admin/animals/` – walidacja, akcje i formularze zarządzania zwierzętami
- `src/lib/supabase/` – klienty (przeglądarka, serwer, proxy sesji)
- `src/lib/env.ts`, `env.server.ts` – walidacja zmiennych środowiskowych
- `supabase/migrations/` – migracje SQL
- `docs/adr/` – decyzje architektoniczne
