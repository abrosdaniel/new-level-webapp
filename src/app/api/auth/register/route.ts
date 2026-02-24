import { NextResponse } from "next/server";
import {
  createDirectus,
  rest,
  authentication,
  readMe,
  createUser,
  isDirectusError,
} from "@directus/sdk";
import { getDirectusAdmin } from "@/lib/directus";
import { getAuthCookieOptions } from "@/lib/auth";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const webhookUrl = `${process.env.WEBHOOK_URL}/webhook/register`;
const webhookKey = process.env.WEBHOOK_KEY;

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
    };

    const { first_name, last_name, birthday, gender, email, password } = body;

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

    const cookieMaxAge = 60 * 60 * 24 * 30;
    const cookieOpts = getAuthCookieOptions(cookieMaxAge);
    const res = NextResponse.json({ user });
    res.cookies.set("directus_token", token, cookieOpts);
    if (refreshToken) {
      res.cookies.set("directus_refresh_token", refreshToken, cookieOpts);
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
