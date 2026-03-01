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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  init,
  backButton,
  retrieveRawInitData,
  openLink,
} from "@tma.js/sdk-react";
import { getSafeRedirect } from "@/lib/utils";
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

const AUTH_PATHS_WEB = ["/login", "/register", "/reset-password"] as const;
const AUTH_PATH_TELEGRAM = "/tg-login" as const;
/** Префиксы путей без авторизации (/documents покрывает /documents/terms и т.д., /payment — результат оплаты) */
const PUBLIC_PATH_PREFIXES = ["/documents", "/payment"] as const;

const LOADING_MSG = {
  variant: "loading" as const,
  title: "Загрузка",
  description: "Проверяем подключение…",
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

/** Целевая страница после авторизации. */
function getIntendedPath(pathname: string | null): string {
  return pathname || "/";
}

export function InitProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const { isAuthenticated, loginTelegram } = useAuth();
  const { user, isLoading, refetch } = useUser();
  const telegramAttempted = useRef(false);
  const [telegramAuthPending, setTelegramAuthPending] = useState(false);
  const redirectAfterAuth = getSafeRedirect(searchParams.get("redirect"));

  const isAuthPath = useMemo(() => {
    if (!pathname) return false;
    return (
      AUTH_PATHS_WEB.some((p) => pathname.startsWith(p)) ||
      pathname.startsWith(AUTH_PATH_TELEGRAM)
    );
  }, [pathname]);

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
    if (platform === null) return;

    if (
      platform === "telegram" &&
      AUTH_PATHS_WEB.some((p) => pathname?.startsWith(p))
    ) {
      const redirect = getIntendedPath(pathname);
      router.replace(`/tg-login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (isLoading) return;

    if (
      isAuthenticated &&
      user?.status === "suspended" &&
      pathname !== "/blocked"
    ) {
      router.replace("/blocked");
      return;
    }

    if (isAuthenticated && isAuthPath) {
      router.replace(redirectAfterAuth);
      return;
    }

    if (!isAuthenticated && !isAuthPath && !isPublicPath) {
      const intendedPath = getIntendedPath(pathname);
      const redirectParam = `redirect=${encodeURIComponent(intendedPath)}`;
      if (platform === "telegram" && !telegramAttempted.current) {
        telegramAttempted.current = true;
        setTelegramAuthPending(true);
        try {
          const initData = retrieveRawInitData();
          if (initData) {
            loginTelegram(initData)
              .then(() => {
                const doRedirect = () => {
                  router.replace(intendedPath);
                };
                setTimeout(() => refetch().then(doRedirect), 200);
              })
              .catch(() => {
                router.replace(`/tg-login?${redirectParam}`);
              })
              .finally(() => setTelegramAuthPending(false));
          } else {
            setTelegramAuthPending(false);
            router.replace(`/tg-login?${redirectParam}`);
          }
        } catch {
          setTelegramAuthPending(false);
          router.replace(`/tg-login?${redirectParam}`);
        }
      } else if (platform === "web") {
        router.replace(`/login?${redirectParam}`);
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
    redirectAfterAuth,
  ]);

  const showLoading =
    platform === null ||
    (isLoading && !isAuthPath && !isPublicPath) ||
    telegramAuthPending ||
    (platform === "web" && !isAuthenticated && !isAuthPath && !isPublicPath);

  if (showLoading) return <Notice msg={LOADING_MSG} />;

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
