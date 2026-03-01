"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { usePlatform } from "@/components/Init";
import { formatDate } from "date-fns";
import { getAssetUrl } from "@/lib/assets";
import { toast } from "sonner";

import type { Course } from "@/types/courses";

import { Photo } from "@/components/Photo";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ds/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WYSIWYG } from "@/components/WYSIWYG";

import { LevelIcon } from "@/assets/icons/Level";
import { DumbbellMini, LockKeyhole } from "@/assets/icons/App";
import { ArrowUpRight, ArrowRightIcon, Info } from "lucide-react";

const levelMap: Record<string, string> = {
  easy: "Легкий",
  medium: "Средний",
  hard: "Сложный",
};

function CourseCard({
  id,
  date_start,
  level,
  cover,
  title,
  brief_description,
  description,
  weeks,
  status,
  subscription_price,
}: Course) {
  const router = useRouter();
  const { user, refetch } = useUser();
  const platform = usePlatform();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPayLoading, setIsPayLoading] = useState(false);

  const trainingLength = useMemo(
    () => (weeks?.flatMap((w) => w.trainings ?? []) ?? []).length,
    [weeks],
  );

  const isStarted = useMemo(() => {
    const dateStart = new Date(date_start);
    const today = new Date();
    dateStart.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dateStart <= today;
  }, [date_start]);

  const isSubscribed = useMemo(() => {
    const subs = user?.subscriptions ?? [];
    const now = Date.now();
    return subs.some((s) => {
      if (String(s.course?.id) !== String(id)) return false;
      if (!s.date_expiration) return true;
      return new Date(s.date_expiration).getTime() >= now;
    });
  }, [user?.subscriptions, id]);

  const canBuy = status !== "close" && !isSubscribed;

  const handleCardClick = useCallback(() => {
    if (!isSubscribed) setDialogOpen(true);
    else if (!isStarted)
      toast.info(
        `Курс "${title}" откроется ${formatDate(date_start, "dd.MM.yyyy")}`,
      );
    else router.push(`/courses/${id}`);
  }, [isSubscribed, isStarted, date_start, id, router, title]);

  const handleBuy = useCallback(async () => {
    setIsPayLoading(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: [{ collection: "courses", id: String(id) }],
        }),
        credentials: "include",
      });
      const data = (await res.json()) as {
        error?: string;
        confirmation_url?: string;
      };
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("not authenticated")) {
          await refetch();
          toast.error("Необходимо авторизоваться");
          if (platform === "web") window.location.href = "/login";
          return;
        }
        throw new Error(data.error ?? "Ошибка оплаты");
      }
      const url = data.confirmation_url;
      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Ошибка при оформлении оплаты",
      );
      setIsPayLoading(false);
    }
  }, [id, platform, refetch]);

  const badges = (
    <div className="flex flex-row items-center gap-2">
      <Badge
        variant="outline"
        className="border-gray-500 rounded-full inline-flex items-center gap-1.5 text-gray-500 text-sm leading-[0.9] font-normal min-h-5"
      >
        <DumbbellMini className="size-4" />
        {trainingLength}
      </Badge>
      <Badge
        variant="outline"
        className="border-gray-500 rounded-full inline-flex items-center gap-1.5 text-gray-500 text-sm leading-[0.9] font-normal min-h-5"
      >
        <LevelIcon
          level={level as "easy" | "medium" | "hard"}
          className="w-4 h-3"
        />
        {levelMap[level]}
      </Badge>
    </div>
  );

  return (
    <>
      <div onClick={handleCardClick} className="cursor-pointer">
        <div className="flex flex-col bg-white rounded-2xl relative shadow-[0_0_10px_rgba(0,0,0,0.1)]">
          <div className="w-full h-full overflow-hidden relative rounded-2xl aspect-[7/3]">
            <Photo
              src={getAssetUrl(cover)}
              alt={title}
              fit="cover"
              position="center"
              className="w-full h-full"
            />
            {!isSubscribed ||
              (!isStarted && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                  <LockKeyhole className="size-8 text-white" />
                </div>
              ))}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 flex flex-row items-center justify-between w-full z-20">
              {status === "close" && !isSubscribed ? (
                <div className="p-2 bg-background/50 rounded-full backdrop-blur-sm text-sm leading-[1.15] font-normal text-white">
                  курс временно недоступен
                </div>
              ) : status !== "close" && !isSubscribed ? (
                <div className="p-2 bg-background/50 rounded-full backdrop-blur-sm inline-flex items-center gap-1.5 text-sm leading-[1.15] font-normal text-white">
                  нет подписки{" "}
                  <Info className="size-4 text-secondary-foreground" />
                </div>
              ) : !isStarted ? (
                <div className="p-2 bg-background/50 rounded-full backdrop-blur-sm text-sm leading-[1.15] font-normal text-white">
                  курс откроется {formatDate(date_start, "dd.MM.yyyy")}
                </div>
              ) : (
                <div />
              )}
              {canBuy ? (
                <div className="p-2.5 bg-background/50 rounded-full backdrop-blur-sm inline-flex items-center gap-1.5 text-sm leading-[1.15] font-normal text-white">
                  Купить{" "}
                  <span className="text-secondary-foreground">
                    {Number(subscription_price)} ₽
                  </span>
                  <ArrowUpRight className="size-4 text-secondary-foreground" />
                </div>
              ) : (
                <div className="p-2.5 bg-background/50 rounded-full backdrop-blur-sm">
                  <ArrowUpRight className="size-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          </div>
          <div className="p-2.5 pb-4 space-y-2 flex flex-col justify-between h-full">
            {badges}
            <div className="space-y-2">
              <h3 className="text-base leading-[1.15] font-semibold line-clamp-1 uppercase">
                {title}
              </h3>
              <p className="text-sm leading-[0.9] text-muted-foreground line-clamp-2">
                {brief_description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="mx-auto w-[calc(100%-2rem)] rounded-2xl">
          <DialogHeader>{badges}</DialogHeader>
          <ScrollArea className="max-h-[420px] rounded-2xl">
            <div className="space-y-2.5">
              <div className="w-full overflow-hidden relative rounded-2xl aspect-[9/3]">
                <Photo
                  src={getAssetUrl(cover)}
                  alt={title}
                  fit="cover"
                  position="center"
                  className="w-full h-full"
                />
              </div>
              <DialogTitle className="text-base leading-[1.15] font-semibold uppercase">
                {title}
              </DialogTitle>
              <WYSIWYG
                html={description}
                className="text-sm leading-[1.15] font-normal text-muted-foreground"
              />
            </div>
          </ScrollArea>
          {canBuy ? (
            <Button
              custom="grey"
              size="lg"
              type="button"
              className="group"
              disabled={isPayLoading}
              onClick={handleBuy}
            >
              {isPayLoading ? (
                "Оформляем оплату…"
              ) : (
                <>
                  Купить{" "}
                  <span className="text-secondary-foreground">
                    {Number(subscription_price)} ₽/мес
                  </span>
                </>
              )}
              <ArrowRightIcon className="!size-5 text-secondary-foreground group-hover:text-[#8D8E90]" />
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Курс закрыт для новых покупок. Доступ возможен при наличии
              активной подписки.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(CourseCard);
