# Etapa 1: Build de la aplicación (usando Node para ejecutar npm run build)
FROM node:20 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Generamos el build de producción en la carpeta 'dist'
RUN npm run build

# Etapa 2: Servir los archivos estáticos (usando un servidor web ligero como Nginx)
FROM nginx:alpine
# Quitamos el html por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*
# Copiamos los archivos de build generados en la etapa 'builder' a la carpeta de nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Exponemos el puerto estándar de Nginx
EXPOSE 80
# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]