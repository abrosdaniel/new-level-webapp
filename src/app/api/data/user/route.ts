import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createDirectus,
  rest,
  authentication,
  readMe,
  updateMe,
  createItem,
  updateItem,
  deleteItem,
  isDirectusError,
} from "@directus/sdk";
import { getDirectusAdmin, readUsers } from "@/lib/directus";
import {
  getValidDirectusToken,
  refreshDirectusTokens,
} from "@/lib/directus-auth";
import {
  verifyToken,
  getCookieName,
  getAuthCookieOptions,
  directusExpiresToSeconds,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "@/lib/auth";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;

const FIELDS = [
  "*",
  "measurements.*",
  "measurements.images.*",
  "payments.*",
  "payments.products.*",
  "subscriptions.*",
  "subscriptions.course.*",
];

/** Deep-параметры для вложенных коллекций */
const DEEP = {
  measurements: { _sort: ["-date_created" as const] },
  payments: { _sort: ["-date_created" as const] },
  subscriptions: { _sort: ["-date_created" as const] },
};

/** Связи пользователя: ключ в body → коллекция Directus */
const RELATIONS: Record<string, { collection: string; userField: string }> = {
  measurement: { collection: "measurements", userField: "user" },
  payment: { collection: "payments", userField: "user" },
  subscription: { collection: "subscriptions", userField: "user" },
};

async function fetchUserWithDirectusToken(
  accessToken: string,
  refreshToken: string | undefined,
): Promise<
  | { user: unknown }
  | {
      user: unknown;
      tokens: { access: string; refresh?: string; expires?: number };
    }
> {
  const tokenResult = await getValidDirectusToken(accessToken, refreshToken);
  const token = tokenResult.token;
  const tokensToSet =
    "cookies" in tokenResult ? tokenResult.cookies : undefined;

  const client = createDirectus(url!).with(authentication("json")).with(rest());
  await client.setToken(token);

  try {
    const me = await client.request(
      readMe({
        fields: FIELDS,
        deep: DEEP,
      }),
    );
    const user = me as Record<string, unknown>;
    return tokensToSet ? { user, tokens: tokensToSet } : { user };
  } catch (err) {
    const isTokenExpired =
      isDirectusError(err) &&
      (String(err.message).includes("Token expired") ||
        err.errors?.[0]?.message?.includes("Token expired"));

    if (isTokenExpired && refreshToken?.trim()) {
      const refreshed = await refreshDirectusTokens(refreshToken);
      if (refreshed) {
        const userClient = createDirectus(url!)
          .with(authentication("json"))
          .with(rest());
        await userClient.setToken(refreshed.access_token);
        const user = await userClient.request(
          readMe({
            fields: FIELDS,
            deep: DEEP,
          }),
        );
        return {
          user,
          tokens: {
            access: refreshed.access_token,
            refresh: refreshed.refresh_token,
            expires: refreshed.expires,
          },
        };
      }
    }
    throw err;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(getCookieName())?.value;
    const directusToken = cookieStore.get("access_token")?.value;
    const directusRefreshToken = cookieStore.get("refresh_token")?.value;

    if (authToken) {
      const payload = await verifyToken(authToken);
      if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      const client = getDirectusAdmin();
      const usersResponse = await client.request(
        readUsers({
          filter: { id: { _eq: payload.userId } },
          limit: 1,
          fields: FIELDS,
          deep: DEEP,
        }),
      );
      const usersList = Array.isArray(usersResponse)
        ? usersResponse
        : ((usersResponse as any)?.data ?? []);
      const user = usersList[0];
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }
      if (
        payload.telegramId &&
        String(user.telegram_id) !== String(payload.telegramId)
      ) {
        return NextResponse.json(
          { error: "Telegram account unlinked" },
          { status: 401 },
        );
      }
      return NextResponse.json({ user });
    }

    // access_token может отсутствовать (cookie истёк), но refresh_token ещё валиден
    let refreshedTokens: {
      access: string;
      refresh?: string;
      expires?: number;
    } | null = null;
    let effectiveAccess = directusToken;
    if (!effectiveAccess && directusRefreshToken?.trim() && url) {
      const refreshed = await refreshDirectusTokens(directusRefreshToken);
      if (refreshed) {
        refreshedTokens = {
          access: refreshed.access_token,
          refresh: refreshed.refresh_token,
          expires: refreshed.expires,
        };
        effectiveAccess = refreshed.access_token;
      }
    }

    if (effectiveAccess && url) {
      const result = await fetchUserWithDirectusToken(
        effectiveAccess,
        refreshedTokens?.refresh ?? directusRefreshToken,
      );

      const res = NextResponse.json({ user: result.user });
      const tokensToSet =
        refreshedTokens ?? ("tokens" in result ? result.tokens : undefined);
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
    }

    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  } catch (err) {
    console.error("Error fetching user:", err);
    const res = NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
    // Очищаем невалидные cookies при ошибке — чтобы клиент корректно редиректил на логин
    const cookieOpts = getAuthCookieOptions(0);
    res.cookies.set("access_token", "", cookieOpts);
    res.cookies.set("refresh_token", "", cookieOpts);
    return res;
  }
}

