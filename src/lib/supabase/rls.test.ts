import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

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
});
