import { cn } from "@/lib/utils";
import Image from "next/image";

function Photo({
  src,
  alt,
  fit = "cover",
  position = "center",
  className,
  loading,
  onClick,
}: {
  src: string;
  alt: string;
  fit?: "contain" | "cover";
  position?: "center" | "top" | "bottom" | "left" | "right";
  className?: string;
  loading?: "lazy" | "eager";
  onClick?: () => void;
}) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <Image
        className={cn(
          fit === "contain" ? "object-contain" : "object-cover",
          position === "center"
            ? "object-center"
            : position === "top"
              ? "object-top"
              : position === "bottom"
                ? "object-bottom"
                : position === "left"
                  ? "object-left"
                  : "object-right",
        )}
        src={src}
        alt={alt}
        fill
        loading={loading}
        onClick={onClick}
      />
    </div>
  );
}

export { Photo };
