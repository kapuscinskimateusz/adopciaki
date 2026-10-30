import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, Heart } from "lucide-react";
import { getFavoriteIds } from "@/features/animals/data";
import { getOwnPreferences } from "@/features/preferences/data";
import { requireCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Moje konto",
  robots: { index: false },
};

function favoritesSummary(count: number) {
  if (count === 0)
    return "Nie masz jeszcze ulubionych. Kliknij serduszko przy zwierzaku.";
  if (count === 1) return "Masz 1 ulubionego zwierzaka.";
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  const few = lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14);
  return `Masz ${count} ${few ? "ulubione zwierzaki" : "ulubionych zwierzaków"}.`;
}

export default async function AccountPage() {
  const user = await requireCurrentUser();
  const [preferences, favoriteIds] = await Promise.all([
    getOwnPreferences(),
    getFavoriteIds(),
  ]);

  const steps = [
    {
      icon: ClipboardList,
      title: "Dopasowania",
      text: preferences
        ? "Ankieta jest wypełniona. Zobacz, które zwierzaki pasują do Ciebie najlepiej."
        : "Odpowiedz na kilka pytań o swój dom i rytm dnia, a pokażemy, kto pasuje najlepiej.",
      href: preferences ? "/account/matches" : "/account/matches/survey",
      cta: preferences ? "Zobacz dopasowania" : "Wypełnij ankietę",
    },
    {
      icon: Heart,
      title: "Ulubione",
      text: favoritesSummary(favoriteIds.size),
      href: favoriteIds.size > 0 ? "/account/favorites" : "/animals",
      cta: favoriteIds.size > 0 ? "Zobacz ulubione" : "Przeglądaj zwierzaki",
    },
  ];

  return (
    <div className="space-y-10">
      <section aria-labelledby="next-steps-heading">
        <h2 id="next-steps-heading" className="font-heading text-2xl font-semibold">
          Twoje następne kroki
        </h2>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2">
          {steps.map((step) => (
            <li
              key={step.title}
              className="bg-card border-border flex flex-col rounded-3xl border p-6"
            >
              <span className="bg-blush text-primary grid size-11 place-items-center rounded-2xl">
                <step.icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-heading mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                {step.text}
              </p>
              <Link
                href={step.href}
                className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
              >
                {step.cta}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="account-details-heading"
        className="border-border border-t pt-8"
      >
        <h2 id="account-details-heading" className="font-heading text-2xl font-semibold">
          Dane konta
        </h2>
        <dl className="mt-4 space-y-1 text-sm">
          <dt className="text-muted-foreground">Adres e-mail</dt>
          <dd className="font-medium">{user.email}</dd>
        </dl>
        <Link
          href="/update-password"
          className="text-primary mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline"
        >
          Zmień hasło
        </Link>
      </section>
    </div>
  );
}
