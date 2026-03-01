"use client";

import { Page, Link } from "@/components/Init";
import { Button } from "@/components/ds/button";

import { ChevronRightIcon } from "lucide-react";

export default function Documents() {
  const Item = ({ title, href }: { title: string; href: string }) => {
    return (
      <Link href={href}>
        <Button
          custom="white"
          size="lg"
          className="items-center justify-between p-3 mb-1 text-left"
        >
          <span className="text-wrap">{title}</span>
          <ChevronRightIcon className="!size-5  text-secondary-foreground" />
        </Button>
      </Link>
    );
  };

  return (
    <Page>
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold uppercase leading-[1.1] mb-6">
          Правовые документы
        </h1>
        <Item
          title="Политика конфиденциальности"
          href="/documents/privacy-policy"
        />
        <Item title="Публичная оферта" href="/documents/public-offer" />
        <Item
          title="Пользовательское соглашение"
          href="/documents/terms-of-service"
        />
        <Item
          title="Согласие на обработку персональных данных"
          href="/documents/personal-data-consent"
        />
      </div>
    </Page>
  );
}
