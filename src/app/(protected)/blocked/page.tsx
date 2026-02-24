"use client";

import { Page, Link } from "@/components/Init";
import { Notice } from "@/components/Notice";

export default function BlockedPage() {
  return (
    <Page back={false} menu={false}>
      <Notice
        msg={{
          variant: "blocked",
          title: "Аккаунт заблокирован",
          description: (
            <p>
              Нам очень жаль, но ваш аккаунт был заблокирован. Пожалуйста,
              свяжитесь с поддержкой, если вы считаете, что это ошибка. <br />{" "}
              <br />{" "}
              <Link
                href="https://t.me/newlevel_appbot"
                target="_blank"
                className="text-secondary-foreground hover:underline"
              >
                Связаться с поддержкой
              </Link>
            </p>
          ),
        }}
      />
    </Page>
  );
}
