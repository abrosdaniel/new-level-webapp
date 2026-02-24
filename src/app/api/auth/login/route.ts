import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/auth";
import {
  createDirectus,
  rest,
  authentication,
  readMe,
  isDirectusError,
} from "@directus/sdk";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };
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
    const user = me as any;

    if (user?.status === "blocked") {
      await client.logout();
      return NextResponse.json(
        { error: "Account blocked", code: "BLOCKED" },
        { status: 403 },
      );
    }

    const res = NextResponse.json({ user });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    const cookieOpts = getAuthCookieOptions(COOKIE_MAX_AGE);
    res.cookies.set("directus_token", token!, cookieOpts);
    if (refreshToken) {
      res.cookies.set("directus_refresh_token", refreshToken, cookieOpts);
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
    console.error("Login error:", errMsg, err);
    const errorMessage =
      process.env.NODE_ENV === "development" ? errMsg : "Invalid credentials";
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
