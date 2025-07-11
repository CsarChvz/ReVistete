Claro, aquí tienes el README completo y estilizado para **ReVistete App**, siguiendo las secciones estándar de un proyecto moderno:

---

# 👕 ReVistete App

**Intercambia, Renueva, Sostenible.**

> Una plataforma completa para el intercambio de ropa, construida con **Next.js 14**, **Prisma**, **NextAuth**, y **Cloudinary**. Promueve la **moda circular** y la **sostenibilidad ambiental**.

---

## 🌐 URL de Demostración

🔗 \[**Próximamente**: Enlace a la demo en vivo de ReVistete]

---

## 🛠️ Tecnologías Utilizadas

| Categoría          | Herramientas                             |
| ------------------ | ---------------------------------------- |
| **Frontend**       | Next.js 14 (App Router), React           |
| **Base de Datos**  | PostgreSQL con Prisma ORM                |
| **Autenticación**  | NextAuth.js (Auth.js)                    |
| **Almacenamiento** | Cloudinary                               |
| **Despliegue**     | Vercel                                   |
| **Estado Global**  | Zustand                                  |
| **Formularios**    | React Hook Form + Zod (validación)       |
| **Tiempo Real**    | Pusher (notificaciones, chat) (opcional) |
| **Lenguaje**       | TypeScript                               |

---

## 🚀 Requisitos Previos

Asegúrate de tener instalado:

* **Node.js** v18 o superior
* **npm** (incluido con Node.js)
* **PostgreSQL** (local o remoto)
* **Docker & Docker Compose** (opcional pero recomendado)

---

## ⚙️ Instalación y Configuración Local

### 1. Clonar el Repositorio

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd revistete-app
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Rellena los valores según tus credenciales:

```env
# NextAuth.js
AUTH_SECRET="YOUR_AUTH_SECRET"
AUTH_URL="http://localhost:3000"

# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"

# Cloudinary
CLOUDINARY_CLOUD_NAME="YOUR_CLOUD_NAME"
CLOUDINARY_API_KEY="YOUR_API_KEY"
CLOUDINARY_API_SECRET="YOUR_API_SECRET"

# Pusher (Opcional)
PUSHER_APP_ID="YOUR_PUSHER_APP_ID"
PUSHER_KEY="YOUR_PUSHER_KEY"
PUSHER_SECRET="YOUR_PUSHER_SECRET"
PUSHER_CLUSTER="YOUR_PUSHER_CLUSTER"
```

💡 **Genera un AUTH\_SECRET seguro con:**

```bash
openssl rand -base64 32
```

---

### 4. Configurar Prisma y Base de Datos

```bash
npx prisma generate
npx prisma migrate dev --name init_revistete_db
```

---

### 5. Ejecutar la Aplicación

#### 🅰️ Opción A: Local (sin Docker)

Asegúrate de que PostgreSQL esté activo.

```bash
npm run dev
```

Accede a: [http://localhost:3000](http://localhost:3000)

---

#### 🅱️ Opción B: Con Docker Compose (Recomendado)

Crea un archivo `docker-compose.yml` con el siguiente contenido:

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: revistete_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/revistete_db?schema=public
      AUTH_SECRET: ${AUTH_SECRET}
      AUTH_URL: http://localhost:3000
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      PUSHER_APP_ID: ${PUSHER_APP_ID}
      PUSHER_KEY: ${PUSHER_KEY}
      PUSHER_SECRET: ${PUSHER_SECRET}
      PUSHER_CLUSTER: ${PUSHER_CLUSTER}
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

volumes:
  db_data:
```

Levanta los servicios:

```bash
docker-compose up --build
```

Luego accede a: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Scripts Útiles

| Comando                     | Descripción                            |
| --------------------------- | -------------------------------------- |
| `npm run dev`               | Ejecuta el servidor de desarrollo      |
| `npm run build`             | Compila la aplicación para producción  |
| `npx prisma studio`         | Abre Prisma Studio para explorar la BD |
| `npx prisma migrate dev`    | Ejecuta las migraciones localmente     |
| `docker-compose up --build` | Levanta app y BD con Docker Compose    |

