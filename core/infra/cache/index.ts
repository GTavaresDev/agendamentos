import { redis } from "./redis";

/**
 * Camada de cache do Postgres.
 *
 * Regras que valem em todo o arquivo:
 * - O Postgres é a fonte da verdade. O Redis só guarda cópia com prazo.
 * - Redis fora do ar nunca derruba uma leitura nem invalida uma escrita
 *   bem-sucedida: todo erro é registrado e o fluxo segue no banco.
 * - Agendamentos e disponibilidade NÃO passam por aqui, de propósito.
 */

/**
 * TTL por recurso, em segundos.
 *
 * Os valores saem de quanto cada dado muda contra o custo de reler do Neon
 * (~150 ms por lista pequena, ~800 ms para os relatórios):
 * - `services`: catálogo da clínica, muda algumas vezes por mês. 10 min.
 * - `clients` / `products` / `users`: mudam algumas vezes por dia e toda
 *   escrita já invalida a chave, então o TTL é só a rede de segurança para
 *   uma invalidação perdida. 5 min.
 * - `reports`: 20 min, por requisito de produto. É a agregação mais cara do
 *   sistema (quatro tabelas inteiras somadas em memória) e é puramente
 *   informativa, então vale ficar defasada para não repetir o custo. A
 *   invalidação é só por TTL: agendamento e venda NÃO derrubam o relatório,
 *   de propósito — acoplar o caminho de reserva ao cache não traria correção
 *   nenhuma, só acoplamento.
 */
export const CacheTTL = {
  clients: 300,
  products: 300,
  users: 300,
  services: 600,
  reports: 1200,
} as const;

/**
 * Normaliza o trecho variável de uma chave: sem acento, sem espaço, minúsculo.
 * "Últimos 6 meses" → "ultimos-6-meses".
 */
function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Chaves de cache.
 *
 * ATENÇÃO — ISOLAMENTO ENTRE EMPRESAS
 *
 * Hoje o schema NÃO tem multi-empresa: nenhuma tabela (Users, Clients,
 * Services, Products, Appointments, Sales) tem coluna de empresa, e todo
 * registro é global. Por isso as chaves abaixo são globais, e não
 * `users:{companyId}`: uma chave que finge um escopo que o banco não aplica é
 * pior que uma chave honestamente global — parece segura para quem vier
 * depois e não isola nada.
 *
 * Se um dia entrar multi-empresa, as DUAS coisas mudam JUNTAS, no mesmo
 * commit:
 *   1. a coluna de empresa no schema, com o filtro em toda consulta; e
 *   2. o prefixo destas chaves (`users:{companyId}:all`, etc.).
 * Mudar só o schema deixa o cache servindo dado de uma empresa para outra.
 */
export const CacheKeys = {
  clients: "clients:all",
  products: "products:all",
  users: "users:all",
  services: "services:all",
  servicesActive: "services:active",
  /**
   * `period` é HOJE o único parâmetro que muda o resultado do relatório
   * (GetReportMetrics não recebe empresa, filtro, funcionário nem paginação).
   * Se entrar qualquer outro parâmetro, ele TEM de entrar nesta chave — senão
   * dois relatórios diferentes se sobrescrevem no Redis.
   */
  reports: (period: string) => `reports:metrics:${slug(period)}`,
} as const;

/** Campos DateTime do schema. O JSON do Redis devolve string; aqui volta a ser Date. */
const DATE_FIELDS = ["createdAt", "updatedAt", "lockedUntil"];

function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(reviveDates) as T;
  }
  if (value === null || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  for (const field of DATE_FIELDS) {
    if (typeof record[field] === "string") {
      record[field] = new Date(record[field] as string);
    }
  }
  return value;
}

/**
 * Lê do cache; no miss, executa `loader`, grava e devolve.
 *
 * Qualquer falha do Redis cai direto no `loader` — o chamador não percebe.
 */
export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  if (!redis) {
    return loader();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return reviveDates(cached);
    }
  } catch (error) {
    console.error(`[cache] leitura falhou para "${key}", seguindo no banco:`, error);
    return loader();
  }

  const fresh = await loader();

  try {
    await redis.set(key, fresh, { ex: ttlSeconds });
  } catch (error) {
    // Gravar no cache é otimização: o dado do banco já está em mãos.
    console.error(`[cache] gravação falhou para "${key}":`, error);
  }

  return fresh;
}

/**
 * Invalida chaves depois de uma escrita no Postgres.
 *
 * Nunca lança: a escrita no banco já foi confirmada e desfazê-la por causa do
 * cache seria trocar um dado velho por um dado perdido. No pior caso o
 * conteúdo fica obsoleto até o TTL expirar.
 */
export async function invalidate(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) {
    return;
  }

  try {
    await redis.del(...keys);
  } catch (error) {
    console.error(`[cache] invalidação falhou para [${keys.join(", ")}]:`, error);
  }
}
