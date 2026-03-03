"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { User } from "@/types/user";

export type ApiError = Error & { code?: string };

async function fetchUser(): Promise<{ user: User }> {
  const res = await fetch("/api/data/user", { credentials: "include" });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    const err = new Error(data?.error || "Not authenticated") as ApiError;
    err.code = data?.code;
    throw err;
  }
  return res.json();
}

async function postUser(patch: Record<string, unknown>): Promise<{
  user: User;
}> {
  const res = await fetch("/api/data/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
    credentials: "include",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    const err = new Error(data?.error || "Update failed") as ApiError;
    err.code = data?.code;
    throw err;
  }
  return res.json();
}

function handleTokenExpired(queryClient: ReturnType<typeof useQueryClient>) {
  toast.error("Сессия истекла, войдите заново");
  queryClient.setQueryData(["user"], null);
}

export function useUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false, // 401 давал 4–8 запросов, CrowdSec банит
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false, // при открытии в Telegram — лишние 401
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60 * 15,
    refetchIntervalInBackground: true,
  });

  const onSuccess = (data: { user: User }) => {
    queryClient.setQueryData(["user"], data);
  };

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => postUser(payload),
    onSuccess,
    onError: (err) => {
      if ((err as ApiError)?.code === "TOKEN_EXPIRED") {
        handleTokenExpired(queryClient);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => postUser(payload),
    onSuccess,
    onError: (err) => {
      if ((err as ApiError)?.code === "TOKEN_EXPIRED") {
        handleTokenExpired(queryClient);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => postUser(payload),
    onSuccess,
    onError: (err) => {
      if ((err as ApiError)?.code === "TOKEN_EXPIRED") {
        handleTokenExpired(queryClient);
      }
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      options = {},
    }: {
      file: File;
      options?: { accept?: string[]; maxSize?: number };
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (options.accept?.length) {
        formData.append("accept", options.accept.join(","));
      }
      if (options.maxSize != null) {
        formData.append("maxSize", String(options.maxSize));
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        const err = new Error(data?.error || "Upload failed") as ApiError;
        err.code = data?.code;
        throw err;
      }
      return res.json() as Promise<{ id: string }>;
    },
    onError: (err) => {
      if ((err as ApiError)?.code === "TOKEN_EXPIRED") {
        handleTokenExpired(queryClient);
      }
    },
  });

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: (relation: string, data: Record<string, unknown>) =>
      createMutation.mutateAsync({ [relation]: data }),
    update: (
      patchOrRelation: Record<string, unknown> | string,
      id?: string | number,
      data?: Record<string, unknown>,
    ) =>
      typeof patchOrRelation === "string"
        ? updateMutation.mutateAsync({
            [patchOrRelation]: { id, ...data },
          })
        : updateMutation.mutateAsync(patchOrRelation),
    delete: (relation: string, id: string | number) =>
      deleteMutation.mutateAsync({ [`${relation}_delete`]: id }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    upload: (file: File, options?: { accept?: string[]; maxSize?: number }) =>
      uploadMutation.mutateAsync({ file, options }),
    isUploading: uploadMutation.isPending,
  };
}
