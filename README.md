Avrora ERP System

Микросервисная ERP система для управления продуктами и клиентами.

Архитектура

Система построена на микросервисной архитектуре с разделением на:

- **Frontend** - React приложение с TypeScript
- **Product Service** - Django REST API для управления продуктами
- **Customer Service** - Django REST API для управления клиентами
- **Databases** - PostgreSQL для каждого сервиса

## Технологии

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- React Icons

### Backend
- Django 5.2
- Django REST Framework
- PostgreSQL
- psycopg2-binary
- django-cors-headers

### Инфраструктура
- Docker
- Docker Compose
- Caddy (веб-сервер для frontend)

## Структура проекта

```
avrora-test-erp/
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── api/            # API клиенты
│   │   └── types/          # TypeScript типы
│   └── package.json
├── services/                # Backend сервисы
│   ├── product_service/     # Сервис продуктов
│   ├── customer_service/    # Сервис клиентов
│   └── shared/             # Общие модули
├── docker/                  # Docker файлы
│   ├── frontend.Dockerfile
│   ├── products.Dockerfile
│   └── customers.Dockerfile
└── docker-compose.yml       # Конфигурация Docker Compose
```

## Запуск через Docker

### Требования
- Docker
- Docker Compose

### Команды запуска

1. Сборка и запуск всех сервисов:
```bash
docker-compose up --build
```

2. Запуск в фоновом режиме:
```bash
docker-compose up -d --build
```

3. Остановка сервисов:
```bash
docker-compose down
```

4. Просмотр логов:
```bash
docker-compose logs -f
```

### Доступные сервисы

После запуска будут доступны:

- **Frontend**: http://localhost:3000
- **Product API**: http://localhost:8001
- **Customer API**: http://localhost:8002
- **Products DB**: localhost:5433
- **Customers DB**: localhost:5434

Административные данные

Для каждого Django сервиса создается суперпользователь:
- Username: admin
- Password: admin
Frontend 

```bash
cd frontend
npm install
npm run dev
```

Backend


## API Endpoints

### Product Service (8001)
- GET /api/products/ - список продуктов
- POST /api/products/ - создание продукта
### Customer Service (8002)
- GET /api/customers/ - список клиентов
- POST /api/customers/ - создание клиента