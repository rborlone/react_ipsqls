@echo off
echo 🚀 Iniciando IP Geolocation Viewer con Docker...
echo.
echo 📦 Levantando servicios...
docker-compose up -d

echo.
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Servicios iniciados:
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://localhost:3001
echo    - Redis: localhost:6379
echo    - MongoDB: localhost:27017
echo.
echo 📊 Ver logs:
echo    docker-compose logs -f
echo.
echo 🛑 Detener servicios:
echo    docker-compose down
echo.
pause
