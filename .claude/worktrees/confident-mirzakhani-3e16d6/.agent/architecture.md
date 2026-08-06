# Harmonize — Arquitetura

Fonte de verdade da arquitetura do Harmonize. Leia antes de criar pastas,
mover camadas ou adicionar persistência.

## Princípio obrigatório: Clean Architecture + Hexagonal

O Harmonize adota **Clean Architecture** e **Ports & Adapters** como princípio
obrigatório. Toda nova feature deve separar apresentação, estado de interface,
regras de negócio, formatação, contratos e acesso a dados.

Código legado concentrado em arquivos grandes (ex.: `scheduling-app.tsx`,
`reports-dashboard.tsx`) **não deve ser copiado como modelo arquitetural**.
A migração é incremental, feature por feature.

### Direção das dependências

```text
presentation (src/app)  →  application (core/application)  →  domain (core/domain)
infrastructure (core/infra)  ─────────────────────────────────^
```

- `domain` não conhece React, Next.js, navegador, banco ou APIs.
- `application` coordena casos de uso e depende apenas do domínio e de contratos.
- `infrastructure` (`core/infra`) implementa gateways, repositórios e integrações.
- `presentation` (`src/app`) renderiza a UI e chama casos de uso; não contém
  regra de negócio nem acesso direto a dados.
- Uma camada interna nunca importa uma camada externa.

## Estrutura do repositório

```text
harmonize/
├── .agent/                         # Documentação para agentes
│   ├── rules.md                    # Índice
│   ├── architecture.md             # Este arquivo
│   ├── use-cases.md
│   └── system-rules.md
├── core/                           # Núcleo (independente de Next.js)
│   ├── domain/                     # Entidades + portas de repositório
│   │   ├── users/
│   │   ├── clients/
│   │   ├── products/
│   │   └── appointments/
│   ├── application/                # Casos de uso
│   │   ├── users/
│   │   ├── clients/
│   │   ├── products/
│   │   ├── appointments/
│   │   └── reports/
│   └── infra/                      # Adaptadores secundários
│       ├── db/
│       └── persistence/
│           └── prisma/
│               ├── client.ts
│               ├── mappers/
│               └── repositories/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── src/
    ├── app/                        # Apresentação (Next.js App Router)
    │   ├── (agendamentos)/         # Sistema Harmonize (login, sessão, agenda)
    │   │   ├── api/                # Rotas API do sistema (Auth.js em /api/auth)
    │   │   ├── mocks/              # Dados demonstrativos do sistema
    │   │   ├── login/page.tsx      # Login (/login)
    │   │   └── (left-nav-bar)/     # Área logada com sidebar
    │   │       ├── _actions/       # Server Actions da área autenticada
    │   │       ├── _components/    # UI da área autenticada
    │   │       └── */page.tsx      # dashboard, agenda, clientes, etc.
    │   ├── (free-access)/          # Sites públicos (sem login/sessão)
    │   │   ├── _components/
    │   │   ├── site/
    │   │   └── links/
    │   ├── layout.tsx
    │   └── page.tsx                # Redireciona / → /login
    └── lib/                        # Helpers de apresentação / utilitários
```

### Aliases

- `@/*` → `src/*`
- `@core/*` → `core/*`

### Regras de organização

- **Não** utilize a pasta `src/features`. O núcleo fica centralizado em `core/`.
- `(agendamentos)` = sistema completo Harmonize (auth, sessão, agendamentos).
- `(left-nav-bar)` = shell autenticado; concentra `_actions` e `_components` da
  área logada (não ficam irmãos de `(left-nav-bar)` em `(agendamentos)/`).
- `(free-access)` = páginas públicas isoladas, sem login/sessão.
- `api` e `mocks` pertencem a `(agendamentos)/`, não à raiz de `app/`.
  Route groups `(...)` não alteram URLs (`/api/auth` permanece).
