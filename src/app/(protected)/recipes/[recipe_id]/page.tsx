"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/hooks/useData";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/assets";
import { getCalcRecipe } from "@/utils/calculate";

import type { Recipe } from "@/types/recipes";

import { Page } from "@/components/Init";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { WYSIWYG } from "@/components/WYSIWYG";
import { Notice } from "@/components/Notice";
import { Photo } from "@/components/Photo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Flame } from "@/assets/icons/App";
import { Clock } from "lucide-react";

const TYPES = [
  {
    title: "Завтрак",
    value: "breakfast",
  },
  {
    title: "Обед",
    value: "lunch",
  },
  {
    title: "Ужин",
    value: "dinner",
  },
  {
    title: "Перекус",
    value: "snack",
  },
];

export default function RecipePage({
  params,
}: {
  params: Promise<{ recipe_id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useUser();
  const [portion, setPortion] = useState<"100g" | "1portion">("1portion");

  const {
    data: recipes = [],
    isLoading: isRecipeLoading,
    isError: isRecipeError,
  } = useData<Recipe[]>({
    token: "user",
    type: "items",
    collection: "recipes",
    key: `recipe-${resolvedParams.recipe_id}`,
    query: {
      fields: ["*"],
      filter: {
        status: { _eq: "published" },
        id: { _eq: resolvedParams.recipe_id },
      },
      limit: 1,
    },
  });

  const recipe = recipes[0];

  const portionValue =
    portion === "100g" ? 100 : (recipe?.portion_weight ?? 100);
  const nutrients = useMemo(() => {
    if (!recipe) return null;
    return getCalcRecipe(
      portionValue,
      recipe.kcal,
      recipe.protein,
      recipe.carbs,
      recipe.fat,
    );
  }, [recipe, portionValue]);

  const isSubscribed = user?.subscriptions?.some(
    (subscription) =>
      subscription.date_expiration &&
      new Date(subscription.date_expiration) > new Date(),
  );

  useEffect(() => {
    if (!isSubscribed && !user) return;
    if (!isSubscribed) {
      toast.error("Для просмотра рецепта необходимо иметь подписку");
      router.push("/");
    }
  }, [isSubscribed, user, router]);

  return (
    <Page className="mx-0">
      {isRecipeLoading ? (
        <>
          <Skeleton className="w-full aspect-video rounded-2xl mb-6" />
          <div className="mx-4">
            <div className="w-full flex flex-row items-center justify-between mb-5">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-80 w-full" />
          </div>
        </>
      ) : !recipe || isRecipeError ? (
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка",
            description: "Не удалось загрузить рецепт. Попробуйте позже.",
          }}
        />
      ) : (
        <>
          <div className="relative aspect-[9/5] rounded-xl overflow-hidden mb-6">
            <Photo
              src={getAssetUrl(recipe.cover)}
              alt={recipe.title}
              fit="cover"
              position="center"
              className="w-full h-full"
            />
            <div className="absolute bottom-2.5 right-2.5 p-2 bg-background/50 rounded-full backdrop-blur-sm inline-flex items-center gap-1.5 text-sm leading-[1.15] font-normal text-white">
              <Clock className="size-3 text-secondary-foreground" />
              {recipe.time ?? 0} минут
            </div>
          </div>
          <div className="flex flex-row items-center justify-between mx-4 mb-5">
            <p className="text-sm leading-[1.15] font-medium text-muted-foreground">
              {TYPES.find((t) => t.value === recipe.type)?.title}
            </p>
            <Tabs
              value={portion}
              onValueChange={(v) => setPortion(v as "100g" | "1portion")}
            >
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="1portion"
                  className="rounded-full px-2.5 py-1.5 text-sm leading-[1.15] font-medium text-muted-foreground data-[state=active]:bg-secondary-foreground data-[state=active]:text-white"
                >
                  на 1 порцию
                </TabsTrigger>
                <TabsTrigger
                  value="100g"
                  className="rounded-full px-2.5 py-1.5 text-sm leading-[1.15] font-medium text-muted-foreground data-[state=active]:bg-secondary-foreground data-[state=active]:text-white"
                >
                  на 100 грамм
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mx-4 mb-5 items-stretch">
            <Badge
              variant="outline"
              className="inline-flex h-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
            >
              <span className="text-secondary-foreground leading-[1.15] font-medium">
                Белки
              </span>
              {nutrients?.protein ?? recipe.protein} г.
            </Badge>
            <Badge
              variant="outline"
              className="inline-flex h-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
            >
              <span className="text-secondary-foreground leading-[1.15] font-medium">
                Жиры
              </span>
              {nutrients?.fat ?? recipe.fat} г.
            </Badge>
            <Badge
              variant="outline"
              className="inline-flex h-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
            >
              <span className="text-secondary-foreground leading-[1.15] font-medium">
                Углеводы
              </span>
              {nutrients?.carbs ?? recipe.carbs} г.
            </Badge>
            <Badge
              variant="outline"
              className="inline-flex h-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
            >
              <Flame className="size-4 text-secondary-foreground" />
              {nutrients?.kcal ?? recipe.kcal} Ккал
            </Badge>
          </div>
          <h2 className="text-lg leading-[1.1] font-semibold uppercase mx-4 mb-3">
            {recipe.title}
          </h2>
          <WYSIWYG
            className="text-base leading-[1.15] font-normal text-muted-foreground mx-4 mb-24"
            html={recipe.recipe}
          />
        </>
      )}
    </Page>
  );
}
