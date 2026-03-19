# Phone AI Caller

Демо fullstack-проекта интернет-магазина парфюмов. После оформления заказа AI-обзвонщик звонит покупателю и помогает подтвердить заказ.  
Все работает через Docker Compose (без обязательного локального запуска вне контейнеров).

## Стек
- Frontend: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + Framer Motion
- Backend: Go HTTP API (модульная структура, chi router)
- PostgreSQL
- Adminer (отдельный контейнер)
- Zustand (корзина) + Framer Motion (анимации)

Фронтенд больше не работает с PostgreSQL напрямую: все операции с данными идут через Go backend по HTTP API.

## Переменные окружения
1. Создайте файл `.env` из `.env.example`.
2. В `.env` задайте `ADMIN_SECRET_KEY` — он используется для доступа к скрытой админке.

Пример `.env.example` расположен в корне проекта.

## Запуск
1. Соберите и запустите все сервисы:
   ```bash
   docker compose up --build
   ```
2. После старта доступно:
   - `http://localhost:3000/` (лендинг)
   - `http://localhost:3000/shop` (магазин)
   - `http://localhost:3000/cart` (корзина)
   - `http://localhost:3000/admin` (скрытая админка)
3. Adminer:
   - `http://localhost:8080/`
4. Backend health:
   - `http://localhost:8081/healthz`
5. PostgreSQL при необходимости:
   - `localhost:5432`

## Инициализация схемы и seed
При старте контейнера `backend` выполняется:
- создание таблиц `Product`, `Order`, `OrderItem` в PostgreSQL (`CREATE TABLE IF NOT EXISTS`, idempotent)
- upsert 2 стартовых товаров:
  - `Noir Velvet`
  - `Amber Essence`

## Скрытая админка
- В интерфейсе нет кнопки/ссылки на `/admin`.
- Перейдите по прямому URL: `http://localhost:3000/admin`.
- Введите секретный ключ из `ADMIN_SECRET_KEY` в `.env`.
- В админке можно:
  - менять `confirmationStatus` у заказов (неподтверждено / подтверждено)
  - создавать новые товары (они появятся в `/shop` после создания)

## Backend API (REST)
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/orders`
- `POST /api/admin/unlock` (secret key -> cookie)
- `GET /api/admin/verify`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `POST /api/admin/products`

