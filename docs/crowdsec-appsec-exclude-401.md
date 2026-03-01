# CrowdSec: исключение 401 от API auth

Сценарий `LePresidente/http-generic-401-bf` может банить IP при легитимных 401 (истёкшая сессия, проверка пользователя).

## Решение 1: AppSec config (рекомендуется)

Создайте `/etc/crowdsec/appsec-configs/exclude-api-auth-401.yaml`:

```yaml
name: custom/exclude-api-auth-401
description: Исключить /api/data/user и /api/upload из 401-bf
pre_eval:
  - filter: req.URL.Path == "/api/data/user" || req.URL.Path == "/api/upload"
    apply:
      - RemoveInBandRuleByName("crowdsecurity/http-generic-401-bf")
```

Подключите в `appsec.yaml`:

```yaml
configs:
  - custom/exclude-api-auth-401
```

## Решение 2: В приложении

В `useUser` отключён retry при 401 — один сбой даёт 1 запрос вместо 4.