export async function POST(req: Request) {
  if (!url) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(getCookieName())?.value;
    let directusToken = cookieStore.get("access_token")?.value;
    let directusRefreshToken = cookieStore.get("refresh_token")?.value;

    const body = (await req.json()) as Record<string, unknown>;
    const userBody: Record<string, unknown> = {};
    const relationOps: Array<{
      key: string;
      data: Record<string, unknown>;
      deleteId?: string | number;
    }> = [];

    for (const [k, v] of Object.entries(body)) {
      if (k.endsWith("_delete") && k.length > 7) {
        const relKey = k.slice(0, -7);
        if (RELATIONS[relKey] && v != null) {
          relationOps.push({
            key: relKey,
            data: {},
            deleteId: v as string | number,
          });
        }
      } else if (RELATIONS[k] && v && typeof v === "object") {
        relationOps.push({ key: k, data: v as Record<string, unknown> });
      } else if (!k.endsWith("_delete")) {
        userBody[k] = v;
      }
    }

    const runRelationOps = async (
      client: { request: (cmd: unknown) => Promise<unknown> },
      userId: string,
    ) => {
      for (const op of relationOps) {
        const rel = RELATIONS[op.key];
        if (!rel) continue;
        const { collection, userField } = rel;
        const payload = { [userField]: userId, ...op.data };
        if (op.deleteId != null) {
          // @ts-expect-error Directus SDK collection from config
          await client.request(deleteItem(collection, String(op.deleteId)));
        } else if (Object.keys(op.data).length > 0) {
          const { id, ...data } = op.data;
          if (id != null) {
            if (Object.keys(data).length > 0) {
              // @ts-expect-error Directus SDK collection from config
              await client.request(updateItem(collection, String(id), data));
            }
          } else {
            // @ts-expect-error Directus SDK collection from config
            await client.request(createItem(collection, payload));
          }
        }
      }
    };

    if (authToken) {
      const payload = await verifyToken(authToken);
      if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      const admin = getDirectusAdmin();
      const userId = String(payload.userId);

      await runRelationOps(
        admin as { request: (cmd: unknown) => Promise<unknown> },
        userId,
      );

      if (Object.keys(userBody).length > 0) {
        await admin.request(updateItem("users", userId, userBody as object));
      }

      const usersResponse = await admin.request(
        readUsers({
          filter: { id: { _eq: payload.userId } },
          limit: 1,
          fields: FIELDS,
          deep: DEEP,
        }),
      );
      const usersList = Array.isArray(usersResponse)
        ? usersResponse
        : ((usersResponse as { data?: unknown[] })?.data ?? []);
      const user = usersList[0];
      return NextResponse.json({ user });
    }

    // access_token может отсутствовать (cookie истёк), пробуем refresh
    let effectiveDirectusToken = directusToken;
    let manualRefreshTokens: {
      access: string;
      refresh?: string;
      expires?: number;
    } | null = null;
    if (!effectiveDirectusToken && directusRefreshToken?.trim() && url) {
      const refreshed = await refreshDirectusTokens(directusRefreshToken);
      if (refreshed) {
        manualRefreshTokens = {
          access: refreshed.access_token,
          refresh: refreshed.refresh_token,
          expires: refreshed.expires,
        };
        effectiveDirectusToken = refreshed.access_token;
        directusRefreshToken = refreshed.refresh_token ?? directusRefreshToken;
      }
    }

    if (effectiveDirectusToken) {
      const tokenResult = await getValidDirectusToken(
        effectiveDirectusToken,
        directusRefreshToken,
      );
      const client = createDirectus(url)
        .with(authentication("json"))
        .with(rest());
      await client.setToken(tokenResult.token);

      const me = await client.request(readMe({ fields: ["id"] }));
      const userId = String((me as { id?: string | number })?.id ?? "");
      if (userId) {
        await runRelationOps(
          client as { request: (cmd: unknown) => Promise<unknown> },
          userId,
        );
      }

      const user =
        Object.keys(userBody).length > 0
          ? await client.request(updateMe(userBody as object))
          : await client.request(readMe({ fields: FIELDS, deep: DEEP }));

      const res = NextResponse.json({ user });
      const tokensToSet =
        manualRefreshTokens ??
        ("cookies" in tokenResult ? tokenResult.cookies : undefined);
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
    }

    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  } catch (err) {
    const errMsg = isDirectusError(err)
      ? (err.errors?.[0]?.message ?? err.message)
      : err instanceof Error
        ? err.message
        : "Update failed";
    console.error("Update error:", err);
    return NextResponse.json({ error: String(errMsg) }, { status: 400 });
  }
}
