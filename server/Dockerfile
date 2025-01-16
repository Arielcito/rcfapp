FROM node:18-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++ gcc openssl-dev curl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias incluyendo TypeScript
RUN npm install
RUN npm install -g typescript
RUN npm rebuild bcrypt --build-from-source

# Copiar código fuente
COPY . .

# Limpiar dist si existe y compilar
RUN rm -rf dist || true
RUN npx tsc

EXPOSE 8080

# Verificar la compilación
RUN ls -la dist/

CMD ["node", "dist/index.js"] 