# Harmonize — Documentação para agentes

Leia estes arquivos **antes** de implementar qualquer feature. Eles substituem o
antigo `rules.md` monolítico e estão separados por responsabilidade.

| Arquivo | Conteúdo |
|---------|----------|
| [architecture.md](./architecture.md) | Clean Architecture, Hexagonal, pastas, camadas, persistência, fluxo de feature, checklist estrutural |
| [use-cases.md](./use-cases.md) | Catálogo de casos de uso (`core/application`), portas, Server Actions e lacunas conhecidas |
| [system-rules.md](./system-rules.md) | Regras de produto, permissões, booking, paginação, UI/React, banco PascalCase e checklist operacional |

## Ordem sugerida de leitura

1. **architecture.md** — para não violar camadas nem criar pastas erradas.
2. **system-rules.md** — para respeitar permissões, horários e convenções do produto.
3. **use-cases.md** — para reutilizar ou estender ações existentes em vez de inventar fluxo paralelo.

## Regra principal (resumo)

```text
presentation → application → domain
infrastructure ─────────────^
```

Código legado grande **não** é modelo arquitetural. Migração incremental.
