"use client";

import { useState } from "react";
import { getCalcCalories } from "@/utils/calculate";
import { cn } from "@/lib/utils";

import type { User } from "@/types/user";

import LifeGoalBoard from "@/components/profile/LifeGoalBoard";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Info } from "lucide-react";
import { Flame, Breakfast, Lunch, Dinner, Snack } from "@/assets/icons/App";

const GOAL_LABELS: Record<User["goal"], string> = {
  weight_loss: "Для сброса веса",
  weight_maintenance: "Для поддержания веса",
  gaining_muscle_mass: "Для набора мышечной массы",
};

export default function KcalBoard({
  user,
  variant = "profile",
  className,
}: {
  user: User;
  variant?: "profile" | "recipes";
  className?: string;
}) {
  const [hoverCardOpen, setHoverCardOpen] = useState(false);
  const kcal = getCalcCalories({
    gender: user.gender,
    birthday: user.birthday,
    weight: user.measurements?.[0]?.weight || 0,
    height: user.measurements?.[0]?.height || 0,
    lifestyle: user.lifestyle,
    goal: user.goal,
  });

  return (
    <div
      className={cn(
        "flex flex-col bg-white p-3 rounded-2xl shadow-sm mb-2.5",
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-base leading-[1.15] font-semibold uppercase">
          Твоя норма калорийности
        </h3>
        {variant === "profile" && (
          <HoverCard open={hoverCardOpen} onOpenChange={setHoverCardOpen}>
            <HoverCardTrigger onClick={() => setHoverCardOpen((o) => !o)}>
              <Info className="!size-4 text-secondary-foreground" />
            </HoverCardTrigger>
            <HoverCardContent
              side="top"
              align="end"
              className="text-sm leading-[1.15] font-normal text-muted-foreground text-center rounded-xl border-none shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            >
              Чтобы рассчитать свою норму калорийности, введи свои актуальные
              параметры в Моих измерениях и выбери свой текущий уровень
              активности. Норма калорийности рассчитается автоматически.
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
      <div className="flex flex-col items-center justify-center bg-[#EEF2F5] py-2.5 rounded-xl">
        <h3 className="inline-flex gap-1 text-base leading-[1.15] font-semibold mb-1">
          <Flame className="size-4 text-secondary-foreground" />
          <span>{kcal.value ?? 0} Ккал</span>
        </h3>
        <p className="text-base leading-[1.15]">{GOAL_LABELS[user.goal]}</p>
      </div>
      {variant === "profile" && <LifeGoalBoard user={user} />}
      {variant === "recipes" && (
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center gap-2.5 text-sm leading-[1.15] font-medium text-secondary-foreground mt-2.5">
            рекомендации по питанию
            <Info className="!size-4" />
          </DialogTrigger>
          <DialogContent
            className="mx-auto w-[calc(100%-2rem)] rounded-2xl"
            classClose="text-secondary-foreground"
          >
            <DialogHeader>
              <DialogTitle className="text-start text-base leading-[1.15] font-semibold uppercase mb-4">
                Рекомендации:
              </DialogTitle>
              <DialogDescription>
                <div className="flex flex-col items-center justify-center bg-[#EEF2F5] py-2.5 rounded-xl mb-1">
                  <h3 className="inline-flex gap-1 text-base leading-[1.15] font-semibold mb-1">
                    <Breakfast className="size-4 text-secondary-foreground" />
                    <span className="text-black">~ 500 Ккал</span>
                  </h3>
                  <p className="text-base leading-[1.15]">Завтрак</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-[#EEF2F5] py-2.5 rounded-xl mb-1">
                  <h3 className="inline-flex gap-1 text-base leading-[1.15] font-semibold mb-1">
                    <Lunch className="size-4 text-secondary-foreground" />
                    <span className="text-black">~ 400 ккал + ~ 200 ккал</span>
                  </h3>
                  <p className="text-base leading-[1.15]">Обед + вкусняшка</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-[#EEF2F5] py-2.5 rounded-xl mb-1">
                  <h3 className="inline-flex gap-1 text-base leading-[1.15] font-semibold mb-1">
                    <Dinner className="size-4 text-secondary-foreground" />
                    <span className="text-black">~ 400 ккал + ~ 200 ккал</span>
                  </h3>
                  <p className="text-base leading-[1.15]">Ужин + вкусняшка</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-[#EEF2F5] py-2.5 rounded-xl mb-4">
                  <h3 className="inline-flex gap-1 text-base leading-[1.15] font-semibold mb-1">
                    <Snack className="size-4 text-secondary-foreground" />
                    <span className="text-black">По желанию</span>
                  </h3>
                  <p className="text-base leading-[1.15]">Перекус</p>
                </div>
                <p className="text-start text-base leading-[1.15] font-normal text-muted-foreground mb-4">
                  В конструкторе — варианты завтраков, обедов, ужинов и
                  перекусов, а также варианты блюд для вегетарианского и
                  безглютенового питания. Выбирай то, что нравится, и составляй
                  вкусное меню без строгих ограничений.
                </p>
                <p className="text-start text-sm leading-[1.15] font-medium text-muted-foreground mb-4">
                  <span className="text-secondary-foreground uppercase">
                    80% рациона{" "}
                  </span>
                  <br />
                  сбалансированное питание
                </p>
                <p className="text-start text-sm leading-[1.15] font-medium text-muted-foreground">
                  <span className="text-secondary-foreground uppercase">
                    20% рациона{" "}
                  </span>
                  <br />
                  любимые вкусности
                </p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
