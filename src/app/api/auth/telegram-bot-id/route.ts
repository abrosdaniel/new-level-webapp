import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  const botId = token.split(":")[0];
  if (!botId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 500 });
  }
  return NextResponse.json({ bot_id: botId });
}
