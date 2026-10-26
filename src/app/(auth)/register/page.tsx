import { AuthCard } from "@/features/auth/auth-card";
import { RegisterForm } from "@/features/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Załóż konto"
      description="Utwórz konto, aby w przyszłości zapisywać ulubione zwierzaki i śledzić swoje zgłoszenia."
    >
      <RegisterForm />
    </AuthCard>
  );
}
