"use client";

import { useData } from "@/hooks/useData";

import { Link, Page } from "@/components/Init";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WYSIWYG } from "@/components/WYSIWYG";
import { Button } from "@/components/custom-ui/button";

export default function FAQ() {
  const { data, isLoading } = useData<
    {
      id: string;
      question: string;
      answer: string;
    }[]
  >({
    token: "user",
    type: "items",
    collection: "faq",
    key: "faq",
    query: {
      fields: ["*"],
      filter: { status: { _eq: "published" } },
      sort: { sort: { _asc: true } },
    },
  });

  return (
    <Page>
      <div className="flex flex-col mb-24">
        <h1 className="text-xl font-semibold uppercase leading-[1.1] mb-6">
          Вопросы и ответы
        </h1>
        <Accordion
          type="single"
          collapsible
          className="bg-white rounded-xl px-3 mb-6"
        >
          {data?.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="last:border-b-0"
            >
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <WYSIWYG html={item.answer} className="text-muted-foreground" />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="text-base leading-[1.15] font-normal text-muted-foreground mb-5">
          Не нашли ответа на свой вопрос? Напишите нам в поддержку, и мы
          обязательно вам поможем!
        </p>
        <Link
          href="https://t.me/newlevel_appbot"
          target="_blank"
          className="text-base leading-[1.15] font-normal text-muted-foreground"
        >
          <Button custom="grey" type="button" size="lg">
            Написать в поддержку
          </Button>
        </Link>
      </div>
    </Page>
  );
}
