export type AppRole = "adopter" | "staff";

export function defaultPathForRole(role: AppRole): string {
  return role === "staff" ? "/admin" : "/account";
}

export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/account",
): string {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  const origin = "http://adopciaki.local";
  const target = new URL(value, origin);

  if (target.origin !== origin) {
    return fallback;
  }

  return `${target.pathname}${target.search}${target.hash}`;
}
