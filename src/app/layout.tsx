import type { Metadata } from "next";

import "@/assets/styles/tailwind.css";
import "@/assets/styles/wysiwyg.css";
import { fontJost } from "@/assets/fonts/fonts";

import { Provider } from "@/app/provider";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

export const metadata: Metadata = {
  title: "New Level",
  description: "Приложение с тренировками от Александры Бальман",
  applicationName: "New Level",
  generator: "Next.js",
  creator: "Alexander Balman",
  publisher: "Alexander Balman",
  metadataBase: new URL(appUrl),
  icons: {
    icon: "/assets/logo.jpeg",
    shortcut: "/assets/logo.jpeg",
    apple: "/assets/logo.jpeg",
  },
  openGraph: {
    title: "New Level — приложение с тренировками от Александры Бальман",
    description:
      "Привет! Ты в New Level - приложении тренировок от Александры Бальман.Начинай свой путь к красивому и сильному телу прямо сейчас!",
    url: appUrl,
    siteName: "New Level",
    images: [
      {
        url: `${appUrl}/assets/auth-hero.jpeg`,
        width: 736,
        height: 306,
        alt: "New Level — приложение с тренировками от Александры Бальман",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Level — приложение с тренировками от Александры Бальман",
    description:
      "Привет! Ты в New Level - приложении тренировок от Александры Бальман.Начинай свой путь к красивому и сильному телу прямо сейчас!",
    images: [`${appUrl}/assets/auth-hero.jpeg`],
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
