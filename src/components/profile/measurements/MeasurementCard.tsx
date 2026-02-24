"use client";

import { formatDate } from "date-fns";
import { getAssetUrl } from "@/lib/assets";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ImageOff } from "lucide-react";
import { Calendar } from "@/assets/icons/App";
import type { Measurement } from "@/types/user";

function getImageFileIds(images: Measurement["images"]): string[] {
  if (!images?.length) return [];
  return images.map((img) => img.directus_files_id);
}

function GridItem({
  title,
  value,
}: {
  title?: React.ReactNode;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 items-center justify-center bg-[#EEF2F5] p-2 rounded-2xl">
      <h3 className="text-base leading-[1.15] font-semibold">{value}</h3>
      <p className="text-sm leading-[0.9] font-normal">{title}</p>
    </div>
  );
}

export function MeasurementCard({
  measurement,
  index,
  array,
  onEdit,
  onCarousel,
}: {
  measurement: Measurement;
  index: number;
  array: Measurement[];
  onEdit: (m: Measurement) => void;
  onCarousel: (e: React.MouseEvent, m: Measurement) => void;
}) {
  const firstImageId = getImageFileIds(measurement.images)[0];
  const isLast = index >= array.length - 1;

  return (
    <div
      onClick={() => onEdit(measurement)}
      className="cursor-pointer grid grid-cols-3 grid-rows-2 gap-2.5"
    >
      <Avatar
        className="w-full h-full rounded-2xl cursor-pointer col-span-1 row-span-2"
        onClick={(e) => onCarousel(e, measurement)}
      >
        <AvatarImage
          className="rounded-xl aspect-square object-cover"
          src={getAssetUrl(firstImageId)}
        />
        <AvatarFallback className="rounded-xl aspect-square bg-[#EEF2F5]">
          <ImageOff className="size-6 text-secondary-foreground" />
        </AvatarFallback>
      </Avatar>
      <GridItem title="Вес" value={`${measurement.weight || "0"} кг`} />
      <GridItem title="Рост" value={`${measurement.height || "0"} см`} />
      <Badge
        variant="outline"
        className="w-full h-fit items-center justify-center gap-1 p-1.5 rounded-full border-muted-foreground text-muted-foreground self-end"
      >
        <Calendar className="!size-3" />
        <span className="text-sm leading-[1] font-normal">
          {formatDate(measurement.date_created || new Date(), "dd.MM.yyyy")}
        </span>
      </Badge>
      <Button
        variant="secondary"
        className="bg-[#EEF2F5] rounded-full p-5 self-end justify-self-end"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(measurement);
        }}
      >
        <ArrowRight className="!size-5 -rotate-45" />
      </Button>
      {!isLast && <Separator className="mt-4 col-span-3" />}
    </div>
  );
}
