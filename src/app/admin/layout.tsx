import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo />
            <span className="text-muted-foreground hidden border-l pl-4 text-sm sm:inline">
              Panel pracownika
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground hidden rounded-lg px-3 py-2 text-sm sm:inline-flex"
            >
              Strona publiczna
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="outline">
                Wyloguj
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="border-border border-b">
        <nav
          aria-label="Nawigacja panelu pracownika"
          className="mx-auto flex max-w-6xl gap-2 px-5"
        >
          <Link
            href="/admin/animals"
            className="border-primary text-foreground inline-flex min-h-12 items-center border-b-2 px-3 text-sm font-semibold"
          >
            Zwierzęta
          </Link>
        </nav>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
