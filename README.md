# Módulo de Gestión de Promociones (Kódigo Fuente)

Esta es una aplicación web sencilla para **registrar, gestionar y validar promociones** aplicadas a categorías de productos en un sistema POS. 

El proyecto consta de un frontend desarrollado en **React (TypeScript) con Vite**, un backend en **Node.js (TypeScript) con Express y Prisma ORM**, y una base de datos **PostgreSQL**. Todo el flujo está dockerizado y listo para ejecutarse de forma local.

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
* [Node.js](https://nodejs.org/) (versión v18 o v22 - opcional para correr de forma local sin Docker)

---

## 🚀 Instalación y Ejecución Rápida (Recomendado)

A continuación, se mencionan los pasos a seguir para ejecutar el entorno completo (base de datos + backend + frontend) usando Docker:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/juanes1205/GestionPromociones/
   cd gestionPromociones
   ```

2. **Configurar las variables de entorno:**
   Copia el archivo de ejemplo `.env.example` y crea el archivo `.env` en la raíz del proyecto:
   ```bash
   cp .env.example .env
   ```

3. **Construir y levantar la aplicación:**
   Ejecuta el siguiente comando para construir las imágenes y encender los contenedores:
   ```bash
   docker compose up --build
   ```

4. **Acceder a los servicios:**
   Una vez esten los servicios ejecutandose, puedes acceder a:
   * **Frontend:** http://localhost:5173
   * **Backend:** http://localhost:3000
   * **API Health Check:** http://localhost:3000/health

---

## 💻 Desarrollo Local (Sin Docker)

Si prefieres ejecutar los servicios de forma local para propósitos de desarrollo rápido:

### 1. Base de Datos (PostgreSQL)
Puedes levantar únicamente PostgreSQL con Docker ejecutando:
```bash
docker compose up db -d
```

### 2. Levantar el Backend
Asegúrate de configurar el archivo `backend/.env` con la URL de conexión correcta para tu base de datos local.
```bash
cd backend
npm install
npx prisma migrate dev      # Correr migraciones locales
npx prisma db seed          # Ejecición de seeders
npm run dev                 # Iniciar servidor en modo desarrollo
```
* **Pruebas unitarias backend:** `npm run test`
* **Linter backend:** `npm run lint`

### 3. Levantar el Frontend
```bash
cd frontend
npm install
npm run dev                 # Iniciar servidor de desarrollo en http://localhost:5173
```
* **Pruebas unitarias frontend:** `npm run test`
* **Linter frontend:** `npm run lint`

---

## 📁 Estructura del Proyecto

* **`backend/`**: Contiene la API en Express + TypeScript.
  * `prisma/`: Esquemas de base de datos, migraciones y seeders.
  * `src/controllers/`: Controladores con validaciones y reglas de negocio.
  * `src/routes/`: Definición de endpoints de API y Health check.
  * `tests/`: Pruebas de integración y unitarias usando Jest y Supertest (mockeando base de datos).
* **`frontend/`**: Aplicación en React + Vite + TypeScript.
  * `src/components/`:
    * `Navbar.tsx`: Barra de navegación sticky (pestañas + estado del servidor).
    * `Footer.tsx`: Pie de página con branding y tech stack.
    * `Dashboard.tsx`: Tarjetas de estadísticas (Programadas, Activas, Finalizadas, Vigentes hoy).
    * `PromotionList.tsx`: Tabla de promociones con filtros y botón "Nueva Promoción".
    * `PromotionForm.tsx`: Formulario modal para crear promociones (se activa desde `PromotionList`).
    * `CategoryManager.tsx`: CRUD de categorías con filtro por nombre.
  * `src/utils/`: Funciones helpers de fechas con pruebas unitarias en Vitest.
  * `src/index.css`: Hoja de estilos con diseño responsivo en Modo Oscuro.
* **`.github/workflows/ci.yml`**: Configuración del flujo automatizado de CI/CD para GitHub Actions.
* **`docker-compose.yml`**: Configuración de servicios Docker.
* **`DECISIONS.md`**: Explicación detallada de las decisiones arquitectónicas y de UI.
