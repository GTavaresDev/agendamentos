import { Redis } from "@upstash/redis";

/**
 * Cliente Redis único da aplicação.
 *
 * O Postgres continua sendo a fonte da verdade — o Redis é só um cache
 * temporário. Sem as variáveis de ambiente configuradas, `redis` é `null` e
 * toda a camada de cache vira passagem direta para o banco. É assim que o
 * desenvolvimento local e os testes rodam sem subir Redis nenhum.
 *
 * Upstash (HTTP) e não ioredis (TCP) porque o app roda em ambiente serverless,
 * onde cada invocação abriria uma conexão nova.
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

export const isCacheEnabled = redis !== null;
