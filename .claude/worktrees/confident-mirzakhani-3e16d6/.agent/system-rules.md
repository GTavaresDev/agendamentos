# Harmonize — Regras do sistema

Regras de produto, negócio, permissão, UI e convenções que todo agente deve
respeitar ao alterar o Harmonize. Para estrutura de pastas e Clean Architecture,
veja [architecture.md](./architecture.md). Para o catálogo de casos de uso, veja
[use-cases.md](./use-cases.md).

---

## Contexto do produto

O **Harmonize** é um sistema de organização e gestão de agendamentos para uma
clínica de saúde, bem-estar e estética. A experiência está em **português do
Brasil (`pt-BR`)**.

### Capacidade atual

- login real com Auth.js (NextAuth v5) + sessão JWT;
- dashboard operacional;
- criação e visualização de agendamentos vinculados ao usuário logado;
- gestão de usuários/equipe e clientes;
- cadastro e gestão de produtos;
- relatórios de operação (parcialmente com dados mock);
- página pública da clínica e links de acesso livre.

### Identidade

| Item | Valor |
|------|--------|
| Nome | **Harmonize** |
| Assinatura | **Saúde, Bem Estar e Estética** |
| Logo | `public/logo.svg` (também pode existir `public/harmonize-logo.png`) |
| Proposta no login | “organizando o caos da rotina de agendamentos” |

### Rotas principais

| Rota | Função |
|------|--------|
| `/` | Login |
| `/dashboard` | Visão geral |
| `/agenda` | Agenda completa do dia |
| `/agendamentos` | Escolha de data/horário e cadastro |
| `/clientes` | Base de clientes |
| `/usuarios` | Usuários/equipe (restrito) |
| `/produtos` | Catálogo e estoque |
| `/relatorios` | Indicadores e análises |
| `/site` | Landing pública |
| `/links` | Links de acesso livre |

---

## Permissões e hierarquia

Níveis definidos em `core/domain/users/UserPermission.ts`:

| ID | Papel | Regras |
|----|--------|--------|
| `1` | **Administrador** | Acesso total; gerencia qualquer usuário; vê todas as agendas |
| `2` | **Gestor** | Acesso a `/usuarios`; pode criar **Gestor** ou **Funcionário**; só edita nível inferior (**Funcionário**); **não** cria/edita Administrador; **não exclui** usuários; na agenda **não vê** agendamentos de Administrador |
| `3` | **Funcionário** | **Sem** acesso a `/usuarios`; na agenda vê/edita apenas os próprios itens |

### Proteção de `/usuarios`

- Rota restrita a Administradores e Gestores (middleware + UI).
- Exclusão de usuários: **somente Administrador** (UI do menu `...` e Server Action).
- Nas Server Actions: o papel vem **somente da sessão Auth.js** (`auth()`), nunca
  de props enviadas pelo client.

`User.role` no domínio: `"Administrador" | "Gestor" | "Funcionario"`, alinhado a
`UserPermission` e à sessão.

### Autenticação e sessão

- Auth.js v5 (`next-auth@beta`), Credentials + JWT (`maxAge` 8h).
- Senhas com **bcrypt** (`core/infra/auth/password.ts`); upgrade automático de
  hashes SHA-256 legados no login.
- Lockout após 5 falhas (`failedLoginAttempts` / `lockedUntil`).
- Cookie httpOnly / CSRF via Auth.js; `AUTH_SECRET` obrigatório.
- Arquivos: `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`,
  `src/app/(agendamentos)/api/auth/[...nextauth]/route.ts`.
- Usuários de teste (seed): `admin@harmonize.com`, `gestor@harmonize.com`,
  `func@harmonize.com` — senha `123456`.

---

## Regras de agendamento (booking)

### Grade de horários

- Slots de **30 minutos**.
- Manhã: `08:00`–`11:30`; tarde: `13:00`–`17:30` (sem horário de almoço `12:00`).
- Fonte canônica de slots: `ALL_TIMES` em
  `core/domain/appointments/Appointment.ts` (espelhada em mocks de UI).

### Duração

| Duração | Slots consecutivos ocupados |
|---------|-----------------------------|
| 30 min | 1 |
| 60 min / 1h | 2 |
| 90 min / 1h30 | 3 |

Cálculo: `Appointment.getOccupiedSlots(startTime, duration)`.

### Conflito

- Não é permitido selecionar horário cujo intervalo (conforme a duração) colida
  com slots já ocupados no mesmo dia.
- **Cliente:** um mesmo cliente não pode estar vinculado a dois atendimentos no
  mesmo dia com intervalos sobrepostos (mesmo horário / duração conflitante).
  Regra em `core/domain/appointments/clientScheduleConflict.ts`, aplicada em
  `CreateAppointment`.
- A validação de ocupação geral deve migrar definitivamente para domínio/use
  case; hoje ainda há lógica na UI de `/agendamentos`.

