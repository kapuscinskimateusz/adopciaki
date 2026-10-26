# Adopciaki

Platforma adopcyjna dla jednego schroniska: katalog zwierząt, konta adoptujących, rekomendacje oparte na regułach, zgłoszenia adopcyjne i panel pracownika.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres, Auth, Storage, RLS). Plan i status etapów: [docs/plan.md](docs/plan.md). Decyzje: [docs/adr](docs/adr).

**Status:** fundament aplikacji jest gotowy. Lokalnie skonfigurowano `.env.local`, zweryfikowano połączenie z projektem Supabase Cloud dev, a CLI zalogowano i repo podlinkowano. Etap 1 jest w toku: migracja profili została wdrożona, test dostępu gościa przeszedł; pełny test RLS wymaga kont adopter A/B i staff.

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

Wartości trzymaj w `.env.local` (ignorowany przez Git) i w ustawieniach hostingu. Repo zawiera tylko `.env.example`.

## Konfiguracja Supabase przed etapem 1

1. Użyj istniejącego projektu dev potwierdzonego w Supabase Dashboard; nie twórz drugiego projektu.
2. Skopiuj URL projektu i klucz publiczny (publishable/anon) do `.env.local`. Nie dodawaj klucza `service_role`. (Zrobione lokalnie.)
3. Zaloguj Supabase CLI (`npx supabase login`) i połącz repo z projektem (`npx supabase link --project-ref <ref>`). `supabase/config.toml` jest już w repo, więc nie trzeba ponownie uruchamiać `supabase init`. (Zrobione lokalnie.)
4. Uruchom aplikację i sprawdź `GET /api/health`; oczekiwany status połączenia to `supabase: ok`. (Zweryfikowane lokalnie.)
5. Przed etapem 2 sprawdź w Auth → URL Configuration adres Site URL i dozwolone przekierowania.

## Testy RLS

Testy integracyjne profili łączą się z Supabase Cloud dev przez klucz publiczny i osobne konta testowe; nie używają `service_role`. Utwórz dwa konta adopter i jedno konto staff w Supabase Auth. Profil adopter A można utworzyć z user metadata `{"role":"staff"}` — test sprawdzi, że rola w bazie nadal pozostaje `adopter`. Nadaj trzeciemu użytkownikowi rolę `staff` ręcznie w SQL Editor:

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

Testy nie czytają `.env.local`. Używaj wyłącznie projektu dev i nie dodawaj klucza `service_role`. Test uruchomisz przez `npm test`. Gdy `.env.rls.local` lub jego zmiennych brakuje, testy RLS są pomijane.

## Struktura

- `src/app/(public|auth|account)`, `src/app/admin` – trasy (grupy tras wg obszarów)
- `src/features/` – logika domenowa per funkcja
- `src/lib/supabase/` – klienty (przeglądarka, serwer, proxy sesji)
- `src/lib/env.ts`, `env.server.ts` – walidacja zmiennych środowiskowych
- `supabase/migrations/` – migracje SQL
- `docs/adr/` – decyzje architektoniczne
