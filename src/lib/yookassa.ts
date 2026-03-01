import type {
  YooKassaCreatePayload,
  YooKassaPaymentResponse,
} from "@/types/yookassa";

const YOOKASSA_URL = "https://api.yookassa.ru/v3/payments";

export async function createYooKassaPayment(
  payload: YooKassaCreatePayload,
  idempotenceKey: string,
): Promise<YooKassaPaymentResponse> {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    throw new Error("YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY not set");
  }
  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
  const res = await fetch(YOOKASSA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      "Idempotence-Key": idempotenceKey,
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as YooKassaPaymentResponse & {
    type?: string;
    code?: string;
    description?: string;
  };
  if (!res.ok) {
    throw new Error(data.description ?? `YooKassa error: ${res.status}`);
  }
  return data;
}
