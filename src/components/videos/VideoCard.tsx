import { Video } from "@/types/videos";
import { Link } from "@/components/Init";
import { Photo } from "@/components/Photo";
import { getAssetUrl } from "@/lib/assets";
import { Badge } from "@/components/ui/badge";
import { Clock, Play } from "lucide-react";

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/videos/${video.sort}`}>
      <div className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.1)]">
        <div className="relative aspect-[9/5] rounded-b-2xl overflow-hidden">
          <Photo
            src={getAssetUrl(video.cover)}
            alt={`Бонусное видео ${video.sort}`}
            fit="cover"
            position="center"
            className="w-full h-full"
          />
          <div className="absolute bottom-2.5 right-2.5 p-2 bg-background/50 rounded-full backdrop-blur-sm inline-flex items-center gap-1.5 text-sm leading-[1.15] font-normal text-white">
            <Play className="size-2.5 fill-secondary-foreground text-secondary-foreground" />
          </div>
        </div>
        <div className="px-2 py-3.5">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 border-muted-foreground text-sm leading-[0.9] font-normal min-h-5 text-muted-foreground mb-2"
          >
            <Clock className="size-2.5 text-secondary-foreground" />
            {video.time} мин
          </Badge>
          <h3 className="text-base leading-[1.15] font-semibold line-clamp-1 uppercase mb-2">
            {video.title}
          </h3>
          <p className="text-sm leading-[0.9] text-muted-foreground line-clamp-2">
            {video.brief_description}
          </p>
        </div>
      </div>
    </Link>
  );
}
