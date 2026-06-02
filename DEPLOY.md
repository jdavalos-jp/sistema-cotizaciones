# Deploy

Este proyecto se despliega como dos servicios separados: `backend` y `frontend`.

## Vercel

Usa dos proyectos de Vercel apuntando al mismo repositorio.

### Backend en Vercel

Directorio raiz del proyecto Vercel:

```text
backend
```

Configuracion incluida:

```text
backend/api/index.js
backend/vercel.json
```

Vercel usara `api/index.js` como funcion serverless. `server.js` queda para desarrollo local o servidores persistentes.

Variables requeridas en Vercel:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
JWT_EXPIRY=7d
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
DB_POOL_MAX=1
DB_CONNECTION_TIMEOUT_MS=10000
DB_IDLE_TIMEOUT_MS=30000
```

Build command recomendado:

```bash
npm install
```

No configures start command para Vercel; Vercel usa la funcion `api/index.js`.

Pruebas despues de publicar:

```text
https://tu-backend.vercel.app/health
https://tu-backend.vercel.app/db/health
```

### Frontend en Vercel

Directorio raiz del proyecto Vercel:

```text
frontend
```

Framework:

```text
Vite
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Variables:

```bash
VITE_API_BASE_URL=https://tu-backend.vercel.app/api
```

Si usas el cliente Supabase del frontend:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Despues de tener la URL final del frontend, actualiza en el backend:

```bash
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

### Migraciones Prisma

Ejecuta migraciones contra Supabase desde local o desde un entorno controlado, no desde cada request serverless:

```bash
cd backend
npm run prisma:migrate:deploy
```

## Backend

Directorio raiz del servicio: `backend`

Comandos recomendados:

```bash
npm ci
npm run prisma:migrate:deploy
npm start
```

Si la plataforma ejecuta un build/postinstall, `npm install` ya ejecuta `prisma generate`.

Variables requeridas:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
JWT_EXPIRY=7d
ALLOWED_ORIGINS=https://tu-frontend.com
NODE_ENV=production
PORT=3001
```

Health checks:

```text
/health
/db/health
```

## Frontend

Directorio raiz del servicio: `frontend`

Comandos recomendados:

```bash
npm ci
npm run build
```

Directorio publicado:

```text
dist
```

Variables:

```bash
VITE_API_BASE_URL=https://tu-backend.com/api
```

Si el frontend y backend viven bajo el mismo dominio y el hosting reescribe `/api` hacia el backend, puedes dejar:

```bash
VITE_API_BASE_URL=/api
```

## Notas

- Node recomendado: `>=22.12`.
- Antes de publicar, confirma que `ALLOWED_ORIGINS` contiene exactamente el dominio del frontend.
- No subas archivos `.env` reales al repositorio.
