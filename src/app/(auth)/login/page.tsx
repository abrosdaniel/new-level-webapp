"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { getSafeRedirect } from "@/lib/utils";

import { Page, Link } from "@/components/Init";
import { Photo } from "@/components/Photo";
import { Button } from "@/components/ds/button";
import { Input, InputPassword } from "@/components/ds/fields";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";

import { ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(1, { message: "Введите пароль" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password });
      router.replace(redirectTo);
    } catch (err) {
      toast.error("Неверный email или пароль");
    }
  };

  return (
    <Page back={false} menu={false}>
      <div className="flex flex-col gap-6 lg:max-w-md lg:mx-auto">
        <Photo
          src="/assets/auth-hero.png"
          alt="Hero"
          className="aspect-video"
          fit="contain"
        />
        <h1 className="text-2xl leading-[1.1] font-bold text-center uppercase">
          Добро пожаловать
          <br />
          <span className="text-secondary-foreground">в New Level</span>
        </h1>
        <p className="text-base leading-[1.15] font-regular text-center text-muted-foreground">
          Введите свой email и пароль, чтобы перейти к тренировкам
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="space-y-3">
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
                      <InputPassword {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Link
                  href="/reset-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Восстановить пароль
                </Link>
              </div>
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
                    <span>Вход…</span>
                    <Spinner className="!size-6" />
                  </>
                ) : (
                  <>
                    <span>Войти</span>
                    <ArrowRight className="!size-6 text-secondary-foreground group-hover:text-gray-400" />
                  </>
                )}
              </Button>
              <p className="text-base text-center text-muted-foreground">
                Еще нет аккаунта?{" "}
                <Link
                  href={
                    redirectTo !== "/"
                      ? `/register?redirect=${encodeURIComponent(redirectTo)}`
                      : "/register"
                  }
                  className="text-sm text-secondary-foreground hover:underline"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </Page>
  );
}
