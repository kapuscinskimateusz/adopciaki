import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "./actions";

export function FavoriteButton({
  animalId,
  animalName,
  isFavorite,
  returnTo,
  className,
}: {
  animalId: string;
  animalName: string;
  isFavorite: boolean;
  returnTo: string;
  className?: string;
}) {
  return (
    <form action={toggleFavoriteAction} className={className}>
      <input type="hidden" name="animalId" value={animalId} />
      <input type="hidden" name="favorite" value={isFavorite ? "false" : "true"} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `Usuń ${animalName} z ulubionych`
            : `Dodaj ${animalName} do ulubionych`
        }
        className="bg-card/90 text-foreground hover:bg-card focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-full shadow-sm backdrop-blur transition focus-visible:ring-2 focus-visible:outline-none"
      >
        <Heart
          className={cn("size-5", isFavorite && "fill-primary text-primary")}
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
