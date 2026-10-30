import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getOwnPreferences } from "@/features/preferences/data";
import { PreferencesForm } from "@/features/preferences/preferences-form";
import { requireAdopter } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Ankieta",
  robots: { index: false },
};

export default async function SurveyPage() {
  await requireAdopter("/account/matches/survey");
  const preferences = await getOwnPreferences();

  return (
    <section className="bg-card border-border rounded-3xl border p-6 sm:p-10">
      {preferences && (
        <Link
          href="/account/matches"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Wróć do dopasowań
        </Link>
      )}
      <h2 className="font-heading mt-2 text-2xl font-semibold">
        Opowiedz nam o swoim domu
      </h2>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        Na podstawie odpowiedzi pokażemy zwierzaki, które mogą do Ciebie pasować, i
        wyjaśnimy dlaczego. Odpowiedzi możesz zmienić w każdej chwili.
      </p>
      <p className="text-muted-foreground border-border mt-5 mb-9 flex items-center gap-2 border-t pt-4 text-sm">
        <ShieldCheck className="size-4 shrink-0" aria-hidden />
        Odpowiedzi widzisz tylko Ty i pracownicy schroniska.
      </p>
      <PreferencesForm preferences={preferences} />
    </section>
  );
}