- Server Actions de um módulo ficam no grupo de rotas em `_actions/`, não soltas
  em `src/app/actions/`.
- Infraestrutura técnica fica em `core/infra/` (não em `src/`).
- Páginas `page.tsx` e layouts devem ser finos: rota, metadata, boundary e
  composição/injeção.

## Responsabilidades por tipo de artefato

### Domínio (`core/domain`)

Entidades, value objects, invariantes e interfaces de repositório.

- TypeScript puro, testável sem React/Next.js.
- Regras como quantidade válida, conflito de horário, status e transições
  pertencem aqui.
- Interfaces de repositório expressam intenção de negócio (não API de ORM).

### Casos de uso (`core/application`)

- Validam e coordenam a operação.
- Aplicam regras de negócio.
- Dependem de interfaces, nunca de implementações concretas.
- Retornam resultados tipados.
- Não renderizam, não formatam para UI e não conhecem Next.js.

### Infraestrutura (`core/infra`)

- Implementa contratos do domínio/aplicação (Prisma, mappers, repositórios).
- Converte models externos ↔ entidades via mappers.
- Normaliza erros técnicos em erros da aplicação.
- É a **única** camada que pode conhecer ORM, SQL, connection strings e SDKs.

### Apresentação (`src/app`)

- Server Actions: composition root fino — instanciam repositórios e chamam
  use cases.
- Componentes `.tsx`: JSX, composição, props, eventos simples, estado visual.
- Hooks (quando existirem): estado/ciclo de UI, loading, erro, paginação,
  filtros; sem regra de negócio.
- Formatters e utils de UI ficam fora do JSX (`src/lib` ou módulos dedicados).

### O que componentes `.tsx` não devem fazer

- `fetch`, banco, `localStorage` ou serviços diretos;
- regra de negócio;
- transformação complexa de DTOs;
- formatação de moeda/data/telefone inline;
- concentrar uma feature inteira em um único arquivo;
- declarar grandes massas de mock.

## Persistência e independência de banco

A aplicação **não pode depender** de um banco, ORM ou fornecedor específico.
Trocar a tecnologia de persistência não deve alterar domínio, casos de uso,
hooks ou componentes.

### Isolamento

Somente `core/infra` pode conhecer:

- client/driver do banco;
- ORM e tipos gerados;
- SQL, tabelas, relações físicas;
- connection strings e env de persistência;
- migrations, seeds, RLS, triggers, SDKs proprietários.

`domain`, `application` e `presentation` **não** importam tipos Prisma (ou de
qualquer outro ORM).

### Portas orientadas ao negócio

Casos de uso dependem de interfaces como:

```ts
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

Evite portas genéricas do tipo `query(table, where)`, `execute(sql)` ou
`findMany(argsDoOrm)`.

### Adaptadores

```text
core/domain/.../ProductRepository.ts          (contrato)
        ^
