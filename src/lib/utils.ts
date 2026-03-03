import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Дата в формате YYYY-MM-DD (локальное время, без сдвига по timezone). */
export function formatBirthday(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Безопасный redirect — только внутренние пути (защита от open redirect). */
export function getSafeRedirect(redirect: string | null): string {
  if (!redirect || typeof redirect !== "string") return "/";
  const s = redirect.trim();
  if (!s.startsWith("/") || s.startsWith("//")) return "/";
  return s;
}
