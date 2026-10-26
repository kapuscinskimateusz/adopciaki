import Link from "next/link";
import { AuthCard } from "@/features/auth/auth-card";
import { AuthMessage } from "@/features/auth/auth-message";
import { LoginForm } from "@/features/auth/login-form";
import { safeRedirectPath } from "@/features/auth/redirect";

const notices: Record<string, string> = {
  confirmed: "Adres e-mail został potwierdzony. Możesz się zalogować.",
  "password-updated": "Hasło zostało zmienione. Zaloguj się nowym hasłem.",
  "confirmation-error": "Link jest nieprawidłowy lub wygasł. Poproś o nowy link.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const { next, notice } = await searchParams;

  return (
    <AuthCard title="Witaj ponownie" description="Zaloguj się na swoje konto adopcyjne.">
      <div className="space-y-5">
        <AuthMessage success={notice ? notices[notice] : undefined} />
        <LoginForm next={safeRedirectPath(next)} />
        <p className="text-center text-sm">
          <Link
            href="/"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Wróć na stronę główną
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
