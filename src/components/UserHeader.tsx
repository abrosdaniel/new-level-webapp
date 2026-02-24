"use client";

import { useUser } from "@/hooks/useUser";
import { getAssetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/components/Init";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function UserHeader({
  children,
  classNames,
}: {
  children?: React.ReactNode;
  classNames?: {
    wrapper?: string;
    container?: string;
  };
}) {
  const { user, isLoading, error } = useUser();

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between h-12 mb-5",
        classNames?.wrapper,
      )}
    >
      <div className={classNames?.container}>{children}</div>
      {isLoading || error || !user ? (
        <Skeleton className="size-10 rounded-full" />
      ) : (
        <Link href="/profile" className="size-10">
          <Avatar>
            <AvatarImage
              src={getAssetUrl(user.avatar, { width: 40, height: 40 })}
            />
            <AvatarFallback>
              {(user.first_name?.toString().charAt(0).toUpperCase() ?? "") +
                (user.last_name?.toString().charAt(0).toUpperCase() ?? "")}
            </AvatarFallback>
          </Avatar>
        </Link>
      )}
    </div>
  );
}
