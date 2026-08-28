# --- Stage 1: Build ---
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Generar Prisma Client
RUN npm run prisma:generate

# Compilar TypeScript
RUN npm run build

# --- Stage 2: Production ---
FROM node:24-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Instalar solo dependencias de producción
RUN npm install --only=production

# Copiar archivos compilados y dependencias generadas desde el builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

# Exponer el puerto del Backend
EXPOSE 3000

# Script de arranque: corre migraciones, seeder datos iniciales e inicia el servidor
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node dist/server.js"]
