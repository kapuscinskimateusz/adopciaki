"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  deleteAnimalPhotoAction,
  reorderAnimalPhotoAction,
  updateAnimalPhotoAltAction,
  uploadAnimalPhotoAction,
} from "./photo-actions";
import {
  initialAnimalPhotoActionState,
  MAX_ANIMAL_PHOTOS,
  type AnimalPhoto,
} from "./photo-schema";

type AnimalPhotoWithUrl = AnimalPhoto & { publicUrl: string };

function ActionMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-muted-foreground text-sm" role="status">
      {message}
    </p>
  );
}

function PhotoItem({
  animalId,
  photo,
  index,
  photoCount,
}: {
  animalId: string;
  photo: AnimalPhotoWithUrl;
  index: number;
  photoCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    updateAnimalPhotoAltAction.bind(null, animalId, photo.id),
    initialAnimalPhotoActionState,
  );
  const [orderState, orderFormAction, orderPending] = useActionState(
    reorderAnimalPhotoAction.bind(null, animalId),
    initialAnimalPhotoActionState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAnimalPhotoAction.bind(null, animalId, photo.id),
    initialAnimalPhotoActionState,
  );

  return (
    <li className="border-border grid gap-4 rounded-xl border p-4 sm:grid-cols-[160px_1fr]">
      <Image
        src={photo.publicUrl}
        alt={photo.alt_text}
        width={320}
        height={240}
        unoptimized
        className="bg-muted h-32 w-full rounded-lg object-cover sm:w-40"
      />
      <div className="space-y-3">
        <form action={formAction} className="space-y-2">
          <label htmlFor={`alt-${photo.id}`} className="text-sm font-medium">
            Tekst alternatywny
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={`alt-${photo.id}`}
              name="alt_text"
              required
              maxLength={250}
              defaultValue={photo.alt_text}
              aria-invalid={Boolean(state.errors?.alt_text?.length)}
              className="border-input bg-background focus-visible:ring-ring h-9 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
            />
            <Button type="submit" variant="outline" disabled={pending}>
              {pending ? "Zapisywanie…" : "Zapisz tekst"}
            </Button>
          </div>
          {state.errors?.alt_text?.[0] && (
            <p className="text-destructive text-sm" role="alert">
              {state.errors.alt_text[0]}
            </p>
          )}
          <ActionMessage message={state.message} />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground mr-1 text-sm">
            Kolejność: {index + 1}
          </span>
          <form action={orderFormAction}>
            <input type="hidden" name="photo_id" value={photo.id} />
            <input type="hidden" name="direction" value="up" />
            <Button
              type="submit"
              variant="outline"
              aria-label={`Przenieś zdjęcie ${index + 1} wyżej`}
              disabled={orderPending || index === 0}
            >
              ↑
            </Button>
          </form>
          <form action={orderFormAction}>
            <input type="hidden" name="photo_id" value={photo.id} />
            <input type="hidden" name="direction" value="down" />
            <Button
              type="submit"
              variant="outline"
              aria-label={`Przenieś zdjęcie ${index + 1} niżej`}
              disabled={orderPending || index === photoCount - 1}
            >
              ↓
            </Button>
          </form>
          <form action={deleteFormAction}>
            <Button type="submit" variant="destructive" disabled={deletePending}>
              {deletePending ? "Usuwanie…" : "Usuń zdjęcie"}
            </Button>
          </form>
        </div>
        <ActionMessage message={orderState.message ?? deleteState.message} />
      </div>
    </li>
  );
}

export function AnimalPhotoManager({
  animalId,
  photos,
}: {
  animalId: string;
  photos: AnimalPhotoWithUrl[];
}) {
  const [state, formAction, pending] = useActionState(
    uploadAnimalPhotoAction.bind(null, animalId),
    initialAnimalPhotoActionState,
  );

  return (
    <section
      className="border-border mt-8 space-y-5 border-t pt-8"
      aria-labelledby="photos-heading"
    >
      <div>
        <h2 id="photos-heading" className="font-heading text-2xl font-semibold">
          Zdjęcia
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {photos.length} z {MAX_ANIMAL_PHOTOS}. JPEG, PNG lub WebP, maksymalnie 5 MiB na
          plik. Zdjęcia z publicznego bucketu są dostępne po poznaniu ich adresu.
        </p>
      </div>

      {photos.length > 0 ? (
        <ol className="space-y-3">
          {photos.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              animalId={animalId}
              photo={photo}
              index={index}
              photoCount={photos.length}
            />
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground text-sm">To zwierzę nie ma jeszcze zdjęć.</p>
      )}

      {photos.length < MAX_ANIMAL_PHOTOS && (
        <form action={formAction} className="bg-muted/40 space-y-4 rounded-xl p-4">
          <div className="space-y-2">
            <label htmlFor="photo-file" className="text-sm font-medium">
              Dodaj zdjęcie
            </label>
            <input
              id="photo-file"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              disabled={pending}
              aria-invalid={Boolean(state.errors?.photo?.length)}
              className="border-input bg-background file:bg-muted w-full rounded-md border text-sm file:mr-3 file:border-0 file:px-3 file:py-2"
            />
            {state.errors?.photo?.[0] && (
              <p className="text-destructive text-sm" role="alert">
                {state.errors.photo[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="photo-alt-text" className="text-sm font-medium">
              Tekst alternatywny
            </label>
            <input
              id="photo-alt-text"
              name="alt_text"
              required
              maxLength={250}
              disabled={pending}
              aria-invalid={Boolean(state.errors?.alt_text?.length)}
              className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
              placeholder="Opisz krótko, co widać na zdjęciu"
            />
            {state.errors?.alt_text?.[0] && (
              <p className="text-destructive text-sm" role="alert">
                {state.errors.alt_text[0]}
              </p>
            )}
          </div>
          <ActionMessage message={state.message} />
          <Button type="submit" disabled={pending}>
            {pending ? "Wysyłanie…" : "Dodaj zdjęcie"}
          </Button>
        </form>
      )}
    </section>
  );
}
