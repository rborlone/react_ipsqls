# 🌍 IP Geolocation Viewer

Aplicación React que permite cargar un archivo Excel con direcciones IP y visualizar su geolocalización con banderas de países.

## 🚀 Características

- **Carga de archivos Excel**: Soporta formatos .xlsx y .xls
- **Geolocalización automática**: Obtiene datos de ubicación usando la API de ip-api.com
- **Banderas de países**: Muestra emojis de banderas para cada país
- **Información detallada**: País, región, ciudad, ISP, coordenadas GPS
- **Manejo de rate limiting**: Control automático de peticiones para evitar límites de la API
- **Interfaz responsive**: Diseño adaptable a dispositivos móviles

## 📋 Requisitos

- Node.js 16 o superior
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio o descarga los archivos

2. Instala las dependencias:
```bash
npm install
```

## ▶️ Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Construcción para producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Para previsualizar la versión de producción:

```bash
npm run preview
```

## 📊 Formato del archivo Excel

El archivo Excel debe contener direcciones IP en la primera columna. Ejemplo:

```
IP
24.48.0.1
8.8.8.8
1.1.1.1
```

Las IPs pueden estar en cualquier columna, el sistema las detectará automáticamente usando expresiones regulares.

## 🔑 API Utilizada

La aplicación utiliza **ip-api.com** para obtener datos de geolocalización:
- **Límite gratuito**: 45 peticiones por minuto
- **Endpoint**: `http://ip-api.com/json/{ip}`

La aplicación incluye control automático para respetar estos límites.

## 📚 Tecnologías

- **React 18**: Framework de UI
- **Vite**: Build tool y dev server
- **xlsx**: Librería para leer archivos Excel
- **axios**: Cliente HTTP para las peticiones a la API
- **CSS3**: Estilos con tema oscuro responsive

## 🎨 Interfaz

La aplicación presenta:
- Área de carga de archivos con drag & drop visual
- Indicador de carga durante el procesamiento
- Tabla con resultados ordenados mostrando:
  - Dirección IP
  - Bandera del país (emoji)
  - País
  - Región
  - Ciudad
  - ISP (Proveedor de Internet)
  - Coordenadas GPS
  - Estado de la consulta

## ⚠️ Limitaciones

- La API gratuita de ip-api.com tiene un límite de 45 peticiones por minuto
- Para listas grandes de IPs, el procesamiento puede tomar varios minutos
- Se recomienda no exceder 100 IPs por archivo para evitar tiempos de espera prolongados

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.

## 📄 Licencia

MIT

## 👨‍💻 Desarrollo

Estructura del proyecto:
```
ipsqls/
├── src/
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos del componente
│   ├── main.jsx          # Punto de entrada
│   ├── index.css         # Estilos globales
│   └── utils/
│       └── countryHelpers.js  # Utilidades para países
├── index.html
├── package.json
└── vite.config.js
```

## 🐛 Solución de problemas

**Problema**: No se detectan IPs en el archivo Excel
- **Solución**: Verifica que las IPs estén en formato válido (xxx.xxx.xxx.xxx)

**Problema**: Error de rate limiting
- **Solución**: La aplicación controla esto automáticamente, espera a que termine el procesamiento

**Problema**: La aplicación no carga
- **Solución**: Asegúrate de haber ejecutado `npm install` primero
