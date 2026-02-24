"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
  type FC,
  type MouseEventHandler,
  type JSX,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  init,
  backButton,
  retrieveRawInitData,
  openLink,
} from "@tma.js/sdk-react";
import {
  type LinkProps as NextLinkProps,
  default as NextLink,
} from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

import { Menu } from "@/components/Menu";
import { Notice } from "@/components/Notice";

export interface LinkProps
  extends NextLinkProps, Omit<JSX.IntrinsicElements["a"], "href"> {}

function getIsExternal(href: LinkProps["href"]): boolean {
  if (typeof window === "undefined") return false;
  try {
    const path =
      typeof href === "string"
        ? href
        : `${href.pathname ?? ""}${href.search ?? ""}${href.hash ?? ""}`;
    const targetUrl = new URL(path, window.location.toString());
    return (
      targetUrl.protocol !== window.location.protocol ||
      targetUrl.host !== window.location.host
    );
  } catch {
    return false;
  }
}

export const Link: FC<LinkProps> = ({
  className,
  onClick: propsOnClick,
  href,
  ...rest
}) => {
  const platform = usePlatform();
  const isExternal = getIsExternal(href);

  const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    (e) => {
      propsOnClick?.(e);

      if (!isExternal) return;

      if (platform === "telegram") {
        e.preventDefault();
        const path =
          typeof href === "string"
            ? href
            : `${href.pathname ?? ""}${href.search ?? ""}${href.hash ?? ""}`;
        openLink(new URL(path, window.location.toString()).toString());
      }
    },
    [href, propsOnClick, platform, isExternal],
  );

  const extraProps =
    platform === "web" && isExternal
      ? { target: "_blank" as const, rel: "noopener noreferrer" }
      : {};

  return (
    <NextLink
      {...rest}
      {...extraProps}
      href={href}
      onClick={onClick}
      className={className}
    />
  );
};

export type Platform = "telegram" | "web";

const PlatformContext = createContext<Platform | null>(null);

export function usePlatform() {
  const context = useContext(PlatformContext);
  return context ?? "web";
}

const AUTH_PATHS = ["/login", "/register", "/reset-password"] as const;
/** Префиксы путей без авторизации (/documents покрывает /documents/terms и т.д., /payment — результат оплаты) */
const PUBLIC_PATH_PREFIXES = ["/documents", "/payment"] as const;
const LOADING_MSG = {
  variant: "loading" as const,
  title: "Загрузка",
  description: "Проверяем подключение…",
};
const NOT_TELEGRAM_MSG = {
  variant: "telegram" as const,
  title: (
    <span>
      Приложение:
      <br />
      {process.env.NEXT_PUBLIC_APP_URL}
    </span>
  ),
  description:
    "Для входа через Telegram открой приложение в браузере и подключи Telegram к аккаунту New Level в настройках профиля",
};

function tryDetectPlatform(): Platform {
  try {
    const initData = retrieveRawInitData();
    if (initData) {
      init();

      backButton.mount();
      return "telegram";
    }
  } catch {
    // Вне Telegram или без tgWebAppData
  }
  return "web";
}

export function InitProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const { isAuthenticated, loginTelegram } = useAuth();
  const { user, isLoading, refetch } = useUser();
  const telegramAttempted = useRef(false);
  const [telegramError, setTelegramError] = useState(false);
  const [telegramAuthPending, setTelegramAuthPending] = useState(false);

  const isAuthPath = useMemo(
    () => AUTH_PATHS.some((p) => pathname?.startsWith(p)),
    [pathname],
  );

  const isPublicPath = useMemo(
    () => PUBLIC_PATH_PREFIXES.some((p) => pathname?.startsWith(p)),
    [pathname],
  );

  useEffect(() => {
    const detected = tryDetectPlatform();
    setPlatform(detected);

    const t = setTimeout(() => {
      const retry = tryDetectPlatform();
      setPlatform((prev) => (prev === "web" ? retry : prev));
    }, 300);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (platform === null || isLoading) return;

    if (
      isAuthenticated &&
      user?.status === "suspended" &&
      pathname !== "/blocked"
    ) {
      router.replace("/blocked");
      return;
    }

    if (isAuthenticated && isAuthPath) {
      router.replace("/");
      return;
    }

    if (!isAuthenticated && !isAuthPath && !isPublicPath) {
      if (platform === "telegram" && !telegramAttempted.current) {
        telegramAttempted.current = true;
        setTelegramError(false);
        setTelegramAuthPending(true);
        try {
          const initData = retrieveRawInitData();
          if (initData) {
            loginTelegram(initData)
              .then(() => refetch())
              .catch((err: Error & { code?: string }) => {
                if (err?.code === "USER_NOT_FOUND") {
                  setTelegramError(true);
                } else {
                  router.replace("/register");
                }
              })
              .finally(() => setTelegramAuthPending(false));
          } else {
            setTelegramAuthPending(false);
            router.replace("/register");
          }
        } catch {
          setTelegramAuthPending(false);
          router.replace("/register");
        }
      } else if (platform === "web") {
        router.replace("/login");
      }
    }
  }, [
    platform,
    isLoading,
    isAuthenticated,
    user,
    isAuthPath,
    pathname,
    router,
    loginTelegram,
    refetch,
  ]);

  const showLoading =
    platform === null ||
    (isLoading && !isAuthPath && !isPublicPath && !telegramError) ||
    telegramAuthPending ||
    (platform === "web" && !isAuthenticated && !isAuthPath && !isPublicPath);

  if (showLoading) return <Notice msg={LOADING_MSG} />;
  if (telegramError) return <Notice msg={NOT_TELEGRAM_MSG} />;

  return (
    <PlatformContext.Provider value={platform}>
      {children}
    </PlatformContext.Provider>
  );
}

export function Page({
  children,
  className,
  back = true,
  menu = true,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  back?: boolean;
  menu?: boolean;
  onClick?: () => void;
}) {
  const router = useRouter();
  const platform = usePlatform();

  useEffect(() => {
    if (platform !== "telegram") return;
    back ? backButton.show() : backButton.hide();
    return backButton.onClick(() => (onClick ? onClick() : router.back()));
  }, [platform, back, router, onClick]);

  const isTelegram = platform === "telegram";

  return (
    <main
      className={
        isTelegram
          ? "pt-[var(--tg-content-safe-area-inset-top)] pb-[var(--tg-content-safe-area-inset-bottom)] pl-[var(--tg-content-safe-area-inset-left)] pr-[var(--tg-content-safe-area-inset-right)]"
          : ""
      }
    >
      <div
        className={cn(
          "mx-4 my-5 flex flex-col lg:max-w-md lg:mx-auto",
          className,
        )}
      >
        {children}
      </div>
      {menu && <Menu />}
    </main>
  );
}
