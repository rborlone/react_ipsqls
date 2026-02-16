# React IP Geolocation Viewer con Cache Inteligente

## Project Overview
Aplicación full-stack que permite subir archivos Excel con direcciones IP y visualiza su geolocalización con un sistema de caché multinivel (Redis + MongoDB) para optimizar performance y reducir llamadas a la API externa.

## Technologies Used

### Frontend
- **React 18** con Vite como build tool
- **xlsx** (^0.18.5) para parsear archivos Excel
- **axios** (^1.6.0) para peticiones HTTP
- **flag-icons** para mostrar banderas SVG de países
- **Intersection Observer API** para lazy loading

### Backend
- **Node.js + Express** para API REST
- **Redis** (v7) para caché L1 en memoria
- **MongoDB** (v7) para caché L2 persistente
- **Docker Compose** para orquestación

## Arquitectura del Proyecto

### Estructura de Archivos
```
ipsqls/
├── .github/
│   └── copilot-instructions.md
├── backend/
│   ├── server.js              # API Express con lógica de caché
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── src/
│   ├── App.jsx                # Frontend React con lazy loading
│   ├── App.css                # Estilos
│   ├── main.jsx               # Entry point + import flag-icons
│   ├── index.css              # Estilos globales
│   └── utils/
│       └── countryHelpers.js  # Utilidades
├── docker-compose.yml         # Orquestación (Redis, MongoDB, Backend, Frontend)
├── Dockerfile.frontend
├── .env
├── README.md
├── QUICKSTART.md
├── API_EXAMPLES.md
└── start.bat / start.sh
```

### Cache Strategy (Prioridad)

La aplicación usa una estrategia de caché en cascada de 3 niveles:

```
🔍 Consulta IP
    ↓
1️⃣ Redis (L1) → ⚡ ~1-5ms (TTL: 24h)
    ↓ Miss
2️⃣ MongoDB (L2) → 💾 ~10-20ms (permanente)
    ↓ Miss
3️⃣ API Externa → 🌐 ~200-300ms (ip-api.com)
    ↓ Success
💾 Guarda en MongoDB → ⚡ Guarda en Redis → ✅ Retorna
```

### Características Implementadas

#### ✅ Backend API Endpoints
- `GET /health` - Health check de servicios
- `GET /api/ip/:ip` - Obtener geolocalización de una IP
- `POST /api/ips/batch` - Procesar múltiples IPs en lote
- `GET /api/stats` - Estadísticas de caché (Redis + MongoDB)
- `DELETE /api/cache/clear` - Limpiar caché Redis

#### ✅ Sistema de Cache
- **Redis**: Cache L1 con TTL de 24 horas (configurable)
- **MongoDB**: Cache L2 persistente con índice único en campo `ip`
- **Logs visuales**: 🟢 Redis / 🟡 MongoDB / 🔵 API
- **Source tracking**: Cada respuesta incluye campo `source` indicando origen

#### ✅ Frontend Features
- **Lazy loading**: Carga incremental de 10 IPs por batch
- **Intersection Observer**: Scroll infinito automático
- **Banderas SVG**: flag-icons en lugar de emojis
- **Source badges**: Iconos visuales (⚡Redis / 💾MongoDB / 🌐API)
- **Stats en vivo**: Contador de IPs en Redis y MongoDB
- **Tema oscuro** responsive

#### ✅ DevOps
- **Docker Compose**: Orquestación de 4 servicios
- **Health checks**: Validación de Redis y MongoDB antes de iniciar backend
- **Volumes**: Persistencia de datos entre reinicios
- **Scripts de inicio**: `start.bat` (Windows) / `start.sh` (Linux/Mac)

## Estado de los Componentes

