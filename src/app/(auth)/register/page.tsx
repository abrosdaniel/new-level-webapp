"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { getSafeRedirect } from "@/lib/utils";

import { Page, Link } from "@/components/Init";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Photo } from "@/components/Photo";
import {
  Input,
  InputPassword,
  InputDate,
  RadioGroup,
} from "@/components/ds/fields";
import { Button } from "@/components/ds/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

import { ArrowRight } from "lucide-react";

const registerSchema = z
  .object({
    first_name: z.string().min(1, { message: "Введите имя" }),
    last_name: z.string().min(1, { message: "Введите фамилию" }),
    birthday: z.date({ message: "Введите дату рождения" }),
    gender: z.enum(["male", "female"], { message: "Выберите пол" }),
    email: z.string().email({ message: "Введите корректный email" }),
    password: z
      .string()
      .min(6, { message: "Пароль должен быть не менее 6 символов" }),
    confirm_password: z.string().min(1, { message: "Введите пароль еще раз" }),
    terms: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Пароли не совпадают",
    path: ["confirm_password"],
  })
  .refine((data) => data.terms === true, {
    message: "Вы должны согласиться с условиями",
    path: ["terms"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { refetch } = useUser();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      birthday: new Date(),
      gender: "female",
      email: "",
      password: "",
      confirm_password: "",
      terms: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      await refetch();
      toast.success("Успех! Добро пожаловать в New Level!");
      router.replace(redirectTo);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при регистрации",
      );
    }
  };

  return (
    <Page back={false} menu={false}>
      <div className="flex flex-col gap-6 lg:max-w-md lg:mx-auto">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl leading-[1.1] font-bold text-center uppercase">
            Добро пожаловать
            <br />
            <span className="text-secondary-foreground">в New Level</span>
          </h1>
          <p className="text-base leading-[1] font-medium text-center text-foreground">
            приложение с авторскими тренировками от блогера Александры Бальман!
          </p>
        </div>
        <Photo
          src="/assets/auth-hero.png"
          alt="Hero"
          className="aspect-video"
          fit="contain"
        />
        <p className="text-base leading-[1.15] font-normal text-muted-foreground">
          Создай свой профиль, чтобы отслеживать прогресс во время тренировок.
          Регистрация займёт меньше минуты — после неё ты попадёшь в приложение
          и сможешь оплатить курс.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base leading-[1] font-medium">
                      Ваше имя
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Имя" {...field} />
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
                    <FormLabel className="text-base leading-[1] font-medium">
                      Ваша фамилия
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Фамилия" {...field} />
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
                    <FormLabel className="text-base leading-[1] font-medium">
                      Дата рождения
                    </FormLabel>
                    <FormControl>
                      <InputDate
                        placeholder="Дата рождения"
                        value={field.value}
                        onChange={field.onChange}
                        defaultMonth={field.value}
                        captionLayout="dropdown"
                      />
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
                    <FormLabel className="text-base leading-[1] font-medium">
                      Ваш пол
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        options={[
                          { value: "female", label: "Женский" },
                          { value: "male", label: "Мужской" },
                        ]}
                        classNames={{
                          group: "flex flex-row gap-5",
                          label: "text-base leading-[1] font-medium",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base leading-[1] font-medium">
                      Ваш email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@yandex.ru"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base leading-[1] font-medium">
                      Ваш пароль
                    </FormLabel>
                    <FormControl>
                      <InputPassword
                        {...field}
                        placeholder="Придумайте пароль для входа"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base leading-[1] font-medium">
                      Повторите пароль
                    </FormLabel>
                    <FormControl>
                      <InputPassword
                        {...field}
                        placeholder="Введите пароль еще раз"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormLabel className="flex items-start gap-2">
                        <Checkbox
                          value={field.value ? "true" : "false"}
                          onCheckedChange={
                            field.onChange as (checked: boolean) => void
                          }
                          className="size-4 border-gray-300 data-[state=checked]:bg-secondary-foreground"
                        />
                        <div className="flex flex-col gap-1.5 text-muted-foreground">
                          <p className="text-sm font-medium leading-[1.15]">
                            Согласие на обработку персональных данных
                          </p>
                          <p className="text-xs font-normal leading-[1.15]">
                            Я согласен с{" "}
                            <Link
                              href="/documents/privacy-policy"
                              target="_blank"
                              className="underline"
                            >
                              политикой конфиденциальности
                            </Link>{" "}
                            и{" "}
                            <Link
                              href="/documents/personal-data-consent"
                              target="_blank"
                              className="underline"
                            >
                              условиями обработки персональных данных
                            </Link>
                          </p>
                        </div>
                      </FormLabel>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-7">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="group"
              >
                {isSubmitting ? (
                  <>
                    <span>Регистрация…</span>
                    <Spinner className="!size-6" />
                  </>
                ) : (
                  <>
                    <span>Начать тренировки!</span>
                    <ArrowRight className="!size-6 text-secondary-foreground group-hover:text-gray-400" />
                  </>
                )}
              </Button>
              <p className="text-base text-center text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link
                  href={
                    redirectTo !== "/"
                      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                      : "/login"
                  }
                  className="text-sm text-secondary-foreground hover:underline"
                >
                  Войти
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </Page>
  );
}
