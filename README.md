# DeslocaFácil - Sistema de Mobilidade Corporativa

## 📋 Sobre o Projeto

MVP de sistema de mobilidade corporativa desenvolvido para o **Hackathon 2025 +Devs2Blu da Blusoft**, que permite gerenciar deslocamentos de colaboradores para eventos, treinamentos e onboardings.

**RESULTADO DA 5a EDIÇÃO DO HACKATON +Devs2Blu : 4a lugar entre 14 grupos participantes!**

###  Desafio

Empresas que recebem colaboradores de outras cidades/estados enfrentam dificuldades em:
- Acompanhar deslocamentos em tempo real
- Prever atrasos e estimar custos
- Organizar horários de chegada
- Consolidar histórico de viagens

### Solução

Sistema centralizado que permite:
- ✅ Registrar deslocamentos de colaboradores
- ✅ Organizar rotas e horários
- ✅ Monitorar status de chegada
- ✅ Exibir trajetos com integração Google Maps
- ✅ Realizar check-in de presença em checkpoints
- ✅ Analisar histórico para previsão de custos

---

## 🏗️ Arquitetura

### Stack Tecnológica

**Backend:**
- Java 21+
- Spring Boot 3.5.3
- Spring Security (autenticação baseada em sessão + CSRF)
- Spring Data JPA
- MySQL 8.0
- ModelMapper

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Bootstrap 5.3
- Font Awesome
- Arquitetura MPA (Multi-Page Application)

**Infraestrutura:**
- Maven
- Docker 
- Docker Compose
- Terraform
- AWS EC2

---

## 📊 Modelo de Dados

### Entidades Principais

#### Usuario
Colaboradores que realizam deslocamentos.
```
- id (PK)
- nome
- email (UK)
- senha (BCrypt)
- telefone
- ativo
- role (ADMIN, USUARIO)
- auditoria (data_cadastro, data_alteracao, criado_por, alterado_por)
```

#### Deslocamento
Registro de viagens corporativas.
```
- id (PK)
- usuario_id (FK)
- origem (cidade, estado, endereco)
- destino (cidade, estado, endereco)
- motivo
- datas (saida, chegada_prevista, chegada_real)
- meio_transporte (ENUM)
- custos (estimado, real)
- status (PLANEJADO, EM_TRANSITO, ATRASADO, CONCLUIDO, CANCELADO)
- observacoes
- auditoria
```

#### Checkpoint
Pontos de controle ao longo do trajeto.
```
- id (PK)
- deslocamento_id (FK, CASCADE)
- descricao
- categoria (PARTIDA, INTERMEDIARIO, CHEGADA)
- localizacao
- datas (prevista, realizada)
- ordem_sugerida
- icone, cor (para UI)
- observacoes
- auditoria
```

### Relacionamentos
- `Usuario` 1:N `Deslocamento`
- `Deslocamento` 1:N `Checkpoint` (ON DELETE CASCADE)

---

## 🔐 Segurança

### Autenticação
- Session-based authentication (JSESSIONID)
- Passwords: BCrypt
- CSRF Protection (Cookie + Header)
- HTTPS obrigatório (requiresSecure)

### Autorização por Role

Usuarios de perfil ADMIN podem criar, editar e consultar deslocamentos. Criar, deletar, alterar checkpoints, ativar e desativar usuarios.
Usuários de perfil USUÁRIO podem adicionar checkpoints em seus deslocamentos ativos e alterar seus dados de usuário.


## 📁 Estrutura do Projeto

```
deslocafacil/
├── backend/
│   └── src/main/java/edu/entra21/fiberguardian/
│       ├── assembler/          # DTOs assemblers/disassemblers
│       ├── configuration/      # Security, CORS, JPA, ModelMapper
│       ├── controller/         # REST endpoints
│       ├── dto/                # Data Transfer Objects
│       ├── exception/          # Exception handlers
│       ├── input/              # Request input models
│       ├── model/              # JPA Entities
│       ├── repository/         # Spring Data repositories
│       ├── service/            # Business logic
│       └── validation/         # Custom validators
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   ├── index.html
│   └── tela_principal.html
└── database/
    └── scripts SQL
```

---

## 🔌 API Endpoints

### Autenticação

#### Login
```http
POST /api/fg-login
Content-Type: application/json

{
  "email": "user@example.com",
  "senha": "senha123"
}
```

#### Logout
```http
POST /api/fg-logout
Cookie: JSESSIONID=xxx
```

#### CSRF Token
```http
GET /api/csrf-token
```

