"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { Link } from "@/components/Init";

import {
  HomeIcon,
  CoursesIcon,
  RecipeIcon,
  VideoIcon,
  ProfileIcon,
} from "@/assets/icons/Menu";

export function Menu() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const MenuItem = ({
    label,
    href,
    icon,
  }: {
    label: string;
    href: string;
    icon: React.ReactElement<{ fill?: string; stroke?: string }>;
  }) => {
    const active = isActive(href);
    return (
      <Link href={href}>
        <div
          className={cn(
            "size-14 p-4 rounded-full",
            active
              ? "bg-primary text-secondary-foreground"
              : "bg-[#EEF2F5] fill-background",
          )}
        >
          {React.cloneElement(icon, {
            fill: active ? "#22E148" : "#EEF2F5",
            stroke: active ? "#22E148" : "#000000",
          })}
        </div>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-row items-center gap-3 p-2 bg-white rounded-full shadow-[0px_0px_10px_0px_rgba(0,0,0,0.05)] z-50">
      <MenuItem label="Главная" href="/" icon={<HomeIcon />} />
      <MenuItem label="Курсы" href="/courses" icon={<CoursesIcon />} />
      <MenuItem label="Рецепты" href="/recipes" icon={<RecipeIcon />} />
      <MenuItem label="Бонусные видео" href="/videos" icon={<VideoIcon />} />
      <MenuItem label="Профиль" href="/profile" icon={<ProfileIcon />} />
    </div>
  );
}
