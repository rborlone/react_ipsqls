# Ejemplos de Uso de la API

## Health Check
```bash
curl http://localhost:3001/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "redis": "connected",
  "mongodb": "connected"
}
```

---

## Obtener información de una IP

```bash
curl http://localhost:3001/api/ip/8.8.8.8
```

**Respuesta esperada:**
```json
{
  "ip": "8.8.8.8",
  "status": "success",
  "country": "United States",
  "countryCode": "US",
  "region": "CA",
  "regionName": "California",
  "city": "Mountain View",
  "lat": 37.4056,
  "lon": -122.0775,
  "isp": "Google LLC",
  "fetchedAt": "2024-01-15T10:30:00.000Z",
  "source": "redis"
}
```

El campo `source` indica de dónde vino la data:
- `redis`: Caché en memoria (más rápido)
- `mongodb`: Base de datos (rápido)
- `api`: API externa (más lento)

---

## Consulta en lote (Batch)

```bash
curl -X POST http://localhost:3001/api/ips/batch \
  -H "Content-Type: application/json" \
  -d '{
    "ips": ["8.8.8.8", "1.1.1.1", "208.67.222.222"]
  }'
```

**Respuesta esperada:**
```json
{
  "results": [
    {
      "ip": "8.8.8.8",
      "country": "United States",
      "source": "redis"
      // ... más campos
    },
    {
      "ip": "1.1.1.1",
      "country": "Australia",
      "source": "mongodb"
      // ... más campos
    },
    {
      "ip": "208.67.222.222",
      "country": "United States",
      "source": "api"
      // ... más campos
    }
  ],
  "total": 3
}
```

---

## Obtener estadísticas de caché

```bash
curl http://localhost:3001/api/stats
```

**Respuesta esperada:**
```json
{
  "mongodb": {
    "totalIps": 150,
    "message": "150 IPs almacenadas en MongoDB"
  },
  "redis": {
    "cachedIps": 45,
    "message": "45 IPs en caché Redis"
  }
}
```

---

## Limpiar caché de Redis

```bash
curl -X DELETE http://localhost:3001/api/cache/clear
```

**Respuesta esperada:**
```json
{
  "message": "Caché Redis limpiado"
}
```

---

## Ejemplos con PowerShell (Windows)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health"
```

### Obtener IP
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/ip/8.8.8.8"
```

### Batch Request
```powershell
$body = @{
    ips = @("8.8.8.8", "1.1.1.1", "208.67.222.222")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/ips/batch" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

### Estadísticas
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/stats"
```

### Limpiar caché
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/cache/clear" `
  -Method Delete
```

---

## Test de Performance

### Medir velocidad de caché

```bash
# Primera vez (API - lento)
time curl http://localhost:3001/api/ip/200.1.123.45

# Segunda vez (MongoDB - rápido)
time curl http://localhost:3001/api/ip/200.1.123.45

# Tercera vez (Redis - muy rápido)
time curl http://localhost:3001/api/ip/200.1.123.45
```

### PowerShell
```powershell
Measure-Command { Invoke-RestMethod -Uri "http://localhost:3001/api/ip/200.1.123.45" }
```

---

## IPs de prueba

Usa estas IPs para testear:

```
8.8.8.8          - Google DNS (USA)
1.1.1.1          - Cloudflare DNS (Australia)
208.67.222.222   - OpenDNS (USA)
185.228.168.9    - CleanBrowsing (Netherlands)
76.76.19.19      - Alternate DNS (USA)
94.140.14.14     - AdGuard DNS (Cyprus)
```

## Monitorear logs en tiempo real

```bash
# Docker
docker-compose logs -f backend

# Local
# Los logs aparecen automáticamente en consola
```

Busca en los logs:
- 🟢 `Cache hit (Redis)` - Super rápido
- 🟡 `Cache hit (MongoDB)` - Rápido
- 🔵 `Fetching from API` - Primera vez
