"use client";

import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

import { Notice } from "@/components/Notice";
import { Page, Link } from "@/components/Init";
import UserHeader from "@/components/UserHeader";
import { Skeleton } from "@/components/ui/skeleton";
import RecomendateFeed from "@/components/home/RecomendateFeed";
import { Button } from "@/components/ds/button";

import {
  HomeDumbbell,
  HomeFruit,
  HomeVideo,
  HomeFolder,
} from "@/assets/icons/App";
import { ArrowRight } from "lucide-react";

const SectionItem = ({
  title,
  href,
  icon,
  type,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  type: string;
}) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "w-full aspect-square rounded-xl p-3 grid grid-cols-2 grid-rows-2 shadow-[0_0_10px_rgba(0,0,0,0.1)]",
          type === "green" ? "bg-white" : "bg-gray-100",
        )}
      >
        <h3 className="text-base leading-[1.15] font-semibold uppercase self-start">
          {title}
        </h3>
        <div className="justify-self-end self-start" />
        <div
          className={cn(
            "self-end opacity-60",
            type === "green" ? "text-secondary-foreground" : "text-[#727273]",
          )}
        >
          {icon}
        </div>
        <Button
          size="icon"
          className={cn(
            "rounded-full size-8 justify-self-end self-end shadow-none",
            type === "green"
              ? "bg-gray-100 hover:bg-white"
              : "bg-white hover:bg-gray-100",
          )}
        >
          <ArrowRight className="!size-4 -rotate-45 text-secondary-foreground" />
        </Button>
      </div>
    </Link>
  );
};

export default function Home() {
  const { user, isLoading, error } = useUser();

  if (error || !user) {
    return (
      <Notice
        msg={{
          variant: "error",
          title: "Ошибка!",
          description: "Не удалось загрузить страницу. Попробуйте позже.",
        }}
      />
    );
  }

  return (
    <Page back={false}>
      <UserHeader>
        {isLoading ? (
          <Skeleton className="h-10 w-2/5" />
        ) : (
          <>
            <h1 className="text-xl leading-[1.1] font-semibold uppercase mb-1">
              Привет,{" "}
              <span className="text-secondary-foreground">
                {user.first_name}
              </span>
            </h1>
            <p className="text-sm leading-[1.15] font-medium">
              Добро пожаловать на НОВЫЙ УРОВЕНЬ!
            </p>
          </>
        )}
      </UserHeader>
      <RecomendateFeed />
      <h2 className="text-lg leading-[1.1] font-semibold uppercase mb-4">
        Разделы и материалы
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-24">
        <SectionItem
          title="Курсы"
          href="/courses"
          icon={<HomeDumbbell />}
          type="green"
        />
        <SectionItem
          title="Питание"
          href="/recipes"
          icon={<HomeFruit />}
          type="gray"
        />
        <SectionItem
          title="Бонусные видео"
          href="/videos"
          icon={<HomeVideo />}
          type="gray"
        />
        <SectionItem
          title="Полезные материалы"
          href="/materials"
          icon={<HomeFolder />}
          type="green"
        />
      </div>
    </Page>
  );
}
