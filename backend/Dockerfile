# Stage 1: Установка зависимостей и компиляция TypeScript
FROM node:16 AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем все файлы из корня
COPY . .

# Компилируем TypeScript
RUN npx tsc

# Stage 2: Запуск production-образа
FROM node:16

WORKDIR /app

# Копируем только скомпилированные файлы и зависимости
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/index.js"]