### Usuários

#### Criar Usuário (ADMIN)
```http
POST /api/usuarios
X-XSRF-TOKEN: xxx

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "role": "USUARIO",
  "senha": "senha123",
  "repeteSenha": "senha123"
}
```

#### Listar Usuários (Paginado)
```http
GET /api/usuarios?page=0&size=20
```

#### Buscar por Nome e Role
```http
GET /api/usuarios/lista-usuario-por-role?nome=João&role=USUARIO
```

#### Alterar Próprios Dados
```http
PUT /api/usuarios/me/nome
X-XSRF-TOKEN: xxx

{
  "nome": "João Silva Santos",
  "telefone": "(47) 99999-9999"
}
```

#### Alterar Senha
```http
PUT /api/usuarios/me/senha
X-XSRF-TOKEN: xxx

{
  "senhaAtual": "senha123",
  "novaSenha": "novaSenha456",
  "repeteNovaSenha": "novaSenha456"
}
```

#### Ativar/Inativar Usuário (ADMIN)
```http
PUT /api/ativo
X-XSRF-TOKEN: xxx

{
  "email": "user@example.com"
}
```

```http
DELETE /api/ativo
X-XSRF-TOKEN: xxx

{
  "email": "user@example.com"
}
```

### Deslocamentos (EM DESENVOLVIMENTO)

```
POST   /api/deslocamentos          # Criar deslocamento
GET    /api/deslocamentos          # Listar todos
GET    /api/deslocamentos/{id}     # Buscar por ID
PUT    /api/deslocamentos/{id}     # Atualizar
DELETE /api/deslocamentos/{id}     # Cancelar
GET    /api/deslocamentos/ativos   # Listar em trânsito/atrasados
```

---

### Checkpoints (EM DESENVOLVIMENTO)

```
POST   /api/checkpoints                    # Criar checkpoint
GET    /api/checkpoints/deslocamento/{id}  # Listar por deslocamento
POST   /api/checkpoints/{id}/checkin       # Realizar check-in
PUT    /api/checkpoints/{id}               # Atualizar
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Concluído
- [x] Autenticação e autorização (Session + CSRF)
- [x] CRUD de usuários
- [x] Gestão de roles (ADMIN, USUARIO)
- [x] Validações customizadas (email, senha)
- [x] Exception handling global
- [x] Auditoria automática (JPA Auditing)
- [x] Frontend base (tela principal, login)
- [x] CRUD de Deslocamentos
- [x] Consulta dinâmica de Deslocamentos usando filtros
- [x] Integração Google Maps

### 🚧 Em Desenvolvimento (Mocks)

- [ ] CRUD de Checkpoints
- [ ] Dashboard de acompanhamento
- [ ] Integração Google Maps
- [ ] Sistema de check-in
- [ ] Relatórios e análise de custos

---

## 🗺️ Integração Google Maps

### Visualização de Rotas

O sistema utiliza a **Google Maps Directions URL** para exibir rotas sem necessidade de API Key:

```javascript
const url = `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}`;
window.open(url, '_blank');
```

---

### Estratégia de Checkpoints

Para deslocamentos com múltiplos checkpoints intermediários, o sistema gera links sequenciais:

```
Checkpoint 1 (PARTIDA) → Checkpoint 2 (INTERMEDIARIO)
Checkpoint 2 → Checkpoint 3 (INTERMEDIARIO)
Checkpoint 3 → Checkpoint 4 (CHEGADA)
```

Cada trecho pode ser visualizado individualmente no Google Maps.

---

## 🧪 Testes

### Executar Testes
```bash
mvn test
```

---

### Cobertura (em planejamento)
```bash
mvn clean verify jacoco:report
```

---

## 📝 Validações Customizadas

### @EmailValido
```java
@NotBlank(message = "Email é obrigatório")
@Email(message = "Email deve ser válido")
@Size(max = 50, message = "Email deve ter até 50 caracteres")
```
---

### @SenhaValida
```java
@NotBlank(message = "A senha é obrigatória")
@Size(min = 6, max = 20, message = "A senha deve ter entre 6 e 20 caracteres")
```
---

# 🐳 Construção dos Containers e Arquitetura Docker

A aplicação roda 100% containerizada, utilizando **Docker** + **Docker Compose** para orquestração. A arquitetura é composta por três serviços principais:

```
mariadb ← backend (Spring Boot) ← frontend (NGINX + TLS)
```

## Backend (Dockerfile multi-stage)

O backend usa **multi-stage build** para reduzir tamanho e melhorar segurança:

### 🔨 Stage 1 — Build

* Base: `maven:3.9-eclipse-temurin-21`
* Compila o projeto e gera o fat-JAR via Maven

### 🚀 Stage 2 — Runtime

* Base: `eclipse-temurin:21-jre-jammy`
* Copia o JAR final
* Expõe a porta `8443`
* Executa via `java -jar`


Motivação: separar dependências de build e runtime → imagens menores, mais seguras.

---

## Frontend (NGINX + TLS real)

A imagem do frontend:

* Usa `nginx:alpine`
* Serve arquivos HTML/JS/CSS estáticos
* Recebe automaticamente via user-data:

  * `cert.pem`
  * `key.pem`
* Configura NGINX para servir em **HTTPS nativo (porta 443)**
* Remove config padrão e aplica seu próprio `nginx.conf`


### nginx.conf – Reverse Proxy Seguro com TLS

O frontend faz proxy para o backend desta forma:

* Frontend em: `https://ec2/`
* Backend em: `https://deslocafacil-backend:8443/api/...`

