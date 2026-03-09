"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getAssetUrl } from "@/lib/assets";
import { Photo } from "../Photo";
import { Button } from "../ds/button";
import { Spinner } from "../ui/spinner";

const UPLOAD_OPTIONS = {
  accept: ["image/jpeg", "image/png", "image/webp"] as string[],
  maxSize: 10 * 1024 * 1024, // 10 MB
};

export function StageUploadImg({
  stage,
  existingImage,
  disabled,
  onSuccess,
}: {
  stage: 1 | 2;
  existingImage?: string | { id?: string } | null;
  disabled?: boolean;
  onSuccess?: () => void;
}) {
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const imageUrl = existingImage
    ? getAssetUrl(
        typeof existingImage === "object" && existingImage?.id
          ? { id: existingImage.id as string }
          : (existingImage as string),
      )
    : previewFileId
      ? getAssetUrl(previewFileId)
      : null;
  const hasImage = !!imageUrl;
  const canConfirm = hasImage && !isConfirming && !disabled;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      UPLOAD_OPTIONS.accept.length &&
      !UPLOAD_OPTIONS.accept.includes(file.type.toLowerCase())
    ) {
      toast.error(
        `Разрешены форматы: ${UPLOAD_OPTIONS.accept.map((t) => t.split("/")[1]).join(", ")}`,
      );
      return;
    }
    if (UPLOAD_OPTIONS.maxSize && file.size > UPLOAD_OPTIONS.maxSize) {
      toast.error("Файл слишком большой (макс. 10 MB)");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("accept", UPLOAD_OPTIONS.accept.join(","));
      formData.append("maxSize", String(UPLOAD_OPTIONS.maxSize));
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data?.error ?? "Ошибка загрузки");
      }
      const { id } = (await res.json()) as { id: string };
      setPreviewFileId(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    setPreviewFileId(null);
    inputRef.current?.focus();
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    const fileId = existingImage
      ? typeof existingImage === "object" && existingImage?.id
        ? existingImage.id
        : String(existingImage)
      : previewFileId;
    if (!fileId) return;

    if (existingImage && !previewFileId) {
      toast.info("Фото уже отправлено");
      return;
    }

    setIsConfirming(true);
    try {
      const res = await fetch("/api/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, fileId }),
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        success?: boolean;
      };
      if (!res.ok) {
        throw new Error(data?.error ?? "Ошибка отправки");
      }
      toast.success("Фото успешно отправлено");
      setPreviewFileId(null);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setIsConfirming(false);
    }
  };

  if (existingImage && !previewFileId) {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-4 border-secondary-foreground bg-white">
          <Photo
            src={imageUrl ?? ""}
            alt="Загруженное фото"
            className="w-full h-full"
            fit="contain"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Фото успешно загружено и отправлено.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm leading-[1.15] font-medium">Загрузите ваше фото</p>
      {hasImage ? (
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-4 border-secondary-foreground bg-white">
          <Photo
            src={imageUrl ?? ""}
            alt="Превью"
            className="w-full h-full"
            fit="contain"
          />
          {!existingImage && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="Удалить фото"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-muted-foreground/40 bg-white cursor-pointer hover:border-secondary-foreground/60 transition-colors",
            disabled && "opacity-50 pointer-events-none",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={UPLOAD_OPTIONS.accept.join(",")}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="sr-only"
          />
          {isUploading ? (
            <Spinner className="size-8 text-secondary-foreground" />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              Выберите 1 фотографию
            </span>
          )}
        </label>
      )}
      {hasImage && !existingImage && (
        <Button
          custom="grey"
          type="button"
          className="w-full text-base h-auto py-3 rounded-2xl font-medium"
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {isConfirming ? (
            <Spinner className="size-5 text-white" />
          ) : (
            "Подтвердить отправку фото"
          )}
        </Button>
      )}
    </div>
  );
}
