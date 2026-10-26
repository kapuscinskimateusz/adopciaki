import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/features/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?notice=confirmation-error", request.url),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email_confirmed_at) {
    return NextResponse.redirect(
      new URL("/login?notice=confirmation-error", request.url),
    );
  }

  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  return NextResponse.redirect(new URL(next, request.url));
}
