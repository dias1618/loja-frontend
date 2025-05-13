# Estágio de build
FROM node:20-alpine AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração
COPY package*.json ./

# Limpa o cache do npm e instala as dependências
RUN npm cache clean --force && \
    npm install

# Copia o código fonte
COPY . .

# Gera o build de produção com otimizações
RUN npm run build -- --configuration production

# Estágio de produção
FROM nginx:alpine

# Copia os arquivos estáticos do build para o nginx
COPY --from=build /app/dist/loja-frontend/browser /usr/share/nginx/html

# Copia a configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove o arquivo de configuração padrão do nginx
RUN rm -rf /etc/nginx/conf.d/default.conf.default

# Otimiza o nginx para melhor performance
RUN echo "worker_processes auto;" > /etc/nginx/nginx.conf && \
    echo "events { worker_connections 1024; }" >> /etc/nginx/nginx.conf && \
    echo "http { include /etc/nginx/conf.d/*.conf; }" >> /etc/nginx/nginx.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"] 