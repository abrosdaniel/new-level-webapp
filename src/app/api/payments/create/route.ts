import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { createItem, readItem, readUsers, updateItem } from "@directus/sdk";
import { getDirectusAdmin } from "@/lib/directus";
import { createYooKassaPayment } from "@/lib/yookassa";
import { verifyToken, getCookieName } from "@/lib/auth";

type ProductInput = { collection: "courses" | "merch"; id: string };

type CartItem = {
  collection: "courses" | "merch";
  id: string;
  title: string;
  price: number;
  quantity: number;
};

async function getUserId(): Promise<string> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(getCookieName())?.value;
  const directusToken = cookieStore.get("access_token")?.value;

  if (authToken) {
    const payload = await verifyToken(authToken);
    if (payload) return String(payload.userId);
  }
  if (directusToken) {
    const { decodeJwt } = await import("jose");
    const payload = decodeJwt(directusToken) as { sub?: string; id?: string };
    const userId = payload?.sub ?? payload?.id;
    if (userId) return String(userId);
  }
  throw new Error("Not authenticated");
}

function aggregateProducts(
  products: ProductInput[],
): Map<
  string,
  { collection: "courses" | "merch"; id: string; quantity: number }
> {
  const map = new Map<
    string,
    { collection: "courses" | "merch"; id: string; quantity: number }
  >();
  for (const p of products) {
    const key = `${p.collection}:${p.id}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += 1;
    } else {
      map.set(key, { collection: p.collection, id: p.id, quantity: 1 });
    }
  }
  return map;
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const body = (await req.json()) as { products: ProductInput[] };
    const { products } = body;
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "products array required" },
        { status: 400 },
      );
    }

    const client = getDirectusAdmin();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    const currency = "RUB";

    const aggregated = aggregateProducts(products);
    const cartItems: CartItem[] = [];

    for (const [, agg] of aggregated) {
      if (agg.collection === "courses") {
        const course = (await client.request(
          readItem("courses", agg.id, {
            fields: ["id", "title", "subscription_price", "status"],
          }),
        )) as {
          title?: string;
          subscription_price?: number;
          status?: string;
        } | null;
        if (!course) {
          return NextResponse.json(
            { error: `Course ${agg.id} not found` },
            { status: 404 },
          );
        }
        if (course.status === "close") {
          return NextResponse.json(
            { error: "Курс закрыт для новых покупок" },
            { status: 400 },
          );
        }
        const price = Number(course.subscription_price);
        if (price <= 0) {
          return NextResponse.json(
            { error: `Course ${agg.id} has no price` },
            { status: 400 },
          );
        }
        cartItems.push({
          collection: "courses",
          id: agg.id,
          title: course.title ?? "Курс",
          price,
          quantity: agg.quantity,
        });
      } else if (agg.collection === "merch") {
        const merch = (await client.request(
          readItem("merch", agg.id, { fields: ["id", "title", "price"] }),
        )) as { title?: string; price?: number } | null;
        if (!merch) {
          return NextResponse.json(
            { error: `Merch ${agg.id} not found` },
            { status: 404 },
          );
        }
        const price = Number(merch.price ?? 0);
        if (price <= 0) {
          return NextResponse.json(
            { error: `Merch ${agg.id} has no price` },
            { status: 400 },
          );
        }
        cartItems.push({
          collection: "merch",
          id: agg.id,
          title: merch.title ?? "Товар",
          price,
          quantity: agg.quantity,
        });
      } else {
        return NextResponse.json(
          { error: `Invalid collection: ${agg.collection}` },
          { status: 400 },
        );
      }
    }

    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const receiptItems = cartItems.map((item) => ({
      description: `${item.title} - ${item.quantity}`,
      quantity: item.quantity,
      amount: {
        value: (item.price * item.quantity).toFixed(2),
        currency,
      },
      vat_code: 1,
      payment_mode: "full_prepayment",
      payment_subject: "commodity",
    }));

    let userEmail: string | undefined;
    try {
      const usersRes = await client.request(
        readUsers({
          filter: { id: { _eq: userId } },
          limit: 1,
          fields: ["email"],
        }),
      );
      const usersList = Array.isArray(usersRes)
        ? usersRes
        : ((usersRes as { data?: unknown[] })?.data ?? []);
      const u = usersList[0] as { email?: string } | undefined;
      userEmail = u?.email;
    } catch {
      // email не обязателен для receipt
    }

    const placeholderId = `pending-${randomUUID()}`;
    const directusPayment = (await client.request(
      createItem("payments", {
        yookassa_payment_id: placeholderId,
        user: userId,
        products: products.map((p) => ({
          collection: p.collection,
          item: p.id,
        })),
        amount: total,
        currency,
        status: "pending",
      } as Record<string, unknown>),
    )) as { id: string };

    const idempotenceKey = randomUUID();
    const returnUrl = `${appUrl}/payment?id=${directusPayment.id}`;
    const description = `Оплата заказа ID: "${directusPayment.id}" для ${userEmail}`;
    const payment = await createYooKassaPayment(
      {
        amount: { value: total.toFixed(2), currency },
        confirmation: { type: "redirect", return_url: returnUrl },
        capture: true,
        description,
        receipt: {
          ...(userEmail && { customer: { email: userEmail } }),
          items: receiptItems,
          internet: "true",
        },
        metadata: {
          userId,
          products: JSON.stringify(products),
        },
      },
      idempotenceKey,
    );

    await client.request(
      updateItem("payments", directusPayment.id, {
        yookassa_payment_id: payment.id,
      } as Record<string, unknown>),
    );

    const confirmationUrl = payment.confirmation?.confirmation_url ?? returnUrl;
    return NextResponse.json({
      confirmation_url: confirmationUrl,
      payment_id: payment.id,
    });
  } catch (err) {
    console.error("Payment create error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
