# Cliente — Sistema de agendamentos

MVP de uma plataforma de agendamentos para clínicas e negócios que trabalham com horários marcados. O projeto reúne uma área administrativa identificada pela marca genérica **Cliente** e uma experiência pública demonstrativa para a clínica de estética **VisioNew**.

O objetivo é validar a organização das telas, os fluxos de navegação, o cadastro de atendimentos e a apresentação de indicadores antes da implementação de autenticação, banco de dados e integrações externas.

## Visão geral do produto

A aplicação atende dois públicos:

- **Administradores e recepcionistas:** acessam dashboard, agenda, usuários e relatórios.
- **Clientes da clínica:** conhecem a VisioNew, consultam tratamentos e avaliações e acessam os links de contato e agendamento.

O MVP foi construído com dados locais e pode ser executado sem configurar serviços externos ou variáveis de ambiente.

## Escopo atual

### Área administrativa — Cliente

#### Login

- Tela de entrada responsiva.
- Campos de e-mail e senha preenchidos para demonstração.
- Alternância de visibilidade da senha.
- Redirecionamento para o dashboard após o envio.
- Não existe validação real de credenciais ou sessão persistente.

Credenciais apresentadas na interface:

```text
E-mail: admin@cliente.com
Senha: agendamentos
```

#### Dashboard

- Resumo de agendamentos do dia.
- Indicadores de clientes ativos, presença e tempo ocupado.
- Lista dos próximos atendimentos.
- Visualização do movimento semanal.
- Atalho para criação de um novo agendamento.

#### Agendamentos

- Seleção de dia em calendário semanal.
- Separação de horários entre manhã e tarde.
- Identificação de horários disponíveis, selecionados e ocupados.
- Seleção de cliente e serviço.
- Campo de observações.
- Resumo da data e do horário antes da confirmação.
- Retorno visual por toast após confirmar.

Cada atendimento também possui o campo **Canal de atendimento**, usado para registrar de onde o cliente chegou. As opções atuais são:

- Sistema
- WhatsApp
- Recepção
- Instagram

O vínculo é representado pelo `channelId` do agendamento. A lista de canais é compartilhada com o relatório **Origem dos agendamentos**, evitando nomes diferentes entre o cadastro e os indicadores.

#### Usuários

- Listagem responsiva de clientes e administradores.
- Busca por nome ou e-mail.
- Exibição de contato, perfil, status e último agendamento.
- Controles visuais de paginação e filtros.
- Modal para adicionar um usuário.
- Retorno visual de sucesso após o envio do formulário.

#### Relatórios

A tela consolida os principais dados que podem ser extraídos dos agendamentos simulados:

- Total de agendamentos.
- Receita estimada.
- Taxa de comparecimento.
- Taxa de ocupação.
- Evolução mensal de agendamentos, cancelamentos e receita.
- Distribuição por status.
- Serviços mais agendados.
- Ocupação por horário.
- Mapa de ocupação semanal.
- Origem dos agendamentos.
- Desempenho por profissional.
- Clientes com maior recorrência.
- Resumo financeiro.

São utilizados cards, barras de progresso, gráficos de área, linha, barra e pizza, mapa de calor e tabelas. Os gráficos são renderizados com Recharts 3.

### Área pública — VisioNew

A VisioNew é a clínica fictícia usada para demonstrar como o sistema pode atender um negócio real.

#### Landing page

- Apresentação da clínica e de sua proposta.
- Seção institucional.
- Lista de tratamentos e durações.
- Jornada do cliente em três etapas.
- Avaliações simuladas no padrão de comentários do Google.
- Nota e quantidade de avaliações simuladas.
- FAQ interativo.
- Informações de contato, endereço e horários.
- Chamadas para o sistema de agendamento.
- Layout responsivo com navegação mobile.

Não existe integração com a API do Google. Avaliações, nota, endereço, telefones e demais informações são conteúdos demonstrativos.

#### Página de links

Página no formato link-in-bio contendo:

- Acesso ao sistema de agendamento.
- Link demonstrativo para WhatsApp.
- Link demonstrativo de localização no Google Maps.
- Acesso à landing page da VisioNew.
- Link para Instagram.

## Rotas

| Rota pública | Descrição |
| --- | --- |
| `/` | Login da área administrativa |
| `/dashboard` | Visão geral da operação |
| `/agendamentos` | Seleção e confirmação de horários |
| `/usuarios` | Gestão de clientes e equipe |
| `/relatorios` | Indicadores, gráficos e tabelas |
| `/free-access` | Landing page da VisioNew |
| `/free-access/links` | Página pública de links da clínica |

As pastas públicas usam os segmentos internos `/site` e `/links`. O `next.config.ts` possui rewrites para preservar as URLs `/free-access` e `/free-access/links` apresentadas ao usuário.

Os route groups `(agendamentos)`, `(left-nav-bar)` e `(free-access)` organizam o código e não fazem parte das URLs.

## Regras de interface

### Área administrativa

- Paleta principal em branco, preto e tons de cinza.
- Fundo padrão das telas em cinza claro.
- Sidebar fixa com 256 px no desktop.
- Mesma tipografia, iconografia e espaçamento em todas as rotas administrativas.
- Navegação interna com `Link` do Next.js para evitar recarregamentos e layout shift.
- Ícones da sidebar com caixa de 18 px e espessura de traço padronizada.
- Componentes no padrão visual do shadcn/ui, estilizados com Tailwind CSS.

Na agenda, desktop e tablet mantêm a mesma disposição:

- Calendário e formulário de detalhes permanecem lado a lado a partir de 768 px.
- A coluna de detalhes varia proporcionalmente entre 260 e 380 px.
- Espaçamentos e dimensões diminuem junto com a largura disponível.
- A disposição muda para uma única coluna somente no mobile, abaixo de 768 px.

### Área pública

- Identidade própria da VisioNew, com tons neutros e quentes.
- Tipografia editorial para títulos.
- Botões e links de agendamento conectam a experiência pública à área de horários.

## Tecnologias

- [Next.js](https://nextjs.org/) 16 com App Router
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) em modo estrito
- [Tailwind CSS](https://tailwindcss.com/) 4
- Componentes no padrão [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI Slot](https://www.radix-ui.com/)
- [Lucide React](https://lucide.dev/) para ícones
- [Recharts](https://recharts.org/) 3 para gráficos
- `class-variance-authority`, `clsx` e `tailwind-merge` para composição de variantes e classes
- ESLint com configuração do Next.js

## Arquitetura de pastas

```text
agendamentos/
├── core/
│   └── infra/
│       └── db/                         # reservado para a futura persistência
├── public/
│   ├── free-access/
│   │   ├── clinica-hero.jpg
│   │   └── clinica-perfil.jpg
│   └── og.png
├── src/
│   ├── app/
│   │   ├── (agendamentos)/
│   │   │   ├── (left-nav-bar)/
│   │   │   │   ├── agendamentos/page.tsx
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── relatorios/page.tsx
│   │   │   │   └── usuarios/page.tsx
│   │   │   └── _components/
│   │   │       ├── ui/                 # componentes reutilizáveis
│   │   │       ├── reports-dashboard.tsx
│   │   │       └── scheduling-app.tsx
│   │   ├── (free-access)/
│   │   │   ├── _components/
│   │   │   │   └── clinic-landing.tsx
│   │   │   ├── links/page.tsx
│   │   │   └── site/page.tsx
│   │   ├── mocks/
│   │   │   └── scheduling.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                    # login
│   └── lib/
│       └── utils.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Dados simulados

Os dados principais ficam em `src/app/mocks/scheduling.ts`:

- Agendamentos do dia.
- Clientes e usuários.
- Dias da semana.
- Horários disponíveis e ocupados.
- Canais de atendimento e seus indicadores.

Alguns conjuntos específicos dos relatórios permanecem próximos ao componente `reports-dashboard.tsx`, como evolução mensal, serviços, ocupação, profissionais e recorrência.

O estado das interações existe apenas no navegador. Portanto:

- Um novo agendamento não é persistido após recarregar a página.
- Um usuário enviado pelo modal não é gravado na listagem.
- Filtros e paginação que não alteram os dados são apenas elementos demonstrativos.
- O login não cria sessão e não protege as rotas.
- Não há banco de dados, API própria, envio de mensagens ou integração com calendários.

## Executando localmente

### Requisitos

- Node.js 20 ou superior recomendado.
- npm.

### Instalação

```bash
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Nenhum arquivo `.env` é necessário para executar o MVP atual.

## Scripts

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js |
| `npm run lint` | Executa as verificações do ESLint |
| `npm run build` | Gera o build de produção usando Webpack |
| `npm run start` | Inicia localmente o build de produção |

Antes de enviar alterações, execute:

```bash
npm run lint
npm run build
```

## Build e deploy

O projeto está preparado como uma aplicação Next.js padrão e pode ser publicado na Vercel.

O comando de build usa explicitamente Webpack:

```bash
next build --webpack
```

Na Vercel, não são necessárias variáveis de ambiente enquanto a aplicação continuar operando somente com mocks.

## Limitações do MVP

Este projeto não deve ser tratado como pronto para produção. Ainda não estão implementados:

- Autenticação e autorização.
- Proteção das rotas administrativas.
- Persistência em banco de dados.
- Cadastro real de clínicas, serviços e profissionais.
- Regras de conflito e concorrência de horários.
- Edição e cancelamento de agendamentos.
- Auditoria persistente dos canais de atendimento.
- Integração com WhatsApp, Google Calendar ou Google Reviews.
- Envio de e-mail, SMS ou notificações.
- Upload e gerenciamento de imagens.
- Exportação real dos relatórios.
- Testes automatizados.

## Evolução recomendada

1. Definir o modelo de domínio para clínica, usuário, cliente, profissional, serviço e agendamento.
2. Implementar banco de dados e migrations em `core/infra/db`.
3. Criar autenticação com perfis e proteção de rotas.
4. Substituir os mocks por uma camada de serviços ou API.
5. Persistir o canal de atendimento em cada agendamento para auditoria real.
6. Calcular os relatórios diretamente a partir dos atendimentos persistidos.
7. Implementar disponibilidade, bloqueios, edição e cancelamento de horários.
8. Adicionar integrações de mensagens, calendário e avaliações quando necessárias.
9. Criar testes unitários, de integração e ponta a ponta.

## Identidade e conteúdo demonstrativo

- **Cliente** é a marca genérica usada na plataforma administrativa.
- **VisioNew** é a clínica fictícia apresentada na área pública.
- Pessoas, telefones, endereços, avaliações, receitas e indicadores são simulados.
- As imagens da clínica estão em `public/free-access` e são usadas apenas na demonstração do MVP.

## Licença

Projeto privado e demonstrativo. Defina uma licença antes de distribuir ou reutilizar publicamente o código e os ativos.
