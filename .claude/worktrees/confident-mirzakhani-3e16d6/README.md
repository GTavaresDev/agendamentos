# 🌿 Harmonize — Gestão Inteligente para Clínicas de Estética

Plataforma SaaS completa e moderna desenvolvida para gestão de agendamentos, clientes, controle de estoque, equipe profissional e relatórios operacionais em tempo real para clínicas de saúde, estética e bem-estar.

---

## 🚀 Funcionalidades Principais

- 📊 **Dashboard Geral**: Resumo em tempo real dos agendamentos do dia, clientes ativos, faturamento e indicadores de desempenho.
- 📅 **Gestão de Agendamentos & Agenda**:
  - Visualização em lista e grade diária/semanal por profissionais.
  - Cadastro de consultas, seleção de cliente, serviço, duração e observações.
  - Atualização dinâmica de status (Confirmado, Concluído, Cancelado).
  - Trava configurável para agendamentos em horários passados (exclusivo Administrador).
- 👤 **Gestão de Clientes**: Cadastro completo de clientes com histórico de procedimentos, contatos, CPF e aniversários.
- 🛍️ **Controle de Produtos & Estoque**: Catálogo de produtos comercializados na clínica, precificação e níveis de estoque em tempo real.
- 👥 **Gestão de Usuários & Permissões**:
  - Perfis de acesso granulares (Administrador, Funcionário, etc.).
  - Controle de bloqueio automático por tentativas inválidas de senha.
  - **Modo de Visualização (Impersonation)**: Permite que administradores visualizem o sistema exatamente como qualquer usuário ou profissional da equipe.
- 📈 **Relatórios & Gráficos**: Dashboards analíticos consolidados com gráficos de canais de captação (Digital vs. Presencial), evolução de receita e performance operacional.
- 🔗 **Página Externa de Links & Site**: Hub público de links corporativos (`/links`) e página informativa (`/site`).

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Interface & Estilização**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), Radix UI
- **Banco de Dados**: [PostgreSQL 16](https://www.postgresql.org/)
- **ORM**: [Prisma ORM v6](https://www.prisma.io/)
- **Autenticação**: [NextAuth.js v5](https://authjs.dev/) (Auth.js) & `bcryptjs`
- **Validação de Dados**: [Zod](https://zod.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Processamento de Imagens**: [Sharp](https://sharp.pixelplumbing.com/) (Geração automatizada de favicon e banners OpenGraph)
- **Containerização**: [Docker](https://www.docker.com/) & Docker Compose

---

## 📂 Estrutura do Projeto

```text
harmonize/
├── prisma/
│   ├── schema.prisma       # Modelagem do banco de dados (Users, Clients, Products, Appointments)
│   └── seed.ts             # Dados iniciais para ambiente de desenvolvimento
├── public/                 # Recursos estáticos (Logos, favicons, banners OpenGraph)
├── scripts/
│   ├── generate-assets.js  # Script de geração de ícones e og:image
│   └── seed-prod.ts        # Script de carga inicial para produção
├── src/
│   └── app/
│       ├── (agendamentos)/ # Módulo autenticado com barra de navegação lateral
│       │   └── (left-nav-bar)/
│       │       ├── _actions/       # Server Actions (Auth, Usuários, Clientes, Agendamentos)
│       │       ├── _components/    # Componentes e layouts da aplicação
│       │       ├── agenda/         # Visão de calendário/grade
│       │       ├── agendamentos/   # Listagem e edição de agendamentos
│       │       ├── clientes/       # Gestão de clientes
│       │       ├── dashboard/      # Painel inicial
│       │       ├── produtos/       # Gestão de produtos
│       │       ├── relatorios/     # Dashboards analíticos
│       │       └── usuarios/       # Gestão de equipe e usuários
│       ├── (free-access)/  # Páginas públicas sem necessidade de login (/links, /site)
│       ├── login/          # Tela de autenticação
│       └── layout.tsx      # Root Layout com configurações de SEO, OpenGraph e Favicon
├── docker-compose.yml      # Configuração do container PostgreSQL
└── package.json
```

---

## ⚙️ Pré-requisitos & Configuração (.env)

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **Node.js** (v20 ou superior)
- **npm**, **yarn** ou **pnpm**
- **Docker** e **Docker Compose** (para executar o banco PostgreSQL localmente)

Crie um arquivo `.env` na raiz do projeto baseado no `.env.exemple`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/harmonize_db?schema=public"
AUTH_SECRET="sua_chave_secreta_para_next_auth"
MASTER_ADMIN_USER_ID="admin@harmonize"
MASTER_ADMIN_PASSWORD="sua_senha_master"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🛠️ Passo a Passo para Execução Local

### 1. Clonar o repositório e instalar dependências

```bash
git clone https://github.com/usuario/harmonize.git
cd harmonize
npm install
```

### 2. Subir o Banco de Dados com Docker

```bash
docker compose up -d
```

### 3. Rodar as Migrações e o Seed do Prisma

```bash
# Executa as migrations para criar as tabelas no PostgreSQL
npx prisma migrate dev

# Executa o seed para popular o banco com dados de teste
npm run db:seed
```

### 4. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra o seu navegador em [http://localhost:3000](http://localhost:3000).

---

## 🔐 Credenciais Padrão para Teste (Seed)

Após executar o comando `npm run db:seed`, utilize as seguintes credenciais para acessar o ambiente local:

- **Administrador**: `admin@harmonize` | **Senha**: `zxcasd`
- **Funcionário**: `lucas@harmonize` | **Senha**: `zxcasd`

---

## 📜 Scripts Disponíveis

No arquivo `package.json`, estão disponíveis os seguintes comandos:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o ambiente de desenvolvimento local na porta 3000 |
| `npm run build` | Compila o projeto para produção utilizando Webpack |
| `npm run start` | Inicia o servidor Next.js em modo de produção |
| `npm run lint` | Executa o linter do ESLint para análise estática de código |
| `npm run db:seed` | Executa a carga inicial de dados fictícios para desenvolvimento |
| `npm run db:seed:prod` | Executa a carga inicial de dados essenciais para ambiente de produção |

---

## 🌐 Deploy

O projeto está otimizado para deploy em plataformas Serverless como a **Vercel**:

1. Conecte o repositório na Vercel.
2. Configure as variáveis de ambiente (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`).
3. Certifique-se de que o banco PostgreSQL de produção esteja acessível via string de conexão.

---

## 📄 Licença

Este projeto é de propriedade privada. Todos os direitos reservados.
