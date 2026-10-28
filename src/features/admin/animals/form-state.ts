import type { AnimalFormField } from "./schema";

export type AnimalFormState = {
  errors?: Partial<Record<AnimalFormField, string[] | undefined>>;
  message?: string;
};

export const initialAnimalFormState: AnimalFormState = {};

export type AnimalFormAction = (
  previousState: AnimalFormState,
  formData: FormData,
) => Promise<AnimalFormState>;
