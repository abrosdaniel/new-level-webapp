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
