import { Trophy, Info } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ds/button";
import { ScrollArea } from "../ui/scroll-area";

export function InfoBanner() {
  return (
    <div className="py-5 px-4 rounded-2xl bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.05)] mb-6">
      <h2 className="text-center text-base leading-[1.15] font-semibold uppercase mb-2.5">
        Покажите свои результаты и получите шанс выиграть приз!
      </h2>
      <p className="text-center text-base leading-[1.15] font-normal text-muted-foreground mb-3">
        Загрузите фотографии «до» в начале курса и «до» и «после» в конце, чтобы
        принять участие в конкурсе!
      </p>
      <Trophy className="size-8 text-secondary-foreground bg-[#EEF2F5] rounded-full p-2 mx-auto mb-3" />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-auto p-0 text-sm text-secondary-foreground"
          >
            Подробные правила конкурса
            <Info className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          className="mx-auto w-[calc(100%-2rem)] rounded-2xl"
          classClose="text-secondary-foreground"
        >
          <DialogHeader>
            <DialogTitle className="text-base leading-[1.15] font-semibold uppercase text-start text-secondary-foreground">
              Правила конкурса
            </DialogTitle>
          </DialogHeader>
          <ScrollArea scrollbar={{ visible: false }} className="max-h-[70vh]">
            <div className="space-y-2.5">
              <p className="text-sm leading-[1.15] font-medium">
                В конкурсе могут участвовать все участники курса NEW LEVEL.
              </p>
              <h3 className="text-sm leading-[1.1] font-semibold uppercase">
                1 этап — фото «до»
              </h3>
              <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                В начале курса необходимо загрузить коллаж из фотографий «до»,
                объединённых в одно изображение, как в примере.
              </p>
              <p className="text-xs leading-[1.15] font-normal">
                <span className="text-sm leading-[1.15] font-medium text-secondary-foreground">
                  Важно!
                </span>
                <br />
                Сохраните это фото до окончания курса и объявления результатов.
                Оно понадобится для создания финального коллажа.
              </p>
              <h3 className="text-sm leading-[1.1] font-semibold uppercase">
                2 этап — фото «до / после»
              </h3>
              <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                В конце курса необходимо загрузить коллаж из фотографий «до» и
                «после», объединённых в одно изображение для сравнения
                результата.
              </p>
              <h3 className="text-sm leading-[1.1] font-semibold uppercase">
                3 этап — общее голосование
              </h3>
              <p className="text-base leading-[1.15] font-normal text-muted-foreground">
                После завершения курса команда NEW LEVEL проверяет все заявки и
                отбирает корректные работы. Работы, которые нарушают правила или
                не показывают заметную динамику, могут быть не допущены к
                участию.
                <br />
                Финалисты участвуют в открытом голосовании в сторис Instagram.
                <br />
                Победитель определяется по итогам общего голосования.
              </p>
              <Trophy className="size-8 text-secondary-foreground bg-[#EEF2F5] rounded-full p-2 mx-auto mt-4" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
