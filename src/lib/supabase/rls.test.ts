import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Osobny plik, żeby nie mieszać haseł kont testowych z konfiguracją aplikacji.
const rlsEnvFile = resolve(process.cwd(), ".env.rls.local");
if (existsSync(rlsEnvFile)) {
  process.loadEnvFile(rlsEnvFile);
}

type TestUser = {
  client: SupabaseClient;
  id: string;
};

const supabaseUrl = process.env.SUPABASE_RLS_URL;
const anonKey = process.env.SUPABASE_RLS_ANON_KEY;
const adopterAEmail = process.env.SUPABASE_RLS_ADOPTER_A_EMAIL;
const adopterAPassword = process.env.SUPABASE_RLS_ADOPTER_A_PASSWORD;
const adopterBEmail = process.env.SUPABASE_RLS_ADOPTER_B_EMAIL;
const adopterBPassword = process.env.SUPABASE_RLS_ADOPTER_B_PASSWORD;
const staffEmail = process.env.SUPABASE_RLS_STAFF_EMAIL;
const staffPassword = process.env.SUPABASE_RLS_STAFF_PASSWORD;

const publicTestIsConfigured = Boolean(supabaseUrl && anonKey);
const testIsConfigured = Boolean(
  publicTestIsConfigured &&
  adopterAEmail &&
  adopterAPassword &&
  adopterBEmail &&
  adopterBPassword &&
  staffEmail &&
  staffPassword,
);

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Brak wymaganej zmiennej środowiskowej ${name}.`);
  }
  return value;
}

function createTestClient(key: string) {
  return createClient(required(supabaseUrl, "SUPABASE_RLS_URL"), key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function signIn(email: string, password: string): Promise<TestUser> {
  const client = createTestClient(required(anonKey, "SUPABASE_RLS_ANON_KEY"));
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      `Nie udało się zalogować użytkownika testowego ${email}: ${error.message}`,
    );
  }
  if (!data.user) {
    throw new Error(`Supabase Auth nie zwrócił użytkownika testowego ${email}.`);
  }
  return { client, id: data.user.id };
}

describe.skipIf(!publicTestIsConfigured)("anonymous database access", () => {
  it("does not let guests read profiles or call the staff helper", async () => {
    const anonymousClient = createTestClient(required(anonKey, "SUPABASE_RLS_ANON_KEY"));
    const { error: selectError } = await anonymousClient
      .from("profiles")
      .select("id")
      .limit(1);
    const { error: rpcError } = await anonymousClient.rpc("is_staff");

    expect(selectError).not.toBeNull();
    expect(rpcError).not.toBeNull();
  });
});

describe.skipIf(!testIsConfigured)("profile row-level security", () => {
  let adopterA: TestUser;
  let adopterB: TestUser;
  let staff: TestUser;
  const testAnimalIds: string[] = [];
  let publishedAnimalId: string;
  let draftAnimalId: string;
  let publishedPhotoId: string;
  let draftPhotoId: string;

  beforeAll(async () => {
    [adopterA, adopterB, staff] = await Promise.all([
      signIn(
        required(adopterAEmail, "SUPABASE_RLS_ADOPTER_A_EMAIL"),
        required(adopterAPassword, "SUPABASE_RLS_ADOPTER_A_PASSWORD"),
      ),
      signIn(
        required(adopterBEmail, "SUPABASE_RLS_ADOPTER_B_EMAIL"),
        required(adopterBPassword, "SUPABASE_RLS_ADOPTER_B_PASSWORD"),
      ),
      signIn(
        required(staffEmail, "SUPABASE_RLS_STAFF_EMAIL"),
        required(staffPassword, "SUPABASE_RLS_STAFF_PASSWORD"),
      ),
    ]);

    const testToken = randomUUID();
    const { data: animals, error: animalError } = await staff.client
      .from("animals")
      .insert([
        {
          slug: `rls-published-${testToken}`,
          name: "RLS published test",
          species: "dog",
          breed: "Test",
          age_months: 24,
          sex: "unknown",
          size: "medium",
          energy_level: 3,
          description: "Test record for RLS.",
          publication_status: "published",
        },
        {
          slug: `rls-draft-${testToken}`,
          name: "RLS draft test",
          species: "cat",
          breed: "Test",
          age_months: 12,
          sex: "unknown",
          size: "small",
          energy_level: 2,
          description: "Test record for RLS.",
          publication_status: "draft",
        },
      ])
      .select("id, publication_status");

    if (animalError) {
      throw new Error(
        `Nie udało się utworzyć zwierząt testowych: ${animalError.message}`,
      );
    }

    const publishedAnimal = animals.find(
      (animal) => animal.publication_status === "published",
    );
    const draftAnimal = animals.find((animal) => animal.publication_status === "draft");
    if (!publishedAnimal || !draftAnimal) {
      throw new Error("Supabase nie zwrócił obu zwierząt testowych.");
    }
    publishedAnimalId = publishedAnimal.id;
    draftAnimalId = draftAnimal.id;
    testAnimalIds.push(publishedAnimalId, draftAnimalId);

    const { data: photos, error: photoError } = await staff.client
      .from("animal_photos")
      .insert([
        {
          animal_id: publishedAnimalId,
          storage_path: `rls-tests/${testToken}/published.webp`,
          alt_text: "Test photo for a published animal.",
        },
        {
          animal_id: draftAnimalId,
          storage_path: `rls-tests/${testToken}/draft.webp`,
          alt_text: "Test photo for a draft animal.",
        },
      ])
      .select("id, animal_id");

    if (photoError) {
      throw new Error(`Nie udało się utworzyć zdjęć testowych: ${photoError.message}`);
    }

    const publishedPhoto = photos.find((photo) => photo.animal_id === publishedAnimalId);
    const draftPhoto = photos.find((photo) => photo.animal_id === draftAnimalId);
    if (!publishedPhoto || !draftPhoto) {
      throw new Error("Supabase nie zwrócił obu zdjęć testowych.");
    }
    publishedPhotoId = publishedPhoto.id;
    draftPhotoId = draftPhoto.id;
  });

  afterAll(async () => {
    if (!staff || testAnimalIds.length === 0) {
      return;
    }

    const { error } = await staff.client.from("animals").delete().in("id", testAnimalIds);
    if (error) {
      throw new Error(`Nie udało się usunąć zwierząt testowych: ${error.message}`);
    }
  });

  it("lets an adopter read only their own profile", async () => {
    const { data: ownProfile, error: ownError } = await adopterA.client
      .from("profiles")
      .select("id, role")
      .eq("id", adopterA.id)
      .maybeSingle();
    const { data: otherProfile, error: otherError } = await adopterA.client
      .from("profiles")
      .select("id")
      .eq("id", adopterB.id)
      .maybeSingle();

    expect(ownError).toBeNull();
    expect(ownProfile).toMatchObject({ id: adopterA.id, role: "adopter" });
    expect(otherError).toBeNull();
    expect(otherProfile).toBeNull();
  });

  it("keeps adopter B's profile private from adopter A", async () => {
    const { data: ownProfile, error: ownError } = await adopterB.client
      .from("profiles")
      .select("id, role")
      .eq("id", adopterB.id)
      .maybeSingle();
    const { data: otherProfile, error: otherError } = await adopterB.client
      .from("profiles")
      .select("id")
      .eq("id", adopterA.id)
      .maybeSingle();

    expect(ownError).toBeNull();
    expect(ownProfile).toMatchObject({ id: adopterB.id, role: "adopter" });
    expect(otherError).toBeNull();
    expect(otherProfile).toBeNull();
  });

  it("does not let an adopter promote themselves to staff", async () => {
    const { error } = await adopterA.client
      .from("profiles")
      .update({ role: "staff" })
      .eq("id", adopterA.id);

    const { data: profile, error: readError } = await adopterA.client
      .from("profiles")
      .select("role")
      .eq("id", adopterA.id)
      .single();

    expect(error).not.toBeNull();
    expect(readError).toBeNull();
    expect(profile?.role).toBe("adopter");
  });

  it("lets staff read profiles and identifies their role in the database", async () => {
    const { data: adopterProfile, error: profileError } = await staff.client
      .from("profiles")
      .select("id, role")
      .eq("id", adopterB.id)
      .single();
    const { data: isStaff, error: rpcError } = await staff.client.rpc("is_staff");

    expect(profileError).toBeNull();
    expect(adopterProfile).toMatchObject({ id: adopterB.id, role: "adopter" });
    expect(rpcError).toBeNull();
    expect(isStaff).toBe(true);
  });

  it("does not identify adopters as staff", async () => {
    const { data, error } = await adopterA.client.rpc("is_staff");

    expect(error).toBeNull();
    expect(data).toBe(false);
  });

  it("lets guests read published animals and their photos only", async () => {
    const anonymousClient = createTestClient(required(anonKey, "SUPABASE_RLS_ANON_KEY"));
    const { data: animals, error: animalError } = await anonymousClient
      .from("animals")
      .select("id, publication_status")
      .in("id", [publishedAnimalId, draftAnimalId]);
    const { data: photos, error: photoError } = await anonymousClient
      .from("animal_photos")
      .select("id")
      .in("id", [publishedPhotoId, draftPhotoId]);

    expect(animalError).toBeNull();
    expect(animals?.map((animal) => animal.id)).toEqual([publishedAnimalId]);
    expect(photoError).toBeNull();
    expect(photos?.map((photo) => photo.id)).toEqual([publishedPhotoId]);
  });

  it("lets adopters read published animals but not drafts", async () => {
    const { data: animals, error } = await adopterA.client
      .from("animals")
      .select("id")
      .in("id", [publishedAnimalId, draftAnimalId]);
    const { data: photos, error: photoError } = await adopterA.client
      .from("animal_photos")
      .select("id")
      .in("id", [publishedPhotoId, draftPhotoId]);

    expect(error).toBeNull();
    expect(animals?.map((animal) => animal.id)).toEqual([publishedAnimalId]);
    expect(photoError).toBeNull();
    expect(photos?.map((photo) => photo.id)).toEqual([publishedPhotoId]);
  });

  it("lets staff read and update unpublished animals and photos", async () => {
    const { data: animals, error: animalError } = await staff.client
      .from("animals")
      .select("id")
      .in("id", [publishedAnimalId, draftAnimalId]);
    const { data: photos, error: photoError } = await staff.client
      .from("animal_photos")
      .select("id")
      .in("id", [publishedPhotoId, draftPhotoId]);
    const { data: updatedAnimal, error: animalUpdateError } = await staff.client
      .from("animals")
      .update({ description: "Updated by staff test." })
      .eq("id", draftAnimalId)
      .select("id")
      .single();
    const { data: updatedPhoto, error: photoUpdateError } = await staff.client
      .from("animal_photos")
      .update({ alt_text: "Updated by staff test." })
      .eq("id", draftPhotoId)
      .select("id")
      .single();

    expect(animalError).toBeNull();
    expect(animals?.map((animal) => animal.id)).toEqual(
      expect.arrayContaining([publishedAnimalId, draftAnimalId]),
    );
    expect(photoError).toBeNull();
    expect(photos?.map((photo) => photo.id)).toEqual(
      expect.arrayContaining([publishedPhotoId, draftPhotoId]),
    );
    expect(animalUpdateError).toBeNull();
    expect(updatedAnimal?.id).toBe(draftAnimalId);
    expect(photoUpdateError).toBeNull();
    expect(updatedPhoto?.id).toBe(draftPhotoId);
  });

  it("does not let adopters create animals or animal photos", async () => {
    const { error: animalError } = await adopterA.client.from("animals").insert({
      slug: `rls-forbidden-${randomUUID()}`,
      name: "Forbidden test record",
      species: "dog",
      breed: "Test",
      sex: "unknown",
      size: "small",
      energy_level: 1,
      description: "This insert must be denied.",
    });
    const { error: photoError } = await adopterA.client.from("animal_photos").insert({
      animal_id: publishedAnimalId,
      storage_path: `rls-tests/forbidden-${randomUUID()}.webp`,
      alt_text: "This insert must be denied.",
    });

    expect(animalError).not.toBeNull();
    expect(photoError).not.toBeNull();
  });
});
