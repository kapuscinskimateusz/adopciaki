import { describe, expect, it } from "vitest";
import { preferencesFormSchema } from "./schema";

const validForm = {
  preferred_species: ["dog", "cat", "dog"],
  preferred_sizes: [],
  housing: "apartment",
  hours_alone: "4_to_8",
  activity_level: "3",
  children_at_home: "under_6",
  has_dogs: "on",
  has_cats: null,
  experience: "first_time",
};

describe("preferences form validation", () => {
  it("normalizes form values for the database", () => {
    const result = preferencesFormSchema.safeParse(validForm);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        preferred_species: ["dog", "cat"],
        preferred_sizes: [],
        housing: "apartment",
        hours_alone: "4_to_8",
        activity_level: 3,
        children_at_home: "under_6",
        has_dogs: true,
        has_cats: false,
        experience: "first_time",
      });
    }
  });

  it("requires at least one species and valid answers", () => {
    const result = preferencesFormSchema.safeParse({
      ...validForm,
      preferred_species: [],
      preferred_sizes: ["huge"],
      housing: "castle",
      activity_level: "0",
      has_cats: "yes",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        preferred_species: expect.any(Array),
        preferred_sizes: expect.any(Array),
        housing: expect.any(Array),
        activity_level: expect.any(Array),
        has_cats: expect.any(Array),
      });
    }
  });
});
