#!/bin/bash

echo "==> 1. Obtendo token CSRF..."
CSRF_RESPONSE=$(curl -sk -c cookies.txt https://localhost:8443/api/csrf-token)

echo -e "\nResposta completa da requisição de token CSRF:"
echo "$CSRF_RESPONSE"

echo -e "\nConteúdo do arquivo cookies.txt:"
cat cookies.txt

# Extrai o token CSRF do JSON no body
#CSRF_TOKEN=$(grep XSRF-TOKEN cookies.txt | awk '{print $NF}')
CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -oP '"token":"\K[^"]+')

echo -e "\nToken CSRF extraído: $CSRF_TOKEN"

echo "2. Enviando POST para reset-senha (sem autenticação)..."

curl -i -X POST https://localhost/api/usuarios/reset-senha \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
  --cookie cookies.txt \
  --data '{
    "email": "guilherme.dias@fiberguardian.com",
    "senha": "novaSenha123",
    "repeteSenha": "novaSenha123"
  }' \
  --insecure

echo
