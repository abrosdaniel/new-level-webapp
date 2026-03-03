import type { Metadata } from "next";

import "@/assets/styles/tailwind.css";
import "@/assets/styles/wysiwyg.css";
import { fontJost } from "@/assets/fonts/fonts";

import { Provider } from "@/app/provider";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

export const metadata: Metadata = {
  title: "НОВЫЙ УРОВЕНЬ",
  description: "Приложение с тренировками от Александры Бальман",
  applicationName: "НОВЫЙ УРОВЕНЬ",
  generator: "Next.js",
  creator: "Alexander Balman",
  publisher: "Alexander Balman",
  metadataBase: new URL(appUrl),
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "НОВЫЙ УРОВЕНЬ — приложение с тренировками от Александры Бальман",
    description:
      "Привет! Ты в НОВЫЙ УРОВЕНЬ - приложении тренировок от Александры Бальман.Начинай свой путь к красивому и сильному телу прямо сейчас!",
    url: appUrl,
    siteName: "НОВЫЙ УРОВЕНЬ",
    images: [
      {
        url: `${appUrl}/assets/auth-hero.png`,
        width: 736,
        height: 306,
        alt: "НОВЫЙ УРОВЕНЬ — приложение с тренировками от Александры Бальман",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "НОВЫЙ УРОВЕНЬ — приложение с тренировками от Александры Бальман",
    description:
      "Привет! Ты в НОВЫЙ УРОВЕНЬ - приложении тренировок от Александры Бальман.Начинай свой путь к красивому и сильному телу прямо сейчас!",
    images: [`${appUrl}/assets/auth-hero.png`],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body
        className={`${fontJost.variable} pt-[var(--tg-safe-area-inset-top)] pb-[var(--tg-safe-area-inset-bottom)] pl-[var(--tg-safe-area-inset-left)] pr-[var(--tg-safe-area-inset-right)] font-jost antialiased`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
