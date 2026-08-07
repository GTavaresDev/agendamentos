export type ClientCancellationTarget = {
  date: string;
  time: string;
  status: string;
};

export type ClientCancellationCheck = {
  allowed: boolean;
  reason?: string;
};

/**
 * Regras de cancelamento pelo próprio cliente. Deriva do ciclo de vida já
 * existente (Pendente/Confirmado → Cancelado) e da proteção retroativa da
 * agenda: nada que já começou ou terminou pode ser cancelado pelo portal.
 *
 * ponytail: sem antecedência mínima porque a clínica ainda não configura uma;
 * quando existir, é aqui que ela entra (e o portal já consome o motivo).
 */
export function canClientCancelAppointment(
  appointment: ClientCancellationTarget,
  now: Date = new Date(),
): ClientCancellationCheck {
  if (appointment.status === "Cancelado") {
    return { allowed: false, reason: "Este agendamento já foi cancelado." };
  }

  if (appointment.status === "Concluído") {
    return { allowed: false, reason: "Atendimentos concluídos não podem ser cancelados." };
  }

  if (hasStarted(appointment, now)) {
    return {
      allowed: false,
      reason: "Este horário já passou. Entre em contato com a clínica.",
    };
  }

  return { allowed: true };
}

function hasStarted(appointment: ClientCancellationTarget, now: Date): boolean {
  const [year, month, day] = appointment.date.split("-").map(Number);
  const [hours, minutes] = appointment.time.split(":").map(Number);

  if ([year, month, day, hours, minutes].some(Number.isNaN)) {
    return true;
  }

  const start = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return now.getTime() >= start.getTime();
}
