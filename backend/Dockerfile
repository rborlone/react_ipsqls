FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
