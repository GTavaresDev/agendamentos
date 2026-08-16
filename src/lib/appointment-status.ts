import type { BadgeVariant } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";

export type AppointmentStatus = "Confirmado" | "Pendente" | "Concluído" | "Cancelado";

/** Mapeamento único de status → variante do Badge, usado em toda a aplicação. */
const STATUS_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  Confirmado: "success",
  Pendente: "warning",
  Concluído: "secondary",
  Cancelado: "destructive",
};

/** Cores sólidas equivalentes às variantes do Badge, para uso em gráficos (ex.: Recharts). */
const STATUS_HEX: Record<AppointmentStatus, string> = {
  Confirmado: "#10b981",
  Pendente: "#f59e0b",
  Concluído: "#a1a1aa",
  Cancelado: "#ef4444",
};

export function getStatusBadgeVariant(status: AppointmentStatus): BadgeVariant {
  return STATUS_VARIANT[status] ?? "secondary";
}

export function getStatusColor(status: AppointmentStatus): string {
  return STATUS_HEX[status] ?? STATUS_HEX.Concluído;
}
