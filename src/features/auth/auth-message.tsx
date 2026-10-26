export function AuthMessage({
  message,
  success,
}: {
  message?: string;
  success?: string;
}) {
  if (message) {
    return (
      <p
        className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
        role="alert"
      >
        {message}
      </p>
    );
  }

  if (success) {
    return (
      <p className="bg-secondary rounded-lg px-3 py-2 text-sm" role="status">
        {success}
      </p>
    );
  }

  return null;
}
