# Adopciaki

Platforma adopcyjna dla jednego schroniska: katalog zwierząt, konta adoptujących, rekomendacje oparte na regułach, zgłoszenia adopcyjne i panel pracownika.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres, Auth, Storage, RLS). Plan i status etapów: [docs/plan.md](docs/plan.md). Decyzje: [docs/adr](docs/adr).

**Status:** etap 0 (fundament) wykonany lokalnie. Supabase nie jest jeszcze skonfigurowany; aplikacja działa bez niego, a połączenie dodamy przed etapem 1.

## Uruchomienie

```bash
npm install
cp .env.example .env.local   # opcjonalnie do czasu założenia projektu Supabase
npm run dev                  # http://localhost:3000
```

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

## Podłączenie Supabase (później)

1. Załóż projekt w panelu Supabase (osobny na dev).
2. Wpisz URL i anon key do `.env.local`.
3. `npx supabase init` (jeśli brak `supabase/config.toml`), `npx supabase login`, `npx supabase link --project-ref <ref>`.
4. W Auth → URL Configuration ustaw Site URL i adresy przekierowań.
5. Sprawdź `GET /api/health`.

## Struktura

- `src/app/(public|auth|account)`, `src/app/admin` – trasy (grupy tras wg obszarów)
- `src/features/` – logika domenowa per funkcja
- `src/lib/supabase/` – klienty (przeglądarka, serwer, proxy sesji)
- `src/lib/env.ts`, `env.server.ts` – walidacja zmiennych środowiskowych
- `supabase/migrations/` – migracje SQL
- `docs/adr/` – decyzje architektoniczne
