"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useUser } from "./useUser";

export function useAuth() {
  const queryClient = useQueryClient();
  const userData = useUser();

  const registerMutation = useMutation({
    mutationFn: async (body: {
      first_name: string;
      last_name: string;
      birthday: Date;
      gender: "male" | "female";
      email: string;
      password: string;
      confirm_password: string;
      terms: boolean;
    }) => {
      const { confirm_password: _, terms: __, ...payload } = body;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          birthday: payload.birthday.toISOString().split("T")[0],
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Register failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
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
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
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
    logout: logoutMutation.mutateAsync,
  };
}
