# DeslocaFácil - Sistema de Mobilidade Corporativa

## 📋 Sobre o Projeto

MVP de sistema de mobilidade corporativa desenvolvido para o **Hackathon 2025 +Devs2Blu da Blusoft**, que permite gerenciar deslocamentos de colaboradores para eventos, treinamentos e onboardings.

### Contexto

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
- Java 17+
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
- Docker (em planejamento)

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

| Endpoint | ADMIN | USUARIO |
|----------|-------|---------|
| POST /api/usuarios | ✅ | ❌ |
| GET /api/usuarios | ✅ | ❌ |
| PUT /api/ativo | ✅ | ❌ |
| POST /api/usuarios/reset-senha | ✅ | ❌ |
| GET /api/usuarios/me/nome | ✅ | ✅ |
| PUT /api/usuarios/me/senha | ✅ | ✅ |

### CORS
Configurado para origens específicas:
```
- https://localhost:5500
- https://localhost:8080
- https://127.0.0.1:5500
```

---

## 🚀 Instalação e Execução

### Pré-requisitos
```bash
- Java 17+
- Maven 3.8+
- MySQL 8.0+
```

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/deslocafacil.git
cd deslocafacil
```

### 2. Configurar Banco de Dados

Criar database:
```sql
CREATE DATABASE deslocafacil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Executar scripts SQL da pasta `/database`:
```sql
source database/01_create_tables.sql
source database/02_insert_data.sql
```

### 3. Configurar application.properties
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/deslocafacil
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
```

### 4. Executar Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Aplicação disponível em: `https://localhost:8080`

### 5. Executar Frontend

Com Live Server (VSCode):
```
1. Abrir pasta /frontend no VSCode
2. Clicar com botão direito em index.html
3. Selecionar "Open with Live Server"
```

Ou servidor HTTP simples:
```bash
cd frontend
python -m http.server 5500
```

Frontend disponível em: `https://localhost:5500`

---

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

### 🚧 Em Desenvolvimento
- [ ] CRUD de Deslocamentos
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

### @SenhaValida
```java
@NotBlank(message = "A senha é obrigatória")
@Size(min = 6, max = 20, message = "A senha deve ter entre 6 e 20 caracteres")
```

### @RecebimentoRecente
```java
// Valida se a data não excede X meses no passado
@RecebimentoRecente(mesesMaximo = 6)
```

---

## 🐛 Troubleshooting

### Erro: CSRF token inválido
```bash
# Solução: Obter novo token antes de cada requisição mutável
GET /api/csrf-token
```

### Erro: Session expirada
```bash
# Solução: Fazer login novamente
POST /api/fg-login
```

### Erro: No property 'email' found for type 'Deslocamento'
```bash
# Causa: Método findByEmail no DeslocamentoRepository
# Solução: Remover método ou ajustar para findByUsuarioEmail
```

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