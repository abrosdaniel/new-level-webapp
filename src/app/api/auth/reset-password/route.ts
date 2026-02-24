import { NextResponse } from "next/server";
import {
  createDirectus,
  rest,
  passwordRequest,
  passwordReset,
} from "@directus/sdk";

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

type DirectusResetPayload = {
  scope?: string;
  iss?: string;
  exp?: number;
};

function decodeJwtPayload(token: string): DirectusResetPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    ) as DirectusResetPayload;
    return payload;
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (payload.scope !== "password-reset" || payload.iss !== "directus") {
    return false;
  }
  if (!payload.exp) return false;
  return payload.exp * 1000 > Date.now();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false });
  }
  return NextResponse.json({
    valid: isTokenValid(token),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      token?: string;
      password?: string;
    };

    if (body.token && body.password) {
      const client = createDirectus(url!).with(rest());
      await client.request(passwordReset(body.token, body.password));
      return NextResponse.json({ ok: true });
    }

    const { email } = body;
    if (!url) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_DIRECTUS_URL не настроен на сервере" },
        { status: 500 },
      );
    }
    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL не настроен на сервере" },
        { status: 500 },
      );
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    const client = createDirectus(url).with(rest());
    await client.request(passwordRequest(email, `${appUrl}/reset-password`));
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Reset password error:", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as Error).message)
        : "Ошибка сброса пароля";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
