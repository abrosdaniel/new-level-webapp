"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { retrieveRawInitData } from "@tma.js/sdk-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlatform } from "@/components/Init";
import { getSafeRedirect } from "@/lib/utils";

import { Page, Link } from "@/components/Init";
import { Photo } from "@/components/Photo";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputPassword } from "@/components/ds/fields";
import { Button } from "@/components/ds/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Spinner } from "@/components/ui/spinner";
import { ArrowRight } from "lucide-react";

function generatePassword(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

function parseInitDataUser(
  initData: string,
): { first_name?: string; last_name?: string } | null {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    return userStr
      ? (JSON.parse(decodeURIComponent(userStr)) as {
          first_name?: string;
          last_name?: string;
        })
      : null;
  } catch {
    return null;
  }
}

const emailSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  terms: z.boolean().refine((v) => v === true, {
    message: "Необходимо согласие на обработку персональных данных",
  }),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Пароль должен быть не менее 6 символов" }),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function TgLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const platform = usePlatform();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const [initData, setInitData] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "password">("email");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const { checkEmail, login, register } = useAuth();

  useEffect(() => {
    const data = retrieveRawInitData();
    setInitData(data ?? null);
  }, []);

  useEffect(() => {
    if (platform === "web") {
      const q =
        redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
      router.replace(`/login${q}`);
    }
  }, [platform, router, redirectTo]);

  const telegramOpts = initData
    ? { platform: "telegram" as const, initData }
    : null;

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", terms: false },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    if (!telegramOpts) {
      toast.error("Ошибка инициализации");
      return;
    }
    try {
      const exists = await checkEmail(data.email);
      setEmailExists(exists);
      if (exists) {
        setStep("password");
        passwordForm.reset({ password: "" });
      } else {
        const tgUser = parseInitDataUser(initData!);
        const firstName = tgUser?.first_name ?? "";
        const lastName = tgUser?.last_name ?? "";
        const password = generatePassword();
        await register({
          first_name: firstName,
          last_name: lastName,
          birthday: new Date("2000-01-01"),
          gender: "female",
          email: data.email,
          password,
          confirm_password: password,
          terms: data.terms,
          ...telegramOpts,
        });
        toast.success("Успех! Добро пожаловать!");
        router.replace(redirectTo);
      }
    } catch {
      toast.error("Ошибка проверки email");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!telegramOpts) return;
    const email = emailForm.getValues("email");
    try {
      await login({ email, password: data.password, ...telegramOpts });
      router.replace(redirectTo);
    } catch (err) {
      toast.error("Неверный пароль");
    }
  };

  if (platform === "web" || !initData) {
    return null;
  }

  return (
    <Page back={false} menu={false}>
      <div className="flex flex-col gap-6 lg:max-w-md lg:mx-auto">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl leading-[1.1] font-bold text-center uppercase">
            Добро пожаловать
          </h1>
          <p className="text-base leading-[1] font-medium text-center text-foreground">
            приложение с авторскими тренировками от блогера Александры Бальман!
          </p>
        </div>
        <Photo
          src="/assets/auth-hero.png"
          alt="Hero"
          className="aspect-video rounded-2xl overflow-hidden"
          fit="cover"
        />

        {step === "email" ? (
          <>
            <p className="text-base leading-[1.15] text-muted-foreground">
              Чтобы полноценно пользоваться приложением, нам нужен ваш email.
              После откроется доступ к личному кабинету, где вы сможете оплатить
              курс.
            </p>
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="flex flex-col gap-6"
              >
                <FormField
                  control={emailForm.control}
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
                  control={emailForm.control}
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
                <Button
                  type="submit"
                  disabled={emailForm.formState.isSubmitting}
                  size="lg"
                  className="group"
                >
                  {emailForm.formState.isSubmitting ? (
                    <>
                      <span>
                        {emailExists === null ? "Проверка…" : "Регистрация…"}
                      </span>
                      <Spinner className="!size-6" />
                    </>
                  ) : (
                    <>
                      <span>Продолжить</span>
                      <ArrowRight className="!size-6 text-secondary-foreground group-hover:text-gray-400" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <p className="text-base leading-[1.15] text-center text-muted-foreground">
              Мы нашли ваш профиль! Введите пароль для входа в приложение и
              начните тренироваться!
            </p>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="flex flex-col gap-6"
              >
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base leading-[1] font-medium">
                        Пароль
                      </FormLabel>
                      <FormControl>
                        <InputPassword
                          {...passwordForm.register("password", {
                            required: "Введите пароль",
                            minLength: {
                              value: 6,
                              message: "Пароль должен быть не менее 6 символов",
                            },
                          })}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  size="lg"
                  className="group"
                >
                  {passwordForm.formState.isSubmitting ? (
                    <>
                      <span>Вход…</span>
                      <Spinner className="!size-6" />
                    </>
                  ) : (
                    <>
                      <span>Продолжить</span>
                      <ArrowRight className="!size-6 text-secondary-foreground group-hover:text-gray-400" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </div>
    </Page>
  );
}
