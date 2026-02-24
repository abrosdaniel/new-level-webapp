"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/custom-ui/fields";
import type { UseFormReturn } from "react-hook-form";

const FIELD_NAMES = [
  "weight",
  "height",
  "chest",
  "waist",
  "hips",
  "thigh_left",
  "thigh_right",
  "arm_left",
  "arm_right",
] as const;

type FieldName = (typeof FIELD_NAMES)[number];

const FIELDS: Array<{
  name: FieldName;
  label: string;
  step?: string;
  placeholder?: string;
}> = [
  { name: "weight", label: "Вес, кг", step: "0.1", placeholder: "65.5" },
  { name: "height", label: "Рост, см", step: "1", placeholder: "165" },
  { name: "chest", label: "Обхват груди, см", step: "0.01", placeholder: "90" },
  { name: "waist", label: "Обхват талии, см", step: "0.01", placeholder: "70" },
  { name: "hips", label: "Обхват бёдер, см", step: "0.01", placeholder: "90" },
  {
    name: "thigh_left",
    label: "Левое бедро, см",
    step: "0.01",
    placeholder: "50",
  },
  {
    name: "thigh_right",
    label: "Правое бедро, см",
    step: "0.01",
    placeholder: "50",
  },
  { name: "arm_left", label: "Левая рука, см", step: "0.01", placeholder: "30" },
  {
    name: "arm_right",
    label: "Правая рука, см",
    step: "0.01",
    placeholder: "30",
  },
];

export function MeasurementFields({
  form,
  disabled,
  showPlaceholders = false,
}: {
  form: UseFormReturn<Record<FieldName, number>>;
  disabled?: boolean;
  showPlaceholders?: boolean;
}) {
  return (
    <>
      {FIELDS.map(({ name, label, step, placeholder }) => (
        <FormField
          key={name}
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base leading-[1] font-medium">
                {label}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step={step}
                  placeholder={showPlaceholders ? placeholder : undefined}
                  disabled={disabled}
                  {...field}
                  value={field.value ?? (showPlaceholders ? "" : 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
}
