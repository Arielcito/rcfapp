# Etapa de construcción
FROM --platform=linux/amd64 node:18-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++ gcc openssl-dev

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY next.config.js ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copiar código fuente
COPY . .

# Generar Prisma Client y construir la aplicación
RUN npx prisma generate
RUN npm run build

# Etapa de producción
FROM --platform=linux/amd64 node:18-alpine AS runner

# Instalar dependencias necesarias para producción
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Configurar variables de entorno para producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"] 