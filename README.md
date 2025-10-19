# 🧩 Plataforma de Reservas API

API RESTful desenvolvida com **Node.js**, **Express**, **Prisma** e **TypeScript**, permitindo o gerenciamento de **usuários (clientes e provedores de serviço)**, **serviços** e **reservas**, com **autenticação JWT**, **histórico de transações** e **documentação Swagger**.

---

## 🚀 Tecnologias Utilizadas

- **Node.js** — Ambiente de execução JavaScript
- **Express** — Framework para criação da API
- **Prisma ORM** — Acesso ao banco de dados
- **TypeScript** — Tipagem estática
- **JWT (JSON Web Token)** — Autenticação e autorização
- **bcrypt** — Criptografia de senhas
- **Jest** — Testes unitários
- **Swagger UI** — Documentação interativa da API

---

## 📂 Estrutura do Projeto

📦 prestacao-de-servico
├── 📁 src
│ ├── 📁 config
│ │ └── swagger.ts
│ │ └── index.ts
│ ├── 📁 modules
│ ├── 📁 error
│ ├── 📁 generate
│ ├── 📁 interfaces
│ ├── 📁 types
│ ├── 📁 enums
│ ├── 📁 middlewares
│ ├── 📁 routes
│ ├── 📁 shared
│ ├── 📁 helpers
│ ├── prisma
│ │ ├── schema.prisma
│ │ └── seed.ts
│ └── server.ts
├── 📁 tests
│ ├── createReservation.test.ts
│ └── cancelReservation.test.ts
│ └── deleteReservation.test.ts
│ └── updateReservation.test.ts
├── .env
├── .env.sample
├── package.json
├── tsconfig.json
└── README.md

### 3️⃣ Configurar variáveis de ambiente .env

# Crie um arquivo .env na raiz com o seguinte conteúdo:

-DATABASE_URL="mysql://usuario:senha@host:porta/banco"
-JWT_SECRET="chave_super_segura"
-PORT=3000

---

### 2️⃣ Instalar dependências

## -npm install

### 🧱 Banco de Dados (Prisma)

# Criar o banco de dados

-npm run push - comando para subir as tabelas ao banco local
-npm run seed - comando para preencher o banco com dados fake com admin

---

### ▶️ Executar o Servidor

Desenvolvimento
npm run dev

# Servidor disponível em:

👉 http://localhost:3000

# Documentação Swagger:

## 👉 http://localhost:3000/docs

### 🧑‍💻 Rotas Principais

Método Endpoint Descrição
POST /api/users/register Cria novo usuário
POST /api/users/login Autenticação JWT
GET /api/services Lista todos os serviços
POST /api/reservations Cria uma nova reserva
PATCH /api/reservations/:id/cancel Cancela uma reserva
PATCH /api/users/:id/balance Atualiza o saldo de um usuário

## ⚙️ Configuração do Ambiente

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/reinaldo-vombo/prestacao-de-servico.git
cd prestacao-de-servico
```
