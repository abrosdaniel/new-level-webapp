"use client";

import { getAssetUrl } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Photo } from "@/components/Photo";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";
import { SquarePlus, Camera } from "@/assets/icons/App";

const UPLOAD_ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_MAX_SIZE = 5 * 1024 * 1024;

export const UPLOAD_OPTIONS = {
  accept: UPLOAD_ACCEPT,
  maxSize: UPLOAD_MAX_SIZE,
} as const;

export function MeasurementImageGrid({
  images,
  onAdd,
  onRemove,
  onCarouselOpen,
  fileInputRef,
  uploadingCount = 0,
  editMode = true,
}: {
  images: string[];
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onCarouselOpen?: (images: string[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadingCount?: number;
  editMode?: boolean;
}) {
  const canAddMore = images.length + uploadingCount < 6;
  return (
    <FormItem className="col-span-2">
      <FormLabel className="text-base leading-[1] font-medium">
        Фотографии (до 6 шт.)
      </FormLabel>
      <div className="grid grid-cols-3 grid-rows-2 gap-2 aspect-[3/2]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl bg-[#EEF2F5] overflow-hidden"
          >
            {images[i] ? (
              <>
                {editMode ? (
                  <Photo
                    src={getAssetUrl(images[i])}
                    alt={`Фото ${i + 1}`}
                    className="w-full h-full"
                  />
                ) : (
                  <Photo
                    src={getAssetUrl(images[i])}
                    alt={`Фото ${i + 1}`}
                    className="w-full h-full cursor-pointer"
                    onClick={() => onCarouselOpen?.(images)}
                  />
                )}
                {editMode && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-1 right-1 size-6 rounded-full p-0 bg-black/50"
                    onClick={() => onRemove(i)}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </>
            ) : editMode ? (
              i >= images.length && i < images.length + uploadingCount ? (
                <div className="w-full h-full flex items-center justify-center text-secondary-foreground">
                  <Spinner className="size-8" />
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!canAddMore}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex items-center justify-center text-secondary-foreground hover:bg-secondary-foreground/10 disabled:opacity-50"
                >
                  <SquarePlus className="size-8" />
                </button>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary-foreground opacity-50">
                <Camera className="size-8" />
              </div>
            )}
          </div>
        ))}
      </div>
      {editMode && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={onAdd}
        />
      )}
    </FormItem>
  );
}
