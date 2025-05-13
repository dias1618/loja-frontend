# Etapa 1: build da aplicação
FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: servidor NGINX para servir os arquivos
FROM nginx:alpine

# Copia os arquivos gerados para o NGINX
COPY --from=build /app/dist/* /usr/share/nginx/html

# Copia config personalizada do NGINX se necessário
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
