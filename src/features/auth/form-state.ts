export type AuthFormState = {
  errors?: Partial<
    Record<"email" | "password" | "confirmPassword", string[] | undefined>
  >;
  message?: string;
  success?: string;
};

export const initialAuthFormState: AuthFormState = {};
