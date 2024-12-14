Через Swagger заголовки могут не добавляться. попробуйте через Postman

# Trainy Day Backend


## Технологии
- **NestJS**
- **Prisma**
- **PostgreSQL**
- **Docker**

## Установка и запуск


Склонируйте репозиторий с помощью команды:
```bash
git clone git@github.com:Vovarama1992/trainy-day.git

Перейдите в папку проекта:

cd trainy-day

Создайте файл .env в корне проекта и добавьте переменные окружения:

DATABASE_URL=postgresql://my_user:my_password@my_postgres:5432/my_database
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

docker-compose build --no-cache

docker-compose up -d

Документация будет доступна по адресу

http://localhost:3001/api/docs

Использование токенов в Swagger UI
Авторизация в системе:

Воспользуйтесь маршрутом POST /auth/login.
В теле запроса укажите:
{
  "email": "user@example.com",
  "password": "Pass123$"
}
После успешного ответа вы получите:
{
  "accessToken": "<your_access_token>",
  "refreshToken": "<your_refresh_token>"
}

Добавление accessToken в заголовки запросов:

Скопируйте значение accessToken, полученное на предыдущем шаге.
В Swagger UI нажмите на кнопку Authorize (в верхнем правом углу интерфейса Swagger).
В открывшемся окне введите токен в формате:

Bearer <your_access_token>

Например:

Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjk3MzcxMjAwLCJleHAiOjE2OTczNzQ4MDB9.DRwvFf8JvJiknFPc93A24P8jkmnT1a3_o2GwZR6ksoQ
Нажмите Authorize и закройте окно.


Отправка запросов с авторизацией:

Теперь все запросы, требующие авторизации, будут автоматически включать заголовок Authorization с вашим токеном.
Например, отправьте запрос на маршрут GET /users/me для получения информации о текущем пользователе.
Обновление токена:

Если accessToken истёк, используйте маршрут POST /auth/refresh-token.
Передайте refreshToken в заголовке Authorization:

Bearer <your_refresh_token>
В ответе вы получите новый accessToken, который нужно снова добавить в Swagger.