import { cn } from "@/lib/utils";

export function WYSIWYG({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("wysiwyg text-start", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
