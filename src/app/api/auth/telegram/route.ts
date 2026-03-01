import { NextResponse } from "next/server";
import { validate, parse } from "@tma.js/init-data-node";
import { getDirectusAdmin, readUsers } from "@/lib/directus";
import {
  createToken,
  getCookieName,
  getAuthCookieOptions,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from "@/lib/auth";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const { initData } = (await req.json()) as { initData?: string };
    if (!initData || !BOT_TOKEN) {
      return NextResponse.json(
        { error: "initData or TELEGRAM_BOT_TOKEN missing" },
        { status: 400 },
      );
    }

    validate(initData, BOT_TOKEN, { expiresIn: 3600 });
    const data = parse(initData);
    const telegramId = data.user?.id?.toString();
    if (!telegramId) {
      return NextResponse.json(
        { error: "No user in init data" },
        { status: 400 },
      );
    }

    const client = getDirectusAdmin();
    const usersResponse = await client.request(
      readUsers({
        filter: { telegram_id: { _eq: telegramId } },
        limit: 1,
      }),
    );

    const usersList = Array.isArray(usersResponse)
      ? usersResponse
      : ((usersResponse as any)?.data ?? []);
    const user = usersList[0];
    if (!user) {
      return NextResponse.json(
        { error: "User not found in Directus", code: "USER_NOT_FOUND" },
        { status: 401 },
      );
    }

    if (user.status === "blocked") {
      return NextResponse.json(
        { error: "Account blocked", code: "BLOCKED" },
        { status: 403 },
      );
    }

    const token = await createToken({
      userId: user.id,
      telegramId,
    });

    const res = NextResponse.json({ user });
    res.cookies.set(
      getCookieName(),
      token,
      getAuthCookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE),
    );
    return res;
  } catch (err: any) {
    if (err?.name === "SignatureInvalidError" || err?.name === "ExpiredError") {
      return NextResponse.json({ error: "Invalid init data" }, { status: 401 });
    }
    console.error("Auth telegram error:", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
