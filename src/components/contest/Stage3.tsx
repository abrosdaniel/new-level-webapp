import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";

import type { User } from "@/types/user";

import { Link } from "@/components/Init";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Photo } from "../Photo";
import { ScrollArea } from "../ui/scroll-area";
import { Medal } from "lucide-react";
import { Button } from "../ds/button";

export function Stage3({
  currentStage,
  date_start,
  date_end,
  image,
  dialogOpen,
  onDialogOpenChange,
}: {
  currentStage: number;
  date_start?: string;
  date_end?: string;
  image?: string;
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}) {
  const isActive = currentStage === 3;
  const isClickable = isActive || dialogOpen;

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <Badge
        variant="outline"
        className={cn(
          "rounded-full px-1.5 py-1 border-muted-foreground text-[10px] leading-[0.9] font-normal text-muted-foreground mb-2.5",
          isActive && "border-secondary-foreground text-secondary-foreground",
        )}
      >
        {date_start && date_end
          ? `${formatDate(new Date(date_start), "dd.MM")} - ${formatDate(new Date(date_end), "dd.MM")}`
          : `${date_start ?? ""} - ${date_end ?? ""}`}
      </Badge>
      <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogTrigger asChild>
          <div
            className={cn(
              "w-full h-full flex flex-col items-center gap-3 justify-center p-2.5 rounded-2xl bg-[#EEF2F5]",
              !isClickable && "opacity-70 pointer-events-none",
            )}
          >
            <Badge
              className={cn(
                "py-2 px-4 rounded-full bg-white text-sm leading-[1.15] font-medium text-muted-foreground uppercase shadow-none shrink-0",
                isActive && "bg-secondary-foreground text-white",
              )}
            >
              3 Этап
            </Badge>
            {image ? (
              <Photo className="shrink-0" src={image} alt="Финальный коллаж" />
            ) : (
              <div className="bg-white p-3 rounded-full shrink-0">
                <Medal
                  className={cn(
                    "size-6 text-muted-foreground",
                    isActive && "text-secondary-foreground",
                  )}
                />
              </div>
            )}
            <p className="text-[11px] leading-[1.1] font-semibold uppercase text-muted-foreground flex-1">
              Голосование
            </p>
          </div>
        </DialogTrigger>
        <DialogContent
          className="mx-auto w-[calc(100%-2rem)] rounded-2xl"
          classClose="text-secondary-foreground"
        >
          <DialogHeader>
            <DialogTitle className="text-base leading-[1.15] font-semibold uppercase text-start text-secondary-foreground">
              <Badge className="py-1.5 px-4 rounded-full text-sm leading-[1.15] font-medium uppercase shadow-none shrink-0 bg-secondary-foreground text-white">
                3 Этап
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-base leading-[1.15] font-semibold text-start text-black uppercase">
              Голосование
            </DialogDescription>
          </DialogHeader>
          <ScrollArea scrollbar={{ visible: false }} className="max-h-[70vh]">
            <div className="space-y-2.5">
              <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                Этот день настал! 🎉
                <br />
                Финалисты конкурса уже определены, и начинается открытое
                голосование в сторис Instagram.
              </p>
              <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                Переходите в Instagram, чтобы поддержать участников и выбрать
                победителя.
              </p>
              <Link
                href="https://www.instagram.com/balman_alexandra"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  custom="grey"
                  type="button"
                  className="w-full text-base h-auto py-3 rounded-2xl font-medium mt-5"
                >
                  Смотреть голосование в соцсетях
                </Button>
              </Link>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
