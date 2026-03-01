import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getDirectusAdmin,
  getDirectusPublic,
  getDirectusUser,
} from "@/lib/directus";
import {
  getValidDirectusToken,
  refreshDirectusTokens,
  type DirectusCookies,
} from "@/lib/directus-auth";
import {
  verifyToken,
  getCookieName,
  getAuthCookieOptions,
  directusExpiresToSeconds,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "@/lib/auth";
import { isDirectusError } from "@directus/sdk";
import { readItem, readItems, readSingleton } from "@directus/sdk";

type ReadParams =
  | {
      type: "item";
      collection: string;
      key: string | number;
      query?: Record<string, unknown>;
    }
  | {
      type: "items";
      collection: string;
      query?: Record<string, unknown>;
    }
  | {
      type: "singleton";
      collection: string;
      query?: Record<string, unknown>;
    };

function isTokenExpiredError(err: unknown): boolean {
  if (!isDirectusError(err)) return false;
  const msg = String((err as { message?: string }).message);
  const errMsg = (err as { errors?: Array<{ message?: string }> }).errors?.[0]
    ?.message;
  return (
    msg.includes("Token expired") ||
    (errMsg?.includes("Token expired") ?? false)
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReadParams & {
      token?: "public" | "user" | "admin";
    };
    const { token: tokenMode, ...params } = body;
    const mode = tokenMode ?? "public";
    const cookieStore = await cookies();
    const authToken = cookieStore.get(getCookieName())?.value;
    const directusToken = cookieStore.get("access_token")?.value;
    const directusRefreshToken = cookieStore.get("refresh_token")?.value;

    // access_token может отсутствовать (cookie истёк), пробуем refresh
    let effectiveDirectusToken = directusToken;
    let manualRefreshTokens: DirectusCookies | null = null;
    if (!effectiveDirectusToken && directusRefreshToken?.trim()) {
      const refreshed = await refreshDirectusTokens(directusRefreshToken);
      if (refreshed) {
        manualRefreshTokens = {
          access: refreshed.access_token,
          refresh: refreshed.refresh_token,
          expires: refreshed.expires,
        };
        effectiveDirectusToken = refreshed.access_token;
      }
    }

    if (mode === "user") {
      const hasAuth =
        (authToken && (await verifyToken(authToken))) || effectiveDirectusToken;
      if (!hasAuth) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 },
        );
      }
    }

    let client:
      | Awaited<ReturnType<typeof getDirectusUser>>
      | ReturnType<typeof getDirectusPublic>
      | ReturnType<typeof getDirectusAdmin>;
    let tokenResult:
      | { token: string }
      | { token: string; cookies: DirectusCookies }
      | undefined;

    if (mode === "public") {
      client = getDirectusPublic();
    } else if (mode === "user" && effectiveDirectusToken) {
      tokenResult = await getValidDirectusToken(
        effectiveDirectusToken,
        manualRefreshTokens?.refresh ?? directusRefreshToken,
      );
      client = await getDirectusUser(tokenResult.token);
    } else {
      client = getDirectusAdmin();
    }

    const executeRead = async () => {
      if (params.type === "item") {
        const { collection, key, query } = params;
        return client.request(readItem(collection as any, key, query as any));
      }
      if (params.type === "singleton") {
        const { collection, query } = params;
        return client.request(readSingleton(collection as any, query as any));
      }
      if (params.type === "items") {
        const { collection, query } = params;
        const data = await client.request(
          readItems(collection as any, query as any),
        );
        return Array.isArray(data) ? data : ((data as any)?.data ?? []);
      }
      return null;
    };

    let data: unknown;
    try {
      data = await executeRead();
    } catch (err) {
      if (
        isTokenExpiredError(err) &&
        directusRefreshToken?.trim() &&
        mode === "user"
      ) {
        const refreshed = await refreshDirectusTokens(directusRefreshToken);
        if (refreshed) {
          client = await getDirectusUser(refreshed.access_token);
          data = await executeRead();
          const res =
            params.type === "items"
              ? NextResponse.json(data)
              : NextResponse.json(data);
          const accessMaxAge =
            refreshed.expires != null
              ? directusExpiresToSeconds(refreshed.expires)
              : 900;
          res.cookies.set(
            "access_token",
            refreshed.access_token,
            getAuthCookieOptions(accessMaxAge),
          );
          if (refreshed.refresh_token) {
            res.cookies.set(
              "refresh_token",
              refreshed.refresh_token,
              getAuthCookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE),
            );
          }
          return res;
        }
      }
      throw err;
    }

    if (
      params.type !== "item" &&
      params.type !== "singleton" &&
      params.type !== "items"
    ) {
      return NextResponse.json(
        { error: "Invalid type: use 'item', 'items', or 'singleton'" },
        { status: 400 },
      );
    }

    const res =
      params.type === "items"
        ? NextResponse.json(data)
        : NextResponse.json(data);

    const tokensToSet =
      manualRefreshTokens ??
      (tokenResult && "cookies" in tokenResult ? tokenResult.cookies : undefined);
    if (tokensToSet) {
      const accessMaxAge =
        tokensToSet.expires != null
          ? directusExpiresToSeconds(tokensToSet.expires)
          : 900;
      res.cookies.set(
        "access_token",
        tokensToSet.access,
        getAuthCookieOptions(accessMaxAge),
      );
      if (tokensToSet.refresh) {
        res.cookies.set(
          "refresh_token",
          tokensToSet.refresh,
          getAuthCookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE),
        );
      }
    }

    return res;
  } catch (err) {
    console.error("Data read error:", err);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
