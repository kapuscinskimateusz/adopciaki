import "server-only";
import { z } from "zod";
import {
  animalAdoptionStatuses,
  animalSexes,
  animalSizes,
  animalSpecies,
} from "@/features/admin/animals/schema";
import { ANIMAL_PHOTO_BUCKET } from "@/features/admin/animals/photo-schema";
import { getCurrentUser, getCurrentViewer } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  CATALOG_PAGE_SIZE,
  escapeLikePattern,
  type CatalogParams,
} from "./catalog-query";

const photoSchema = z.object({
  storage_path: z.string(),
  alt_text: z.string(),
  display_order: z.number().int(),
});

const publicAnimalSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  species: z.enum(animalSpecies),
  breed: z.string(),
  age_months: z.number().int().nullable(),
  sex: z.enum(animalSexes),
  size: z.enum(animalSizes),
  energy_level: z.number().int().min(1).max(5),
  description: z.string(),
  traits: z.array(z.string()),
  good_with_children: z.boolean().nullable(),
  good_with_dogs: z.boolean().nullable(),
  good_with_cats: z.boolean().nullable(),
  can_stay_alone: z.boolean().nullable(),
  suitable_for_apartment: z.boolean().nullable(),
  requires_experience: z.boolean().nullable(),
  adoption_status: z.enum(animalAdoptionStatuses),
  created_at: z.string(),
  animal_photos: z.array(photoSchema),
});

export type PublicPhoto = { url: string; alt: string };
export type PublicAnimal = Omit<
  z.output<typeof publicAnimalSchema>,
  "animal_photos" | "created_at"
> & { photos: PublicPhoto[] };

const ANIMAL_COLUMNS =
  "id, slug, name, species, breed, age_months, sex, size, energy_level, description, traits, good_with_children, good_with_dogs, good_with_cats, can_stay_alone, suitable_for_apartment, requires_experience, adoption_status, created_at, animal_photos(storage_path, alt_text, display_order)";

async function parseAnimals(rows: unknown[]): Promise<PublicAnimal[]> {
  const parsed = publicAnimalSchema.array().safeParse(rows);
  if (!parsed.success) {
    throw new Error(
      `Supabase zwrócił nieprawidłowe dane zwierząt: ${parsed.error.message}`,
    );
  }

  const supabase = await createClient();
  return parsed.data.map(({ animal_photos, created_at: _createdAt, ...animal }) => {
    void _createdAt;
    return {
      ...animal,
      photos: [...animal_photos]
        .sort((a, b) => a.display_order - b.display_order)
        .map((photo) => ({
          url: supabase.storage.from(ANIMAL_PHOTO_BUCKET).getPublicUrl(photo.storage_path)
            .data.publicUrl,
          alt: photo.alt_text,
        })),
    };
  });
}

// RLS zwraca gościowi wyłącznie opublikowane zwierzęta; filtr jest dodatkowym zabezpieczeniem.
export async function getCatalogPage(params: CatalogParams) {
  const supabase = await createClient();

  const buildQuery = () => {
    let query = supabase
      .from("animals")
      .select(ANIMAL_COLUMNS, { count: "exact" })
      .eq("publication_status", "published");

    if (params.status) {
      query = query.eq("adoption_status", params.status);
    } else {
      query = query.neq("adoption_status", "adopted");
    }
    if (params.species) query = query.eq("species", params.species);
    if (params.size) query = query.eq("size", params.size);
    if (params.sex) query = query.eq("sex", params.sex);
    if (params.q) query = query.ilike("name", `%${escapeLikePattern(params.q)}%`);

    switch (params.sort) {
      case "name":
        query = query.order("name", { ascending: true });
        break;
      case "youngest":
        query = query.order("age_months", { ascending: true, nullsFirst: false });
        break;
      case "oldest":
        query = query.order("age_months", { ascending: false, nullsFirst: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }
    // Stabilna kolejność przy równych wartościach, żeby paginacja nie dublowała wyników.
    return query.order("id", { ascending: true });
  };

  const from = (params.page - 1) * CATALOG_PAGE_SIZE;
  let { data, error, count } = await buildQuery().range(
    from,
    from + CATALOG_PAGE_SIZE - 1,
  );

  // PGRST103: strona poza zakresem. Pobieramy pierwszą stronę, żeby poznać liczbę wyników.
  if (error?.code === "PGRST103") {
    ({ data, error, count } = await buildQuery().range(0, CATALOG_PAGE_SIZE - 1));
    data = [];
  }
  if (error) {
    throw new Error(`Nie udało się pobrać katalogu zwierząt: ${error.message}`);
  }

  const total = count ?? 0;
  return {
    animals: await parseAnimals(data ?? []),
    total,
    totalPages: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
  };
}

export async function getFeaturedAnimals(limit = 4) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animals")
    .select(ANIMAL_COLUMNS)
    .eq("publication_status", "published")
    .eq("adoption_status", "available")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Nie udało się pobrać zwierząt: ${error.message}`);
  }
  return parseAnimals(data ?? []);
}

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export async function getAnimalBySlug(slug: string): Promise<PublicAnimal | null> {
  if (!slugSchema.safeParse(slug).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animals")
    .select(ANIMAL_COLUMNS)
    .eq("publication_status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się pobrać profilu zwierzęcia: ${error.message}`);
  }
  if (!data) return null;

  const [animal] = await parseAnimals([data]);
  return animal;
}

// Gość dostaje pusty zbiór (serduszko prowadzi do logowania), a staff null: ulubione
// są funkcją konta adoptującego, więc serduszko się nie wyświetla.
// RLS zawęża wynik do ulubionych zalogowanego.
export async function getFavoriteIds(): Promise<Set<string> | null> {
  if (!(await getCurrentUser())) return new Set();
  if ((await getCurrentViewer())?.isStaff) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("favorites").select("animal_id");
  if (error) {
    throw new Error(`Nie udało się pobrać ulubionych: ${error.message}`);
  }
  return new Set((data ?? []).map((row) => row.animal_id as string));
}

// Zwierzęta, które przestały być opublikowane, znikają z listy dzięki RLS na animals.
export async function getFavoriteAnimals(): Promise<PublicAnimal[]> {
  const supabase = await createClient();
  const { data: favorites, error } = await supabase
    .from("favorites")
    .select("animal_id")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Nie udało się pobrać ulubionych: ${error.message}`);
  }

  const ids = (favorites ?? []).map((row) => row.animal_id as string);
  if (ids.length === 0) return [];

  const { data, error: animalsError } = await supabase
    .from("animals")
    .select(ANIMAL_COLUMNS)
    .eq("publication_status", "published")
    .in("id", ids);
  if (animalsError) {
    throw new Error(`Nie udało się pobrać ulubionych zwierząt: ${animalsError.message}`);
  }

  const animals = await parseAnimals(data ?? []);
  return animals.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
}

// Kandydaci do rekomendacji: wszystkie opublikowane, jeszcze nieadoptowane zwierzęta.
// Schronisko ma ich dziesiątki, więc ranking liczymy w pamięci po stronie serwera.
export async function getRecommendableAnimals(): Promise<PublicAnimal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animals")
    .select(ANIMAL_COLUMNS)
    .eq("publication_status", "published")
    .neq("adoption_status", "adopted")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(`Nie udało się pobrać zwierząt do rekomendacji: ${error.message}`);
  }
  return parseAnimals(data ?? []);
}
