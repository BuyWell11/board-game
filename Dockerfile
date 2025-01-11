# Stage 1: Установка зависимостей и сборка проекта
FROM node:16 AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

# Сборка проекта
RUN npm run build

# Stage 2: Подготовка к запуску в production
FROM node:16

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только файлы сборки из предыдущего этапа
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Указываем порт, который слушает Next.js
EXPOSE 3000

# Запускаем сервер Next.js
CMD ["npm", "start"]
