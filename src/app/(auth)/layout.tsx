import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {children}
        <p className="text-muted-foreground mt-6 text-center text-xs">
          Twoje dane są chronione przez bezpieczne logowanie Supabase.
        </p>
      </div>
    </main>
  );
}
