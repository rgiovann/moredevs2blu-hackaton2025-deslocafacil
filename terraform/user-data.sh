#!/bin/bash
set -e

##############################
# Atualização do sistema
##############################
sudo apt-get update -y

##############################
# Instala AWS CLI
##############################
sudo apt-get install -y awscli

##############################
# Dependências utilitárias
##############################
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    unzip

##############################
# Instala OpenJDK 21
##############################
# 1. Instalar dependências
sudo apt-get update
sudo apt-get install -y wget apt-transport-https gnupg

# 2. Adicionar chave GPG do Adoptium (Temurin)
wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo tee /etc/apt/trusted.gpg.d/adoptium.asc

# 3. Adicionar repositório
echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/adoptium.list

# 4. Atualizar e instalar Java 21
sudo apt-get update
sudo apt-get install -y temurin-21-jdk

# 5. Verificar instalação
java -version

##############################
# Instala Maven
##############################
sudo apt-get install -y maven

##############################
# Instalação do Docker Engine
##############################
# 4. Criar diretório para keyrings
sudo install -m 0755 -d /etc/apt/keyrings

# 5. Baixar chave GPG do Docker
sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
    -o /etc/apt/keyrings/docker.asc

# 6. Ajustar permissões
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 7. Adicionar repositório Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 8. Atualizar índice de pacotes
sudo apt-get update

# 9. Instalar Docker Engine
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 10. Verificar instalação
sudo docker --version
sudo docker compose version

# 11. Testar Docker
sudo docker info

# 12. (Opcional) Adicionar usuário ao grupo docker (evita usar sudo)
sudo usermod -aG docker admin
##############################
# Adiciona usuário admin ao grupo docker
##############################
if id "admin" &>/dev/null; then
    usermod -aG docker admin
fi

##############################
# Clona o repositório
##############################
cd /home/admin
sudo -u admin git clone https://github.com/rgiovann/moredevs2blu-hackaton2025-deslocafacil.git

cd moredevs2blu-hackaton2025-deslocafacil/backend

# sudo -u admin mkdir -p src/main/resources/ssl

##############################
# Baixa SSL cert e SSL key do SSM
##############################
aws ssm get-parameter --name "/hackaton-devs2blu/tls/key" --with-decryption --query "Parameter.Value" --output text > src/main/resources/ssl/key.pem

aws ssm get-parameter --name "/hackaton-devs2blu/tls/cert" --with-decryption --query "Parameter.Value" --output text > src/main/resources/ssl/cert.pem

# chmod 600 src/main/resources/ssl/*.pem

# fix dos certificados

cd /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/src/main/resources/ssl

echo "=== Corrigindo certificado ==="
# Extrair Base64 limpo
cat cert.pem | \
  sed 's/-----BEGIN CERTIFICATE-----//g' | \
  sed 's/-----END CERTIFICATE-----//g' | \
  tr -d ' \n' > /tmp/cert_base64.txt

# Reformatar com quebras corretas
echo "-----BEGIN CERTIFICATE-----" > cert.pem
fold -w 64 /tmp/cert_base64.txt >> cert.pem
echo "" >> cert.pem  # ← ADICIONA linha vazia antes do END
echo "-----END CERTIFICATE-----" >> cert.pem

echo "=== Corrigindo chave privada ==="
# Extrair Base64 limpo
cat key.pem | \
  sed 's/-----BEGIN PRIVATE KEY-----//g' | \
  sed 's/-----END PRIVATE KEY-----//g' | \
  tr -d ' \n' > /tmp/key_base64.txt

# Reformatar
echo "-----BEGIN PRIVATE KEY-----" > key.pem
fold -w 64 /tmp/key_base64.txt >> key.pem
echo "" >> key.pem  # ← ADICIONA linha vazia antes do END
echo "-----END PRIVATE KEY-----" >> key.pem

# Limpar temporários
rm /tmp/cert_base64.txt /tmp/key_base64.txt

