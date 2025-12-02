#!/bin/bash

# Verifica os parâmetros
if [ -z "$1" ]; then
  echo "Uso: ./curl_csrf.sh <email_admin>"
  exit 1
fi

EMAIL_ADMIN="$1"

echo "==> 1. Obtendo primeiro token CSRF..."
CSRF_RESPONSE=$(curl -sk -c cookies.txt https://localhost/api/csrf-token)

CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -oP '"token":"\K[^"]+')
if [ -z "$CSRF_TOKEN" ]; then
  echo "❌ Erro ao obter token CSRF"
  exit 1
fi

echo "✅ Token CSRF inicial: $CSRF_TOKEN"
echo

echo "==> 2. Realizando login do admin: $EMAIL_ADMIN"
curl -sk -b cookies.txt -c cookies.txt \
  -X POST https://localhost/api/fg-login \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
  -d "{\"email\": \"$EMAIL_ADMIN\", \"senha\": \"senha123\"}"

echo -e "\n✅ Login efetuado."
echo

echo "==> 3. Obtendo NOVO token CSRF (após login)..."
CSRF_RESPONSE2=$(curl -sk -b cookies.txt -c cookies.txt https://localhost/api/csrf-token)
CSRF_TOKEN2=$(echo "$CSRF_RESPONSE2" | grep -oP '"token":"\K[^"]+')

if [ -z "$CSRF_TOKEN2" ]; then
  echo "❌ Erro ao obter token CSRF pós-login"
  exit 1
fi

echo "✅ Token CSRF pós-login: $CSRF_TOKEN2"
echo

echo "==> 4. Chamando endpoint /api/fornecedores (listar tudo)..."
curl -i -sk -b cookies.txt -c cookies.txt \
  -X GET https://localhost/api/fornecedores/nomes \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN2" \
  -H "Accept: application/json"


echo -e "\n✅ Fim do script."
