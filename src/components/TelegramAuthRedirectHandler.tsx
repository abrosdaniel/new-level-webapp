"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function parseTgAuthResult(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const match = location.hash.match(
      /[#?&]tgAuthResult=([A-Za-z0-9\-_=]*)(?:$|&)/,
    );
    if (!match) return null;
    let data = match[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = data.length % 4;
    if (pad > 1) data += "=".repeat(4 - pad);
    return JSON.parse(window.atob(data)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Попап: postMessage в opener и закрытие.
 * Мобильная same-tab: редирект в той же вкладке, нет opener — шлём в API и инвалидируем user.
 */
export function TelegramAuthRedirectHandler() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const authData = parseTgAuthResult();
    if (!authData) return;

    if (window.opener) {
      try {
        window.opener.postMessage(
          JSON.stringify({ event: "auth_result", result: authData }),
          "*",
        );
        window.close();
      } catch {
        // ignore
      }
      return;
    }

    // Same-tab (мобильный): редирект вернул в ту же вкладку
    fetch("/api/auth/link-telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authData),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Link failed");
        return res.json();
      })
      .then(() => {
        history.replaceState(null, "", location.pathname + location.search);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.success("Telegram успешно подключен");
      })
      .catch(() => {
        toast.error("Ошибка подключения Telegram");
      });
  }, [queryClient]);

  return null;
}
