import { describe, expect, it } from "vitest";
import {
  animalPhotoUploadSchema,
  hasSupportedImageSignature,
  MAX_ANIMAL_PHOTO_SIZE,
} from "./photo-schema";

describe("animal photo validation", () => {
  it("accepts supported image files and normalized alt text", () => {
    const result = animalPhotoUploadSchema.safeParse({
      photo: new File([new Uint8Array([0xff, 0xd8, 0xff])], "animal.jpg", {
        type: "image/jpeg",
      }),
      alt_text: "  Pies siedzi na trawie.  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.alt_text).toBe("Pies siedzi na trawie.");
    }
  });

  it("rejects unsupported, empty, and oversized files", () => {
    const unsupported = animalPhotoUploadSchema.safeParse({
      photo: new File(["svg"], "animal.svg", { type: "image/svg+xml" }),
      alt_text: "Zdjęcie zwierzęcia.",
    });
    const empty = animalPhotoUploadSchema.safeParse({
      photo: new File([], "animal.png", { type: "image/png" }),
      alt_text: "Zdjęcie zwierzęcia.",
    });
    const oversized = animalPhotoUploadSchema.safeParse({
      photo: new File([new Uint8Array(MAX_ANIMAL_PHOTO_SIZE + 1)], "animal.webp", {
        type: "image/webp",
      }),
      alt_text: "Zdjęcie zwierzęcia.",
    });

    expect(unsupported.success).toBe(false);
    expect(empty.success).toBe(false);
    expect(oversized.success).toBe(false);
  });

  it("checks file signatures instead of trusting the declared MIME type", async () => {
    const validPng = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "animal.png",
      { type: "image/png" },
    );
    const mislabeledSvg = new File(["<svg />"], "animal.png", { type: "image/png" });

    await expect(hasSupportedImageSignature(validPng)).resolves.toBe(true);
    await expect(hasSupportedImageSignature(mislabeledSvg)).resolves.toBe(false);
  });
});
