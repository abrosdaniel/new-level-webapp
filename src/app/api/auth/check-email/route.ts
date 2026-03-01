import { NextResponse } from "next/server";
import { getDirectusAdmin, readUsers } from "@/lib/directus";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email обязателен" },
        { status: 400 },
      );
    }

    const client = getDirectusAdmin();
    const usersResponse = await client.request(
      readUsers({
        filter: { email: { _eq: email.trim().toLowerCase() } },
        limit: 1,
        fields: ["id"],
      }),
    );

    const usersList = Array.isArray(usersResponse)
      ? usersResponse
      : ((usersResponse as { data?: unknown[] })?.data ?? []);
    const exists = usersList.length > 0;

    return NextResponse.json({ exists });
  } catch (err) {
    console.error("Check email error:", err);
    return NextResponse.json(
      { error: "Ошибка проверки email" },
      { status: 500 },
    );
  }
}
