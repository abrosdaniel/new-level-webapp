"use client";

import { use, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useData } from "@/hooks/useData";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

import type { Video } from "@/types/videos";

const KinescopePlayer = dynamic(
  () => import("@kinescope/react-kinescope-player"),
  { ssr: true },
);

import { Page } from "@/components/Init";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { WYSIWYG } from "@/components/WYSIWYG";
import { Notice } from "@/components/Notice";

import { Clock } from "lucide-react";

export default function VideoPage({
  params,
}: {
  params: Promise<{ video: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useUser();

  const sortNum = parseInt(resolvedParams.video, 10);
  const {
    data: videos = [],
    isLoading: isVideoLoading,
    isError: isVideoError,
  } = useData<Video[]>({
    token: "user",
    type: "items",
    collection: "videos",
    key: `video-${resolvedParams.video}`,
    query: {
      fields: ["*"],
      filter: {
        status: { _eq: "published" },
        sort: { _eq: isNaN(sortNum) ? 0 : sortNum },
      },
      limit: 1,
    },
  });

  const video = videos[0];

  const isSubscribed = user?.subscriptions?.some(
    (subscription) =>
      subscription.date_expiration &&
      new Date(subscription.date_expiration) > new Date(),
  );

  const videoId = useMemo(() => {
    if (!video?.video) return null;
    const parts = video.video.trim().split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last?.split("?")[0] ?? null;
  }, [video?.video]);

  useEffect(() => {
    if (!isSubscribed && !user) return;
    if (!isSubscribed) {
      toast.error("Для просмотра видео необходимо иметь подписку");
      router.push("/");
    }
  }, [isSubscribed, user, router]);

  return (
    <Page className="mx-0">
      {isVideoLoading ? (
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
      ) : !video || isVideoError ? (
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка",
            description: "Не удалось загрузить видео. Попробуйте позже.",
          }}
        />
      ) : (
        <>
          {videoId && (
            <div className="w-full relative aspect-video rounded-2xl bg-black overflow-hidden mb-5">
              <KinescopePlayer videoId={videoId} preload="auto" />
            </div>
          )}
          <div className="mx-4 mb-24">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground mb-5"
            >
              <Clock className="size-2.5 text-secondary-foreground" />
              {video.time ?? 0} мин
            </Badge>
            <h2 className="text-lg leading-[1.1] font-semibold uppercase mb-3">
              {video.title}
            </h2>
            <p className="text-base leading-[1.15] font-normal text-muted-foreground mb-3">
              {video.brief_description}
            </p>
            <WYSIWYG
              className="text-base leading-[1.15] font-normal text-muted-foreground mb-6"
              html={video.description}
            />
          </div>
        </>
      )}
    </Page>
  );
}
