# React IP Geolocation Viewer

## Project Overview
Aplicación React que permite subir archivos Excel con direcciones IP y visualiza su geolocalización con banderas de países usando la API de ip-api.com.

## Technologies Used
- **React 18** con Vite como build tool
- **xlsx** (^0.18.5) para parsear archivos Excel
- **axios** (^1.6.0) para peticiones HTTP a la API
- **Emojis nativos** para mostrar banderas de países
- **Intersection Observer API** para lazy loading

## Arquitectura del Proyecto

### Estructura de Archivos
```
ipsqls/
├── .github/
│   └── copilot-instructions.md
├── src/
│   ├── App.jsx                # Componente principal con lazy loading
│   ├── App.css                # Estilos específicos del componente
│   ├── main.jsx               # Entry point de React
│   ├── index.css              # Estilos globales
│   └── utils/
│       └── countryHelpers.js  # Utilidades (no usado actualmente)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### Características Implementadas

#### ✅ Lazy Loading con Scroll Infinito
- **Carga por lotes**: Procesa 10 IPs a la vez
- **Intersection Observer**: Detecta automáticamente cuando el usuario hace scroll al final
- **Velocidad controlada**: 1.5 segundos entre cada request (40 requests/min)
- **Contador de progreso**: Muestra "Cargadas X de Y IPs"
- **UI no bloqueante**: El usuario puede ver resultados mientras se cargan más

#### ✅ Procesamiento de Excel
- Acepta formatos: .xlsx, .xls
- Extrae IPs automáticamente de cualquier columna/fila
- Validación con regex: `/^(\d{1,3}\.){3}\d{1,3}$/`
- Manejo de errores si no encuentra IPs válidas

#### ✅ Geolocalización
- API: `http://ip-api.com/json/{ip}`
- Datos obtenidos: país, región, ciudad, ISP, coordenadas GPS, código de país
- Manejo de fallos: Marca IPs con error y continúa procesando

#### ✅ UI/UX
- Tema oscuro responsive
- Tabla con 8 columnas: IP, Bandera, País, Región, Ciudad, ISP, Lat/Lon, Estado
- Banderas mediante emojis Unicode (conversión de código ISO a emoji)
- Spinner animado durante carga de más datos
- Mensaje de completado cuando todas las IPs están procesadas

## Estado de los Componentes

### App.jsx - Estados Principales
```javascript
const [ipData, setIpData] = useState([]);           // IPs ya procesadas
const [pendingIps, setPendingIps] = useState([]);   // IPs pendientes por procesar
const [loading, setLoading] = useState(false);      // Carga inicial del Excel
const [loadingMore, setLoadingMore] = useState(false); // Carga de más IPs
const [error, setError] = useState('');             // Mensajes de error
const [totalIps, setTotalIps] = useState(0);        // Total de IPs encontradas
const observerRef = useRef(null);                   // Ref para Intersection Observer
const loadingRef = useRef(false);                   // Flag para evitar cargas duplicadas
```

### Flujo de Ejecución

1. **Usuario sube Excel** → `handleFileUpload()`
2. **Parseo de Excel** → Extrae todas las IPs
3. **Primer lote automático** → `loadNextBatch()` carga primeras 10 IPs
4. **Usuario hace scroll** → Intersection Observer detecta
5. **Carga siguiente lote** → Procesa otras 10 IPs
6. **Repite hasta completar** → Mensaje final de completado

## API Utilizada

### ip-api.com
- **Endpoint**: `http://ip-api.com/json/{ip}`
- **Límite gratuito**: 45 requests/minuto
- **Respuesta típica**:
```json
{
  "status": "success",
  "country": "United States",
  "countryCode": "US",
  "region": "CA",
  "regionName": "California",
  "city": "Los Angeles",
  "lat": 34.0522,
  "lon": -118.2437,
  "isp": "AT&T Services"
}
```

## Development Guidelines

### Comandos Disponibles
- `npm run dev` - Servidor de desarrollo en http://localhost:5173
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

### Patrón de Lazy Loading
- **BATCH_SIZE**: 10 IPs por lote (configurable)
- **Delay entre requests**: 1.5 segundos (respeta rate limit)
- **Intersection Observer threshold**: 0.1 (10% de visibilidad)

### Mejoras Futuras Sugeridas
- [ ] Exportar resultados a Excel/CSV
- [ ] Filtros por país/región
- [ ] Ordenamiento de columnas
- [ ] Caché de resultados para evitar re-consultas
- [ ] Barra de progreso visual más detallada
- [ ] Modo claro/oscuro toggle
- [ ] Pausar/reanudar carga de IPs
- [ ] Búsqueda/filtrado en la tabla

## Notas Importantes
- **No usar librería de banderas externa**: Se usan emojis nativos para evitar dependencias
- **Rate limiting crítico**: ip-api.com bloquea si excedes 45 req/min
- **Intersection Observer**: Compatible con navegadores modernos (no IE11)
- **Archivos grandes**: Testeado con éxito, carga incremental mejora UX significativamente

## Current Status
- ✅ Proyecto completamente funcional
- ✅ Lazy loading implementado
- ✅ UI responsive y moderna
- ✅ Manejo de errores robusto
- 🚀 Listo para producción
