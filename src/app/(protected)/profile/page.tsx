"use client";

import { useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { getAssetUrl } from "@/lib/assets";
import { toast } from "sonner";

import { Page, Link, usePlatform } from "@/components/Init";
import { Notice } from "@/components/Notice";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/custom-ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EditProfile from "@/components/profile/EditProfile";
import Payments from "@/components/profile/Payments";
import MeasurementsBoard from "@/components/profile/measurements/MeasurementsBoard";
import KcalBoard from "@/components/profile/KcalBoard";
import LifeGoalBoard from "@/components/profile/LifeGoalBoard";

import { QuestionMark, Measurements } from "@/assets/icons/App";
import { Loader2, LogOut } from "lucide-react";

export default function Profile() {
  const platform = usePlatform();
  const { logout } = useAuth();
  const { user, isLoading, error, upload, update, isUploading, isUpdating } =
    useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { id } = await upload(file, {
        accept: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        maxSize: 5 * 1024 * 1024,
      });
      await update({ avatar: id });
      toast.success("Аватар обновлён");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Ошибка при загрузке фото",
      );
    }
    e.target.value = "";
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Вы вышли из аккаунта. Ждём вас снова в New Level!");
  };

  return (
    <Page back={false}>
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-between h-12 mb-6">
          <h1 className="text-lg leading-[1.1] font-semibold uppercase">
            Мой профиль
          </h1>
          <div className="flex flex-row items-center gap-2">
            <Link href="/faq/">
              <Button
                variant="secondary"
                className="bg-white rounded-full"
                size="icon"
              >
                <QuestionMark className="!size-4" />
              </Button>
            </Link>
            {user && !isLoading && !error ? (
              <EditProfile user={user} />
            ) : (
              <Skeleton className="size-9 rounded-full" />
            )}
            {platform === "web" &&
              (user && !isLoading && !error ? (
                <Button
                  variant="secondary"
                  className="bg-white rounded-full"
                  size="icon"
                  onClick={handleLogout}
                >
                  <LogOut className="!size-4" />
                </Button>
              ) : (
                <Skeleton className="size-9 rounded-full" />
              ))}
          </div>
        </div>
        {user && !isLoading && !error ? (
          <div className="flex flex-col mb-24">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploading || isUpdating}
              className="relative mx-auto mb-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-foreground focus:ring-offset-2 disabled:opacity-50"
              aria-label="Сменить аватар"
            >
              <Avatar className="size-32 rounded-full cursor-pointer">
                <AvatarImage
                  src={getAssetUrl(user.avatar, { width: 128, height: 128 })}
                />
                <AvatarFallback>
                  {isUploading || isUpdating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "+"
                  )}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleFileChange}
                aria-hidden
              />
            </button>
            <h1 className="text-lg leading-[1.1] text-center font-semibold uppercase mb-1">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-base leading-[1] font-medium text-center text-muted-foreground mb-2.5">
              {user.email}
            </p>
            <Payments user={user} />
            <Link href="/profile/measurements" className="w-full">
              <Button
                custom="grey"
                type="button"
                className="w-full text-lg h-auto py-3 rounded-2xl font-medium mb-5"
              >
                Мои измерения
                <Measurements className="!size-6 text-secondary-foreground" />
              </Button>
            </Link>
            <MeasurementsBoard user={user} />
            <KcalBoard user={user} />
            <LifeGoalBoard user={user} />
            <Link
              href="https://t.me/newlevel_appbot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                custom="grey"
                type="button"
                className="w-full text-lg h-auto py-3 rounded-2xl font-medium"
              >
                Написать в поддержку
              </Button>
            </Link>
            <Link
              href="/documents"
              className="w-full my-5  text-center text-sm leading-[1.15] font-medium text-muted-foreground underline"
            >
              Правовые документы
            </Link>
          </div>
        ) : (
          <Notice
            msg={{
              variant: "loading",
              title: "Загрузка профиля",
              description: "Загружаем данные…",
            }}
          />
        )}
      </div>
    </Page>
  );
}
