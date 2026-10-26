import { AuthCard } from "@/features/auth/auth-card";
import { UpdatePasswordForm } from "@/features/auth/update-password-form";
import { requireCurrentUser } from "@/lib/supabase/auth";

export default async function UpdatePasswordPage() {
  await requireCurrentUser();

  return (
    <AuthCard
      title="Ustaw nowe hasło"
      description="Wybierz hasło, którego użyjesz przy następnym logowaniu."
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
