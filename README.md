<p align="center">
<a href ="https://wnrs.ru" target="_blank" title="WINNERS">
<img src=".github/assets/logo.jpeg" width="150px" alt="WINNERS"/>
</a>
</p>
<div align="center">

[![Site/Version](https://img.shields.io/badge/app.newlevel.space-v_1.1-2A8F3B)](https://app.newlevel.space)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org)
[![Directus](https://img.shields.io/badge/Directus-263238?logo=directus)](https://directus.io)
[![N8N](https://img.shields.io/badge/N8N-EA4B71?logo=n8n&logoColor=white)](https://n8n.io)

</div>

## Introduction

New Level is a production-grade web application architected to deliver subscription-based sports content at scale. The platform was designed with a strong focus on performance, security, and long-term maintainability, aligning with modern engineering standards for content-driven systems.

The application is built with Next.js (App Router), leveraging React Server Components and hybrid rendering strategies (SSR/ISR) to balance SEO, performance, and dynamic personalization. The system follows a headless architecture, decoupling content management from presentation and enabling independent content operations without impacting deployment cycles.

Authentication and gated content delivery are implemented with secure token handling and role-based access control principles. API communication is centralized through a service layer, reducing coupling and improving testability. The application is optimized for performance through controlled hydration, efficient data fetching strategies, and minimized client-side footprint.

The platform was engineered not only as a content delivery tool but as a scalable digital product foundation capable of evolving into a broader ecosystem (subscriptions, analytics, automation, integrations).

# Table of Contents

1. [Features](#features)
2. [Stack](#stack)
3. [Quick Start](#quick-start)
4. [Credits](#credits)

## Features

- 🎥 **Premium Content Access** - Structured delivery of exclusive sports content
- 🔐 **Secure Authentication** - Token-based access control for gated materials
- 💳 **Subscription-Based Model** - Controlled access to premium resources
- 🗂 **Headless CMS Integration** - Flexible and scalable content management
- ⚡ **Next.js App Router Architecture** - Hybrid SSR/ISR rendering with React Server Components
- 🗄 **Service Layer Abstraction** - Centralized API communication and clean separation of concerns
- 📦 **Modular Component System** - Scalable, reusable UI architecture
- 🚀 **Performance Optimization** - Optimized hydration, image handling, and bundle size control
- 🔎 **Clear Content Navigation** - Categorized and logically structured content hierarchy

## Stack

- **Frontend:**
  ![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)
  ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?logo=tanstack)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
  ![Zod](https://img.shields.io/badge/Zod-408AFF?logo=zod&logoColor=white)
  ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?logo=reacthookform&logoColor=white)
  ![date-fns](https://img.shields.io/badge/date--fns-770C56?logo=date-fns&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
  ![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?logo=postcss)
  ![Radix UI](https://img.shields.io/badge/Radix_UI-161618?logo=radixui)
  ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?logo=shadcnui)
  ![Embla Carousel](https://img.shields.io/badge/Embla_Carousel-8FB3F6)
  ![Lucide](https://img.shields.io/badge/Lucide-F56565?logo=lucide&logoColor=white)
  ![Юkassa](https://img.shields.io/badge/Юkassa-0070f0)

- **Backend:**
  ![Directus](https://img.shields.io/badge/Directus-263238?logo=directus)
  ![N8N](https://img.shields.io/badge/N8N-EA4B71?logo=n8n&logoColor=white)
  ![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

- **Tools & Services:**
  ![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)
  ![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github)
  ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint)
  ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black)
  ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

## Quick Start

❗ **Prerequisites:**

- ✅ Node.js 20+ installed
- ✅ Directus with tables configured
- ✅ N8N with nodes set up

Clone the repository

```bash
git clone https://github.com/abrosdaniel/new-level-webapp.git
```

Install dependencies:

```bash
npm install
```

Create `.env` in the project root:

```env
NEXT_PUBLIC_APP_URL=your_project_url
AUTH_SECRET=your_generate_auth_key

NEXT_PUBLIC_DIRECTUS_URL=your_directus_url
DIRECTUS_TOKEN=your_directus_token

NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_telegram_bot_username
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

NEXT_PUBLIC_KINESCOPE_TOKEN=your_kinescope_token

YOOKASSA_SHOP_ID=your_yookassa_shop_id
YOOKASSA_SECRET_KEY=your_yookassa_secret_key

NEXT_PUBLIC_SELLER_NAME=your_seller_name
NEXT_PUBLIC_SELLER_INN=your_seller_inn
NEXT_PUBLIC_SELLER_OGRN=your_seller_ogrn
NEXT_PUBLIC_SELLER_EMAIL=your_seller_email

WEBHOOK_URL=your_wevhook_url
WEBHOOK_KEY=your_webhook_key
```

Standard Next.js commands:

```bash
npm run dev
npm run build
npm run start
```

## Credits

- **Developer:** [Daniel Abros](https://abros.dev)
- **Design:** [Daria Afanaseva](https://t.me/A_dari)
- **Client:** [Alexandra Balman](https://t.me/balmanalexandra)
