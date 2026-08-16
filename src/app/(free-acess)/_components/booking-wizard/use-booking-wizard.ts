import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  BookableProfessionalDTO,
  BookableServiceDTO,
} from "@core/application/portal/booking-catalog.usecase";
import type { ClientAppointmentDTO } from "@core/application/portal/client-appointments.usecase";
import {
  createClientAppointmentAction,
  getAvailableDatesAction,
  getAvailableTimesAction,
  getProfessionalsForServiceAction,
} from "../../_actions/portal-booking-actions";
import { STEP_ORDER, Step } from "./booking-wizard.types";

export function useBookingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("servico");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [service, setService] = useState<BookableServiceDTO | null>(null);
  const [professional, setProfessional] = useState<BookableProfessionalDTO | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [professionals, setProfessionals] = useState<BookableProfessionalDTO[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [booked, setBooked] = useState<ClientAppointmentDTO | null>(null);

  async function selectService(selected: BookableServiceDTO) {
    setService(selected);
    setProfessional(null);
    setDate("");
    setTime("");
    setError("");
    setLoading(true);
    setStep("profissional");

    const list = await getProfessionalsForServiceAction(selected.id);
    setProfessionals(list);
    setLoading(false);
  }

  async function selectProfessional(selected: BookableProfessionalDTO) {
    setProfessional(selected);
    setDate("");
    setTime("");
    setLoading(true);
    setStep("data");

    const available = await getAvailableDatesAction(service!.id);
    setDates(available);
    setLoading(false);
  }

  async function selectDate(selected: string) {
    setDate(selected);
    setTime("");
    setLoading(true);
    setStep("horario");

    const available = await getAvailableTimesAction(service!.id, selected);
    setTimes(available);
    setLoading(false);
  }

  function selectTime(selected: string) {
    setTime(selected);
    setStep("confirmacao");
  }

  async function confirm() {
    if (!service || !professional || !date || !time) return;

    setLoading(true);
    setError("");

    const result = await createClientAppointmentAction({
      serviceId: service.id,
      professionalId: professional.id,
      date,
      time,
    });

    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.error || "Não foi possível agendar.");
      // O horário pode ter sido ocupado durante o fluxo: volta para a escolha.
      const refreshed = await getAvailableTimesAction(service.id, date);
      setTimes(refreshed);
      setTime("");
      setStep("horario");
      return;
    }

    setBooked(result.data);
    setStep("sucesso");
    router.refresh();
  }

  function goBack() {
    setError("");
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) {
      setStep(STEP_ORDER[index - 1]);
    }
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return {
    step,
    stepIndex,
    loading,
    error,
    service,
    professional,
    date,
    time,
    professionals,
    dates,
    times,
    booked,
    selectService,
    selectProfessional,
    selectDate,
    selectTime,
    confirm,
    goBack,
  };
}
