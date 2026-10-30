import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getOwnPreferences } from "@/features/preferences/data";
import { PreferencesForm } from "@/features/preferences/preferences-form";
import { requireCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Ankieta preferencji",
  robots: { index: false },
};

export default async function PreferencesPage() {
  await requireCurrentUser("/account/preferences");
  const preferences = await getOwnPreferences();

  return (
    <section className="bg-card border-border mt-8 rounded-3xl border p-6 sm:p-10">
      <p className="text-primary text-sm font-semibold tracking-widest uppercase">
        Ankieta preferencji
      </p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight">
        Opowiedz nam o swoim domu
      </h1>
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
