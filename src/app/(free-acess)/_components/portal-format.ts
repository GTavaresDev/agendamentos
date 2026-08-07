import type { AppointmentStatus } from "@/lib/appointment-status";
import { getStatusBadgeVariant } from "@/lib/appointment-status";

/**
 * Rótulos do cliente para o ciclo de vida do agendamento.
 * O status interno (Pendente/Confirmado/Concluído/Cancelado) não muda —
 * só a forma de apresentar.
 */
const CLIENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  Pendente: "Aguardando confirmação",
  Confirmado: "Confirmado",
  Concluído: "Atendimento concluído",
  Cancelado: "Cancelado",
};

export function clientStatusLabel(status: AppointmentStatus): string {
  return CLIENT_STATUS_LABEL[status] ?? status;
}

export { getStatusBadgeVariant };

/** Data ISO (yyyy-mm-dd) para Date local, sem o deslocamento de fuso do parser. */
function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** 2026-08-15 → 15/08/2026 */
export function formatDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString("pt-BR");
}

/** 2026-08-15 → "15 ago" (o pt-BR formata "15 de ago."; aqui é compacto) */
export function formatDayMonth(iso: string): string {
  return `${formatDayNumber(iso)} ${formatMonthShort(iso)}`;
}

/** 2026-08-15 → "sex" */
export function formatShortWeekday(iso: string): string {
  return parseIsoDate(iso)
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "");
}

/** 2026-08-15 → "ago" */
export function formatMonthShort(iso: string): string {
  return parseIsoDate(iso)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
}

/** 2026-08-15 → "15" */
export function formatDayNumber(iso: string): string {
  return iso.slice(8, 10);
}

/** 2026-08-15 → "sexta-feira" */
export function formatWeekday(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString("pt-BR", { weekday: "long" });
}

/** "Hoje", "Amanhã" ou "sexta-feira, 15/08/2026" */
export function formatFriendlyDate(iso: string, now: Date = new Date()): string {
  const target = parseIsoDate(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return `${formatWeekday(iso)}, ${formatDate(iso)}`;
}

export function isToday(iso: string, now: Date = new Date()): boolean {
  const target = parseIsoDate(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return target.getTime() === today.getTime();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