echo "=== Validando certificado ==="
openssl x509 -in cert.pem -text -noout | head -n 15

echo "=== Formato corrigido ==="
tail -n 3 cert.pem

##############################
# Ajustar permissões dos certificados
##############################
echo "=== Ajustando permissões dos certificados ==="

# Mudar dono para admin
chown admin:admin /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/src/main/resources/ssl/cert.pem
chown admin:admin /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/src/main/resources/ssl/key.pem

# Ajustar permissões (leitura para Maven)
chmod 644 /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/src/main/resources/ssl/cert.pem
chmod 644 /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/src/main/resources/ssl/key.pem

# Verificar
ls -la /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/src/main/resources/ssl/

echo "=== Permissões ajustadas ==="

##############################################
# Copia certificados do backend para o frontend
##############################################

cp /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/src/main/resources/ssl/cert.pem \
   /home/admin/moredevs2blu-hackaton2025-deslocafacil/frontend/cert/cert.pem

cp /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/src/main/resources/ssl/key.pem \
   /home/admin/moredevs2blu-hackaton2025-deslocafacil/frontend/cert/key.pem

cd /home/admin/moredevs2blu-hackaton2025-deslocafacil

##############################
# Lê variáveis sensíveis do backend (DB e Flyway)
##############################
DB_USER=$(aws ssm get-parameter --name "/hackaton-devs2blu/backend/db_user" --with-decryption --query "Parameter.Value" --output text)
DB_PASSWORD=$(aws ssm get-parameter --name "/hackaton-devs2blu/backend/db_password" --with-decryption --query "Parameter.Value" --output text)
DB_URL=$(aws ssm get-parameter --name "/hackaton-devs2blu/backend/db_url" --with-decryption --query "Parameter.Value" --output text)

FLYWAY_USER=$(aws ssm get-parameter --name "/hackaton-devs2blu/backend/flyway_user" --with-decryption --query "Parameter.Value" --output text)
FLYWAY_PASSWORD=$(aws ssm get-parameter --name "/hackaton-devs2blu/backend/flyway_password" --with-decryption --query "Parameter.Value" --output text)
FLYWAY_URL=$(aws ssm get-parameter --name "/hackaton-devs2blu/backend/flyway_url" --with-decryption --query "Parameter.Value" --output text)

KEYSTORE_PASSWORD=$(aws ssm get-parameter --name "/hackaton-devs2blu/backend/keystore_password" --with-decryption --query "Parameter.Value" --output text)
KEY_PASSWORD=$(aws ssm get-parameter --name "/hackaton-devs2blu/backend/keystore_key_password" --with-decryption --query "Parameter.Value" --output text)

##############################
# Cria arquivo .env para o Docker Compose
##############################
cat <<EOF > /home/admin/moredevs2blu-hackaton2025-deslocafacil/.env
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_URL=$DB_URL

FLYWAY_USER=$FLYWAY_USER
FLYWAY_PASSWORD=$FLYWAY_PASSWORD
FLYWAY_URL=$FLYWAY_URL

KEYSTORE_PATH=classpath:localhost.p12
KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD
KEYSTORE_TYPE=PKCS12
KEYSTORE_ALIAS=localhost
KEY_PASSWORD=$KEY_PASSWORD
EOF

chown admin:admin /home/admin/moredevs2blu-hackaton2025-deslocafacil/.env
chmod 600 /home/admin/moredevs2blu-hackaton2025-deslocafacil/.env

##############################
# Build do backend (gera o JAR)
##############################
sudo -u admin mvn -f /home/admin/moredevs2blu-hackaton2025-deslocafacil/backend/pom.xml clean package -DskipTests

##############################
# Sobe o Docker Compose
##############################
cd /home/admin/moredevs2blu-hackaton2025-deslocafacil

sudo docker compose up -d

##############################
# Fim do userdata
##############################
