import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-card border-border rounded-3xl border p-6 shadow-sm sm:p-8">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
      </header>
      {children}
    </section>
  );
}
