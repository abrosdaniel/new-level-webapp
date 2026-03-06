"use client";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/hooks/useData";
import { useUser } from "@/hooks/useUser";
import { formatDate } from "date-fns";
import { toast } from "sonner";

import type { Course } from "@/types/courses";

import { Page } from "@/components/Init";
import UserHeader from "@/components/UserHeader";
import { Notice } from "@/components/Notice";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import TrainingCard from "@/components/courses/TrainingCard";
import { LockKeyhole } from "@/assets/icons/App";

export default function CoursePage({
  params,
}: {
  params: Promise<{ course_id: Course["id"] }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

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
      deep: {
        weeks: {
          _filter: { status: { _eq: "open" } },
        },
      },
    },
  });

  const { user } = useUser();

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

  useEffect(() => {
    if (!isSubscribed) {
      router.push("/courses");
      toast.error("Для просмотра курса необходимо иметь подписку.");
    }
  }, [isSubscribed, router]);

  const isWeekOpen = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date <= today;
  };

  if (isCourseError) {
    return (
      <Page>
        <UserHeader classNames={{ wrapper: "mx-4", container: "w-full" }}>
          {isCourseLoading || !course ? (
            <Skeleton className="h-12 w-3/5" />
          ) : (
            <h1 className="text-xl leading-[1.1] font-semibold line-clamp-2 uppercase w-3/5">
              {course?.title}
            </h1>
          )}
        </UserHeader>
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка",
            description: "Не удалось загрузить курс. Попробуйте позже.",
          }}
        />
      </Page>
    );
  }

  return (
    <Page className="mx-0">
      <UserHeader classNames={{ wrapper: "mx-4", container: "w-full" }}>
        {isCourseLoading || !course ? (
          <Skeleton className="h-12 w-3/5" />
        ) : (
          <h1 className="text-xl leading-[1.1] font-semibold line-clamp-2 uppercase w-full">
            {course?.title}
          </h1>
        )}
      </UserHeader>
      {isCourseLoading || !course ? (
        <Skeleton className="h-20 w-full mx-4" />
      ) : (
        <p className="text-base leading-[1.15] font-normal text-muted-foreground mx-4">
          {course.brief_description}
        </p>
      )}
      <div className="relative w-full mb-24">
        {isCourseLoading || !course || !course.weeks ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 w-full mx-4 mt-6" />
          ))
        ) : course.weeks.length === 0 ? (
          <Notice
            msg={{
              variant: "notfound",
              title: "Нет доступных недель",
              description: "Пока нет доступных недель.",
            }}
          />
        ) : (
          course.weeks.map((week) => {
            const weekDate = week.date_start;
            const weekOpen = isWeekOpen(weekDate);

            return (
              <div
                key={week.sort}
                className="sticky top-0 bg-background space-y-4 py-4 rounded-2xl"
              >
                <div className="flex flex-row items-center justify-between mx-4">
                  <h2 className="font-semibold text-lg uppercase">
                    Неделя {week.sort}
                  </h2>
                  {!weekOpen && (
                    <Badge
                      variant="outline"
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
                    >
                      <LockKeyhole className="size-2.5" />
                      доступ откроется {formatDate(weekDate, "dd.MM.yyyy")}
                    </Badge>
                  )}
                </div>

                {week.trainings.length === 0 ? (
                  <Notice
                    msg={{
                      variant: "notfound",
                      title: "Тренировок нет",
                      description: "Пока нет доступных тренировок.",
                    }}
                  />
                ) : (
                  <Carousel
                    className="w-full"
                    opts={{
                      align: "start",
                      skipSnaps: true,
                    }}
                  >
                    <CarouselContent className="pl-4 pb-1">
                      {week.trainings.map((training) => (
                        <CarouselItem
                          key={training.sort}
                          className="pl-4 basis-2/3"
                        >
                          <TrainingCard
                            week_status={weekOpen ? "open" : "close"}
                            course_url={course.id}
                            week_url={week.sort}
                            {...training}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                )}
              </div>
            );
          })
        )}
      </div>
    </Page>
  );
}
