@echo off
setlocal

rem Caminhos
set "BASE_DIR=E:\ENTRA21\projetos\fiberguardian\frontend"
set "CERT_DIR=%BASE_DIR%\cert"
set "WEBAPP_DIR=%BASE_DIR%\src\main\webapp"

rem Muda para o diretório dos certificados e do Caddyfile
cd /d "%CERT_DIR%"

rem Inicia http-server com SSL em nova janela (em background)
echo Iniciando http-server em HTTP (porta 8080)...
start "HTTP Server" cmd /k npx http-server "%WEBAPP_DIR%" -p 8080

rem Aguarda 1 segundo para garantir que o http-server começou
timeout /t 1 >nul

rem Inicia o Caddy
echo Iniciando Caddy...
caddy stop
caddy start

endlocal