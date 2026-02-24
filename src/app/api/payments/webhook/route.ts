import { NextResponse } from "next/server";
import { createItem, readItems, readUsers, updateItem } from "@directus/sdk";
import { getDirectusAdmin } from "@/lib/directus";
import { isWebhookAllowed } from "@/lib/yookassa-webhook";

const SUBSCRIPTION_DAYS = 30;

const webhookUrl = `${process.env.WEBHOOK_URL}/webhook/payments`;
const webhookKey = process.env.WEBHOOK_KEY;

type ProductInput = { collection: "courses" | "merch"; id: string };

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export async function POST(req: Request) {
  if (!isWebhookAllowed(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      type?: string;
      event?: string;
      object?: {
        id?: string;
        status?: string;
        metadata?: { userId?: string; products?: string };
      };
    };
    const event = body.event ?? body.type;
    if (event !== "payment.succeeded") {
      return NextResponse.json({ received: true });
    }
    const paymentObj = body.object;
    if (!paymentObj?.id) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const yookassaId = paymentObj.id;
    if (paymentObj.status !== "succeeded") {
      return NextResponse.json({ received: true });
    }
    const metadata = paymentObj.metadata ?? {};
    const userId = metadata.userId;
    const productsRaw = metadata.products;
    if (!userId || !productsRaw) {
      return NextResponse.json({ received: true });
    }
    let products: ProductInput[];
    try {
      products = JSON.parse(
        typeof productsRaw === "string"
          ? productsRaw
          : JSON.stringify(productsRaw),
      ) as ProductInput[];
    } catch {
      return NextResponse.json({ received: true });
    }
    if (!Array.isArray(products)) {
      return NextResponse.json({ received: true });
    }

    const client = getDirectusAdmin();

    const paymentsRes = await client.request(
      readItems("payments", {
        filter: { yookassa_payment_id: { _eq: yookassaId } },
        limit: 1,
        fields: ["id", "status", "user", "amount", "currency"],
      }),
    );
    const paymentsList = Array.isArray(paymentsRes)
      ? paymentsRes
      : ((paymentsRes as { data?: unknown[] })?.data ?? []);
    const payment = paymentsList[0] as {
      id: string;
      status: string;
      user: string;
      amount?: number;
      currency?: string;
    };
    if (!payment) {
      return NextResponse.json({ received: true });
    }
    if (payment.status === "succeeded") {
      return NextResponse.json({ received: true });
    }

    const now = new Date();

    for (const p of products) {
      if (p.collection === "courses") {
        const courseRes = await client.request(
          readItems("courses", {
            filter: { id: { _eq: p.id } },
            limit: 1,
            fields: ["id", "date_start"],
          }),
        );
        const course = Array.isArray(courseRes)
          ? courseRes[0]
          : ((courseRes as { data?: unknown[] })?.data?.[0] as
              | { date_start?: string }
              | undefined);
        if (!course) continue;
        const dateStart = course.date_start ? new Date(course.date_start) : now;

        const subsRes = await client.request(
          readItems("subscriptions", {
            filter: {
              user: { _eq: userId },
              course: { _eq: p.id },
            },
            limit: 1,
            fields: ["id", "date_expiration", "amount", "currency"],
          }),
        );
        const subsList = Array.isArray(subsRes)
          ? subsRes
          : ((subsRes as { data?: unknown[] })?.data ?? []);
        const existing = subsList[0] as
          | { id: string; date_expiration: string | null }
          | undefined;
        const amount = Number(payment?.amount ?? 0);
        const currency = payment?.currency ?? "RUB";

        let newExpiration: Date;
        if (!existing) {
          if (dateStart > now) {
            newExpiration = addDays(dateStart, SUBSCRIPTION_DAYS);
          } else {
            newExpiration = addDays(now, SUBSCRIPTION_DAYS);
          }
          await client.request(
            createItem("subscriptions", {
              user: userId,
              course: p.id,
              date_expiration: toDateString(newExpiration),
              amount,
              currency,
            } as Record<string, unknown>),
          );
        } else {
          const prevExp = existing.date_expiration
            ? new Date(existing.date_expiration)
            : null;
          if (prevExp && prevExp > now) {
            newExpiration = addDays(prevExp, SUBSCRIPTION_DAYS);
          } else {
            newExpiration = addDays(now, SUBSCRIPTION_DAYS);
          }
          await client.request(
            updateItem("subscriptions", existing.id, {
              date_expiration: toDateString(newExpiration),
              amount,
              currency,
            } as Record<string, unknown>),
          );
        }
      }
    }

    await client.request(
      updateItem("payments", payment.id, {
        status: "succeeded",
      } as Record<string, unknown>),
    );

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
      // email не обязателен для webhook
    }

    if (webhookUrl?.startsWith("http") && webhookKey) {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": webhookKey,
        },
        body: JSON.stringify({
          userId,
          email: userEmail,
          paymentId: payment.id,
          yookassaId,
          products,
          amount: payment?.amount,
          currency: payment?.currency,
        }),
      }).catch(console.error);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
