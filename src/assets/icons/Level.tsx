import { cn } from "@/lib/utils";

const LevelIcon = ({
  level,
  className,
}: {
  level: "easy" | "medium" | "hard";
  className?: string;
}) => {
  const getBarColor = (barIndex: number) => {
    // Полоски 1 и 2: активны для easy, medium, hard
    if (barIndex === 1 || barIndex === 2) {
      if (level === "easy") return "bg-green-500";
      if (level === "medium") return "bg-yellow-500";
      if (level === "hard") return "bg-red-500";
    }
    // Полоски 3 и 4: активны для medium и hard
    if (barIndex === 3 || barIndex === 4) {
      if (level === "medium") return "bg-yellow-500";
      if (level === "hard") return "bg-red-500";
    }
    // Полоски 5 и 6: активны только для hard
    if (barIndex === 5 || barIndex === 6) {
      if (level === "hard") return "bg-red-500";
    }
    return "bg-muted-foreground";
  };

  return (
    <div
      className={cn(
        "flex flex-row gap-[1px] items-end justify-between h-full w-full",
        className
      )}
    >
      <div className={cn("w-1/6 h-1/6 rounded-full", getBarColor(1))} />
      <div className={cn("w-1/6 h-2/6 rounded-full", getBarColor(2))} />
      <div className={cn("w-1/6 h-3/6 rounded-full", getBarColor(3))} />
      <div className={cn("w-1/6 h-4/6 rounded-full", getBarColor(4))} />
      <div className={cn("w-1/6 h-5/6 rounded-full", getBarColor(5))} />
      <div className={cn("w-1/6 h-full rounded-full", getBarColor(6))} />
    </div>
  );
};

export { LevelIcon };
