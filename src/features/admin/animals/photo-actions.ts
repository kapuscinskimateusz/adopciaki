"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { AnimalPhotoActionState } from "./photo-schema";
import {
  ANIMAL_PHOTO_BUCKET,
  animalPhotoAltTextSchema,
  animalPhotoSchema,
  animalPhotoUploadSchema,
  hasSupportedImageSignature,
  MAX_ANIMAL_PHOTOS,
} from "./photo-schema";

const animalIdSchema = z.uuid();
const photoIdSchema = z.uuid();
const photoReorderSchema = z.object({
  photo_id: z.uuid(),
  direction: z.enum(["up", "down"]),
});

function logPhotoError(
  operation: string,
  error: { code?: string; message: string },
): AnimalPhotoActionState {
  console.error(`Animal photo ${operation} failed`, {
    code: error.code,
    message: error.message,
  });
  return { message: "Nie udało się zapisać zmian zdjęcia. Spróbuj ponownie." };
}

function revalidateAnimalPhotos(animalId: string) {
  revalidatePath("/admin/animals");
  revalidatePath(`/admin/animals/${animalId}/edit`);
  revalidatePath("/");
}

export async function uploadAnimalPhotoAction(
  animalId: string,
  _previousState: AnimalPhotoActionState,
  formData: FormData,
): Promise<AnimalPhotoActionState> {
  await requireStaff(`/admin/animals/${animalId}/edit`);

  const parsedAnimalId = animalIdSchema.safeParse(animalId);
  if (!parsedAnimalId.success) {
    return { message: "Nieprawidłowy identyfikator zwierzęcia." };
  }

  const parsed = animalPhotoUploadSchema.safeParse({
    photo: formData.get("photo"),
    alt_text: formData.get("alt_text"),
  });
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Sprawdź wybrane zdjęcie i tekst alternatywny.",
    };
  }
  if (!(await hasSupportedImageSignature(parsed.data.photo))) {
    return {
      errors: { photo: ["Plik nie zawiera prawidłowego obrazu JPEG, PNG lub WebP."] },
      message: "Wybierz prawidłowy plik ze zdjęciem.",
    };
  }

  const supabase = await createClient();
  const { data: photos, error: photosError } = await supabase
    .from("animal_photos")
    .select("display_order")
    .eq("animal_id", parsedAnimalId.data)
    .order("display_order", { ascending: false });

  if (photosError) {
    return logPhotoError("list before upload", photosError);
  }
  if (photos.length >= MAX_ANIMAL_PHOTOS) {
    return { message: "Zwierzę może mieć maksymalnie 10 zdjęć." };
  }

  const extensionByMimeType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  } as const;
  const file = parsed.data.photo;
  const extension =
    file.type === "image/jpeg"
      ? extensionByMimeType["image/jpeg"]
      : file.type === "image/png"
        ? extensionByMimeType["image/png"]
        : extensionByMimeType["image/webp"];
  const storagePath = `${parsedAnimalId.data}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(ANIMAL_PHOTO_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    return logPhotoError("upload", uploadError);
  }

  const displayOrder =
    photos.length === 0 ? 0 : Math.max(...photos.map((photo) => photo.display_order)) + 1;
  const { error: metadataError } = await supabase.from("animal_photos").insert({
    animal_id: parsedAnimalId.data,
    storage_path: storagePath,
    alt_text: parsed.data.alt_text,
    display_order: displayOrder,
  });

  if (metadataError) {
    const { error: cleanupError } = await supabase.storage
      .from(ANIMAL_PHOTO_BUCKET)
      .remove([storagePath]);
    if (cleanupError) {
      console.error("Animal photo upload cleanup failed", {
        message: cleanupError.message,
        storagePath,
      });
      return {
        message:
          "Nie udało się zapisać zdjęcia ani usunąć wysłanego pliku. Zgłoś ten problem administratorowi.",
      };
    }
    return logPhotoError("metadata creation", metadataError);
  }

  revalidateAnimalPhotos(parsedAnimalId.data);
  return {};
}

export async function updateAnimalPhotoAltAction(
  animalId: string,
  photoId: string,
  _previousState: AnimalPhotoActionState,
  formData: FormData,
): Promise<AnimalPhotoActionState> {
  void _previousState;
  await requireStaff(`/admin/animals/${animalId}/edit`);

  const parsedAnimalId = animalIdSchema.safeParse(animalId);
  const parsedPhotoId = photoIdSchema.safeParse(photoId);
  const parsedAltText = animalPhotoAltTextSchema.safeParse(formData.get("alt_text"));
  if (!parsedAnimalId.success || !parsedPhotoId.success) {
    return { message: "Nieprawidłowy identyfikator zwierzęcia lub zdjęcia." };
  }
  if (!parsedAltText.success) {
    return {
      errors: { alt_text: parsedAltText.error.issues.map((issue) => issue.message) },
      message: "Sprawdź tekst alternatywny.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animal_photos")
    .update({ alt_text: parsedAltText.data })
    .eq("id", parsedPhotoId.data)
    .eq("animal_id", parsedAnimalId.data)
    .select("id")
    .maybeSingle();

  if (error) {
    return logPhotoError("alt text update", error);
  }
  if (!data) {
    return { message: "Nie znaleziono zdjęcia do edycji." };
  }

  revalidateAnimalPhotos(parsedAnimalId.data);
  return { message: "Zapisano tekst alternatywny." };
}

export async function reorderAnimalPhotoAction(
  animalId: string,
  _previousState: AnimalPhotoActionState,
  formData: FormData,
): Promise<AnimalPhotoActionState> {
  await requireStaff(`/admin/animals/${animalId}/edit`);

  const parsedAnimalId = animalIdSchema.safeParse(animalId);
  const parsedForm = photoReorderSchema.safeParse({
    photo_id: formData.get("photo_id"),
    direction: formData.get("direction"),
  });
  if (!parsedAnimalId.success || !parsedForm.success) {
    return { message: "Nieprawidłowe dane zmiany kolejności zdjęć." };
  }

  const supabase = await createClient();
  const { data: photos, error: photosError } = await supabase
    .from("animal_photos")
    .select("id")
    .eq("animal_id", parsedAnimalId.data)
    .order("display_order", { ascending: true });

  if (photosError) {
    return logPhotoError("list before reorder", photosError);
  }

  const photoIds = photos.map((photo) => photo.id);
  const currentIndex = photoIds.indexOf(parsedForm.data.photo_id);
  if (currentIndex === -1) {
    return { message: "Nie znaleziono zdjęcia do przeniesienia." };
  }

  const targetIndex =
    parsedForm.data.direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= photoIds.length) {
    return {};
  }

  [photoIds[currentIndex], photoIds[targetIndex]] = [
    photoIds[targetIndex],
    photoIds[currentIndex],
  ];

  const { error } = await supabase.rpc("reorder_animal_photos", {
    p_animal_id: parsedAnimalId.data,
    p_photo_ids: photoIds,
  });
  if (error) {
    return logPhotoError("reorder", error);
  }

  revalidateAnimalPhotos(parsedAnimalId.data);
  return {};
}

export async function deleteAnimalPhotoAction(
  animalId: string,
  photoId: string,
  _previousState: AnimalPhotoActionState,
  _formData: FormData,
): Promise<AnimalPhotoActionState> {
  void _previousState;
  void _formData;
  await requireStaff(`/admin/animals/${animalId}/edit`);

  const parsedAnimalId = animalIdSchema.safeParse(animalId);
  const parsedPhotoId = photoIdSchema.safeParse(photoId);
  if (!parsedAnimalId.success || !parsedPhotoId.success) {
    return { message: "Nieprawidłowy identyfikator zwierzęcia lub zdjęcia." };
  }

  const supabase = await createClient();
  const { data, error: photoError } = await supabase
    .from("animal_photos")
    .select("id, animal_id, storage_path, alt_text, display_order, created_at")
    .eq("id", parsedPhotoId.data)
    .eq("animal_id", parsedAnimalId.data)
    .maybeSingle();

  if (photoError) {
    return logPhotoError("lookup before deletion", photoError);
  }
  if (!data) {
    return { message: "Nie znaleziono zdjęcia do usunięcia." };
  }

  const parsedPhoto = animalPhotoSchema.safeParse(data);
  if (!parsedPhoto.success) {
    throw new Error(
      `Supabase zwrócił nieprawidłowe dane zdjęcia: ${parsedPhoto.error.message}`,
    );
  }

  const { error: storageError } = await supabase.storage
    .from(ANIMAL_PHOTO_BUCKET)
    .remove([parsedPhoto.data.storage_path]);
  if (storageError) {
    return logPhotoError("storage deletion", storageError);
  }

  const { data: deletedPhoto, error: deleteError } = await supabase
    .from("animal_photos")
    .delete()
    .eq("id", parsedPhotoId.data)
    .eq("animal_id", parsedAnimalId.data)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("Animal photo metadata deletion after storage deletion failed", {
      code: deleteError.code,
      message: deleteError.message,
    });
    return {
      message:
        "Plik został usunięty, ale nie udało się usunąć jego opisu. Ponów operację.",
    };
  }
  if (!deletedPhoto) {
    return {
      message:
        "Plik został usunięty, ale nie udało się usunąć jego opisu. Ponów operację.",
    };
  }

  revalidateAnimalPhotos(parsedAnimalId.data);
  return {};
}
