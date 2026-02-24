"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { User } from "@/types/user";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/custom-ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputDate, RadioGroup } from "@/components/custom-ui/fields";
import { Spinner } from "@/components/ui/spinner";

import { PencilLine } from "@/assets/icons/App";
import { ArrowRightIcon } from "lucide-react";

const updateSchema = z.object({
  first_name: z.string().min(1, { message: "Введите имя" }),
  last_name: z.string().min(1, { message: "Введите фамилию" }),
  gender: z.enum(["male", "female"], { message: "Выберите пол" }),
  phone: z.string().min(10, { message: "Введите корректный номер телефона" }),
  birthday: z.date({ message: "Введите дату рождения" }),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function EditProfile({ user }: { user: User }) {
  const { update, isUpdating, refetch } = useUser();
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      phone: user?.phone ?? "",
      gender: user?.gender ?? "female",
      birthday: user?.birthday ? new Date(user.birthday) : new Date(),
    },
  });

  const onSubmit = async (data: UpdateFormData) => {
    try {
      await update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        gender: data.gender,
        birthday: data.birthday.toISOString().split("T")[0],
      });
      await refetch();
      toast.success("Профиль успешно обновлён!");
      setOpen(false);
    } catch (error) {
      toast.error("Ошибка при обновлении профиля. Попробуйте позже.");
      console.error("Error updating profile:", error);
    }
  };

  useEffect(() => {
    if (!open || !user) return;
    const bd = user.birthday ? new Date(user.birthday) : new Date();
    form.reset({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone: user.phone ?? "",
      gender: user.gender ?? "female",
      birthday: Number.isNaN(bd.getTime()) ? new Date() : bd,
    });
  }, [open, user, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-white rounded-full"
          size="icon"
        >
          <PencilLine className="!size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-auto w-[calc(100%-2rem)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base leading-[1.15] font-semibold uppercase text-center">
            Редактировать профиль
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ваше имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Ваше имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ваша фамилия</FormLabel>
                  <FormControl>
                    <Input placeholder="Ваша фамилия" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ваш пол</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { value: "female", label: "Женский" },
                        { value: "male", label: "Мужской" },
                      ]}
                      className="flex flex-row gap-5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер телефона</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Ваш телефон"
                      pattern="^\+?\d{10,15}$"
                      inputMode="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата рождения</FormLabel>
                  <FormControl>
                    <InputDate
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Выберите дату рождения"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <span>Обновление…</span>
                  <Spinner className="!size-6" />
                </>
              ) : (
                <>
                  <span>Обновить профиль</span>
                  <ArrowRightIcon className="!size-5 text-secondary-foreground" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
