# 🌍 IP Geolocation Viewer con Cache Inteligente

Aplicación completa full-stack que permite subir archivos Excel con direcciones IP y visualiza su geolocalización con un sistema inteligente de caché multinivel.

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: React 18 + Vite + flag-icons
- **Backend**: Node.js + Express
- **Cache**: Redis (memoria rápida)
- **Database**: MongoDB (persistencia)
- **Orquestación**: Docker Compose

### Flujo de Datos (Cache Strategy)
```
Usuario consulta IP
    ↓
1. ¿Está en Redis? → ✅ Retornar (más rápido: ~1ms)
    ↓ No
2. ¿Está en MongoDB? → ✅ Guardar en Redis + Retornar (~10ms)
    ↓ No
3. Consultar API externa → ✅ Guardar en MongoDB + Redis + Retornar (~200ms)
```

## 🚀 Características

### ✅ Sistema de Cache Multinivel
- **Redis**: Cache L1 (TTL: 24 horas por defecto)
- **MongoDB**: Cache L2 (persistencia permanente)
- **API externa**: ip-api.com (solo cuando no existe en cache)

### ✅ UI Features
- Lazy loading con scroll infinito
- Banderas de países con flag-icons (SVG de alta calidad)
- Indicadores de fuente de datos (⚡Redis / 💾MongoDB / 🌐API)
- Estadísticas en tiempo real
- Tema oscuro responsive

### ✅ Backend API
- `GET /api/ip/:ip` - Obtener info de una IP
- `POST /api/ips/batch` - Proceso en lote de múltiples IPs
- `GET /api/stats` - Estadísticas de caché
- `DELETE /api/cache/clear` - Limpiar caché Redis
- `GET /health` - Health check

## 🐳 Instalación con Docker (Recomendado)

### Prerequisitos
- Docker Desktop instalado
- Docker Compose

### Levantar toda la infraestructura
```bash
# Clonar o descargar el proyecto
cd ipsqls

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar que todos los servicios estén corriendo
docker-compose ps
```

### Servicios disponibles
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Redis**: localhost:6379
- **MongoDB**: localhost:27017

### Comandos útiles
```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (limpiar datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose up --build

# Ver estadísticas de caché
curl http://localhost:3001/api/stats

# Limpiar caché Redis
curl -X DELETE http://localhost:3001/api/cache/clear
```

## 💻 Instalación Local (Sin Docker)

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
npm install
npm run dev
```

### Servicios requeridos
Necesitas tener Redis y MongoDB corriendo localmente:
```bash
# Redis (puerto 6379)
redis-server

# MongoDB (puerto 27017)
mongod
```

## 📊 Uso de la Aplicación

1. Acceder a http://localhost:5173
2. Subir archivo Excel (.xlsx/.xls) con IPs
3. Ver resultados con geolocalización
4. Scroll automático carga más IPs
5. Observar estadísticas de caché en tiempo real

### Formato del Excel
El archivo puede tener cualquier estructura, la app extrae automáticamente las IPs válidas:
```
| Columna 1    | Columna 2    | ...
|--------------|--------------|-----
| 8.8.8.8      | Otros datos  | ...
| 1.1.1.1      | ...          | ...
```

## 🔧 Configuración

### Variables de Entorno - Backend
```env
PORT=3001
REDIS_URL=redis://redis:6379
MONGODB_URL=mongodb://mongodb:27017/ipsqls
IP_API_URL=http://ip-api.com/json
CACHE_TTL=86400  # 24 horas en segundos
```

### Variables de Entorno - Frontend
```env
VITE_API_URL=http://localhost:3001
```

## 📈 Mejoras de Performance

### Con Cache vs Sin Cache
- **Primera consulta** (API): ~200-300ms
- **Segunda consulta** (MongoDB): ~10-20ms
- **Tercera+ consulta** (Redis): ~1-5ms

### Rate Limiting
- Sin cache: Limitado a 45 req/min (API gratuita)
- Con cache: Ilimitado para IPs ya consultadas

## 🗃️ Estructura del Proyecto
```
ipsqls/
├── backend/
│   ├── server.js           # API Express
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── src/
│   ├── App.jsx             # Frontend React
│   ├── App.css
│   ├── main.jsx
│   └── utils/
│       └── countryHelpers.js
├── docker-compose.yml       # Orquestación
├── Dockerfile.frontend
├── .env
└── README.md
```

## 🚀 Roadmap / Mejoras Futuras

- [ ] Autenticación y usuarios
- [ ] Exportar resultados a CSV/Excel
- [ ] Dashboard de analíticas
- [ ] Filtros avanzados por país/región
- [ ] API key para ip-api.com (versión Pro)
- [ ] Webhooks para notificaciones
- [ ] GraphQL API
- [ ] Tests unitarios y E2E

## 📝 Logs y Debugging

### Ver logs del backend
```bash
docker-compose logs -f backend
```

Los logs muestran la fuente de cada consulta:
- 🟢 Cache hit (Redis)
- 🟡 Cache hit (MongoDB)
- 🔵 Fetching from API

## 🐛 Solución de Problemas

**Problema**: Los contenedores no inician
- **Solución**: Verificar que Docker Desktop esté corriendo

**Problema**: Error de conexión al backend
- **Solución**: Verificar que el backend esté en http://localhost:3001/health

**Problema**: No se muestran las banderas
- **Solución**: Verificar que flag-icons esté instalado: `npm install flag-icons`

## 🤝 Contribuciones
Pull requests son bienvenidos. Para cambios mayores, por favor abrir un issue primero.

## 📄 Licencia
MIT

## 👨‍💻 Autor
Red Negocios - Proyecto Codelco Licitación

---

**Nota**: Este proyecto usa la API gratuita de ip-api.com que tiene límite de 45 requests/minuto. El sistema de caché minimiza las llamadas a la API
