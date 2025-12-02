@echo off
setlocal

rem Caminhos
set "BASE_DIR=E:\DEVS2BLU\projetos\hackaton\deslocafacil\frontend"

set "CERT_DIR=%BASE_DIR%\cert"
set "WEBAPP_DIR=%BASE_DIR%\src\main\webapp"

rem Muda para o diretório dos certificados e do Caddyfile
cd /d "%CERT_DIR%"

rem Verifica se a porta 8080 está ocupada
netstat -ano | findstr :8080 >nul
if not errorlevel 1 (
    echo [ERRO] Porta 8080 ja esta em uso. Feche o processo e tente novamente.
    pause
    exit /b 1
) else (
    echo [INFO] Porta 8080 vazia! Continuando configuracao...
)

rem Inicia http-server com SSL em nova janela (em background)
echo Iniciando http-server com SSL em nova janela...
start "HTTP Server" cmd /k npx http-server "%WEBAPP_DIR%" --ssl --cert "%CERT_DIR%\cert.pem" --key "%CERT_DIR%\key.pem"

rem Aguarda 1 segundo para garantir que o http-server começou
timeout /t 1 >nul

rem Inicia o Caddy
echo Iniciando Caddy...
caddy start

endlocal