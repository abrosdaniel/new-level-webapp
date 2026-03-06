"use client";

import { useState } from "react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/components/Init";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

import type { Subscription, Payment, User } from "@/types/user";

import { Link } from "@/components/Init";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ds/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Notice } from "../Notice";
import { InputCopy } from "@/components/ds/fields";
import { Label } from "@/components/ui/label";

import { Calendar } from "@/assets/icons/App";
import { ArrowRightIcon, CircleCheck, CircleX, EyeIcon } from "lucide-react";

function BuyButton({
  courseId,
  platform,
  label,
}: {
  courseId: string | number;
  platform: "telegram" | "web";
  label: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useUser();

  return (
    <Button
      custom="grey"
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/payments/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              products: [{ collection: "courses", id: String(courseId) }],
            }),
            credentials: "include",
          });
          const data = (await res.json()) as {
            error?: string;
            confirmation_url?: string;
          };
          if (!res.ok) {
            if (data.error?.toLowerCase().includes("not authenticated")) {
              await refetch();
              if (platform === "web") window.location.href = "/login";
              return;
            }
            throw new Error(data.error ?? "Ошибка оплаты");
          }
          const url = data.confirmation_url;
          if (url) {
            window.location.href = url;
          }
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : "Ошибка при оформлении оплаты",
          );
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? "Загрузка…" : label}
    </Button>
  );
}

