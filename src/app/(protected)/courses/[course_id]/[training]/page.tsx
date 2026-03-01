"use client";

import { use, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useData } from "@/hooks/useData";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

import type { Course, Training } from "@/types/courses";

const KinescopePlayer = dynamic(
  () => import("@kinescope/react-kinescope-player"),
  { ssr: true },
);

import { Page } from "@/components/Init";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { WYSIWYG } from "@/components/WYSIWYG";
import { Button } from "@/components/ds/button";
import { Notice } from "@/components/Notice";

import { Clock } from "lucide-react";
import { Flame } from "@/assets/icons/App";

export default function TrainingPage({
  params,
}: {
  params: Promise<{ course_id: string; training: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [weekSort, trainingSort] = useMemo(() => {
    const parts = resolvedParams.training.split("-");
    const ws = parseInt(parts[0] ?? "", 10);
    const ts = parseInt(parts[1] ?? "", 10);
    return [isNaN(ws) ? null : ws, isNaN(ts) ? null : ts];
  }, [resolvedParams.training]);

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useData<Course>({
    token: "user",
    type: "item",
    collection: "courses",
    key: String(resolvedParams.course_id),
    query: {
      fields: ["*", "weeks.*", "weeks.trainings.*"],
    },
  });

  const training = useMemo(() => {
    if (!course?.weeks || weekSort == null || trainingSort == null) return null;
    const week = course.weeks.find((w) => w.sort === weekSort);
    return week?.trainings?.find((t) => t.sort === trainingSort) as Training;
  }, [course?.weeks, weekSort, trainingSort]);

  const isSubscribed = useMemo(() => {
    const subs = user?.subscriptions ?? [];
    const now = Date.now();
    return subs.some((s) => {
      if (String(s.course?.id) !== String(resolvedParams.course_id))
        return false;
      if (!s.date_expiration) return true;
      return new Date(s.date_expiration).getTime() >= now;
    });
  }, [user?.subscriptions, resolvedParams.course_id]);

  const videoId = useMemo(() => {
    if (!training?.video) return null;
    const parts = training.video.trim().split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last?.split("?")[0] ?? null;
  }, [training?.video]);

  const isNext = useMemo(() => {
    if (!course?.weeks || weekSort == null || trainingSort == null)
      return false;
    const week = course.weeks.find((w) => w.sort === weekSort);
    return week?.trainings?.find(
      (t) => t.sort === trainingSort + 1,
    ) as Training;
  }, [course?.weeks, weekSort, trainingSort]);

  useEffect(() => {
    if (!isSubscribed && course?.title) {
      toast.error(
        `Для просмотра тренировки необходимо иметь подписку на курс "${course.title}"`,
      );
      router.push("/courses");
    }
  }, [isSubscribed, router, course?.title]);

  return (
    <Page className="mx-0">
      {isCourseLoading ? (
        <>
          <Skeleton className="w-full aspect-video rounded-2xl mb-6" />
          <div className="mx-4">
            <div className="w-full flex flex-row items-center justify-between mb-5">
              <Skeleton className="h-8 w-32" />
              <div className="flex flex-row items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-80 w-full" />
          </div>
        </>
      ) : !course || isCourseError || !training ? (
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка",
            description: "Не удалось загрузить курс. Попробуйте позже.",
          }}
        />
      ) : (
        <>
          {videoId && (
            <div className="w-full relative aspect-video rounded-2xl bg-black overflow-hidden mb-6">
              <KinescopePlayer videoId={videoId} preload="auto" />
            </div>
          )}
          <div className="mx-4 mb-24">
            <div className="flex flex-row items-center justify-between mb-5">
              <p className="text-sm leading-[1.15] font-medium text-muted-foreground">
                Тренировка {training.sort}
              </p>
              <div className="flex flex-row items-center gap-2">
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
                >
                  <Flame className="size-2.5 text-secondary-foreground" />
                  {training.kcal ?? 0} Ккал
                </Badge>
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
                >
                  <Clock className="size-2.5 text-secondary-foreground" />
                  {training.time ?? 0} минут
                </Badge>
              </div>
            </div>
            <h2 className="text-lg leading-[1.1] font-semibold uppercase mb-3">
              {training.brief_description}
            </h2>
            <WYSIWYG
              className="text-base leading-[1.15] font-normal text-muted-foreground mb-6"
              html={training.description}
            />
            {isNext && (
              <Button
                type="button"
                custom="grey"
                size="lg"
                onClick={() =>
                  router.push(
                    `/courses/${resolvedParams.course_id}/${weekSort}-${isNext.sort}`,
                  )
                }
              >
                Следующая тренировка
              </Button>
            )}
          </div>
        </>
      )}
    </Page>
  );
}
