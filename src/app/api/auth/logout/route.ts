import { NextResponse } from "next/server";
import { getCookieName, getAuthCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const clearOpts = getAuthCookieOptions(0);

  res.cookies.set(getCookieName(), "", clearOpts);
  res.cookies.set("directus_token", "", clearOpts);
  res.cookies.set("directus_refresh_token", "", clearOpts);

  return res;
}
