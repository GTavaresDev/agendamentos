# Harmonize — Casos de uso

Catálogo dos casos de uso da aplicação (`core/application`). Cada ação do
sistema deve ter um caso de uso pequeno, explícito e independente de UI/ORM.

## Convenções

Casos de uso:

- validam e coordenam a operação;
- aplicam regras de negócio;
- dependem de **interfaces** (portas), nunca de implementações concretas;
- retornam resultados tipados;
- não renderizam, não formatam para UI e não conhecem Next.js.

Nomes preferidos: verbo + substantivo (`CreateProduct`, `ListAppointments`,
`UpdateAppointmentStatus`).

Ponto de entrada atual: Server Actions em
`src/app/(agendamentos)/(left-nav-bar)/_actions/*` instanciam o repositório e chamam o use case.

---

## Users — `core/application/users/`

| Caso de uso | Arquivo | Responsabilidade |
|-------------|---------|------------------|
| **AuthenticateUser** | `AuthenticateUser.ts` | Valida e-mail/senha, status Ativo, lockout; rehash bcrypt se legado; retorna DTO seguro |
| **CreateUser** | `CreateUser.ts` | Cria usuário; e-mail único; defaults `role=Funcionario`, `status=Ativo` |
| **UpdateUser** | `UpdateUser.ts` | Atualização parcial (inclui lockout/senha); recalcula iniciais se o nome mudar |
| **ListUsers** | `ListUsers.ts` | Lista com filtros opcionais: search (nome/e-mail/telefone), role, status |
| **DeleteUser** | `DeleteUser.ts` | Remove usuário existente; falha se não encontrado |

### Porta

`core/domain/users/UserRepository.ts` —
`findAll`, `findById`, `findByEmail`, `save`, `update`, `delete`.

### Fronteira (Server Actions)

`src/app/(agendamentos)/(left-nav-bar)/_actions/user-actions.ts`

- `fetchUsersAction`
- `createUserAction` (bcrypt + hierarquia via sessão Auth.js)
- `updateUserAction`
- `deleteUserAction`

Auth:

`src/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions.ts` — `loginAction`, `logoutAction`,
`getCurrentSessionAction`, `requireSessionAction`.

---

## Clients — `core/application/clients/`

| Caso de uso | Arquivo | Responsabilidade |
|-------------|---------|------------------|
| **CreateClient** | `CreateClient.ts` | Cria cliente; garante e-mail único |
| **UpdateClient** | `UpdateClient.ts` | Atualiza dados via comportamento da entidade (`updateDetails` / status) |
| **ListClients** | `ListClients.ts` | Lista todos os clientes |
| **DeleteClient** | `DeleteClient.ts` | Remove cliente existente; falha se não encontrado |

### Porta

`core/domain/clients/ClientRepository.ts` —
`findAll`, `findById`, `findByEmail`, `save`, `update`, `delete`.

### Fronteira

`src/app/(agendamentos)/(left-nav-bar)/_actions/client-actions.ts`

- `fetchClientsAction`
- `createClientAction`
- `updateClientAction`
- `deleteClientAction`

---

## Products — `core/application/products/`

| Caso de uso | Arquivo | Responsabilidade |
|-------------|---------|------------------|
| **CreateProduct** | `CreateProduct.ts` | Cria produto; se quantidade ≤ 5 e status Ativo → `Baixo estoque`; se quantidade 0 → `Inativo` |
| **UpdateProduct** | `UpdateProduct.ts` | Atualiza produto aplicando a mesma regra de estoque/status |
| **ListProducts** | `ListProducts.ts` | Lista com filtros: search, category, status |
| **DeleteProduct** | `DeleteProduct.ts` | Remove produto existente; falha se não encontrado |

### Porta

`core/domain/products/ProductRepository.ts` —
`findAll`, `findById`, `save`, `update`, `delete`.

### Fronteira

`src/app/(agendamentos)/(left-nav-bar)/_actions/product-actions.ts`

- `fetchProductsAction`
- `createProductAction`
- `updateProductAction`
- `deleteProductAction`

---

## Appointments — `core/application/appointments/`

