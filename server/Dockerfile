FROM --platform=linux/amd64 node:18-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++ gcc openssl-dev

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

EXPOSE 8080

# Asegurarnos que el directorio dist existe
RUN ls -la dist/

CMD ["npm", "start"] 