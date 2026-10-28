import Link from "next/link";
import { requireStaff } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  animalAdoptionStatusLabels,
  animalPublicationStatusLabels,
  animalSpeciesLabels,
} from "@/features/admin/animals/labels";
import { animalListItemSchema } from "@/features/admin/animals/schema";

export default async function AdminAnimalsPage() {
  await requireStaff("/admin/animals");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animals")
    .select("id, slug, name, species, publication_status, adoption_status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Nie udało się pobrać zwierząt: ${error.message}`);
  }

  const parsedAnimals = animalListItemSchema.array().safeParse(data ?? []);
  if (!parsedAnimals.success) {
    throw new Error(
      `Supabase zwrócił nieprawidłowe dane zwierząt: ${parsedAnimals.error.message}`,
    );
  }
  const animals = parsedAnimals.data;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">
            Panel pracownika
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Zwierzęta
          </h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj profilami, publikacją i statusem adopcji.
          </p>
        </div>
        <Link
          href="/admin/animals/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium"
        >
          Dodaj zwierzę
        </Link>
      </div>

      {animals.length === 0 ? (
        <div className="bg-card border-border mt-8 rounded-2xl border p-6">
          <h2 className="font-heading text-xl font-semibold">Nie ma jeszcze zwierząt</h2>
          <p className="text-muted-foreground mt-2">
            Dodaj pierwszy profil. Nowe zwierzę zostanie zapisane jako szkic.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {animals.map((animal) => (
            <li
              key={animal.id}
              className="bg-card border-border flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="font-heading text-xl font-semibold">{animal.name}</h2>
                  <span className="text-muted-foreground text-sm">
                    {animalSpeciesLabels[animal.species]}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  /{animal.slug} ·{" "}
                  {animalPublicationStatusLabels[animal.publication_status]} ·{" "}
                  {animalAdoptionStatusLabels[animal.adoption_status]}
                </p>
              </div>
              <Link
                href={`/admin/animals/${animal.id}/edit`}
                className="border-border hover:bg-muted inline-flex h-9 shrink-0 items-center justify-center rounded-lg border px-3 text-sm font-medium"
              >
                Edytuj
                <span className="sr-only"> {animal.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
