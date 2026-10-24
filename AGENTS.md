<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Adopciaki — zasady dla agentów AI

- Język UI: polski. Kod, nazwy i commity: angielski.
- Stack i decyzje: `docs/adr/`. Plan, etapy i status realizacji: `docs/plan.md`. Pracuj małymi pionowymi przyrostami.
- **Bezpieczeństwo:** uprawnienia egzekwuje baza (RLS), nie UI. Każda nowa tabela ma RLS i test RLS.
- Nigdy nie umieszczaj sekretów w kodzie ani w repo; `SUPABASE_SERVICE_ROLE_KEY` tylko w kodzie z `server-only`, bez prefiksu `NEXT_PUBLIC_`.
- Autoryzację na serwerze opieraj na `supabase.auth.getUser()`, nie `getSession()`.
- Dane wejściowe waliduj Zod po stronie serwera. Zmiany schematu tylko przez migracje w `supabase/migrations/`.
- Przed zakończeniem zadania uruchom: `npm run lint && npm run typecheck && npm test && npm run build`.
