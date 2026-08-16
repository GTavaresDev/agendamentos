import type { BookableServiceDTO } from "@core/application/portal/booking-catalog.usecase";

export type Step = "servico" | "profissional" | "data" | "horario" | "confirmacao" | "sucesso";

export const STEP_ORDER: Step[] = ["servico", "profissional", "data", "horario", "confirmacao"];

export const STEP_TITLE: Record<Step, { title: string; subtitle: string }> = {
  servico: { title: "Escolha o serviço", subtitle: "O que você deseja agendar?" },
  profissional: { title: "Escolha o profissional", subtitle: "Quem vai te atender?" },
  data: { title: "Escolha a data", subtitle: "Mostramos apenas os dias com horário livre." },
  horario: { title: "Escolha o horário", subtitle: "Horários livres para a data escolhida." },
  confirmacao: { title: "Confirme seu agendamento", subtitle: "Revise antes de confirmar." },
  sucesso: { title: "Agendamento realizado!", subtitle: "" },
};

export interface BookingWizardProps {
  services: BookableServiceDTO[];
}

export interface UseBookingWizardProps {
  services: BookableServiceDTO[];
}
