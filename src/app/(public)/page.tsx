import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Adopciaki</h1>
      <p className="text-muted-foreground max-w-prose text-lg">
        Platforma adopcyjna schroniska dla zwierząt. Strona w budowie.
      </p>
      <Button disabled>Przeglądaj zwierzęta (wkrótce)</Button>
    </main>
  );
}
