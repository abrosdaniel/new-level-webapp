import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);
const COOKIE_NAME = "auth_token";

export interface AuthPayload {
  userId: string | number;
  telegramId?: string;
  exp?: number;
}

const EXPIRY = "7d";

export const REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function directusExpiresToSeconds(expires: number): number {
  return expires >= 86400 ? Math.floor(expires / 1000) : expires;
}

export function getAuthCookieOptions(maxAgeSeconds: number) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "lax" | "none",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
