import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import { getAssetUrl } from "@/lib/assets";

import type { User } from "@/types/user";

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
import { Info } from "lucide-react";
import { Image as ImageIcon } from "@/assets/icons/App";
import { StageUploadImg } from "./StageUploadImg";

export function Stage1({
  currentStage,
  date_start,
  date_end,
  image,
  dialogOpen,
  onDialogOpenChange,
  onParticipantRefetch,
}: {
  currentStage: number;
  date_start?: string;
  date_end?: string;
  image?: string;
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
  onParticipantRefetch?: () => void;
}) {
  const isActive = currentStage === 1;
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
              1 Этап
            </Badge>
            {image ? (
              <Photo
                className="aspect-video w-full rounded-xl overflow-hidden shrink-0"
                src={getAssetUrl(image)}
                alt="Фото «до»"
                fit="cover"
                position="center"
              />
            ) : (
              <div className="bg-white p-3 rounded-full shrink-0">
                <ImageIcon
                  className={cn(
                    "size-6 text-muted-foreground",
                    isActive && "text-secondary-foreground",
                  )}
                />
              </div>
            )}
            <p className="text-[11px] leading-[1.1] font-semibold uppercase text-muted-foreground flex-1">
              Фото «до»
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
                1 Этап
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-base leading-[1.15] font-semibold text-start text-black uppercase">
              Загрузите фотографии «до»
            </DialogDescription>
          </DialogHeader>
          <ScrollArea scrollbar={{ visible: false }} className="max-h-[70vh]">
            <div className="space-y-2.5">
              <div className="flex flex-col gap-2.5 p-3 bg-white shadow-[0_0_10px_rgba(0,0,0,0.05)] rounded-2xl mb-6">
                <Badge
                  variant="outline"
                  className="rounded-full px-1.5 py-1 border-muted-foreground text-sm leading-[0.9] font-normal text-muted-foreground mb-2.5"
                >
                  <Info className="size-3 text-secondary-foreground mr-1" />
                  загрузить фото можно до{" "}
                  {date_end
                    ? formatDate(new Date(date_end), "dd.MM.yyyy")
                    : (date_end ?? "")}
                </Badge>
                <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                  Загрузите одно фото в виде коллажа.
                </p>
              </div>
              <h3 className="text-base leading-[1.15] font-semibold text-start text-secondary-foreground uppercase">
                Как сделать фотографии
              </h3>
              <p className="text-sm leading-[1.15] font-medium">
                При подготовке фотографий соблюдайте несколько правил:
              </p>
              <ul className="text-base leading-[1.15] font-normal text-muted-foreground">
                <li className="list-decimal list-outside ml-6">
                  используйте оригинальные фотографии без обработки и фильтров
                </li>
                <li className="list-decimal list-outside ml-6   ">
                  делайте фотографии в одинаковом ракурсе
                </li>
                <li className="list-decimal list-outside ml-6">
                  выбирайте хорошее освещение
                </li>
                <li className="list-decimal list-outside ml-6">
                  фигура должна быть видна полностью
                </li>
              </ul>
              <div className="flex flex-col gap-2.5 p-3 bg-white shadow-[0_0_10px_rgba(0,0,0,0.05)] rounded-2xl mb-6">
                <p className="text-xs leading-[1.15] font-normal text-muted-foreground">
                  <span className="text-sm leading-[1.15] font-medium text-secondary-foreground">
                    Важно!
                  </span>
                  <br />
                  Для участия необходимо подготовить коллаж из нескольких
                  фотографий, объединённых в одно изображение, как показано в
                  примере.
                </p>
              </div>
              <p className="text-sm leading-[1.15] font-medium">Пример фото</p>
              <Photo
                src="/assets/primer-stage1.png"
                alt="Пример фото"
                className="aspect-video w-full border-4 border-secondary-foreground rounded-2xl overflow-hidden"
                fit="cover"
                position="center"
              />
              <StageUploadImg
                stage={1}
                existingImage={image}
                disabled={currentStage !== 1}
                onSuccess={onParticipantRefetch}
              />
              <div className="flex flex-col gap-2.5 p-3 bg-white shadow-[0_0_10px_rgba(0,0,0,0.05)] rounded-2xl mb-6">
                <p className="text-xs leading-[1.15] font-normal text-muted-foreground">
                  <span className="text-sm leading-[1.15] font-medium text-secondary-foreground">
                    Важно!
                  </span>
                  <br />
                  Фото можно загрузить только один раз. Нажав кнопку
                  “Подтвердить отправку фото” вы подтверждаете свое участие в
                  конкурсе. Фотографии «до» необходимо сохранить до окончания
                  курса и объявления результатов. Они используются для
                  корректного сравнения прогресса и создания финального коллажа
                  для участия в розыгрыше.
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
