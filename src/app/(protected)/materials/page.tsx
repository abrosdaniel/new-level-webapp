"use client";

import { useUser } from "@/hooks/useUser";
import { getAssetUrl } from "@/lib/assets";
import { useData } from "@/hooks/useData";

import { Link, Page } from "@/components/Init";
import UserHeader from "@/components/UserHeader";
import { Notice } from "@/components/Notice";
import { Photo } from "@/components/Photo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

import { ArrowRight } from "lucide-react";

interface Material {
  id: string;
  type: "ios" | "android" | "other";
  title: string;
  url: string;
  cover: string;
  sort: number;
  status: "published" | "unpublished";
}

const SECTIONS = [
  {
    title: "Приложения IOS",
    type: "ios",
  },
  {
    title: "Приложения Android",
    type: "android",
  },
  {
    title: "Дополнительно",
    type: "other",
  },
];

export default function Materials() {
  const { user } = useUser();
  const isSubscribed = user?.subscriptions?.some(
    (subscription) =>
      subscription.date_expiration &&
      new Date(subscription.date_expiration) > new Date(),
  );
  const { data: materials = [] } = useData<Material[]>({
    token: "user",
    type: "items",
    collection: "materials",
    key: "tools",
    query: {
      fields: ["*"],
      filter: { status: { _eq: "published" } },
      sort: { sort: { _asc: true } },
    },
  });

  const ToolItem = ({
    title,
    cover,
    href,
  }: {
    title: string;
    cover: string;
    href: string;
  }) => {
    return (
      <Link href={href}>
        <div className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.1)]">
          <div className="relative aspect-[9/5] rounded-b-2xl overflow-hidden bg-[#EEF2F5]">
            <Photo
              src={getAssetUrl(cover)}
              alt={title}
              fit="cover"
              position="center"
              className="absolute bottom-3 left-3 size-16 rounded-full"
            />
            <Button
              size="icon"
              className="absolute bottom-2.5 right-2.5 rounded-full size-8 bg-white hover:bg-gray-100"
            >
              <ArrowRight className="!size-4 -rotate-45 text-secondary-foreground" />
            </Button>
          </div>
          <div className="px-2 py-3.5">
            <h3 className="text-base leading-[1.15] font-semibold line-clamp-1 uppercase mb-2">
              {title}
            </h3>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <Page className="mx-0">
      <UserHeader classNames={{ wrapper: "mx-4", container: "w-full" }}>
        <h1 className="text-xl font-semibold uppercase leading-[1.1]">
          Дополнительные материалы
        </h1>
      </UserHeader>
      {isSubscribed ? (
        <div className="flex flex-col gap-6 mb-24">
          {materials.length === 0 ? (
            <Notice
              msg={{
                variant: "notfound",
                title: "Нет доступных материалов",
                description: (
                  <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                    Пока нет доступных материалов. Доступ ко всем материалам
                    откроется
                    <br />
                    <span className="font-semibold text-secondary-foreground uppercase">
                      9 марта
                    </span>
                  </p>
                ),
              }}
            />
          ) : (
            <>
              {SECTIONS.filter((section) =>
                materials.some((m) => m.type === section.type),
              ).map((section) => {
                const sectionMaterials = materials.filter(
                  (m) => m.type === section.type,
                );
                return (
                  <div key={section.type} className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold uppercase leading-[1.1] px-4">
                      {section.title}
                    </h2>
                    <Carousel
                      className="w-full"
                      opts={{
                        align: "start",
                        skipSnaps: true,
                      }}
                    >
                      <CarouselContent className="pl-4 pb-1">
                        {sectionMaterials.map((material) => (
                          <CarouselItem
                            key={material.id}
                            className="pl-4 basis-2/3"
                          >
                            <ToolItem
                              title={material.title}
                              cover={material.cover}
                              href={material.url}
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                );
              })}
            </>
          )}
        </div>
      ) : (
        <Notice
          msg={{
            variant: "notaccess",
            title: "Доступ закрыт",
            description:
              "Для просмотра материалов необходимо иметь активную подписку.",
          }}
        />
      )}
    </Page>
  );
}
