import Link from "next/link";
import { createAnimalAction } from "@/features/admin/animals/actions";
import { AnimalForm } from "@/features/admin/animals/animal-form";
import { requireStaff } from "@/lib/supabase/auth";

export default async function NewAnimalPage() {
  await requireStaff("/admin/animals/new");

  return (
    <section>
      <Link
        href="/admin/animals"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Wróć do zwierząt
      </Link>
      <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight">
        Dodaj zwierzę
      </h1>
      <p className="text-muted-foreground mt-2">
        Uzupełnij dane profilu. Po zapisaniu dodasz zdjęcia i ustawisz ich kolejność.
      </p>
      <div className="bg-card border-border mt-8 rounded-2xl border p-5 sm:p-8">
        <AnimalForm action={createAnimalAction} />
      </div>
    </section>
  );
}
