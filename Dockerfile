# syntax=docker/dockerfile:1
# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости (включая dev для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Build args для NEXT_PUBLIC_* (встраиваются в билд) — задать в Dokploy: Build Time Arguments
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DIRECTUS_URL
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ARG NEXT_PUBLIC_KINESCOPE_TOKEN
ARG NEXT_PUBLIC_SELLER_NAME
ARG NEXT_PUBLIC_SELLER_INN
ARG NEXT_PUBLIC_SELLER_OGRN
ARG NEXT_PUBLIC_SELLER_EMAIL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_DIRECTUS_URL=$NEXT_PUBLIC_DIRECTUS_URL
ENV NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ENV NEXT_PUBLIC_KINESCOPE_TOKEN=$NEXT_PUBLIC_KINESCOPE_TOKEN
ENV NEXT_PUBLIC_SELLER_NAME=$NEXT_PUBLIC_SELLER_NAME
ENV NEXT_PUBLIC_SELLER_INN=$NEXT_PUBLIC_SELLER_INN
ENV NEXT_PUBLIC_SELLER_OGRN=$NEXT_PUBLIC_SELLER_OGRN
ENV NEXT_PUBLIC_SELLER_EMAIL=$NEXT_PUBLIC_SELLER_EMAIL

# Сборка приложения
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Копируем public и static в standalone (Next.js не копирует их автоматически)
RUN cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создаём непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем standalone-сборку (public и static уже скопированы в builder)
COPY --from=builder /app/.next/standalone ./

USER nextjs

EXPOSE 3010

ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
