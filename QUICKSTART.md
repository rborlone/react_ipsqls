# 🚀 Inicio Rápido - IP Geolocation Viewer

## Opción 1: Docker (Recomendado)

### Windows
```cmd
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

O manualmente:
```bash
docker-compose up -d
```

## Opción 2: Local (desarrollo)

### 1. Backend
```bash
cd backend
npm install
npm start
```

### 2. Frontend (en otra terminal)
```bash
npm install
npm run dev
```

## Verificar que todo funcione

1. **Backend Health Check**:
   ```bash
   curl http://localhost:3001/health
   ```
   Deberías ver: `{"status":"ok","redis":"connected","mongodb":"connected"}`

2. **Frontend**: 
   Abre http://localhost:5173

3. **Test de API**:
   ```bash
   curl http://localhost:3001/api/ip/8.8.8.8
   ```

## URLs Importantes

- 🎨 **Frontend**: http://localhost:5173
- 🔌 **Backend API**: http://localhost:3001
- 📊 **Estadísticas**: http://localhost:3001/api/stats
- ❤️ **Health**: http://localhost:3001/health

## Comandos útiles

### Docker
```bash
# Ver logs
docker-compose logs -f

# Ver logs del backend solamente
docker-compose logs -f backend

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Limpiar volúmenes (borra datos)
docker-compose down -v
```

### Desarrollo local
```bash
# Limpiar caché Redis
curl -X DELETE http://localhost:3001/api/cache/clear

# Ver estadísticas
curl http://localhost:3001/api/stats
```

## Problemas comunes

❌ **Puerto 3001 ya en uso**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

❌ **Docker no inicia**
- Verificar que Docker Desktop esté corriendo
- Ejecutar `docker-compose down` y luego `docker-compose up -d`

❌ **No se conecta al backend**
- Verificar que el backend esté corriendo: `curl http://localhost:3001/health`
- Revisar el archivo `.env` en el frontend: `VITE_API_URL=http://localhost:3001`

## Siguiente paso

1. Abre http://localhost:5173
2. Sube un archivo Excel con IPs
3. ¡Disfruta de la geolocalización instantánea con caché! 🎉
