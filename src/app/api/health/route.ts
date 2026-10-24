import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Sprawdza łączność z Supabase bez ujawniania szczegółów błędów.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ app: "ok", supabase: "not_configured" });
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    return NextResponse.json(
      { app: "ok", supabase: error ? "error" : "ok" },
      { status: error ? 503 : 200 },
    );
  } catch {
    return NextResponse.json({ app: "ok", supabase: "error" }, { status: 503 });
  }
}
