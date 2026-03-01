import { Button as ButtonUI } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "rounded-xl text-base leading-[1] font-medium !ring-0 !focus:ring-0 !outline-none",
  {
    variants: {
      custom: {
        default: "",
        black: "w-full",
        grey: "w-full bg-[#8D8E90] text-white hover:text-[#8D8E90]",
        white: "w-full bg-white text-black hover:text-[#8D8E90]",
      },
    },
    defaultVariants: {
      custom: "black",
    },
  },
);

export type ButtonProps = React.ComponentProps<typeof ButtonUI> &
  VariantProps<typeof buttonVariants>;

export const Button = ({
  custom = "default",
  children,
  className,
  ...props
}: ButtonProps) => {
  const customKey = custom ?? "black";
  return (
    <ButtonUI
      className={cn(buttonVariants({ custom: customKey }), className)}
      {...props}
    >
      {children}
    </ButtonUI>
  );
};