export default function Payments({ user }: { user: User }) {
  const platform = usePlatform();
  const { refetch } = useUser();

  const formatSafe = (value: string | null | undefined, fmt: string) => {
    const d = value ? new Date(value) : new Date(NaN);
    return isValid(d) ? format(d, fmt) : "—";
  };

  const isActive = (subscription: Subscription) => {
    if (!subscription.date_expiration) return false;
    else
      return (
        new Date(subscription.date_expiration).getTime() > new Date().getTime()
      );
  };

  return (
    <Dialog>
      <DialogTrigger
        asChild
        onClick={() => {
          refetch();
        }}
      >
        <Button
          custom="grey"
          type="button"
          className="group text-lg h-auto py-3 rounded-2xl font-medium mb-2.5"
        >
          Мои покупки
          <Calendar className="!size-5 text-secondary-foreground group-hover:text-[#8D8E90]" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="mx-auto w-[calc(100%-2rem)] rounded-2xl"
        classClose="text-secondary-foreground"
      >
        <DialogHeader>
          <DialogTitle className="text-base leading-[1.15] font-semibold uppercase text-center">
            Мои покупки
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="subscriptions" className="w-full">
          <div className="w-full flex justify-center mb-3">
            <TabsList className="rounded-full p-[3px] h-auto bg-white shadow-[0_0_10px_rgba(0,0,0,0.05)]">
              <TabsTrigger
                key="subscriptions"
                value="subscriptions"
                className="rounded-full px-2 py-1.5 text-sm leading-[1.15] font-normal text-black data-[state=active]:bg-secondary-foreground data-[state=active]:text-white"
              >
                Подписки
              </TabsTrigger>
              <TabsTrigger
                key="payments"
                value="payments"
                className="rounded-full px-2 py-1.5 text-sm leading-[1.15] font-normal text-black data-[state=active]:bg-secondary-foreground data-[state=active]:text-white"
              >
                История покупок
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="subscriptions">
            {user.subscriptions && user.subscriptions.length > 0 ? (
              <ScrollArea className="h-[500px]">
                <div className="flex flex-col gap-4 w-full">
                  {user.subscriptions.map((subscription: Subscription, idx) => (
                    <div
                      key={subscription.id ?? `sub-${idx}`}
                      className="flex flex-col bg-white p-4 rounded-xl"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 px-1 py-0.5 rounded-full w-fit mb-5 text-sm leading-[0.9] font-normal",
                          isActive(subscription)
                            ? "text-secondary-foreground border-secondary-foreground"
                            : "text-red-500 border-red-500",
                        )}
                      >
                        {isActive(subscription) ? (
                          <>
                            <CircleCheck
                              data-icon="inline-start"
                              className="!size-4"
                            />
                            Подписка активна до{" "}
                            {formatSafe(
                              subscription.date_expiration,
                              "dd.MM.yyyy",
                            )}
                          </>
                        ) : (
                          <>
                            <CircleX
                              data-icon="inline-start"
                              className="!size-4"
                            />
                            Подписка истекла{" "}
                            {formatSafe(
                              subscription.date_expiration,
                              "dd.MM.yyyy",
                            )}
                          </>
                        )}
                      </Badge>
                      <div className="flex flex-row items-center gap-2.5 mb-2.5">
                        <h3 className="flex-grow text-sm leading-[1.15] font-medium uppercase line-clamp-1">
                          {subscription.course?.title ?? "—"}
                        </h3>
                        <p className="flex-shrink-0 text-sm leading-[1.15] font-normal">
                          {subscription.course?.subscription_price}{" "}
                          {subscription.currency}/мес
                        </p>
                      </div>
                      {subscription.course &&
                      subscription.course.status !== "close" ? (
                        <BuyButton
                          courseId={subscription.course.id}
                          platform={platform}
                          label={
                            isActive(subscription) ? (
                              <>
                                Продлить подписку
                                <ArrowRightIcon className="!size-5 text-secondary-foreground group-hover:text-gray-400 -rotate-45" />
                              </>
                            ) : (
                              <>
                                Купить подписку
                                <ArrowRightIcon className="!size-5 text-secondary-foreground group-hover:text-gray-400 -rotate-45" />
                              </>
                            )
                          }
                        />
                      ) : subscription.course?.status === "close" ? (
                        <p className="text-sm text-muted-foreground">
                          Курс закрыт для новых покупок
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Notice
                msg={{
                  variant: "scroll",
                  title: "Нет подписок",
                  description: (
                    <p>
                      У вас пока нет подписок на курсы. <br /> Если вы хотите
                      купить подписку на курс, то вы можете сделать это здесь.
                      <br />
                      <br />
                      <Link
                        href="/courses"
                        className="text-center text-sm text-foreground hover:underline"
                      >
                        Выбрать курс
                      </Link>
                    </p>
                  ),
                }}
              />
            )}
          </TabsContent>
          <TabsContent value="payments">
            {user.payments && user.payments.length > 0 ? (
              <ScrollArea className="h-[500px]">
                <div className="flex flex-col gap-4 w-full">
                  {user.payments.map((payment: Payment, idx) => (
                    <div
                      key={payment.id ?? `pay-${idx}`}
                      className="flex flex-col bg-white p-4 rounded-xl"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-start justify-start">
                          <p className="text-sm leading-[1.15] font-normal text-muted-foreground">
                            {formatSafe(
                              payment.date_created,
                              "dd.MM.yyyy HH:mm",
                            )}
                          </p>
                        </div>
                        <div className="flex items-start justify-end">
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1 px-1 py-0.5 rounded-full w-fit mb-1.5 text-sm leading-[0.9] font-normal",
                              payment.status === "succeeded"
                                ? "text-secondary-foreground border-secondary-foreground"
                                : payment.status === "pending"
                                  ? "text-amber-600 border-amber-600"
                                  : "text-red-500 border-red-500",
                            )}
                          >
                            {payment.status === "succeeded" ? (
                              <>
                                <CircleCheck
                                  data-icon="inline-start"
                                  className="!size-4"
                                />
                                Оплачено
                              </>
                            ) : payment.status === "pending" ? (
                              "В обработке"
                            ) : payment.status === "canceled" ? (
                              <>
                                <CircleX
                                  data-icon="inline-start"
                                  className="!size-4"
                                />
                                Отменён
                              </>
                            ) : payment.status === "failed" ? (
                              "Ошибка"
                            ) : null}
                          </Badge>
                        </div>
                        <div className="flex items-end justify-start">
                          <Link
                            href={`/payment?id=${payment.id}`}
                            className="inline-flex items-center gap-1 text-sm leading-[1.15] font-normal text-muted-foreground hover:underline"
                          >
                            <EyeIcon className="!size-4" />
                            Посмотреть чек
                          </Link>
                        </div>
                        <div className="flex items-end justify-end">
                          <span className="text-sm leading-[1.15] font-medium">
                            {payment.amount} {payment.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Notice
                msg={{
                  variant: "scroll",
                  title: "Нет покупок",
                  description: "У вас пока нет покупок.",
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
