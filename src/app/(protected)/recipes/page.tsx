"use client";

import { useUser } from "@/hooks/useUser";
import { getAssetUrl } from "@/lib/assets";
import { useData } from "@/hooks/useData";

import { Recipe } from "@/types/recipes";

import { Link, Page } from "@/components/Init";
import UserHeader from "@/components/UserHeader";
import { Notice } from "@/components/Notice";
import { Photo } from "@/components/Photo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import KcalBoard from "@/components/profile/KcalBoard";
import { Skeleton } from "@/components/ui/skeleton";

import { Clock, Flame } from "lucide-react";

const SECTIONS = [
  {
    title: "Завтраки",
    type: "breakfast",
  },
  {
    title: "Обеды",
    type: "lunch",
  },
  {
    title: "Ужины",
    type: "dinner",
  },
  {
    title: "Перекусы",
    type: "snack",
  },
];

export default function Recipes() {
  const { user } = useUser();
  const isSubscribed = user?.subscriptions?.some(
    (subscription) =>
      subscription.date_expiration &&
      new Date(subscription.date_expiration) > new Date(),
  );
  const { data: recipes = [] } = useData<Recipe[]>({
    token: "user",
    type: "items",
    collection: "recipes",
    key: "recipes",
    query: {
      fields: ["*"],
      filter: { status: { _eq: "published" } },
      sort: { sort: { _asc: true } },
      limit: -1,
    },
  });

  const RecipeItem = ({
    title,
    cover,
    href,
    time,
    kcal,
  }: {
    title: string;
    cover: string;
    href: string;
    time: number;
    kcal: number;
  }) => {
    return (
      <Link href={href}>
        <div className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.1)] h-full">
          <div className="relative aspect-[9/5] rounded-b-2xl overflow-hidden bg-[#EEF2F5] shrink-0">
            <Photo
              src={getAssetUrl(cover)}
              alt={title}
              fit="cover"
              position="center"
              className="w-full h-full"
            />
          </div>
          <div className="px-2 py-3.5 flex-1 flex flex-col">
            <h3 className="text-sm leading-[1.1] font-semibold line-clamp-5 uppercase mb-2 flex-1">
              {title}
            </h3>
            <div className="flex flex-row items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
              >
                <Flame className="size-2.5 text-secondary-foreground" />
                {kcal} Ккал
              </Badge>
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
              >
                <Clock className="size-2.5 text-secondary-foreground" />
                {time} мин
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <Page back={false} className="mx-0">
      <UserHeader classNames={{ wrapper: "mx-4", container: "w-full" }}>
        <h1 className="text-xl font-semibold uppercase leading-[1.1]">
          Питание
        </h1>
      </UserHeader>
      {isSubscribed ? (
        <>
          {user ? (
            <KcalBoard user={user} variant="recipes" className="mx-4 mb-6" />
          ) : (
            <Skeleton className="h-28 rounded-2xl mx-4" />
          )}
          <div className="flex flex-col gap-6 mb-24">
            {recipes.length === 0 ? (
              <Notice
                msg={{
                  variant: "notfound",
                  title: "Нет доступных рецептов",
                  description: (
                    <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                      Пока нет доступных рецептов. Скоро они тут появятся!
                    </p>
                  ),
                }}
              />
            ) : (
              <>
                {SECTIONS.filter((section) =>
                  recipes.some((r) => r.type === section.type),
                ).map((section) => {
                  const sectionRecipes = recipes.filter(
                    (r) => r.type === section.type,
                  );
                  return (
                    <div key={section.type} className="flex flex-col gap-3">
                      <div className="flex flex-row items-center justify-between mx-4">
                        <h2 className="text-lg font-semibold uppercase leading-[1.1]">
                          {section.title}
                        </h2>
                        <p className="text-sm leading-[1.1] font-semibold text-muted-foreground uppercase">
                          Рецептов: {sectionRecipes.length}
                        </p>
                      </div>
                      <Carousel
                        className="w-full"
                        opts={{
                          align: "start",
                          skipSnaps: true,
                        }}
                      >
                        <CarouselContent className="pl-4 pb-1">
                          {sectionRecipes.map((recipe) => (
                            <CarouselItem
                              key={recipe.id}
                              className="pl-4 basis-2/3"
                            >
                              <RecipeItem
                                title={recipe.title}
                                cover={recipe.cover}
                                time={recipe.time}
                                kcal={Math.round(
                                  recipe.kcal * (recipe.portion_weight / 100),
                                )}
                                href={`/recipes/${recipe.id}`}
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
        </>
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
