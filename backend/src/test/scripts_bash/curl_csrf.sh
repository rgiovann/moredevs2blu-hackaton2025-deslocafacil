#!/bin/bash

# Verifica se os parâmetros foram passados
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Erro: informe o e-mail e a operação desejada (LISTA, INCLUI, ALTERA, DELETA)."
  echo "Uso: ./curl_csrf.sh <email> <operacao>"
  exit 1
fi

EMAIL="$1"
OPERACAO="$2"
OPERACAO=$(echo "$OPERACAO" | tr '[:lower:]' '[:upper:]')  # <- converte para maiúsculas

echo "==> 1. Obtendo token CSRF..."
CSRF_RESPONSE=$(curl -sk -c cookies.txt https://localhost:8443/csrf-token)

echo -e "\nResposta completa da requisição de token CSRF:"
echo "$CSRF_RESPONSE"

echo -e "\nConteúdo do arquivo cookies.txt:"
cat cookies.txt

# Extrai o token CSRF do JSON no body
#CSRF_TOKEN=$(grep XSRF-TOKEN cookies.txt | awk '{print $NF}')
CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -oP '"token":"\K[^"]+')

echo -e "\nToken CSRF extraído: $CSRF_TOKEN"

echo "==> 2. Efetuando login..."
curl -sk -b cookies.txt -c cookies.txt \
  -X POST https://localhost:8443/login \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
  -d "{\"email\": \"$EMAIL\", \"senha\": \"senha123\"}"

echo -e "\n==> 3. Executando operação: $OPERACAO"

case "$OPERACAO" in
  LISTA)
curl -sk -v -X GET https://localhost:8443/usuarios \
  -H "Accept: application/json" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
  -b cookies.txt
    ;;
  INCLUI)
    echo "[TODO] Operação INCLUI ainda não implementada."
    ;;
  ALTERA)
    echo "[TODO] Operação ALTERA ainda não implementada."
    ;;
  DELETA)
    echo "[TODO] Operação DELETA ainda não implementada."
    ;;
  *)
    echo "Erro: operação inválida. Use uma das opções: LISTA, INCLUI, ALTERA, DELETA."
    exit 1
    ;;
esac

echo -e "\nFim do script."
