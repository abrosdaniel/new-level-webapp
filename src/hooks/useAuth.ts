"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { User } from "@/types/user";
import { formatBirthday } from "@/lib/utils";
import { useUser } from "./useUser";

export function useAuth() {
  const queryClient = useQueryClient();
  const userData = useUser();

  const registerMutation = useMutation({
    mutationFn: async (
      body: {
        first_name: string;
        last_name: string;
        birthday: Date;
        gender: "male" | "female";
        email: string;
        password: string;
        confirm_password: string;
        terms: boolean;
      } & { platform?: "web" | "telegram"; initData?: string },
    ) => {
      const { confirm_password: _, terms: __, platform, initData, ...payload } =
        body;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          birthday: formatBirthday(payload.birthday),
          ...(platform && { platform }),
          ...(initData && { initData }),
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Register failed");
      }
      const data = (await res.json()) as { user: User };
      return data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(["user"], { user: data.user });
      } else {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (
      body: {
        email: string;
        password: string;
      } & { platform?: "web" | "telegram"; initData?: string },
    ) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Login failed");
      }
      const data = (await res.json()) as { user: User };
      return data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(["user"], { user: data.user });
      } else {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
  });

  const telegramAuthMutation = useMutation({
    mutationFn: async (initData: string) => {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        user?: unknown;
      };
      if (!res.ok) {
        const err = new Error(
          data?.error || "Telegram auth failed",
        ) as Error & { code?: string };
        err.code = data?.code;
        throw err;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const checkEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Check failed");
      const data = (await res.json()) as { exists?: boolean };
      return data.exists ?? false;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
    },
  });

  return {
    isAuthenticated: !!userData.user,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    loginTelegram: telegramAuthMutation.mutateAsync,
    checkEmail: checkEmailMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}
