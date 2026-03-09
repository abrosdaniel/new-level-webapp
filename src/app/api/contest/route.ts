import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createDirectus,
  rest,
  authentication,
  readMe,
  createItem,
  updateItem,
  readItems,
  isDirectusError,
} from "@directus/sdk";
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
import { getDirectusAdmin } from "@/lib/directus";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;

/** POST: создать или обновить participant. Body: { stage: 1 | 2, fileId: string } */
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

    let userId: string;
    let tokenResult:
      | { token: string }
      | {
          token: string;
          cookies: { access: string; refresh?: string; expires?: number };
        }
      | undefined;

    if (authToken) {
      const payload = await verifyToken(authToken);
      if (!payload) {
        return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
      }
      userId = String(payload.userId);
      tokenResult = undefined;
    } else {
      if (!directusToken && directusRefreshToken?.trim()) {
        const refreshed = await refreshDirectusTokens(directusRefreshToken);
        if (refreshed) {
          directusToken = refreshed.access_token;
          directusRefreshToken =
            refreshed.refresh_token ?? directusRefreshToken;
        }
      }

      if (!directusToken) {
        return NextResponse.json(
          {
            error: "Сессия истекла",
            code: "TOKEN_EXPIRED" as const,
          },
          { status: 401 },
        );
      }

      tokenResult = await getValidDirectusToken(
        directusToken,
        directusRefreshToken ?? "",
      );
      const client = createDirectus(url)
        .with(authentication("json"))
        .with(rest());
      await client.setToken(tokenResult.token);
      const me = await client.request(readMe({ fields: ["id"] }));
      userId = String((me as { id?: string | number })?.id ?? "");
    }

    if (!userId) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const client = authToken
      ? getDirectusAdmin()
      : await (async () => {
          const c = createDirectus(url!)
            .with(authentication("json"))
            .with(rest());
          await c.setToken(tokenResult!.token);
          return c;
        })();

    const body = (await req.json()) as { stage?: number; fileId?: string };
    const { stage, fileId } = body;

    if (stage !== 1 && stage !== 2) {
      return NextResponse.json(
        { error: "Укажите stage: 1 или 2" },
        { status: 400 },
      );
    }
    if (!fileId || typeof fileId !== "string") {
      return NextResponse.json({ error: "Укажите fileId" }, { status: 400 });
    }

    if (stage === 1) {
      const existing1 = await client.request(
        readItems("participants", {
          filter: { user: { _eq: userId } },
          limit: 1,
          fields: ["id"],
        }),
      );
      const list1 = Array.isArray(existing1)
        ? existing1
        : ((existing1 as { data?: unknown[] })?.data ?? []);
      const participant1 = list1[0] as { id?: string } | undefined;
      if (participant1?.id) {
        await client.request(
          updateItem("participants", String(participant1.id), {
            image_before: fileId,
          } as Record<string, unknown>),
        );
      } else {
        await client.request(
          createItem("participants", {
            user: userId,
            image_before: fileId,
          } as Record<string, unknown>),
        );
      }
    } else {
      const existing = await client.request(
        readItems("participants", {
          filter: { user: { _eq: userId } },
          limit: 1,
          fields: ["id"],
        }),
      );
      const list = Array.isArray(existing)
        ? existing
        : ((existing as { data?: unknown[] })?.data ?? []);
      const participant = list[0] as { id?: string } | undefined;
      if (!participant?.id) {
        return NextResponse.json(
          { error: "Сначала загрузите фото для 1 этапа" },
          { status: 400 },
        );
      }
      await client.request(
        updateItem("participants", String(participant.id), {
          image_after: fileId,
        } as Record<string, unknown>),
      );
    }

    const res = NextResponse.json({ success: true });
    if (tokenResult && "cookies" in tokenResult && tokenResult.cookies) {
      const tokensToSet = tokenResult.cookies;
      res.cookies.set(
        "access_token",
        tokensToSet.access,
        getAuthCookieOptions(
          tokensToSet.expires != null
            ? directusExpiresToSeconds(tokensToSet.expires)
            : 900,
        ),
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
    if (isDirectusError(err)) {
      return NextResponse.json(
        {
          error: err.errors?.[0]?.message ?? err.message ?? "Ошибка Directus",
        },
        { status: 400 },
      );
    }
    console.error("Contest API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка сервера" },
      { status: 500 },
    );
  }
}
