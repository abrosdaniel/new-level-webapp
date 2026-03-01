import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Безопасный redirect — только внутренние пути (защита от open redirect). */
export function getSafeRedirect(redirect: string | null): string {
  if (!redirect || typeof redirect !== "string") return "/";
  const s = redirect.trim();
  if (!s.startsWith("/") || s.startsWith("//")) return "/";
  return s;
}
