"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Page, Link } from "@/components/Init";
import { Notice } from "@/components/Notice";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/custom-ui/button";
import { Input, InputPassword } from "@/components/custom-ui/fields";

import { ArrowRight } from "lucide-react";

type State = "request" | "reset" | "sent" | "success" | "error" | "loading";

const requestSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Пароль должен быть не менее 6 символов" }),
    confirm_password: z.string().min(1, { message: "Повторите пароль" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Пароли не совпадают",
    path: ["confirm_password"],
  });

type RequestFormData = z.infer<typeof requestSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [state, setState] = useState<State>("loading");

  const formRequest = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const formReset = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  const email = formRequest.watch("email");

  const showRequestForm = useMemo(
    () => !token && (state === "request" || state === "sent"),
    [token, state],
  );
  const showResetForm = useMemo(
    () => token && (state === "reset" || state === "success"),
    [token, state],
  );

  useEffect(() => {
    if (!token) {
      setState("request");
      return;
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        setState(data.valid ? "reset" : "error");
      })
      .catch(() => setState("error"));
  }, [token]);

  const onSubmitRequest = async (data: RequestFormData) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Ошибка");
      setState("sent");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Не удалось отправить ссылку для сброса пароля. Попробуйте позже.",
      );
    }
  };

  const onSubmitReset = async (data: ResetFormData) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Ошибка");
      setState("success");
      toast.success("Пароль успешно изменён! Теперь вы можете войти.");
      router.push("/login");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Не удалось изменить пароль. Попробуйте позже.",
      );
    }
  };

  if (state === "loading") {
    return (
      <Notice
        msg={{
          variant: "loading",
          title: "Проверка ссылки",
          description: "Проверяем данные для восстановления пароля…",
        }}
      />
    );
  }

  if (state === "error") {
    return (
      <Notice
        msg={{
          variant: "error",
          title: "Ссылка недействительна",
          description: (
            <span>
              Ссылка для сброса пароля устарела или уже использована.{" "}
              <Link
                href="/reset-password"
                className="text-center text-sm text-foreground hover:underline"
              >
                Запросить новую ссылку
              </Link>
            </span>
          ),
        }}
      />
    );
  }

  if (state === "sent") {
    return (
      <Notice
        msg={{
          variant: "sent",
          title: "Ссылка отправлена",
          description: (
            <p>
              Если на email адрес <span className="font-medium">{email}</span>{" "}
              существует аккаунт, то ссылка для сброса пароля отправлена.
              Проверьте почту и перейдите по ссылке.
              <br />
              <br />
              <Link
                href="/login"
                className="text-center text-sm text-foreground hover:underline"
              >
                Вернуться к входу
              </Link>
            </p>
          ),
        }}
      />
    );
  }

  if (state === "success") {
    return null;
  }

  return (
    <Page back={false} menu={false}>
      <div className="mx-4 my-5 flex flex-col gap-6 lg:max-w-md lg:mx-auto">
        <h1 className="text-lg font-semibold uppercase">
          Восстановление пароля
        </h1>

        {showRequestForm && state === "request" && (
          <Form {...formRequest}>
            <form
              onSubmit={formRequest.handleSubmit(onSubmitRequest)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={formRequest.control}
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
              <Button
                type="submit"
                disabled={formRequest.formState.isSubmitting}
                size="lg"
                className="group"
              >
                {formRequest.formState.isSubmitting ? "Отправка…" : "Отправить"}
                <ArrowRight className="!size-6 text-secondary-foreground group-hover:text-gray-400" />
              </Button>
            </form>
          </Form>
        )}

        {showResetForm && state === "reset" && (
          <Form {...formReset}>
            <form
              onSubmit={formReset.handleSubmit(onSubmitReset)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={formReset.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base leading-[1] font-medium">
                      Новый пароль
                    </FormLabel>
                    <FormControl>
                      <InputPassword {...field} placeholder="Введите пароль" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formReset.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base leading-[1] font-medium">
                      Повторите пароль
                    </FormLabel>
                    <FormControl>
                      <InputPassword
                        {...field}
                        placeholder="Повторите пароль"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={formReset.formState.isSubmitting}
                size="lg"
                className="group"
              >
                {formReset.formState.isSubmitting
                  ? "Смена пароля…"
                  : "Сменить пароль"}
                <ArrowRight className="!size-6 text-secondary-foreground group-hover:text-gray-400" />
              </Button>
            </form>
          </Form>
        )}

        <Link
          href="/login"
          className="text-center text-sm text-muted-foreground hover:underline"
        >
          Вернуться к входу
        </Link>
      </div>
    </Page>
  );
}
