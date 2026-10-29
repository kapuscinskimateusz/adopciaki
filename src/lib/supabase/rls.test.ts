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
const publishedAnimalId = "70000000-0000-4000-8000-000000000001";
const draftAnimalId = "70000000-0000-4000-8000-000000000002";
const publishedPhotoId = "71000000-0000-4000-8000-000000000001";
const draftPhotoId = "71000000-0000-4000-8000-000000000002";
const additionalPublishedPhotoId = "71000000-0000-4000-8000-000000000003";
const overflowPhotoId = "73000000-0000-4000-8000-000000000001";
const storageTestPath = `${draftAnimalId}/rls-storage-test.webp`;
const photoLimitTestIds = Array.from(
  { length: 8 },
  (_, index) => `72000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
);

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

    const { error: animalError } = await staff.client.from("animals").upsert(
      [
        {
          id: publishedAnimalId,
          slug: "rls-published-test",
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
          id: draftAnimalId,
          slug: "rls-draft-test",
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
      ],
      { onConflict: "id" },
    );

    if (animalError) {
      throw new Error(
        `Nie udało się utworzyć zwierząt testowych: ${animalError.message}`,
      );
    }

    const { error: photoError } = await staff.client.from("animal_photos").upsert(
      [
        {
          id: publishedPhotoId,
          animal_id: publishedAnimalId,
          storage_path: `${publishedAnimalId}/${publishedPhotoId}.webp`,
          alt_text: "Test photo for a published animal.",
          display_order: 0,
        },
        {
          id: draftPhotoId,
          animal_id: draftAnimalId,
          storage_path: `${draftAnimalId}/${draftPhotoId}.webp`,
          alt_text: "Test photo for a draft animal.",
          display_order: 0,
        },
        {
          id: additionalPublishedPhotoId,
          animal_id: publishedAnimalId,
          storage_path: `${publishedAnimalId}/${additionalPublishedPhotoId}.webp`,
          alt_text: "Additional test photo for a published animal.",
          display_order: 1,
        },
      ],
      { onConflict: "id" },
    );

    if (photoError) {
      throw new Error(`Nie udało się utworzyć zdjęć testowych: ${photoError.message}`);
    }
  });

  afterAll(async () => {
    if (!staff) {
      return;
    }

    const cleanupErrors: string[] = [];
    const { error: storageError } = await staff.client.storage
      .from("animal-photos")
      .remove([storageTestPath]);
    if (storageError) {
      cleanupErrors.push(`Storage: ${storageError.message}`);
    }

    const { error: photosError } = await staff.client
      .from("animal_photos")
      .delete()
      .in("id", [
        publishedPhotoId,
        draftPhotoId,
        additionalPublishedPhotoId,
        overflowPhotoId,
        ...photoLimitTestIds,
      ]);
    if (photosError) {
      cleanupErrors.push(`Metadane zdjęć: ${photosError.message}`);
    }

    const { error: animalsError } = await staff.client
      .from("animals")
      .update({ publication_status: "archived" })
      .in("id", [publishedAnimalId, draftAnimalId]);
    if (animalsError) {
      cleanupErrors.push(`Zwierzęta testowe: ${animalsError.message}`);
    }
    if (cleanupErrors.length > 0) {
      throw new Error(`Nie udało się posprzątać danych RLS: ${cleanupErrors.join("; ")}`);
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

  it("limits Storage writes to staff and keeps public photo objects downloadable", async () => {
    const imageBytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    const { error: staffUploadError } = await staff.client.storage
      .from("animal-photos")
      .upload(storageTestPath, imageBytes, {
        contentType: "image/webp",
        upsert: true,
      });
    const { error: adopterUploadError } = await adopterA.client.storage
      .from("animal-photos")
      .upload(`${draftAnimalId}/adopter-forbidden.webp`, imageBytes, {
        contentType: "image/webp",
      });
    const anonymousClient = createTestClient(required(anonKey, "SUPABASE_RLS_ANON_KEY"));
    const { error: anonymousUploadError } = await anonymousClient.storage
      .from("animal-photos")
      .upload(`${draftAnimalId}/anonymous-forbidden.webp`, imageBytes, {
        contentType: "image/webp",
      });
    const { error: invalidAnimalUploadError } = await staff.client.storage
      .from("animal-photos")
      .upload(`${randomUUID()}/unrelated.webp`, imageBytes, {
        contentType: "image/webp",
      });
    const { data: staffFiles, error: staffListError } = await staff.client.storage
      .from("animal-photos")
      .list(draftAnimalId);
    const { data: adopterFiles, error: adopterListError } = await adopterA.client.storage
      .from("animal-photos")
      .list(draftAnimalId);
    const { data: anonymousFiles, error: anonymousListError } =
      await anonymousClient.storage.from("animal-photos").list(draftAnimalId);
    const publicUrl = `${
      anonymousClient.storage.from("animal-photos").getPublicUrl(storageTestPath).data
        .publicUrl
    }?verification=${randomUUID()}`;
    const publicResponse = await fetch(publicUrl);
    const publicImageBytes = new Uint8Array(await publicResponse.arrayBuffer());
    const { error: adopterUpdateError } = await adopterA.client.storage
      .from("animal-photos")
      .update(storageTestPath, imageBytes, { contentType: "image/webp" });
    const { error: staffUpdateError } = await staff.client.storage
      .from("animal-photos")
      .update(storageTestPath, imageBytes, { contentType: "image/webp" });
    const { error: adopterDeleteError } = await adopterA.client.storage
      .from("animal-photos")
      .remove([storageTestPath]);
    const { data: filesAfterAdopterDelete } = await staff.client.storage
      .from("animal-photos")
      .list(draftAnimalId);
    const { error: staffDeleteError } = await staff.client.storage
      .from("animal-photos")
      .remove([storageTestPath]);

    expect(staffUploadError).toBeNull();
    expect(adopterUploadError).not.toBeNull();
    expect(anonymousUploadError).not.toBeNull();
    expect(invalidAnimalUploadError).not.toBeNull();
    expect(staffListError).toBeNull();
    expect(staffFiles?.map((file) => file.name)).toContain("rls-storage-test.webp");
    expect(adopterListError).toBeNull();
    expect(adopterFiles?.map((file) => file.name)).not.toContain("rls-storage-test.webp");
    expect(anonymousListError).toBeNull();
    expect(anonymousFiles?.map((file) => file.name)).not.toContain(
      "rls-storage-test.webp",
    );
    expect(adopterUpdateError).not.toBeNull();
    expect(staffUpdateError).toBeNull();
    expect(publicResponse.ok).toBe(true);
    expect(publicImageBytes).toEqual(imageBytes);
    expect(adopterDeleteError).toBeNull();
    expect(filesAfterAdopterDelete?.map((file) => file.name)).toContain(
      "rls-storage-test.webp",
    );
    expect(staffDeleteError).toBeNull();
  });

  it("reorders all animal photos atomically and denies adopters", async () => {
    const { error: reorderError } = await staff.client.rpc("reorder_animal_photos", {
      p_animal_id: publishedAnimalId,
      p_photo_ids: [additionalPublishedPhotoId, publishedPhotoId],
    });
    const { data: reorderedPhotos, error: readError } = await staff.client
      .from("animal_photos")
      .select("id, display_order")
      .eq("animal_id", publishedAnimalId)
      .order("display_order", { ascending: true });
    const { error: adopterReorderError } = await adopterA.client.rpc(
      "reorder_animal_photos",
      {
        p_animal_id: publishedAnimalId,
        p_photo_ids: [publishedPhotoId, additionalPublishedPhotoId],
      },
    );

    expect(reorderError).toBeNull();
    expect(readError).toBeNull();
    expect(reorderedPhotos).toEqual([
      { id: additionalPublishedPhotoId, display_order: 0 },
      { id: publishedPhotoId, display_order: 1 },
    ]);
    expect(adopterReorderError).not.toBeNull();
  });

  it("enforces the ten-photo maximum in the database", async () => {
    const { error: fillError } = await staff.client.from("animal_photos").insert(
      photoLimitTestIds.map((id, index) => ({
        id,
        animal_id: publishedAnimalId,
        storage_path: `${publishedAnimalId}/${id}.webp`,
        alt_text: `Limit test photo ${index + 1}.`,
        display_order: index + 2,
      })),
    );
    const { error: overflowError } = await staff.client.from("animal_photos").insert({
      id: overflowPhotoId,
      animal_id: publishedAnimalId,
      storage_path: `${publishedAnimalId}/${overflowPhotoId}.webp`,
      alt_text: "Overflow test photo.",
      display_order: 10,
    });
    const { count, error: countError } = await staff.client
      .from("animal_photos")
      .select("id", { count: "exact", head: true })
      .eq("animal_id", publishedAnimalId);

    expect(fillError).toBeNull();
    expect(overflowError).not.toBeNull();
    expect(countError).toBeNull();
    expect(count).toBe(10);
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
    const { data: updatedPhoto, error: photoUpdateError } = await adopterA.client
      .from("animal_photos")
      .update({ alt_text: "This update must be denied." })
      .eq("id", publishedPhotoId)
      .select("id")
      .maybeSingle();
    const { data: deletedPhotos, error: photoDeleteError } = await adopterA.client
      .from("animal_photos")
      .delete()
      .eq("id", publishedPhotoId)
      .select("id");
    const { data: unchangedPhoto, error: unchangedPhotoError } = await adopterA.client
      .from("animal_photos")
      .select("id, alt_text")
      .eq("id", publishedPhotoId)
      .single();

    expect(animalError).not.toBeNull();
    expect(photoError).not.toBeNull();
    expect(photoUpdateError).toBeNull();
    expect(updatedPhoto).toBeNull();
    expect(photoDeleteError).toBeNull();
    expect(deletedPhotos).toEqual([]);
    expect(unchangedPhotoError).toBeNull();
    expect(unchangedPhoto?.alt_text).toBe("Test photo for a published animal.");
  });

  it("archives animals and prevents staff from physically deleting them", async () => {
    const { data: archivedAnimal, error: archiveError } = await staff.client
      .from("animals")
      .update({ publication_status: "archived" })
      .eq("id", publishedAnimalId)
      .select("id, publication_status")
      .single();
    const { error: deleteError } = await staff.client
      .from("animals")
      .delete()
      .eq("id", draftAnimalId);
    const { data: preservedAnimal, error: readError } = await staff.client
      .from("animals")
      .select("id, publication_status")
      .eq("id", draftAnimalId)
      .single();

    expect(archiveError).toBeNull();
    expect(archivedAnimal).toMatchObject({
      id: publishedAnimalId,
      publication_status: "archived",
    });
    expect(deleteError).not.toBeNull();
    expect(readError).toBeNull();
    expect(preservedAnimal).toMatchObject({
      id: draftAnimalId,
      publication_status: "draft",
    });
  });
});

describe.skipIf(!testIsConfigured)("favorites row-level security", () => {
  const favoriteAnimalId = "74000000-0000-4000-8000-000000000001";
  const favoriteDraftAnimalId = "74000000-0000-4000-8000-000000000002";
  let adopterA: TestUser;
  let adopterB: TestUser;
  let staff: TestUser;

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

    const { error } = await staff.client.from("animals").upsert(
      [
        {
          id: favoriteAnimalId,
          slug: "rls-favorite-published-test",
          name: "RLS favorite published",
          species: "dog",
          breed: "Test",
          age_months: 24,
          sex: "unknown",
          size: "medium",
          energy_level: 3,
          description: "Test record for favorites RLS.",
          publication_status: "published",
        },
        {
          id: favoriteDraftAnimalId,
          slug: "rls-favorite-draft-test",
          name: "RLS favorite draft",
          species: "cat",
          breed: "Test",
          age_months: 12,
          sex: "unknown",
          size: "small",
          energy_level: 2,
          description: "Test record for favorites RLS.",
          publication_status: "draft",
        },
      ],
      { onConflict: "id" },
    );
    if (error) {
      throw new Error(
        `Nie udało się utworzyć zwierząt testowych dla ulubionych: ${error.message}`,
      );
    }

    // Wpisy z poprzednich przebiegów mogłyby zafałszować wyniki.
    await Promise.all(
      [adopterA, adopterB].map((user) =>
        user.client.from("favorites").delete().eq("user_id", user.id),
      ),
    );
  });

  afterAll(async () => {
    if (!adopterA || !adopterB || !staff) return;

    await Promise.all(
      [adopterA, adopterB].map((user) =>
        user.client.from("favorites").delete().eq("user_id", user.id),
      ),
    );
    await staff.client
      .from("animals")
      .update({ publication_status: "archived" })
      .in("id", [favoriteAnimalId, favoriteDraftAnimalId]);
  });

  it("does not let guests access favorites", async () => {
    const anonymousClient = createTestClient(required(anonKey, "SUPABASE_RLS_ANON_KEY"));
    const { error: selectError } = await anonymousClient
      .from("favorites")
      .select("animal_id")
      .limit(1);
    const { error: insertError } = await anonymousClient
      .from("favorites")
      .insert({ animal_id: favoriteAnimalId });

    expect(selectError).not.toBeNull();
    expect(insertError).not.toBeNull();
  });

  it("lets an adopter favorite a published animal and read only their own favorites", async () => {
    const { error: insertError } = await adopterA.client
      .from("favorites")
      .insert({ animal_id: favoriteAnimalId });
    const { data: ownFavorites, error: ownError } = await adopterA.client
      .from("favorites")
      .select("user_id, animal_id");
    const { data: foreignView, error: foreignError } = await adopterB.client
      .from("favorites")
      .select("user_id, animal_id");
    const { data: staffView, error: staffError } = await staff.client
      .from("favorites")
      .select("user_id")
      .eq("animal_id", favoriteAnimalId);

    expect(insertError).toBeNull();
    expect(ownError).toBeNull();
    expect(ownFavorites).toEqual([{ user_id: adopterA.id, animal_id: favoriteAnimalId }]);
    expect(foreignError).toBeNull();
    expect(foreignView).toEqual([]);
    expect(staffError).toBeNull();
    expect(staffView).toEqual([]);
  });

  it("rejects duplicates, impersonation and unpublished animals", async () => {
    const { error: duplicateError } = await adopterA.client
      .from("favorites")
      .insert({ animal_id: favoriteAnimalId });
    const { error: impersonationError } = await adopterB.client
      .from("favorites")
      .insert({ user_id: adopterA.id, animal_id: favoriteAnimalId });
    const { error: draftError } = await adopterA.client
      .from("favorites")
      .insert({ animal_id: favoriteDraftAnimalId });

    expect(duplicateError).not.toBeNull();
    expect(impersonationError).not.toBeNull();
    expect(draftError).not.toBeNull();
  });

  it("does not allow updating favorites or deleting someone else's", async () => {
    const { error: updateError } = await adopterA.client
      .from("favorites")
      .update({ animal_id: favoriteDraftAnimalId })
      .eq("animal_id", favoriteAnimalId);
    const { data: foreignDeleted, error: foreignDeleteError } = await adopterB.client
      .from("favorites")
      .delete()
      .eq("user_id", adopterA.id)
      .select("animal_id");
    const { data: stillThere } = await adopterA.client
      .from("favorites")
      .select("animal_id");

    expect(updateError).not.toBeNull();
    expect(foreignDeleteError).toBeNull();
    expect(foreignDeleted).toEqual([]);
    expect(stillThere).toEqual([{ animal_id: favoriteAnimalId }]);
  });

  it("lets an adopter remove their own favorite even after the animal is unpublished", async () => {
    const { error: unpublishError } = await staff.client
      .from("animals")
      .update({ publication_status: "draft" })
      .eq("id", favoriteAnimalId);
    const { data: deleted, error: deleteError } = await adopterA.client
      .from("favorites")
      .delete()
      .eq("animal_id", favoriteAnimalId)
      .select("animal_id");

    expect(unpublishError).toBeNull();
    expect(deleteError).toBeNull();
    expect(deleted).toEqual([{ animal_id: favoriteAnimalId }]);
  });
});
