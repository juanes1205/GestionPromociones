# Decisiones Tecnológicas: Módulo de Gestión de Promociones

Este archivo justifica las elecciones tecnológicas y de arquitectura implementadas en la solución del desafío técnico para Kódigo Fuente.

---

## 1. Lenguaje y Arquitectura General
* **TypeScript (Fullstack):** Se eligió TypeScript tanto para el backend (Node.js/Express) como para el frontend (React) para unificar el lenguaje del proyecto y garantizar un tipado estricto. Esto ayuda a prevenir errores comunes en tiempo de ejecución (como campos nulos, tipos incorrectos de fechas y errores ortográficos en los payloads) y proporciona una experiencia de desarrollo superior con autocompletado y validaciones estáticas.
* **Estructura Monorrepósito:** Se estructuró el proyecto dividiendo `backend/` y `frontend/` en carpetas desacopladas. Esto facilita tanto el desarrollo local independiente como el flujo de empaquetado en contenedores Docker y la orquestación.

--- 

## 2. Backend (Node.js + Express + Prisma ORM)
* **Express:** Un framework minimalista, maduro y de alto rendimiento. Ideal para construir APIs REST rápidas con TypeScript sin agregar sobrecarga de frameworks más robustos pero complejos (como NestJS) para el alcance de este desafío.
* **Prisma ORM:** Se eligió Prisma en lugar de consultas SQL puras o Sequelize por las siguientes razones:
  1. **Tipado Automático:** Genera tipos TS directamente del esquema (`schema.prisma`), garantizando que las consultas a la base de datos tengan autocompletado nativo.
  2. **Migraciones Declarativas:** Prisma maneja el historial de cambios en PostgreSQL de forma estructurada y reproducible en producción (`prisma migrate deploy`).
  3. **Relaciones Claras:** Facilita la carga de relaciones con una sintaxis limpia.
  4. **Seeding Integrado:** Permite ejecutar datos iniciales con un script JS simple que se ejecuta en el flujo de Docker.

---

## 3. Base de Datos (PostgreSQL)
* **PostgreSQL:** Un motor de base de datos relacional de nivel empresarial con soporte nativo para transacciones ACID, integridad referencial y restricciones avanzadas.
* **Diseño del Esquema:**
  * **`Category` (Categorías):** Almacena las categorías de productos (Tecnología, Ropa, etc.) asociadas a las promociones.
  * **`Promotion` (Promociones):** Almacena los campos (`name`, `discountType`, `discountValue`, `startDate`, `endDate`, `status`) y tiene una clave foránea (`categoryId`) que apunta a la categoría correspondiente.
  * **Restricción Referencial:** Se definió la relación con `onDelete: Restrict` para evitar que se elimine una categoría que tiene promociones activas vinculadas.
  * **Tipos de Datos ENUM Nativos:** Se definieron enums en PostgreSQL para `DiscountType` (`PORCENTAJE`, `MONTO_FIJO`) y `PromotionStatus` (`PROGRAMADA`, `ACTIVA`, `FINALIZADA`), lo que previene que ingresen valores erróneos a nivel de base de datos.

---

## 4. Frontend (React + Vite + Custom CSS)
* **Vite:** Herramienta de compilación ultrárrápida basada en ES Modules.
* **Diseño y Estética (Vanilla CSS):**
  * Se diseñó una interfaz en **Modo Oscuro** utilizando variables CSS globales.
  * La paleta se seleccionó usando tonos de color HSL cohesivos (índigo para acentos, verde para activos, rojo para eliminar/bloqueado, etc.).
  * Se usaron elementos visuales limpios inspirados en **Glassmorphic Cards** (tarjetas semi-transparentes con desenfoque de fondo y bordes sutiles) para un diseño elegante.
  * **Micro-animaciones:** Efectos de desplazamiento suave (`hover`) y transiciones en botones y tarjetas de estadísticas que mejoran la experiencia del usuario (UX).
  * **Tipografía:** Se inyectó la fuente de Google **"Outfit"** para una apariencia moderna.
* **Arquitectura de Componentes UI:**
  * **`Navbar`:** Barra de navegación sticky con glassmorphism que centraliza la navegación por pestañas (Promociones / Categorías) y el indicador de salud del servidor en tiempo real. Extrae esta responsabilidad de `App.tsx` para mantener el componente raíz limpio.
  * **`Footer`:** Componente estático con branding, tech stack y copyright.
  * **`PromotionForm` como Modal:** El formulario de creación de promociones se presenta como un diálogo modal (`modal-backdrop` + `modal-card`) que se activa con un botón "+ Nueva Promoción" en el panel de listado.
  * **Formulario de Categorías como Modal:** Siguiendo el mismo patrón de diseño consistente (UX) establecido para las promociones, el formulario de creación de categorías se trasladó a un diálogo modal que se activa mediante un botón "+ Nueva Categoría" en el encabezado del panel `CategoryManager`.
  * **Paginación del Cliente (10 registros por página):** Para mejorar el rendimiento visual y la legibilidad en pantallas pequeñas, se implementó una paginación local de 10 elementos por página en `PromotionList` y `CategoryManager`. Al realizarse a nivel de cliente, se ofrece una velocidad de respuesta instantánea sin sobrecargar al servidor backend con consultas repetitivas de compensación (`offset`/`limit`).
  * **Filtros en tiempo real:** Tanto `PromotionList` (por nombre, categoría y estado) como `CategoryManager` (por nombre) implementan filtros locales en el cliente, restableciendo la página actual automáticamente a la primera (página 1) ante cualquier cambio en los filtros para asegurar que no se muestren páginas vacías.
* **Vitest:** Ejecutor de pruebas ultraligero que comparte la misma configuración de Vite. Permite testear lógica de negocio y helpers en el frontend de forma instantánea.

---

## 5. Dockerización y Despliegue
* **Docker Compose:** Orquesta PostgreSQL (`db`), el backend (`backend`) y el frontend (`frontend`).
* **Flujo de Arranque Sincronizado:**
  * La base de datos tiene un `healthcheck` que ejecuta `pg_isready`.
  * El backend depende de la base de datos usando `condition: service_healthy`.
  * En su comando de inicio (`CMD`), el backend corre `npx prisma migrate deploy` para aplicar las migraciones a PostgreSQL y `npx prisma db seed` para ejecutar los seeders de categorías y promociones por defecto antes de levantar el servidor. Esto asegura que la base de datos esté lista y poblada en el primer arranque.
  * El frontend se compila inyectando `VITE_API_URL` como argumento en tiempo de construcción (`ARG`) y se sirve mediante **Nginx**, lo que optimiza el rendimiento y peso de la imagen de producción.

---

## 6. Pipeline CI/CD (GitHub Actions)
* El pipeline está configurado en etapas dependientes (`lint` -> `test` -> `build` -> `smoke test`):
  * **Lint & Test:** Verifica formato en código fuente frontend y backend, y corre pruebas unitarias sin levantar base de datos (usando mocks para Prisma y Vitest).
  * **Build:** Compila imágenes Docker localmente para validar que la construcción no tiene fallas.
  * **Smoke Test:** Levanta la aplicación (`docker compose up -d`), inyectando variables de entorno simuladas en GitHub Secrets, espera a que los servicios estén listos, y realiza un `curl` al endpoint `/health`. Si no responde `200 OK`, el flujo falla inmediatamente.
