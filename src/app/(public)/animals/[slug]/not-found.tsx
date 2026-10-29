import Link from "next/link";

export default function AnimalNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        Nie znaleziono zwierzęcia
      </h1>
      <p className="text-muted-foreground mt-3">
        Ten profil nie istnieje albo nie jest już dostępny.
      </p>
      <Link
        href="/animals"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold"
      >
        Wróć do katalogu
      </Link>
    </div>
  );
}
