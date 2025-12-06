FROM nginx:alpine

# Diretório seguro para chave
RUN mkdir -p /etc/ssl/private \
    && rm -f /etc/nginx/conf.d/default.conf

# Copia HTML/JS/CSS para o NGINX
COPY webapp/ /usr/share/nginx/html/

# Copia certificados
COPY certs/cert.pem /etc/ssl/certs/cert.pem
COPY certs/key.pem /etc/ssl/private/key.pem

# Permissões adequadas
RUN chmod 644 /etc/ssl/certs/cert.pem \
    && chmod 600 /etc/ssl/private/key.pem

# Copia nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf