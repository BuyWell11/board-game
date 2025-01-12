# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект в контейнер
COPY . .

# Сборка Next.js приложения
RUN npm run build

# Этап 2: Запуск production-версии
FROM node:20-alpine AS runner

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Устанавливаем только production-зависимости
RUN npm install --omit=dev

# Указываем порт, который будет использоваться
EXPOSE 3000

# Устанавливаем NODE_ENV в production
ENV NODE_ENV=production

# Запускаем приложение
CMD ["npm", "run", "start"]
