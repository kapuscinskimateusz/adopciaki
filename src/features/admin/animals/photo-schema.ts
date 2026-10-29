import { z } from "zod";

export const ANIMAL_PHOTO_BUCKET = "animal-photos";
export const MAX_ANIMAL_PHOTOS = 10;
export const MAX_ANIMAL_PHOTO_SIZE = 5 * 1024 * 1024;
export const ANIMAL_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const animalPhotoFileSchema = z
  .file({ error: "Wybierz plik ze zdjęciem." })
  .min(1, { error: "Wybrane zdjęcie jest puste." })
  .max(MAX_ANIMAL_PHOTO_SIZE, { error: "Zdjęcie może mieć maksymalnie 5 MiB." })
  .mime([...ANIMAL_PHOTO_MIME_TYPES], {
    error: "Dozwolone formaty zdjęć to JPEG, PNG i WebP.",
  });

export const animalPhotoAltTextSchema = z
  .string()
  .trim()
  .min(1, { error: "Dodaj tekst alternatywny zdjęcia." })
  .max(250, { error: "Tekst alternatywny może mieć maksymalnie 250 znaków." });

export const animalPhotoUploadSchema = z.object({
  photo: animalPhotoFileSchema,
  alt_text: animalPhotoAltTextSchema,
});

export const animalPhotoSchema = z.object({
  id: z.uuid(),
  animal_id: z.uuid(),
  storage_path: z.string().min(1),
  alt_text: z.string(),
  display_order: z.number().int().min(0),
  created_at: z.string(),
});

export async function hasSupportedImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (file.type === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return false;
}

export type AnimalPhoto = z.infer<typeof animalPhotoSchema>;
export type AnimalPhotoUpload = z.infer<typeof animalPhotoUploadSchema>;
export type AnimalPhotoFormField = "photo" | "alt_text";
export type AnimalPhotoActionState = {
  errors?: Partial<Record<AnimalPhotoFormField, string[] | undefined>>;
  message?: string;
};

export const initialAnimalPhotoActionState: AnimalPhotoActionState = {};
