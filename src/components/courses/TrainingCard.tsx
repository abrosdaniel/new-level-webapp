"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Training } from "@/types/courses";

import { Photo } from "@/components/Photo";
import { Badge } from "@/components/ui/badge";
import { getAssetUrl } from "@/lib/assets";
import { LockKeyhole } from "@/assets/icons/App";
import { Flame, Clock } from "lucide-react";

interface CardTrainingProps extends Training {
  week_status: "open" | "close";
  course_url: string | number;
  week_url: string | number;
}

export default function TrainingCard({
  week_status,
  course_url,
  week_url,
  ...training
}: CardTrainingProps) {
  const router = useRouter();

  const handleCardClick = useCallback(() => {
    if (week_status === "close")
      toast.info(`Тренировка ${training.sort} не доступна`);
    else router.push(`/courses/${course_url}/${week_url}-${training.sort}`);
  }, [week_status, course_url, week_url, training.sort, router]);

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.1)]"
    >
      <div className="relative aspect-[9/5] rounded-b-2xl overflow-hidden">
        <Photo
          src={getAssetUrl(training.cover)}
          alt={`Тренировка ${training.sort}`}
          fit="cover"
          position="center"
          className="w-full h-full"
        />
        {week_status === "close" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <LockKeyhole className="size-6 text-white" />
          </div>
        )}
      </div>
      <div className="px-2 py-3.5">
        <div className="flex flex-row items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
          >
            <Flame className="size-2.5 text-secondary-foreground" />
            {training.kcal} Ккал
          </Badge>
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground"
          >
            <Clock className="size-2.5 text-secondary-foreground" />
            {training.time} мин
          </Badge>
        </div>
        <h3 className="text-base leading-[1.15] font-semibold line-clamp-1 uppercase mb-2">
          Тренировка {training.sort}
        </h3>
        <p className="text-sm leading-[0.9] text-muted-foreground line-clamp-2">
          {training.brief_description}
        </p>
      </div>
    </div>
  );
}
