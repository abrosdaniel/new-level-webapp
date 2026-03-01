## Правила проекта

- Используем `npm` для установки зависимостей.
- Платежи через ЮКасса: API routes `/api/payments/create` и `/api/payments/webhook`. Переменные: `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `NEXT_PUBLIC_APP_URL`, `SUBSCRIPTION_PRICE` (опционально). Webhook защищён проверкой IP ЮКасса; для локального тестирования: `YOOKASSA_WEBHOOK_SKIP_IP_CHECK=true`.
- Исходящие вебхуки (n8n): при успешной регистрации — POST на `NEXT_PUBLIC_WEBHOOK_URL/webhook/register`, при успешной оплате — POST на `NEXT_PUBLIC_WEBHOOK_URL/webhook/payments`. Ключ авторизации в заголовке: `x-api-key: NEXT_PUBLIC_WEBHOOK_KEY`.
- Видео тренировок воспроизводятся через Kinescope (`@kinescope/react-kinescope-player`).
  - `videoId` получается из Directus в поле `training.video` (строка).
  - API route `/api/videos/[...path]` используется для получения данных о видео через Kinescope API (опционально).
  - Для работы API route нужны переменные окружения: `KINESCOPE_API_URL` и `KINESCOPE_API_TOKEN`.
- Анимации реализуем через `gsap`.
- Для серверных запросов и кеширования используем `@tanstack/react-query`.
- Следим за правилами ESLint и удаляем неиспользуемый код при изменениях.