| Caso de uso | Arquivo | Responsabilidade |
|-------------|---------|------------------|
| **CreateAppointment** | `CreateAppointment.ts` | Cria agendamento; defaults: serviço `Consulta`, duração `30 min`, status `Confirmado`, canal `site`; gera iniciais; bloqueia se o cliente já tiver atendimento com horário sobreposto no mesmo dia |
| **UpdateAppointmentStatus** | `UpdateAppointmentStatus.ts` | Altera status para um dos valores permitidos |
| **ListAppointments** | `ListAppointments.ts` | Lista por data e/ou filtros de search/status |
| **DeleteAppointment** | `DeleteAppointment.ts` | Remove agendamento existente; falha se não encontrado |

### Porta

`core/domain/appointments/AppointmentRepository.ts` —
`findAll`, `findByDate`, `findById`, `save`, `update`, `delete`.

### Fronteira

`src/app/(agendamentos)/(left-nav-bar)/_actions/appointment-actions.ts`

- `fetchAppointmentsAction`
- `createAppointmentAction`
- `updateAppointmentStatusAction`
- `deleteAppointmentAction`

### Lacunas conhecidas (a migrar para o domínio/use case)

Hoje ainda vivem principalmente na UI / `src/lib`:

- detecção de conflito de horários (`Appointment.getOccupiedSlots` + ocupação na tela);
- tolerância de 5 minutos para horários passados (`isBookingTimeExpired`);
- vínculo completo `clientId` ponta a ponta (schema já tem; domínio/mapper ainda parciais).

Novos casos de uso sugeridos quando a migração avançar:

- `ScheduleAppointment` (com validação de conflito e tolerância);
- `CancelAppointment`;
- `CheckAppointmentConflict`.

---

## Reports — `core/application/reports/`

| Caso de uso | Arquivo | Responsabilidade |
|-------------|---------|------------------|
| **GetDashboardMetrics** | `GetDashboardMetrics.ts` | Agrega contagens para o dashboard; pode usar fallbacks mock se o banco estiver vazio |
| **GetReportMetrics** | `GetReportMetrics.ts` | Métricas de relatório com multiplicador por período; fallbacks mock quando necessário |

### Fronteira

`src/app/(agendamentos)/(left-nav-bar)/_actions/report-actions.ts`

- `fetchDashboardMetricsAction`
- `fetchReportMetricsAction`

Portas de leitura dedicadas (CQRS pontual) são preferíveis para relatórios
analíticos que não se encaixem em repositório de agregado, por exemplo:

- `RecurringClientsQuery`
- `ProfessionalPerformanceQuery`
- `ChannelPerformanceQuery`

---

## Entidades e invariantes relacionados

Referência rápida do que os use cases orquestram (`core/domain`):

| Agregado | Arquivo | Status / notas |
|----------|---------|----------------|
| User | `users/User.ts` | `Ativo` \| `Inativo`; role de domínio `Cliente` \| `Administrador` |
| UserPermission | `users/UserPermission.ts` | Níveis 1 Admin, 2 Gestor, 3 Funcionário |
| Client | `clients/Client.ts` | `Ativo` \| `Inativo`; CPF e nascimento opcionais |
| Product | `products/Product.ts` | `Ativo` \| `Inativo` \| `Baixo estoque`; price/qty ≥ 0 |
| Appointment | `appointments/Appointment.ts` | `Confirmado` \| `Pendente` \| `Concluído` \| `Cancelado`; slots `ALL_TIMES` |

Detalhes de permissão, booking e paginação: ver
[system-rules.md](./system-rules.md).

---

## Fluxo padrão

```text
UI / Page
  → *_actions.ts
    → CasoDeUso.execute(...)
      → Repository (porta)
        → Prisma*Repository + Mapper
          → PostgreSQL
```

## Ao criar um novo caso de uso

1. Defina o contrato necessário na porta do domínio (mínimo possível).
2. Implemente o use case em `core/application/<contexto>/`.
3. Exponha a operação via Server Action fina em `_actions/`.
4. Não coloque regra de negócio na Action, no componente ou no mapper.
5. Garanta teste com repositório `in-memory` ou fake quando a suíte existir.
