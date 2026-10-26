import type { InputHTMLAttributes } from "react";

export function AuthField({
  id,
  label,
  type,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type: "email" | "password";
  autoComplete: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  error?: string[];
}) {
  const errorMessage = error?.[0];

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
      />
      {errorMessage && (
        <p id={`${id}-error`} className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
