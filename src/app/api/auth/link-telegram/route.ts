import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validate, parse } from "@tma.js/init-data-node";
import { createHmac, createHash } from "crypto";
import { updateMe } from "@directus/sdk";
import { isDirectusError } from "@directus/sdk";
import { getDirectusUser } from "@/lib/directus";
import { getValidDirectusToken, refreshDirectusTokens } from "@/lib/directus-auth";
import { getAuthCookieOptions } from "@/lib/auth";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type LinkBody =
  | { initData: string }
  | {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      auth_date: number;
      hash: string;
    };

function verifyWidgetData(data: {
  id: number;
  auth_date: number;
  hash: string;
  [key: string]: unknown;
}): boolean {
  if (!BOT_TOKEN) return false;
  const { hash, ...rest } = data;
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  const secretKey = createHash("sha256").update(BOT_TOKEN).digest();
  const hmac = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  return hmac === hash;
}

function isTokenExpiredError(err: unknown): boolean {
  if (!isDirectusError(err)) return false;
  const msg = String((err as { message?: string }).message);
  const errMsg = (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message;
  return msg.includes("Token expired") || Boolean(errMsg?.includes("Token expired"));
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const directusToken = cookieStore.get("directus_token")?.value;
    const directusRefreshToken = cookieStore.get("directus_refresh_token")?.value;

    if (!directusToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await req.json()) as LinkBody;

    let telegramId: string;

    if ("initData" in body && body.initData) {
      if (!BOT_TOKEN) {
        return NextResponse.json(
          { error: "Server misconfigured" },
          { status: 500 },
        );
      }
      validate(body.initData, BOT_TOKEN, { expiresIn: 3600 });
      const parsed = parse(body.initData);
      telegramId = parsed.user?.id?.toString() ?? "";
      if (!telegramId) {
        return NextResponse.json(
          { error: "No user in init data" },
          { status: 400 },
        );
      }
    } else if (
      "id" in body &&
      "auth_date" in body &&
      "hash" in body &&
      typeof body.id === "number"
    ) {
      if (!verifyWidgetData(body as Parameters<typeof verifyWidgetData>[0])) {
        return NextResponse.json(
          { error: "Invalid Telegram data" },
          { status: 400 },
        );
      }
      telegramId = String(body.id);
    } else {
      return NextResponse.json(
        { error: "initData or widget data required" },
        { status: 400 },
      );
    }

    const tokenResult = await getValidDirectusToken(
      directusToken,
      directusRefreshToken,
    );
    let client = await getDirectusUser(tokenResult.token);

    try {
      await client.request(updateMe({ telegram_id: telegramId } as object));
    } catch (err) {
      if (
        isTokenExpiredError(err) &&
        directusRefreshToken?.trim()
      ) {
        const refreshed = await refreshDirectusTokens(directusRefreshToken);
        if (refreshed) {
          client = await getDirectusUser(refreshed.access_token);
          await client.request(updateMe({ telegram_id: telegramId } as object));
          const res = NextResponse.json({ success: true, telegram_id: telegramId });
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

    const res = NextResponse.json({ success: true, telegram_id: telegramId });
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
    const msg = (err as { message?: string })?.message ?? "";
    if (
      msg.includes("duplicate") ||
      msg.includes("unique") ||
      msg.includes("already exists")
    ) {
      return NextResponse.json(
        { error: "Этот Telegram уже привязан к другому аккаунту" },
        { status: 409 },
      );
    }
    console.error("Link telegram error:", err);
    return NextResponse.json(
      { error: "Failed to link Telegram" },
      { status: 500 },
    );
  }
}
