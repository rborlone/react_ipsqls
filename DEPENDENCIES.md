# 📦 Dependencias del Proyecto

## Frontend (`package.json`)

### Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "xlsx": "^0.18.5",
  "axios": "^1.6.0",
  "flag-icons": "^7.2.3"
}
```

### DevDependencies
```json
{
  "@vitejs/plugin-react": "^4.3.4",
  "vite": "^6.0.3"
}
```

**Instalación**:
```bash
npm install
```

---

## Backend (`backend/package.json`)

### Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "axios": "^1.6.0",
  "redis": "^4.6.0",
  "mongodb": "^6.3.0",
  "dotenv": "^16.3.1"
}
```

### DevDependencies
```json
{
  "nodemon": "^3.0.1"
}
```

**Instalación**:
```bash
cd backend
npm install
```

---

## Servicios Docker

### Redis
- **Imagen**: `redis:7-alpine`
- **Puerto**: 6379
- **Persistencia**: redis_data volume
- **Config**: appendonly yes

### MongoDB
- **Imagen**: `mongo:7`
- **Puerto**: 27017
- **Database**: ipsqls
- **Persistencia**: mongodb_data volume

### Backend
- **Base**: `node:18-alpine`
- **Puerto**: 3001
- **Healthcheck**: Depende de Redis y MongoDB

### Frontend
- **Base**: `node:18-alpine`
- **Puerto**: 5173
- **Comando**: `npm run dev -- --host`

---

## Comandos de Instalación Completos

### Instalación desde cero
```bash
# 1. Clonar proyecto
git clone <repo-url>
cd ipsqls

# 2. Instalar dependencias frontend
npm install

# 3. Instalar dependencias backend
cd backend
npm install
cd ..

# 4. Levantar con Docker
docker-compose up -d
```

### Actualizar dependencias
```bash
# Frontend
npm update

# Backend
cd backend
npm update
```

### Verificar versiones
```bash
# Frontend
npm list --depth=0

# Backend
cd backend
npm list --depth=0
```

---

## Notas de Versiones

- **Node.js**: >= 18.x requerido
- **npm**: >= 9.x recomendado
- **Docker**: >= 24.x
- **Docker Compose**: >= 2.x

### Compatibilidad de Navegadores (Frontend)
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90
- No soporta IE11 (usa Intersection Observer)

---

## Actualizaciones Futuras

Cuando se actualicen las dependencias, verificar:

1. **Redis client**: La API cambió en v4.x (ya implementado)
2. **MongoDB driver**: v6.x usa async/await nativo (ya implementado)
3. **React 18**: Concurrent features activadas
4. **Vite 6**: Configuración actualizada

---

## Scripts útiles

### Frontend
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Backend
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```