core/infra/persistence/prisma/repositories/   (Prisma)
core/infra/persistence/in-memory/             (testes — quando existir)
```

A escolha da implementação ocorre no **composition root** (hoje: Server Actions).
Nunca use condicionais de banco dentro de use cases, entidades ou componentes.

### Models vs entidades vs DTOs vs view models

| Conceito | Papel |
|----------|--------|
| Database model | Tabela/coluna do mecanismo de persistência |
| Entity | Comportamento e invariantes do negócio |
| DTO | Transporte na fronteira do caso de uso |
| View model | Dados preparados para a UI |

Fluxo de mapeamento:

```text
DatabaseModel → PersistenceMapper → DomainEntity
DomainEntity  → PersistenceMapper → DatabaseModel
```

Nunca retorne model do ORM para o caso de uso. Nunca anexe decorators/campos
técnicos de persistência na entidade.

### Identificadores, datas e valores

- IDs do domínio são tipos/value objects da aplicação; UUID/autoincrement são
  detalhe do adaptador.
- Datas do domínio são `Date` ou value objects; timestamps do banco não vazam.
- Dinheiro: preferir value object `Money` (não tipos `decimal` do ORM na entity).
- Nulos, enums e status físicos são traduzidos para conceitos do domínio.

### Transações

Quando houver atomicidade entre repositórios, use abstração de aplicação
(`UnitOfWork` / `TransactionManager`). O use case não chama `beginTransaction`,
`commit` ou `rollback` do driver.

### Paginação e consultas

- Filtros/paginação entram por objetos da aplicação.
- Repositórios convertem para a linguagem do banco.
- Relatórios analíticos podem usar portas de leitura dedicadas (CQRS pontual).
- Portas de leitura retornam DTOs da aplicação, nunca rows crus.

### Erros e constraints

- Invariantes ficam no domínio; constraints do banco são segunda linha de defesa.
- Infra converte erros técnicos em `ConflictError`, `NotFoundError`,
  `PersistenceError` (ou equivalentes da aplicação).
- Credenciais nunca entram no repositório nem no bundle do client.

### Testes de persistência

Toda porta deve permitir:

- testes de use case com fake/`in-memory`;
- testes de contrato por implementação;
- testes de mapper, constraints e transações;
- troca de banco sem reescrever testes de domínio/aplicação.

## Fluxo esperado de uma feature

```text
Page / Component
  → Server Action (_actions/*)
    → UseCase (core/application)
      → Repository port (core/domain)
        → Prisma*Repository (core/infra)
          → Mapper
            → PostgreSQL
```

Exemplo de produto:

```text
ProductsPage
  → product-actions.ts
    → CreateProduct
      → ProductRepository
        → PrismaProductRepository
          → ProductMapper
            → Prisma Client
```

## Composition root atual

Server Actions em `src/app/(agendamentos)/(left-nav-bar)/_actions/`:

- `user-actions.ts`
- `client-actions.ts`
- `product-actions.ts`
- `appointment-actions.ts`
- `report-actions.ts`

Cada action instancia o repositório Prisma concreto e injeta no caso de uso.

## Stack técnica

| Área | Tecnologia |
|------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| Linguagem | TypeScript `strict` |
| Estilo | Tailwind CSS 4 |
| Ícones | Lucide React |
| Gráficos | Recharts |
| UI local | `src/app/(agendamentos)/(left-nav-bar)/_components/ui` |
| Persistência | PostgreSQL + Prisma 6 (somente em `core/infra`) |
| Auth | Auth.js v5 (`next-auth`), bcryptjs, zod |

Arquivos de auth: `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`,
`src/app/(agendamentos)/api/auth/[...nextauth]/route.ts`, `core/infra/auth/password.ts`.

Antes de concluir alterações relevantes:

```bash
npm run lint
npm run build
```

## Estratégia para o legado

Ao alterar áreas ainda monolíticas:

1. não aumente o acoplamento;
2. extraia a nova regra para a camada correta;
3. migre de forma incremental;
4. não faça reescrita ampla sem pedido explícito;
5. preserve comportamento e aparência;
6. não altere mudanças não relacionadas do usuário.

## Checklist arquitetural (nova feature)

- [ ] Domínio não importa React, Next.js ou infraestrutura
- [ ] Componentes `.tsx` apenas renderizam e delegam
- [ ] Regras de negócio em entidades / value objects / casos de uso
- [ ] Formatação fora do JSX
- [ ] Acesso externo atrás de gateway/repositório
- [ ] Nenhum tipo/client de banco vazou para domínio, aplicação ou UI
- [ ] Contratos de repositório orientados ao negócio
- [ ] Models convertidos por mappers explícitos
- [ ] Implementação do banco escolhida só no composition root
- [ ] Casos de uso testáveis com adaptadores `in-memory`
- [ ] Imports respeitam a direção das dependências
- [ ] Não há `fetch` ou mocks dentro de componentes de domínio
- [ ] Não foi criada pasta `src/features`
- [ ] `npm run lint` e `npm run build` passam
