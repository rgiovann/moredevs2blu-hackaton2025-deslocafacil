#!/bin/bash

curl -i -X POST https://localhost/api/usuarios/reset-senha \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guilherme.dias@fiberguardian.com",
    "senha": "novaSenha123",
    "repeteSenha": "novaSenha123"
  }' \
  --insecure