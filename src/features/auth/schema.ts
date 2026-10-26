import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .max(254, { error: "Adres e-mail jest za długi." })
  .pipe(z.email({ error: "Podaj prawidłowy adres e-mail." }));

const passwordSchema = z
  .string()
  .min(8, { error: "Hasło musi mieć co najmniej 8 znaków." })
  .max(128, { error: "Hasło może mieć maksymalnie 128 znaków." });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Podaj hasło." }).max(128),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    error: "Hasła muszą być takie same.",
  });

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    error: "Hasła muszą być takie same.",
  });
