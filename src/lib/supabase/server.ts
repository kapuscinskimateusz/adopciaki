import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/env";

export async function createClient() {
  // cookies() musi być pierwsze: oznacza trasę jako dynamiczną, zanim konfiguracja ewentualnie rzuci błąd.
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Wywołanie z Server Component - odświeżaniem sesji zajmuje się proxy.
        }
      },
    },
  });
}
