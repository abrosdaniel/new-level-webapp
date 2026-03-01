"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ru as ruCalendar } from "react-day-picker/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Input as InputUI } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  RadioGroup as RadioGroupUI,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { Eye, EyeOff, CalendarIcon, CopyIcon } from "lucide-react";

export const Input = ({
  className,
  ...props
}: React.ComponentProps<typeof InputUI>) => {
  return (
    <InputUI
      className={cn(
        "text-base leading-[1.15] font-normal !px-3 !py-4 !h-auto border-gray-200 rounded-xl shadow-sm focus-visible:ring-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
};

export const InputPassword = ({
  className,
  ...props
}: React.ComponentProps<typeof InputUI>) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
      >
        {visible ? (
          <EyeOff className="size-4 text-muted-foreground" />
        ) : (
          <Eye className="size-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};

type InputDateProps = Omit<
  React.ComponentProps<typeof InputUI>,
  "value" | "onChange" | "type"
> & {
  value?: Date | string;
  onChange?: (date: Date) => void;
  defaultMonth?: Date;
  captionLayout?: "dropdown" | "label";
};

export const InputDate = ({
  className,
  value,
  onChange,
  placeholder = "Выберите дату",
  disabled,
  defaultMonth,
  captionLayout = "label",
  ...props
}: InputDateProps) => {
  const [open, setOpen] = useState(false);
  const date = value
    ? typeof value === "string"
      ? new Date(value)
      : value
    : undefined;
  const isValidDate = date && !Number.isNaN(date.getTime());

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(date);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <Input
          readOnly
          disabled={disabled}
          placeholder={placeholder}
          value={isValidDate ? format(date, "d MMMM yyyy", { locale: ru }) : ""}
          className={cn("pr-10 cursor-pointer", className)}
          onClick={() => !disabled && setOpen(true)}
          {...props}
        />
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            aria-label="Открыть календарь"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0 rounded-xl" align="end">
        <Calendar
          mode="single"
          locale={ruCalendar}
          selected={isValidDate ? date : undefined}
          defaultMonth={defaultMonth}
          captionLayout={captionLayout}
          onSelect={handleSelect}
          classNames={{
            root: "rounded-xl",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export const RadioGroup = ({
  classNames,
  value,
  onChange,
  options,
  ...props
}: React.ComponentProps<typeof RadioGroupUI> & {
  classNames?: {
    group?: string;
    label?: string;
    item?: string;
  };
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: React.ReactNode }[];
}) => {
  return (
    <RadioGroupUI
      value={value}
      onValueChange={onChange}
      className={cn(classNames?.group)}
      {...props}
    >
      {options.map((option) => (
        <Label
          className={cn(
            "flex items-center gap-3 cursor-pointer",
            classNames?.label,
          )}
          key={option.value}
        >
          <RadioGroupItem
            value={option.value}
            className={cn("size-4 border-gray-300", classNames?.item)}
            classDot="size-2 fill-secondary-foreground text-secondary-foreground"
          />
          {option.label}
        </Label>
      ))}
    </RadioGroupUI>
  );
};

export const InputCopy = ({
  className,
  message = "Текст скопирован",
  ...props
}: React.ComponentProps<typeof InputUI> & { message?: string }) => {
  return (
    <div className="relative">
      <InputUI className={cn("cursor-pointer pr-10", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        aria-label="Скопировать"
        onClick={() => {
          navigator.clipboard.writeText(props.value as string);
          toast.success(message);
        }}
      >
        <CopyIcon className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
};