### Tolerância de 5 minutos

- Um horário permanece reservável até `início + 5 minutos`.
- Exemplo: `14:00` pode ser marcado até `14:05`; depois disso fica **indisponível
  e riscado**.
- Helper: `src/lib/appointment-time.ts` (`BOOKING_TOLERANCE_MINUTES = 5`).
- Ideal futuro: invariante no domínio + validação no caso de uso de criação.

### Status de agendamento

Valores: `Confirmado` \| `Pendente` \| `Concluído` \| `Cancelado`.

Comportamento atual da UI (agenda/dashboard):

- ação **Status** alterna tipicamente `Confirmado` ↔ `Concluído`;
- **Excluir** remove o registro (não apenas cancela).

Canais conhecidos (mock/domínio): `site`, `whatsapp`, `recepcao`, `instagram`.

---

## Regras de produtos

- `price` e `quantity` ≥ 0.
- Se `quantity <= 5` e status seria Ativo → `Baixo estoque`.
- Se `quantity === 0` → `Inativo`.
- Status possíveis: `Ativo` \| `Inativo` \| `Baixo estoque`.

---

## Regras de usuários e clientes

- E-mail único (User e Client) — reforçado no use case e no banco.
- User: nome obrigatório; e-mail deve conter `@`.
- Client: status `Ativo` \| `Inativo`; CPF e data de nascimento opcionais.
- Senha de usuário: hasheada na Server Action (hoje SHA-256); detalhe de
  infraestrutura/apresentação, não do domínio.

---

## Paginação de listagens

- Tamanho de página: **10 itens** (`LIST_PAGE_SIZE` em `src/lib/pagination.ts`).
- Aplicar em: usuários, clientes, produtos e agenda.
- Ao mudar busca/filtros, voltar para a página `1`.
- Componente: `src/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination.tsx`.

---

## Regras de banco de dados (schema físico)

- Tabelas PostgreSQL em **PascalCase** com aspas: `"Users"`, `"Products"`,
  `"Appointments"`, `"AppointmentChannels"`, `"Clients"`, `"UserPermissions"`.
- No Prisma, sempre `@@map("NomeDaTabela")`.
- Migrations devem usar exatamente esses nomes.
- Schema físico **não** determina a forma das entidades de domínio.
- Clients de banco só no servidor; nunca no bundle do navegador.

---

## Convenções de React / Next.js

- Server Components por padrão; `"use client"` só com interação, estado ou API
  do browser.
- Fronteira client o mais baixa possível na árvore.
- Não misturar metadata, regra de negócio e UI complexa no mesmo arquivo.
- Imagens públicas a partir de `/` com `next/image` quando aplicável.
- Acessibilidade: labels, foco, teclado, contraste.
- Telas responsivas (mobile e desktop).
- Textos visíveis em `pt-BR`; identificadores de código em inglês.

### Componentes `.tsx`

Devem: renderizar, compor, receber props/callbacks, estado visual simples.

Não devem: `fetch`/banco direto, regra de negócio, formatação inline complexa,
funções reutilizáveis de domínio/formatadores dentro do arquivo (extraia para
`src/lib`, `core`, etc.).

### Operadores ternários em `.tsx`

Evite ternários no JSX. Permitidos apenas em atribuições simples de primitivos
fora do JSX. Para renderização condicional, use `if`, early return ou variáveis
pré-calculadas.

---

## Dados, validação e erros

- Validar na fronteira; reforçar invariantes no domínio.
- DTO ≠ entidade ≠ view model ≠ model de banco.
- Sem `any`.
- Erros de domínio específicos e independentes de transporte.
- Infra converte erros de banco/HTTP; UI mostra mensagens amigáveis em `pt-BR`.
- Mocks são adaptadores temporários — não importar no domínio nem embutir em
  componentes como fonte de verdade.

---

## Estratégia para o legado

Arquivos como `scheduling-app.tsx` e `reports-dashboard.tsx` ainda concentram
responsabilidades. Ao alterar:

1. não aumente o acoplamento;
2. extraia a nova regra para a camada correta;
3. migração incremental;
4. sem reescrita ampla sem pedido explícito;
5. preserve comportamento e aparência;
6. não altere mudanças não relacionadas do usuário.

---

## Checklist rápido antes de concluir

- [ ] Regra de negócio não ficou no `.tsx`
- [ ] Permissões Admin/Gestor/Funcionário respeitadas
- [ ] Booking: conflito + tolerância de 5 min considerados
- [ ] Listagens com 10 itens/página quando aplicável
- [ ] Tabelas Prisma mapeadas em PascalCase
- [ ] Sem vazamento de Prisma para domínio/UI
- [ ] Textos em `pt-BR`, código em inglês
- [ ] `npm run lint` e `npm run build` passam

Se um pedido do usuário conflitar com estes princípios, entregue o resultado
pedido respeitando as fronteiras da arquitetura e explique limitações relevantes.
