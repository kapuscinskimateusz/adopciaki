import { describe, expect, it, vi } from "vitest";

// Zwykła funkcja zamiast vi.fn(): Vitest raportuje wyjątki rzucone przez vi.fn(),
// nawet gdy kod je obsługuje, a tu właśnie sprawdzamy obsługę błędu.
let createClient: () => Promise<unknown>;
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClient() }));

const { getCatalogStats } = await import("./data");

type CountResult = { count: number | null; error: { message: string } | null };

// Atrapa łańcucha from().select().eq("publication_status") kończonego filtrem statusu adopcji.
function supabaseReturning(waiting: CountResult, adopted: CountResult) {
  const query = {
    select: () => query,
    eq: (column: string) =>
      column === "adoption_status" ? Promise.resolve(adopted) : query,
    neq: () => Promise.resolve(waiting),
  };
  return { from: () => query };
}

describe("getCatalogStats", () => {
  it("counts waiting and adopted animals", async () => {
    createClient = async () =>
      supabaseReturning({ count: 12, error: null }, { count: 3, error: null });

    await expect(getCatalogStats()).resolves.toEqual({ waiting: 12, adopted: 3 });
  });

  it("returns null when Supabase is not configured", async () => {
    createClient = async () => {
      throw new Error("Brak konfiguracji Supabase");
    };

    await expect(getCatalogStats()).resolves.toBeNull();
  });

  it("returns null when a count query fails", async () => {
    createClient = async () =>
      supabaseReturning(
        { count: 12, error: null },
        { count: null, error: { message: "boom" } },
      );

    await expect(getCatalogStats()).resolves.toBeNull();
  });
});
