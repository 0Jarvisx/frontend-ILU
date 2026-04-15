<p align="center">
  <img src="public/favicon.svg" alt="Hotel ILU" width="80" />
</p>

<h1 align="center">Hotel ILU</h1>

<p align="center">
  <strong>Sistema web de reservaciones y administración hotelera</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📖 Descripción

Aplicación frontend para el **Hotel ILU** que permite a los huéspedes explorar habitaciones, consultar disponibilidad en tiempo real y completar reservaciones en línea.

---

## ✨ Características

### 🏠 Experiencia del Huésped
- **Página principal** con hero section y galería de habitaciones
- **Búsqueda de disponibilidad** con selección de fechas y número de huéspedes
- **Proceso de checkout** con formulario para datos del huésped

### 🔒 Panel Administrativo
- **Gestión de habitaciones** — CRUD completo con tipos de habitación, precios e imágenes
- **Gestión de usuarios** — Alta, edición y desactivación de usuarios del sistema
- **Roles y permisos** — Creación de roles con permisos granulares
- **Gestión de reservaciones** — Visualización y administración de reservas
- **Rutas protegidas** con autenticación basada en cookies HTTP-only

---

## 🛠️ Tech Stack

| Categoría         | Tecnología                                    |
| ----------------- | --------------------------------------------- |
| **Framework**     | React 19 con React Compiler                   |
| **Lenguaje**      | TypeScript 6                                  |
| **Build Tool**    | Vite 8                                        |
| **Estilos**       | TailwindCSS 4                                 |
| **Routing**       | React Router 7                                |
| **HTTP Client**   | Axios                                         |
| **Tipografía**    | Inter (Google Fonts)                          |
| **Iconografía**   | Material Symbols Outlined                     |
| **Servidor Prod** | Nginx (Alpine)                                |
| **Contenedores**  | Docker con multi-stage build                  |

---

## 📁 Estructura del Proyecto

```
hotel-ILU/
├── public/                  # Assets estáticos
├── src/
│   ├── api/                 # Instancia de Axios configurada
│   ├── assets/              # Imágenes y recursos
│   ├── components/
│   │   ├── home/            # HeroSection, FloatingSearchBar, SanctuariesGrid
│   │   ├── layout/          # SideNavBar, TopNavBar, AdminLayout
│   │   ├── reservations/    # Componentes de reservaciones
│   │   ├── roles/           # Componentes de gestión de roles
│   │   ├── rooms/           # RoomCard y componentes de habitaciones
│   │   ├── shared/          # ProtectedRoute, ConfirmModal
│   │   └── users/           # Componentes de gestión de usuarios
│   ├── context/             # AuthContext (autenticación global)
│   ├── services/            # Servicios API (auth, rooms, users, roles, etc.)
│   ├── types/               # Tipos e interfaces TypeScript
│   ├── utils/               # Funciones utilitarias
│   ├── App.tsx              # Router principal
│   └── main.tsx             # Entry point
├── Dockerfile               # Build de producción (multi-stage + Nginx)
├── Dockerfile.dev           # Build de desarrollo con hot reload
├── docker-compose.yml       # Orquestación dev/prod
├── nginx.conf               # Configuración de Nginx para SPA
├── vite.config.ts           # Configuración de Vite + proxy API
└── package.json
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** ≥ 22
- **npm** ≥ 10
- Backend API corriendo en `http://localhost:3000` (el proxy de Vite redirige `/api/*`)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/hotel-ILU.git
cd hotel-ILU

# Instalar dependencias
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Build de Producción

```bash
npm run build
npm run preview     # Para previsualizar el build
```

---

## 🐳 Docker

### Desarrollo (con hot reload)

```bash
docker compose --profile dev up --build
```

Disponible en `http://localhost:5173`.

### Producción (Nginx)

```bash
docker compose --profile prod up --build
```

Servido en `http://localhost:80` con caché de assets y soporte para SPA routing.

---

## 🌐 Variables de Entorno

El proxy de Vite redirige todas las peticiones `/api/*` al backend. Para cambiar el target, edita `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:3000', changeOrigin: true },
  },
},
```