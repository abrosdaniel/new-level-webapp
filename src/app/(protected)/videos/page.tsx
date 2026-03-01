"use client";

import { useUser } from "@/hooks/useUser";
import { useData } from "@/hooks/useData";

import { Video } from "@/types/videos";

import { Page } from "@/components/Init";
import UserHeader from "@/components/UserHeader";
import { Notice } from "@/components/Notice";
import VideoCard from "@/components/videos/VideoCard";

export default function Materials() {
  const { user } = useUser();
  const isSubscribed = user?.subscriptions?.some(
    (subscription) =>
      subscription.date_expiration &&
      new Date(subscription.date_expiration) > new Date(),
  );
  const { data: videos = [] } = useData<Video[]>({
    token: "user",
    type: "items",
    collection: "videos",
    key: "videos",
    query: {
      fields: ["*"],
      filter: { status: { _eq: "published" } },
      sort: { sort: { _asc: true } },
    },
  });

  return (
    <Page>
      <UserHeader>
        <h1 className="text-xl font-semibold uppercase leading-[1.1]">
          Бонусные видео
        </h1>
      </UserHeader>
      {isSubscribed ? (
        videos.length === 0 ? (
          <Notice
            msg={{
              variant: "notfound",
              title: "Нет доступных видео",
              description: (
                <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                  Пока нет доступных видео. Скоро они тут появятся!
                </p>
              ),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-24">
            {videos.map((video) => (
              <VideoCard key={video.sort} video={video} />
            ))}
          </div>
        )
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
