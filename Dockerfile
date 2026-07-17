# =============================================
# Stage 1: Build — compila el frontend con Vite
# =============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero para aprovechar cache de Docker
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Recibir la URL del API como build argument
ARG VITE_API_URL=https://tecnologicosgr.tech/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Compilar la aplicación
RUN npm run build

# =============================================
# Stage 2: Serve — Nginx sirve los estáticos
# =============================================
FROM nginx:1.27-alpine AS runner

# Eliminar la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración personalizada (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
