import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AnimalForm } from "@/features/admin/animals/animal-form";
import { AnimalPhotoManager } from "@/features/admin/animals/animal-photo-manager";
import { updateAnimalAction } from "@/features/admin/animals/actions";
import { animalRecordSchema } from "@/features/admin/animals/schema";
import {
  ANIMAL_PHOTO_BUCKET,
  animalPhotoSchema,
} from "@/features/admin/animals/photo-schema";
import { requireStaff } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

const animalIdSchema = z.uuid();

export default async function EditAnimalPage({
  params,
}: PageProps<"/admin/animals/[animalId]/edit">) {
  const { animalId } = await params;
  await requireStaff(`/admin/animals/${animalId}/edit`);

  const parsedId = animalIdSchema.safeParse(animalId);
  if (!parsedId.success) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animals")
    .select(
      "id, slug, name, species, breed, age_months, sex, size, energy_level, description, traits, good_with_children, good_with_dogs, good_with_cats, can_stay_alone, suitable_for_apartment, requires_experience, publication_status, adoption_status, created_at, updated_at",
    )
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się pobrać danych zwierzęcia: ${error.message}`);
  }
  if (!data) {
    notFound();
  }

  const parsedAnimal = animalRecordSchema.safeParse(data);
  if (!parsedAnimal.success) {
    throw new Error(
      `Supabase zwrócił nieprawidłowe dane zwierzęcia: ${parsedAnimal.error.message}`,
    );
  }
  const animal = parsedAnimal.data;
  const action = updateAnimalAction.bind(null, animal.id);
  const { data: photoData, error: photosError } = await supabase
    .from("animal_photos")
    .select("id, animal_id, storage_path, alt_text, display_order, created_at")
    .eq("animal_id", animal.id)
    .order("display_order", { ascending: true });

  if (photosError) {
    throw new Error(`Nie udało się pobrać zdjęć zwierzęcia: ${photosError.message}`);
  }

  const parsedPhotos = animalPhotoSchema.array().safeParse(photoData ?? []);
  if (!parsedPhotos.success) {
    throw new Error(
      `Supabase zwrócił nieprawidłowe dane zdjęć: ${parsedPhotos.error.message}`,
    );
  }
  const photos = parsedPhotos.data.map((photo) => ({
    ...photo,
    publicUrl: supabase.storage.from(ANIMAL_PHOTO_BUCKET).getPublicUrl(photo.storage_path)
      .data.publicUrl,
  }));

  return (
    <section>
      <Link
        href="/admin/animals"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Wróć do zwierząt
      </Link>
      <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight">
        Edytuj: {animal.name}
      </h1>
      <p className="text-muted-foreground mt-2">
        Zmiany wprowadzone tutaj dotyczą profilu zwierzęcia.
      </p>
      <div className="bg-card border-border mt-8 rounded-2xl border p-5 sm:p-8">
        <AnimalForm action={action} animal={animal} />
        <AnimalPhotoManager animalId={animal.id} photos={photos} />
      </div>
    </section>
  );
}
