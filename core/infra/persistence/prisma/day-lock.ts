import { prisma } from "./client";

/**
 * Serializa as reservas de um mesmo dia.
 *
 * Dois clientes que tentam o mesmo horário ao mesmo tempo passariam os dois
 * pela verificação de disponibilidade antes de qualquer um gravar. A trava
 * consultiva do Postgres faz o segundo esperar o primeiro terminar, então a
 * revalidação dentro da trava já enxerga o agendamento recém-criado.
 *
 * ponytail: trava por dia (não por horário) — simples e suficiente no volume de
 * uma clínica; refinar para (dia, horário) se a concorrência crescer.
 */
export async function withDayLock<T>(date: string, run: () => Promise<T>): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`appointments:${date}`})::bigint)`;
      // `run` usa o client global de propósito: grava numa transação própria que
      // commita antes desta liberar a trava, então o próximo a entrar já lê o registro.
      return run();
    },
    { timeout: 15_000 },
  );
}