### App.jsx - Estados Principales
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const [ipData, setIpData] = useState([]);           // IPs ya procesadas
const [pendingIps, setPendingIps] = useState([]);   // IPs pendientes
const [loading, setLoading] = useState(false);      // Carga inicial Excel
const [loadingMore, setLoadingMore] = useState(false); // Carga de batch
const [error, setError] = useState('');             // Mensajes de error
const [totalIps, setTotalIps] = useState(0);        // Total de IPs
const [stats, setStats] = useState(null);           // Stats de caché
const observerRef = useRef(null);                   // Intersection Observer
const loadingRef = useRef(false);                   // Flag anti-duplicación
```

### backend/server.js - Función Principal
```javascript
async function getIpInfo(ip) {
  // 1. Buscar en Redis
  const cachedData = await redisClient.get(`ip:${ip}`);
  if (cachedData) return { ...JSON.parse(cachedData), source: 'redis' };
  
  // 2. Buscar en MongoDB
  const mongoData = await ipsCollection.findOne({ ip });
  if (mongoData) {
    await redisClient.setEx(`ip:${ip}`, TTL, JSON.stringify(mongoData));
    return { ...mongoData, source: 'mongodb' };
  }
  
  // 3. Consultar API externa
  const response = await axios.get(`http://ip-api.com/json/${ip}`);
  const data = { ip, ...response.data, fetchedAt: new Date() };
  
  // Guardar en MongoDB y Redis
  await ipsCollection.updateOne({ ip }, { $set: data }, { upsert: true });
  await redisClient.setEx(`ip:${ip}`, TTL, JSON.stringify(data));
  
  return { ...data, source: 'api' };
}
```

### Flujo de Ejecución

1. **Usuario sube Excel** → `handleFileUpload()`
2. **Parseo de IPs** → Extrae todas las IPs válidas
3. **Batch request al backend** → `POST /api/ips/batch` con 10 IPs
4. **Backend procesa cada IP**:
   - Revisa Redis → MongoDB → API
   - Guarda en cache si es necesario
   - Retorna con campo `source`
5. **Frontend muestra resultados** con badge de fuente
6. **Scroll trigger** → Repite proceso hasta completar
7. **Stats actualizados** → Muestra contadores de caché
```

## Development Guidelines

### Comandos Disponibles
- `npm run dev` - Servidor de desarrollo en http://localhost:5173
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

### Docker
- `docker-compose up -d` - Levantar todos los servicios
- `docker-compose down` - Detener servicios
- `docker-compose logs -f backend` - Ver logs del backend
- `start.bat` / `start.sh` - Scripts de inicio rápido

### Backend
- `cd backend && npm start` - Iniciar servidor Express
- Puerto: 3001
- Redis: localhost:6379
- MongoDB: localhost:27017

### Patrón de Lazy Loading
- **BATCH_SIZE**: 10 IPs por lote (configurable)
- **Delay entre requests**: ~200ms en batch mode (optimizado con caché)
- **Intersection Observer threshold**: 0.1 (10% de visibilidad)

### Mejoras Futuras Sugeridas
- [ ] Exportar resultados a Excel/CSV
- [ ] Filtros por país/región
- [ ] Ordenamiento de columnas
- [ ] Barra de progreso visual más detallada
- [ ] Modo claro/oscuro toggle
- [ ] Pausar/reanudar carga de IPs
- [ ] Búsqueda/filtrado en la tabla

## Notas Importantes
- **Banderas SVG**: Se usa la librería `flag-icons` para banderas de alta calidad (instalada vía npm)
- **Rate limiting crítico**: ip-api.com bloquea si excedes 45 req/min (el caché resuelve esto)
- **Intersection Observer**: Compatible con navegadores modernos (no IE11)
- **Archivos grandes**: Testeado con éxito, carga incremental mejora UX significativamente
- **Caché persistente**: MongoDB mantiene datos entre reinicios, Redis se limpia al reiniciar

## Inicio Rápido

### Con Docker (Recomendado)
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh && ./start.sh

# O manualmente
docker-compose up -d
```

### Sin Docker (Desarrollo Local)
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
npm install
npm run dev
```

### Verificar que funciona
```bash
# Health check
curl http://localhost:3001/health

# Test de IP
curl http://localhost:3001/api/ip/8.8.8.8

# Stats
curl http://localhost:3001/api/stats
```

## Current Status
- ✅ Proyecto completamente funcional
- ✅ Sistema de caché Redis + MongoDB implementado
- ✅ Lazy loading implementado
- ✅ UI responsive y moderna con banderas SVG
- ✅ Backend API REST con 5 endpoints
- ✅ Docker Compose con 4 servicios orquestados
- ✅ Manejo de errores robusto
- ✅ Documentación completa (README, QUICKSTART, API_EXAMPLES)
- 🚀 Listo para producción

