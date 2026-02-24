"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate } from "date-fns";
import { Page, Link } from "@/components/Init";
import { Notice } from "@/components/Notice";
import { useData } from "@/hooks/useData";
import type { Payment } from "@/types/user";

const REFRESH_INTERVAL = 5000;
const MESSAGE_INTERVAL_MS = 6000;
const HAPPY_MESSAGES = [
  "Вносим данные в систему...",
  "Ждём подтверждения платежа...",
];

type PaymentWithProducts = Omit<Payment, "products"> & {
  products: Array<{
    collection: string;
    item: {
      title: string;
      brief_description: string;
      subscription_price: number;
    };
  }>;
};

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [messageIndex, setMessageIndex] = useState(0);

  const { data, isLoading, error } = useData<PaymentWithProducts>(
    id
      ? {
          collection: "payments",
          key: id,
          token: "public",
          type: "item",
          query: {
            fields: [
              "*",
              "products.collection",
              "products.item",
              "products.item.*",
            ],
            limit: 1,
          },
        }
      : null,
    {
      refetchInterval: (query) =>
        (query.state.data as PaymentWithProducts | undefined)?.status ===
        "pending"
          ? REFRESH_INTERVAL
          : false,
    },
  );

  const isPending = data?.status === "pending";
  useEffect(() => {
    if (!isPending) return;
    const timer = setInterval(() => {
      setMessageIndex((i) => (i < HAPPY_MESSAGES.length - 1 ? i + 1 : i));
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPending]);

  if (!id) {
    return (
      <Page back={false} menu={false}>
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка",
            description: (
              <>
                <p>
                  Такой платеж не найден. Если вы оплатили, попробуйте
                  обратиться в поддержку.
                </p>
                <Link
                  className="text-secondary-foreground hover:underline"
                  href="https://t.me/newlevel_appbot"
                  target="_blank"
                >
                  Связаться с поддержкой
                </Link>
              </>
            ),
          }}
        />
      </Page>
    );
  }

  if (isLoading) {
    return (
      <Page back={false} menu={false}>
        <Notice
          msg={{
            variant: "loading",
            title: "Загрузка платежа",
            description: "Пожалуйста, подождите пока мы загрузим ваш платёж.",
          }}
        />
      </Page>
    );
  }

  if (error) {
    return (
      <Page back={false} menu={false}>
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка",
            description: (
              <>
                <p>Произошла ошибка при загрузке платежа. Попробуйте позже.</p>
                <br />
                <br />
                <Link
                  className="text-secondary-foreground hover:underline"
                  href="/"
                  target="_self"
                >
                  Вернуться в приложение
                </Link>
              </>
            ),
          }}
        />
      </Page>
    );
  }

  if (!data) {
    return (
      <Page back={false} menu={false}>
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка",
            description: (
              <>
                <p>
                  Такой платеж не найден. Если вы оплатили, сообщите в
                  поддержку.
                </p>
                <br />
                <br />
                <Link
                  className="text-secondary-foreground hover:underline"
                  href="https://t.me/newlevel_appbot"
                  target="_blank"
                >
                  Связаться с поддержкой
                </Link>
              </>
            ),
          }}
        />
      </Page>
    );
  }

  if (data.status === "canceled") {
    return (
      <Page back={false} menu={false}>
        <Notice
          msg={{
            variant: "notfound",
            title: "Оплата отменена",
            description: (
              <>
                <p>
                  Вы отменили платёж. Попробуйте снова, когда будете готовы.
                </p>
                <Link
                  className="text-secondary-foreground hover:underline"
                  href="/"
                  target="_self"
                >
                  Вернуться в приложение
                </Link>
              </>
            ),
          }}
        />
      </Page>
    );
  }

  if (data.status === "pending") {
    return (
      <Page back={false} menu={false}>
        <Notice
          msg={{
            variant: "loading",
            title: "Оплата в обработке",
            description: (
              <>
                <p>Пожалуйста, подождите пока мы обработаем ваш платёж.</p>
                <br />
                <br />
                <p className="text-blue-500 font-medium">
                  {HAPPY_MESSAGES[messageIndex]}
                </p>
              </>
            ),
          }}
        />
      </Page>
    );
  }

  if (data.status === "succeeded") {
    return (
      <Page back={false} menu={false}>
        <Notice
          msg={{
            variant: "star",
            title: "Спасибо за покупку!",
            description: (
              <>
                <div className="flex flex-col border rounded-lg p-4 mb-5">
                  <h3 className="text-lg font-medium mb-5">Электронный чек</h3>
                  <div className="mb-3">
                    <p className="text-start text-sm text-muted-foreground">
                      Продавец: {process.env.NEXT_PUBLIC_SELLER_NAME}
                    </p>
                    <p className="text-start text-sm text-muted-foreground">
                      ИНН: {process.env.NEXT_PUBLIC_SELLER_INN}
                    </p>
                    <p className="text-start text-sm text-muted-foreground">
                      ОГРН: {process.env.NEXT_PUBLIC_SELLER_OGRN}
                    </p>
                    <p className="text-start text-sm text-muted-foreground">
                      Email: {process.env.NEXT_PUBLIC_SELLER_EMAIL}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-start text-sm text-muted-foreground">
                      Дата и время:{" "}
                      {formatDate(
                        new Date(data.date_created),
                        "dd.MM.yyyy HH:mm",
                      )}
                    </p>
                    <p className="text-start text-sm text-muted-foreground">
                      ID платежа в ЮKassa:{" "}
                      <span className="whitespace-nowrap">
                        {data.yookassa_payment_id}
                      </span>
                    </p>
                    <p className="text-start text-sm text-muted-foreground">
                      ID платёжа в приложении:{" "}
                      <span className="whitespace-nowrap">{data.id}</span>
                    </p>
                    <p className="text-start text-sm text-muted-foreground">
                      Сумма:{" "}
                      <span className="whitespace-nowrap">
                        {data.amount} {data.currency}
                      </span>
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-start text-sm text-muted-foreground mb-1">
                      Товары:
                    </p>
                    <ul className="list-disc text-sm text-muted-foreground space-y-1 pl-4">
                      {data.products.map((product, index) => (
                        <li key={index} className="text-start">
                          <span className="font-medium">
                            {product.item?.title}
                          </span>
                          {product.item?.subscription_price != null && (
                            <span className="block whitespace-nowrap">
                              {product.item.subscription_price} {data.currency}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-start text-sm text-muted-foreground">
                    Статус:{" "}
                    {data.status === "succeeded" ? (
                      <span className="text-green-500">Оплачено</span>
                    ) : data.status === "pending" ? (
                      <span className="text-amber-500">В обработке</span>
                    ) : data.status === "canceled" ? (
                      <span className="text-black">Отменён</span>
                    ) : data.status === "failed" ? (
                      <span className="text-red-500">Ошибка</span>
                    ) : null}
                  </p>
                </div>
                <Link
                  className="text-secondary-foreground hover:underline"
                  href="/"
                  target="_self"
                >
                  Вернуться в приложение
                </Link>
              </>
            ),
          }}
        />
      </Page>
    );
  }
}