Componentes principais:

* Resolução dinâmica via `resolver 127.0.0.11` (Docker internal DNS)
* `proxy_ssl_verify off` para permitir TLS interno autoassinado
* Forward correto de headers (`X-Forwarded-*`)


Motivação: segurança de ponta a ponta, inclusive dentro da rede Docker.

---

## Docker Compose — Orquestração Completa

O `docker-compose.yml` define 3 serviços:

### 📌 mariadb

* Armazena dados persistidos
* Volume dedicado `db_data`
* Apenas backend tem acesso a ele


### 📌 backend

* Build via Dockerfile
* Lê variáveis sensíveis do `.env` gerado via SSM
* Inclui caminhos para chaves/certificados
* Reinício automático `restart: unless-stopped`
* Expõe `8443` para o NGINX


### 📌 frontend

* Build do Dockerfile do NGINX
* Depende do backend
* Expõe a porta `443` ao mundo
* Serve o site estático
* Proxy seguro para o backend


Motivação: arquitetura limpa, de três camadas, totalmente isolada:

```
[Usuário] → HTTPS → [NGINX Frontend] → HTTPS → [Spring Boot] → [MariaDB]
```

---

# 🏭 Infraestrutura (AWS + Terraform)

A infraestrutura é provisionada via **Terraform**, garantindo reprodutibilidade, mínimo esforço operacional e segurança centralizada por IAM + SSM Parameter Store.
Ela cria automaticamente:

### 🔐 Rede e Segurança

* **Security Group dedicado** permitindo apenas:

  * `22` (SSH)
  * `8443` (backend Spring Boot com TLS)
  * `443` (frontend NGINX com TLS)
    Todas as saídas são liberadas para permitir update, clone, SSM, etc.


### 🧩 IAM e Acesso Seguro a Secrets

* Criação de uma **IAM Role** exclusiva para a EC2.
* Permite acesso somente ao prefixo de parâmetros seguros no SSM:
  `/hackaton-devs2blu/backend/*`
* Policies para **decrypt via KMS** e leitura de parâmetros sensíveis:

  * credenciais do Banco
  * credenciais do Flyway
  * senhas de keystore
  * certificados SSL (Key + Cert)


### 🖥️ EC2 Automatizada com User Data

A máquina EC2 (Debian 12) é criada com:

* Docker Engine + Compose instalados
* Java 21 e Maven
* AWS CLI
* Clone automático do repositório
* Download seguro dos certificados TLS via SSM
* Correção, revalidação e normalização do formato PEM
* Criação do `.env` preenchido dinamicamente
* Build automático do backend (`mvn clean package`)
* Execução do `docker compose up -d`


### ✔ Objetivo da Infra

Produzir um ambiente totalmente **autogerenciado**, onde subir uma nova EC2 já entrega:

* Certificados válidos
* Variáveis sensíveis carregadas
* Backend compilado
* Containers rodando
* Frontend e API expostos em HTTPS

---




## 👥 Equipe

Projeto desenvolvido para o **Hackathon 2025 +Devs2Blu**.
- Angelo Balotin Mattos
- Cauê França
- Daniel Greenwod
- Danyel Pinheiro
- Giovanni Leopoldo Rozza

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais no contexto do Hackathon Blusoft.

---

## 🔗 Links Úteis

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3/)
- [Google Maps Platform](https://developers.google.com/maps)

---

**Status do Projeto:** 🚧 Em Desenvolvimento (MVP)