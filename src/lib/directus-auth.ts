import { decodeJwt } from "jose";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const REFRESH_BEFORE_EXPIRY_SEC = 300;

export async function refreshDirectusTokens(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires?: number;
} | null> {
  if (!url) return null;
  const baseUrl = url.replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "json",
      refresh_token: refreshToken.trim(),
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: {
      access_token?: string;
      refresh_token?: string;
      expires?: number;
    };
    access_token?: string;
    refresh_token?: string;
    expires?: number;
    errors?: Array<{ message?: string }>;
  };
  const data = json?.data ?? json;
  if (data?.access_token && res.ok) {
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires: data.expires ?? json.expires,
    };
  }
  if (!res.ok && process.env.NODE_ENV === "development") {
    console.error(
      "Directus refresh failed:",
      res.status,
      json?.errors?.[0]?.message ?? json,
    );
  }
  return null;
}

export type DirectusCookies = {
  access: string;
  refresh?: string;
  expires?: number;
};

export async function getValidDirectusToken(
  accessToken: string,
  refreshToken: string | undefined,
): Promise<
  | { token: string }
  | { token: string; cookies: DirectusCookies }
> {
  let token = accessToken;
  let cookiesToSet: DirectusCookies | undefined;

  try {
    const payload = decodeJwt(accessToken);
    const exp = payload.exp ?? 0;
    const now = Math.floor(Date.now() / 1000);
    if (exp - now < REFRESH_BEFORE_EXPIRY_SEC && refreshToken?.trim()) {
      const refreshed = await refreshDirectusTokens(refreshToken);
      if (refreshed) {
        token = refreshed.access_token;
        cookiesToSet = {
          access: refreshed.access_token,
          refresh: refreshed.refresh_token,
          expires: refreshed.expires,
        };
      }
    }
  } catch {
    // JWT невалидный
  }

  return cookiesToSet ? { token, cookies: cookiesToSet } : { token };
}
