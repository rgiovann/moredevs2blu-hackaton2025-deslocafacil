echo "==> 4.1. Buscando fornecedor pelo CNPJ..."
CNPJ_TESTE="12345678000190"

curl -i -sk -b cookies.txt -c cookies.txt \
  -X GET "https://localhost/api/fornecedores/$CNPJ_TESTE" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN2" \
  -H "Accept: application/json"

echo -e "\n✅ Busca por CNPJ concluída."
echo

echo "==> 4.2. Inserindo novo fornecedor..."
curl -i -sk -b cookies.txt -c cookies.txt \
  -X POST https://localhost/api/fornecedores \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN2" \
  -d '{
    "nomeFornecedor": "Fornecedor de Teste Ltda",
    "cnpj": "'"$CNPJ_TESTE"'"
  }'

echo -e "\n✅ Inserção concluída."
echo

echo "==> 4.3. Atualizando fornecedor existente..."
curl -i -sk -b cookies.txt -c cookies.txt \
  -X PUT "https://localhost/api/fornecedores/$CNPJ_TESTE" \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN2" \
  -d '{
    "nomeFornecedor": "Fornecedor de Teste Ltda - Atualizado",
    "cnpj": "'"$CNPJ_TESTE"'"
  }'

echo -e "\n✅ Atualização concluída."
echo

echo "==> 4.4. Deletando fornecedor pelo CNPJ..."
curl -i -sk -b cookies.txt -c cookies.txt \
  -X DELETE "https://localhost/api/fornecedores/$CNPJ_TESTE" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN2"

echo -e "\n✅ Deleção concluída."
echo
