"use client";

import { useRef } from "react";
import { useData } from "@/hooks/useData";
import Autoplay from "embla-carousel-autoplay";
import { getAssetUrl } from "@/lib/assets";

import type { Feed } from "@/types/feed";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Link } from "@/components/Init";
import { Photo } from "../Photo";
import { Skeleton } from "../ui/skeleton";

export default function RecomendateFeed() {
  const plugin = useRef(Autoplay({ delay: 5000 }));
  const { data, isLoading, isError } = useData<Feed[]>({
    token: "user",
    type: "items",
    collection: "feed",
    key: "feed",
    query: {
      filter: {
        status: "published",
      },
    },
  });

  return isLoading || isError ? (
    <Skeleton className="w-full aspect-[20/7] rounded-xl mb-6" />
  ) : (
    <Carousel
      className="w-full rounded-xl overflow-hidden mb-6"
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {(data ?? []).map((item) => (
          <CarouselItem key={item.id} className="basis-full">
            <Link
              href={item.url}
              target={item.url?.startsWith("http") ? "_blank" : "_self"}
            >
              <Photo
                src={getAssetUrl(item.cover)}
                alt={""}
                fit="cover"
                position="center"
                className="w-full h-full aspect-[20/7]"
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
