import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Bug,
  ShieldAlert,
  Frown,
  ShieldX,
  Loader2Icon,
  Send,
  MailCheck,
  ScrollText,
  Star,
} from "lucide-react";
import { LockKeyhole, Measurements } from "@/assets/icons/App";

export function Notice({
  msg,
}: {
  msg: {
    variant: string;
    title: React.ReactNode;
    description: React.ReactNode;
  };
}) {
  const { variant, title, description } = msg;
  return (
    <Empty className="h-full min-h-[calc(100vh-220px)]">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className={cn(
            "bg-gray-100 text-secondary-foreground rounded-full",
            variant === "error" && "bg-destructive text-destructive-foreground",
            variant === "blocked" && "text-destructive",
            variant === "notaccess" && "text-orange-500",
            variant === "loading" && "bg-primary",
            variant === "telegram" && "bg-blue-500 text-white",
          )}
        >
          {variant === "error" && <Bug />}
          {variant === "blocked" && <ShieldX />}
          {variant === "notaccess" && <ShieldAlert />}
          {variant === "notfound" && <Frown />}
          {variant === "loading" && <Loader2Icon className="animate-spin" />}
          {variant === "lock" && <LockKeyhole />}
          {variant === "send" && <MailCheck />}
          {variant === "scroll" && <ScrollText />}
          {variant === "measurements" && <Measurements />}
          {variant === "star" && <Star />}
          {variant === "telegram" && <Send />}
        </EmptyMedia>
        <EmptyTitle className="leading-[1.1]">{title}</EmptyTitle>
        <EmptyDescription className="leading-[1.15]">
          {description}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export const FrameMessage = Notice;
