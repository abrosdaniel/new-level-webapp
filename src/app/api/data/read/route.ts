import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getDirectusAdmin,
  getDirectusPublic,
  getDirectusUser,
} from "@/lib/directus";
import { getValidDirectusToken, refreshDirectusTokens } from "@/lib/directus-auth";
import { verifyToken, getCookieName, getAuthCookieOptions } from "@/lib/auth";
import { isDirectusError } from "@directus/sdk";
import { readItem, readItems, readSingleton } from "@directus/sdk";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

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
  const errMsg = (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message;
  return msg.includes("Token expired") || (errMsg?.includes("Token expired") ?? false);
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
    const directusToken = cookieStore.get("directus_token")?.value;
    const directusRefreshToken = cookieStore.get("directus_refresh_token")?.value;

    if (mode === "user") {
      const hasAuth =
        (authToken && (await verifyToken(authToken))) || directusToken;
      if (!hasAuth) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 },
        );
      }
    }

    let client: Awaited<ReturnType<typeof getDirectusUser>> | ReturnType<typeof getDirectusPublic> | ReturnType<typeof getDirectusAdmin>;
    let tokenResult:
      | { token: string }
      | { token: string; cookies: { access: string; refresh?: string } }
      | undefined;

    if (mode === "public") {
      client = getDirectusPublic();
    } else if (mode === "user" && directusToken) {
      tokenResult = await getValidDirectusToken(
        directusToken,
        directusRefreshToken,
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
        const data = await client.request(readItems(collection as any, query as any));
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
        mode === "user" &&
        directusToken
      ) {
        const refreshed = await refreshDirectusTokens(directusRefreshToken);
        if (refreshed) {
          client = await getDirectusUser(refreshed.access_token);
          data = await executeRead();
          const res =
            params.type === "items"
              ? NextResponse.json(data)
              : NextResponse.json(data);
          const cookieOpts = getAuthCookieOptions(COOKIE_MAX_AGE);
          res.cookies.set("directus_token", refreshed.access_token, cookieOpts);
          if (refreshed.refresh_token) {
            res.cookies.set(
              "directus_refresh_token",
              refreshed.refresh_token,
              cookieOpts,
            );
          }
          return res;
        }
      }
      throw err;
    }

    if (params.type !== "item" && params.type !== "singleton" && params.type !== "items") {
      return NextResponse.json(
        { error: "Invalid type: use 'item', 'items', or 'singleton'" },
        { status: 400 },
      );
    }

    const res =
      params.type === "items"
        ? NextResponse.json(data)
        : NextResponse.json(data);

    if (tokenResult && "cookies" in tokenResult) {
      const cookieOpts = getAuthCookieOptions(COOKIE_MAX_AGE);
      res.cookies.set("directus_token", tokenResult.cookies.access, cookieOpts);
      if (tokenResult.cookies.refresh) {
        res.cookies.set(
          "directus_refresh_token",
          tokenResult.cookies.refresh,
          cookieOpts,
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
