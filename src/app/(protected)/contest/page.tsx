"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/hooks/useData";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import type { Contest, Participant } from "@/types/contest";

import { Page } from "@/components/Init";
import UserHeader from "@/components/UserHeader";
import { InfoBanner } from "@/components/contest/InfoBanner";
import { Notice } from "@/components/Notice";
import { Stage1 } from "@/components/contest/Stage1";
import { Stage2 } from "@/components/contest/Stage2";
import { Stage3 } from "@/components/contest/Stage3";
import { Button } from "@/components/ds/button";

import { CircleCheck, CircleX } from "lucide-react";

function getCurrentStage(contest: Contest | null | undefined): number {
  if (!contest) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const {
    date_before_start,
    date_before_end,
    date_after_start,
    date_after_end,
    date_final_start,
    date_final_end,
  } = contest;

  if (today < date_before_start) return 0;
  if (today >= date_before_start && today <= date_before_end) return 1;
  if (today > date_before_end && today < date_after_start) return 1.5;
  if (today >= date_after_start && today <= date_after_end) return 2;
  if (today > date_after_end && today < date_final_start) return 2.5;
  if (today >= date_final_start && today <= date_final_end) return 3;
  return 3.5;
}

function getStageForDialog(currentStage: number): 1 | 2 | 3 {
  if (currentStage < 1) return 1;
  if (currentStage > 3) return 3;
  return Math.ceil(currentStage) as 1 | 2 | 3;
}

export default function ContestPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [stageDialogOpen, setStageDialogOpen] = useState<1 | 2 | 3 | null>(
    null,
  );

  const {
    data: contest,
    isLoading: isContestLoading,
    isError: isContestError,
  } = useData<Contest>({
    token: "user",
    type: "singleton",
    collection: "contest_25minutes",
    key: "contest_25minutes",
    query: {
      fields: ["*", "winner.*"],
    },
  });
  const { data: participants, refetch: refetchParticipants } = useData<
    Participant[]
  >({
    token: "user",
    type: "items",
    collection: "participants",
    key: `participant-${user?.id}`,
    query: {
      filter: {
        user: { _eq: user?.id },
      },
      fields: ["*", "image_before.*", "image_after.*"],
      limit: 1,
    },
  });
  const participant = participants?.[0];
  const currentStage = useMemo(() => getCurrentStage(contest), [contest]);

  useEffect(() => {
    if (!user) {
      router.push("/");
      toast.error("Для просмотра конкурса необходимо авторизоваться");
    }
    if (!contest && isContestLoading && isUserLoading) {
      return;
    }
  }, [isContestLoading, contest, router, isUserLoading, user]);

  return (
    <Page className="mx-0">
      {isContestError ? (
        <Notice
          msg={{
            variant: "error",
            title: "Ошибка",
            description: "Не удалось загрузить конкурс. Попробуйте позже.",
          }}
        />
      ) : (
        <>
          <div className="mx-4 mb-24">
            <UserHeader>
              <h1 className="text-xl leading-[1.1] font-semibold uppercase">
                Конкурс трансформации
              </h1>
            </UserHeader>
            <InfoBanner />
            <div className="flex flex-row justify-between gap-3 mb-2.5">
              <Stage1
                currentStage={currentStage}
                date_start={contest?.date_before_start}
                date_end={contest?.date_before_end}
                image={participant?.image_before ?? undefined}
                dialogOpen={stageDialogOpen === 1}
                onDialogOpenChange={(open) =>
                  setStageDialogOpen(open ? 1 : null)
                }
                onParticipantRefetch={refetchParticipants}
              />
              <Stage2
                currentStage={currentStage}
                date_start={contest?.date_after_start}
                date_end={contest?.date_after_end}
                image={participant?.image_after ?? undefined}
                dialogOpen={stageDialogOpen === 2}
                onDialogOpenChange={(open) =>
                  setStageDialogOpen(open ? 2 : null)
                }
                onParticipantRefetch={refetchParticipants}
              />
              <Stage3
                currentStage={currentStage}
                date_start={contest?.date_final_start}
                date_end={contest?.date_final_end}
                dialogOpen={stageDialogOpen === 3}
                onDialogOpenChange={(open) =>
                  setStageDialogOpen(open ? 3 : null)
                }
              />
            </div>
            <div className="flex flex-row items-center gap-2 mx-8 mb-3">
              <div
                className={cn(
                  "text-[#BFBFBF]",
                  currentStage >= 1 && "text-secondary-foreground",
                )}
              >
                {currentStage >= 1 ? (
                  <CircleCheck className="size-6" />
                ) : (
                  <CircleX className="size-6" />
                )}
              </div>
              <div
                className={cn(
                  "w-full h-2 bg-[#BFBFBF] rounded-full",
                  currentStage >= 1.5 && "bg-secondary-foreground",
                )}
              />
              <div
                className={cn(
                  "text-[#BFBFBF]",
                  currentStage >= 2 && "text-secondary-foreground",
                )}
              >
                {currentStage >= 2 ? (
                  <CircleCheck className="size-6" />
                ) : (
                  <CircleX className="size-6" />
                )}
              </div>
              <div
                className={cn(
                  "w-full h-2 bg-[#BFBFBF] rounded-full",
                  currentStage >= 2.5 && "bg-secondary-foreground",
                )}
              />
              <div
                className={cn(
                  "text-[#BFBFBF]",
                  currentStage >= 3 && "text-secondary-foreground",
                )}
              >
                {currentStage >= 3 ? (
                  <CircleCheck className="size-6" />
                ) : (
                  <CircleX className="size-6" />
                )}
              </div>
            </div>
            <Button
              custom="grey"
              type="button"
              className="w-full text-lg h-auto py-3 rounded-2xl font-medium mb-5"
              disabled={
                currentStage === 0 ||
                currentStage === 1.5 ||
                currentStage === 2.5
              }
              onClick={() =>
                setStageDialogOpen(getStageForDialog(currentStage))
              }
            >
              Загрузить фото
            </Button>
          </div>
        </>
      )}
    </Page>
  );
}
