import { AuthCard } from "@/features/auth/auth-card";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset hasła"
      description="Podaj adres e-mail przypisany do konta. Wyślemy link do ustawienia nowego hasła."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
