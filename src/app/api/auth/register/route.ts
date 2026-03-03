import { NextResponse } from "next/server";
import {
  createDirectus,
  rest,
  authentication,
  readMe,
  createUser,
  isDirectusError,
} from "@directus/sdk";
import { validate, parse } from "@tma.js/init-data-node";
import { getDirectusAdmin } from "@/lib/directus";
import {
  createToken,
  getCookieName,
  getAuthCookieOptions,
  directusExpiresToSeconds,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "@/lib/auth";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const webhookUrl = `${process.env.WEBHOOK_URL}/webhook/register`;
const webhookKey = process.env.WEBHOOK_KEY;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      first_name?: string;
      last_name?: string;
      birthday?: string;
      gender?: string;
      email?: string;
      password?: string;
      status?: string;
      role?: string;
      platform?: "web" | "telegram";
      initData?: string;
    };

    const {
      first_name,
      last_name,
      birthday,
      gender,
      email,
      password,
      platform,
      initData,
    } = body;

    let telegramId: string | undefined;
    if (platform === "telegram" && initData && BOT_TOKEN) {
      try {
        validate(initData, BOT_TOKEN, { expiresIn: 3600 });
        const data = parse(initData);
        telegramId = data.user?.id?.toString();
      } catch {
        return NextResponse.json(
          { error: "Невалидные данные Telegram" },
          { status: 400 },
        );
      }
    }

    if (!email || !password || !url) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 },
      );
    }

    const adminClient = getDirectusAdmin();

    const userData: Record<string, unknown> = {
      first_name: first_name ?? "",
      last_name: last_name ?? "",
      email,
      password,
      status: "active",
      role: "b8a98260-14a2-4be2-91b4-ab93dd6a9be0",
      birthday: birthday ?? "",
      gender: gender ?? "",
      ...(telegramId && { telegram_id: telegramId }),
    };

    await adminClient.request(createUser(userData as any));

    const authClient = createDirectus(url)
      .with(authentication("json"))
      .with(rest());

    const authData = await authClient.login(
      { email, password },
      { mode: "json" },
    );
    const token = authData?.access_token;
    const refreshToken = authData?.refresh_token;
    if (!token) {
      return NextResponse.json(
        { error: "Регистрация пройдена, но вход не удался" },
        { status: 500 },
      );
    }

    const user = await authClient.request(readMe());

    if ((user as any)?.status === "blocked") {
      await authClient.logout();
      return NextResponse.json(
        { error: "Аккаунт заблокирован", code: "BLOCKED" },
        { status: 403 },
      );
    }

    const accessMaxAge =
      authData?.expires != null
        ? directusExpiresToSeconds(authData.expires)
        : 900;
    const res = NextResponse.json({ user });
    res.cookies.set("access_token", token, getAuthCookieOptions(accessMaxAge));
    if (refreshToken) {
      res.cookies.set(
        "refresh_token",
        refreshToken,
        getAuthCookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE),
      );
    }
    if (telegramId) {
      const authToken = await createToken({
        userId: (user as any).id,
        telegramId,
      });
      res.cookies.set(
        getCookieName(),
        authToken,
        getAuthCookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE),
      );
    }

    if (webhookUrl?.startsWith("http") && webhookKey) {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": webhookKey,
        },
        body: JSON.stringify(user),
      }).catch(console.error);
    }

    return res;
  } catch (err) {
    const errMsg = isDirectusError(err)
      ? (err.errors?.[0]?.message ?? err.message)
      : err instanceof Error
        ? err.message
        : JSON.stringify(err);
    const errCode = isDirectusError(err)
      ? err.errors?.[0]?.extensions?.code
      : undefined;
    console.error("Register error:", errMsg, err);

    if (errCode === "RECORD_NOT_UNIQUE" || errMsg?.includes("unique")) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 },
      );
    }

    const errorMessage =
      process.env.NODE_ENV === "development" ? errMsg : "Ошибка регистрации";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
