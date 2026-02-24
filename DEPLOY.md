# Деплой на Dokploy

## Переменные окружения

В **Environment** (runtime) должны быть заданы:

- `NEXT_PUBLIC_APP_URL` — полный URL приложения (например `https://app.newlevel.space`)
- `NEXT_PUBLIC_DIRECTUS_URL` — URL Directus (например `https://db.newlevel.space`)
- `AUTH_SECRET` — секрет для JWT
- `DIRECTUS_TOKEN` — токен Directus (для admin API)
- `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- Остальные переменные из `.env`

## Build Time Arguments

Для корректной сборки в **Build Time Arguments** добавьте:

- `NEXT_PUBLIC_APP_URL` — тот же URL, что и в Environment
- `NEXT_PUBLIC_DIRECTUS_URL` — тот же URL

## Типичные проблемы

### «Email обязателен» при восстановлении пароля

- Если видите **«NEXT_PUBLIC_DIRECTUS_URL не настроен»** — добавьте переменную в Environment.
- Если видите **«NEXT_PUBLIC_APP_URL не настроен»** — добавьте переменную в Environment.
- Если ошибка «Email обязателен» — проверьте, что запрос доходит до API (DevTools → Network).

### Вход не работает (логин не сохраняется)

1. **HTTPS** — приложение должно открываться по `https://`. Cookies с `Secure` не работают по HTTP.
2. **Проверка cookies** — DevTools → Application → Cookies. После логина должны появиться `directus_token` и `directus_refresh_token`.
3. **Прокси** — если перед приложением стоит reverse proxy (Traefik, Nginx), он не должен удалять заголовок `Set-Cookie`.
