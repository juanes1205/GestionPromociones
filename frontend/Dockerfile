# --- Stage 1: Build ---
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Recibir VITE_API_URL como argumento de construcción
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compilar frontend
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
