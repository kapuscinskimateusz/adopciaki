# ADR 0001: Stack technologiczny

Status: zaakceptowany

## Kontekst

Projekt solo, portfolio, nauka AI-assisted codingu. Potrzebne: SEO katalogu, auth, relacyjne dane, bezpieczeństwo oparte na bazie.

## Decyzja

- **Next.js (App Router) + TypeScript (strict)** – SSR/SEO, Server Actions, brak osobnego backendu.
- **Tailwind CSS + shadcn/ui** – szybki, spójny UI; komponenty w repo, bez ciężkiej zależności.
- **Supabase Cloud** (Postgres, Auth, Storage, RLS) – bez Dockera; migracje SQL w repo, wdrażane przez CLI.
- **Zod** – walidacja env i danych wejściowych. **Vitest** – testy jednostkowe.
- **Hosting:** Vercel + Supabase Cloud.
- Cechy zwierząt jako kolumny/enumy w `animals`; osobny model `traits` dopiero, gdy będzie uzasadniony.
- Uwaga Next.js 16: `middleware` → `proxy.ts`. `cacheComponents` wyłączone dla prostoty (można włączyć później).

## Konsekwencje

- Autoryzacja egzekwowana przez RLS, nie przez UI.
- `service_role` wyłącznie po stronie serwera (`server-only`).
- Zależność od Supabase Cloud; lokalne środowisko wymagałoby Dockera.
