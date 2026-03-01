import { useEffect, useState } from "react";
import type { User } from "@/types/user";
import { useUser } from "@/hooks/useUser";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ds/button";
import { RadioGroup } from "@/components/ds/fields";
import { ChevronRightIcon, ArrowRightIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function LifeGoalBoard({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const { update, isUpdating, refetch } = useUser();

  const form = useForm<User>({
    defaultValues: {
      lifestyle: user.lifestyle,
      goal: user.goal,
    },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        lifestyle: user.lifestyle,
        goal: user.goal,
      });
    }
  }, [open, user?.lifestyle, user?.goal, form]);

  const onSubmit = async (data: { lifestyle?: string; goal?: string }) => {
    try {
      const patch: Record<string, unknown> = {};
      if (data.lifestyle != null) patch.lifestyle = data.lifestyle;
      if (data.goal != null) patch.goal = data.goal;
      if (Object.keys(patch).length === 0) return;
      await update(patch);
      await refetch();
      toast.success("Уровень активности и цель обновлены!");
      setOpen(false);
    } catch (error) {
      toast.error(
        "Ошибка при обновлении уровня активности и цели. Попробуйте позже.",
      );
      console.error("Error updating lifestyle and goal:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          custom="white"
          size="lg"
          className="inline-flex items-center justify-between p-3 mb-6"
        >
          Ваша активность и цель
          <ChevronRightIcon className="!size-5 text-secondary-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-auto w-[calc(100%-2rem)] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base leading-[1.15] font-semibold uppercase text-center">
            Активность и цель
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="lifestyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base leading-[1] font-medium">
                    Уровень активности
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      classNames={{
                        label: "bg-white shadow-sm rounded-xl p-2",
                      }}
                      options={[
                        { value: "low", label: "Сидячий и малоподвижный" },
                        {
                          value: "easy",
                          label: (
                            <p className="flex flex-col">
                              <span>Легкая активность</span>
                              <span className="text-muted-foreground text-sm font-normal">
                                (физические нагрузки 1-3 раза в неделю)
                              </span>
                            </p>
                          ),
                        },
                        {
                          value: "average",
                          label: (
                            <p className="flex flex-col">
                              <span>Средняя активность</span>
                              <span className="text-muted-foreground text-sm font-normal">
                                (физические нагрузки 3-5 раза в неделю)
                              </span>
                            </p>
                          ),
                        },
                        {
                          value: "high",
                          label: (
                            <p className="flex flex-col">
                              <span>Высокая активность</span>
                              <span className="text-muted-foreground text-sm font-normal">
                                (физические нагрузки 6-7 раза в неделю)
                              </span>
                            </p>
                          ),
                        },
                        {
                          value: "highst",
                          label: (
                            <p className="flex flex-col">
                              <span>Очень высокая активность</span>
                              <span className="text-muted-foreground text-sm font-normal">
                                (постоянно высокая физическая нагрузка)
                              </span>
                            </p>
                          ),
                        },
                      ]}
                      className="flex flex-col gap-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base leading-[1] font-medium">
                    Цель
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      classNames={{
                        label: "bg-white shadow-sm rounded-xl p-2.5",
                      }}
                      options={[
                        { value: "weight_loss", label: "Сброс веса" },
                        {
                          value: "weight_maintenance",
                          label: "Поддержание веса",
                        },
                        {
                          value: "gaining_muscle_mass",
                          label: "Набор мышечной массы",
                        },
                      ]}
                      className="flex flex-col gap-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" size="lg" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <span>Обновление…</span>
                    <Spinner className="!size-6" />
                  </>
                ) : (
                  <>
                    <span>Обновить</span>
                    <ArrowRightIcon className="!size-5 text-secondary-foreground" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
