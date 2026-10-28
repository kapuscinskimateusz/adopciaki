import { describe, expect, it } from "vitest";
import { animalFormSchema } from "./schema";

const validAnimal = {
  slug: "luna",
  name: "Luna",
  species: "dog",
  breed: "Mieszaniec",
  age_months: "8",
  sex: "female",
  size: "medium",
  energy_level: "4",
  description: "Szukamy dla niej odpowiedzialnego domu.",
  traits: "Aktywna\nLubi spacery",
  publication_status: "draft",
  adoption_status: "available",
};

describe("animal form validation", () => {
  it("normalizes form values for the database", () => {
    const result = animalFormSchema.safeParse(validAnimal);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        slug: "luna",
        age_months: 8,
        energy_level: 4,
        traits: ["Aktywna", "Lubi spacery"],
      });
    }
  });

  it("accepts an unknown age and ignores blank traits", () => {
    const result = animalFormSchema.safeParse({
      ...validAnimal,
      age_months: "",
      traits: "  \nSpokojna\n",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age_months).toBeNull();
      expect(result.data.traits).toEqual(["Spokojna"]);
    }
  });

  it("rejects malformed slugs and out-of-range values", () => {
    const result = animalFormSchema.safeParse({
      ...validAnimal,
      slug: "Luna!",
      age_months: "-1",
      energy_level: "6",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        slug: expect.any(Array),
        age_months: expect.any(Array),
        energy_level: expect.any(Array),
      });
    }
  });
});
