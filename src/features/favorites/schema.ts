import { z } from "zod";

export const toggleFavoriteSchema = z.object({
  animalId: z.uuid(),
  favorite: z.enum(["true", "false"]).transform((value) => value === "true"),
});
