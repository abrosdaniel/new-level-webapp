"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@/types/user";
import { useUser } from "@/hooks/useUser";
import { usePlatform } from "@/components/Init";
import Script from "next/script";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/custom-ui/button";

import { Telegram } from "@/assets/icons/App";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";

declare global {
  interface Window {
    Telegram?: {
      Login?: {
        auth: (
          options: { bot_id: string },
          callback: (
            authData:
              | {
                  id: number;
                  auth_date: number;
                  hash: string;
                  first_name?: string;
                  last_name?: string;
                  username?: string;
                  photo_url?: string;
                }
              | false,
          ) => void,
        ) => void;
      };
    };
  }
}

function ConnectTelegram({ user }: { user: User }) {
  const platform = usePlatform();
  const { refetch, isUpdating } = useUser();
  const [linking, setLinking] = useState(false);
  const hasTelegram = !!user?.telegram_id;

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") setLinking(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!linking) return;
    const t = setTimeout(() => setLinking(false), 45000);
    return () => clearTimeout(t);
  }, [linking]);

  const handleConnect = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/telegram-bot-id");
      if (!res.ok) throw new Error("Bot not configured");
      const { bot_id } = (await res.json()) as { bot_id: string };
      if (!bot_id) throw new Error("Bot ID not found");

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || window.innerWidth < 768;

      if (isMobile) {
        const returnTo = encodeURIComponent(window.location.href);
        const origin = encodeURIComponent(
          window.location.origin ||
            `${window.location.protocol}//${window.location.hostname}`,
        );
        window.location.href = `https://oauth.telegram.org/auth?bot_id=${bot_id}&origin=${origin}&return_to=${returnTo}`;
        return;
      }

      if (!window.Telegram?.Login?.auth) {
        toast.error(
          "Виджет Telegram загружается, попробуйте через пару секунд",
        );
        return;
      }

      setLinking(true);
      window.Telegram.Login.auth(
        { bot_id },
        async (
          authDataOrOrigin:
            | { id: number; auth_date: number; hash: string }
            | false,
          authDataOptional?: { id: number; auth_date: number; hash: string },
        ) => {
          const authData =
            authDataOptional &&
            typeof authDataOptional === "object" &&
            "id" in authDataOptional
              ? authDataOptional
              : authDataOrOrigin && typeof authDataOrOrigin === "object"
                ? authDataOrOrigin
                : null;
          if (!authData || !("id" in authData)) {
            toast.error(
              "Авторизация не завершена. Закройте всплывающее окно и попробуйте снова.",
            );
            setLinking(false);
            return;
          }
          try {
            const linkRes = await fetch("/api/auth/link-telegram", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(authData),
              credentials: "include",
            });
            if (!linkRes.ok) {
              const err = await linkRes.json().catch(() => ({}));
              throw new Error((err as { error?: string }).error || "Ошибка");
            }
            toast.success("Telegram успешно подключен");
            await refetch();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Ошибка подключения",
            );
          } finally {
            setLinking(false);
          }
        },
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не удалось запустить авторизацию",
      );
      setLinking(false);
    }
  }, [refetch]);

  if (platform === "telegram") return null;

  if (hasTelegram) {
    return (
      <Link
        href={`https://t.me/${BOT_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit mx-auto mb-5"
      >
        <Button
          type="button"
          className="w-fit px-3 py-2 rounded-full bg-black text-white text-sm leading-[1.15] font-medium"
        >
          Открыть в Telegram
          <Telegram className="!size-4" />
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-widget.js?22"
        strategy="lazyOnload"
      />
      <Button
        type="button"
        className="w-fit px-3 py-2 mx-auto rounded-full bg-black text-white text-sm leading-[1.15] font-medium mb-5"
        onClick={handleConnect}
        disabled={isUpdating || linking}
      >
        {linking ? "Откройте окно авторизации…" : "Привязать Telegram"}
        <Telegram className="!size-4" />
      </Button>
    </>
  );
}

function DisconnectTelegram({ user }: { user: User }) {
  const platform = usePlatform();
  const hasTelegram = !!user?.telegram_id;
  const { update, refetch, isUpdating } = useUser();

  const handleUnlink = useCallback(async () => {
    if (!confirm("Вы уверены, что хотите отвязать Telegram от аккаунта?"))
      return;
    try {
      await update({ telegram_id: null });
      toast.success("Telegram отвязан");
      await refetch();
    } catch (error) {
      toast.error("Ошибка при отвязке");
      console.error(error);
    }
  }, [update, refetch]);

  if (platform === "telegram" || !hasTelegram) return null;

  return (
    <Button
      type="button"
      className="w-fit px-3 py-2 mx-auto rounded-full bg-transparent shadow-none text-muted-foreground text-sm leading-[1.15] font-medium underline"
      onClick={handleUnlink}
      disabled={isUpdating}
    >
      Отвязать Telegram
    </Button>
  );
}

export { ConnectTelegram, DisconnectTelegram };
