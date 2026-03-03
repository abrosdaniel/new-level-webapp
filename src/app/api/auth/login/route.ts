import { NextResponse } from "next/server";
import {
  getAuthCookieOptions,
  directusExpiresToSeconds,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "@/lib/auth";
import {
  createDirectus,
  rest,
  authentication,
  readMe,
  updateMe,
  isDirectusError,
} from "@directus/sdk";
import { validate, parse } from "@tma.js/init-data-node";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      platform?: "web" | "telegram";
      initData?: string;
    };
    const { email, password, platform, initData } = body;
    if (!url) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_DIRECTUS_URL не настроен на сервере" },
        { status: 500 },
      );
    }
    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password required" },
        { status: 400 },
      );
    }

    const client = createDirectus(url)
      .with(authentication("json"))
      .with(rest());

    const authData = await client.login({ email, password }, { mode: "json" });
    const token = authData?.access_token;
    const refreshToken = authData?.refresh_token;
    if (!token) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const me = await client.request(readMe());
    const user = me as { id?: string; status?: string };

    if (user?.status === "blocked") {
      await client.logout();
      return NextResponse.json(
        { error: "Account blocked", code: "BLOCKED" },
        { status: 403 },
      );
    }

    let telegramId: string | undefined;
    if (platform === "telegram" && initData && BOT_TOKEN && user?.id) {
      try {
        validate(initData, BOT_TOKEN, { expiresIn: 3600 });
        const data = parse(initData);
        telegramId = data.user?.id?.toString();
      } catch (err) {
        // initData invalid — не блокируем вход
      }
    }
    if (telegramId) {
      await client.request(updateMe({ telegram_id: telegramId } as object));
    }

    const res = NextResponse.json({ user });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    const accessMaxAge =
      authData?.expires != null
        ? directusExpiresToSeconds(authData.expires)
        : 900;
    res.cookies.set("access_token", token!, getAuthCookieOptions(accessMaxAge));
    if (refreshToken) {
      res.cookies.set(
        "refresh_token",
        refreshToken,
        getAuthCookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE),
      );
    }
    return res;
  } catch (err) {
    const errMsg = isDirectusError(err)
      ? (err.errors?.[0]?.message ?? err.message)
      : err instanceof Error
        ? err.message
        : JSON.stringify(err);
    const isInvalidCredentials =
      typeof errMsg === "string" &&
      (errMsg.toLowerCase().includes("invalid") ||
        errMsg.toLowerCase().includes("credentials"));
    const errorMessage = isInvalidCredentials
      ? "Неверный email или пароль"
      : process.env.NODE_ENV === "development"
        ? errMsg
        : "Ошибка входа";
    if (process.env.NODE_ENV === "development" && !isInvalidCredentials) {
      console.error("Login error:", errMsg);
    }
    return NextResponse.json(
      {
        error: errorMessage,
        code: isInvalidCredentials ? "INVALID_CREDENTIALS" : undefined,
      },
      { status: 401 },
    );
  }
}
