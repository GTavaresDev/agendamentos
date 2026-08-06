import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createAppointmentAction,
  deleteAppointmentAction,
  fetchAppointmentsAction,
  updateAppointmentStatusAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/appointment-actions";
import { AppointmentProps } from "@core/domain/appointments/appointment.entity";
import { useAppShell } from "./use-app-shell";

export interface AppointmentsContextType {
  appointmentList: AppointmentProps[];
  isLoading: boolean;
  handleAddAppointment: (appt: {
    date: string;
    time: string;
    name: string;
    service: string;
    serviceId?: string;
    duration: string;
    channelId: string;
    notes?: string;
    clientId?: string;
  }) => Promise<void>;
  handleAppointmentStatusChange: (
    id: string,
    status: "Confirmado" | "Cancelado" | "Concluído"
  ) => Promise<void>;
  handleDeleteAppointment: (id: string) => Promise<void>;
}

export const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function useAppointmentsState(): AppointmentsContextType {
  const { currentUser, showToast } = useAppShell();
  const [appointmentList, setAppointmentList] = useState<AppointmentProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    fetchAppointmentsAction()
      .then((appointments) => {
        if (!cancelled && appointments) setAppointmentList(appointments);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  async function handleAddAppointment(appt: {
    date: string;
    time: string;
    name: string;
    service: string;
    serviceId?: string;
    duration: string;
    channelId: string;
    notes?: string;
    clientId?: string;
  }) {
    const res = await createAppointmentAction(appt);
    if (res.success && res.data) {
      setAppointmentList((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.error || "Erro ao agendar.");
    }
  }

  async function handleAppointmentStatusChange(
    id: string,
    status: "Confirmado" | "Cancelado" | "Concluído"
  ) {
    await updateAppointmentStatusAction(id, status);
    setAppointmentList((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    showToast(`Agendamento marcado no banco como ${status}`);
  }

  async function handleDeleteAppointment(id: string) {
    await deleteAppointmentAction(id);
    setAppointmentList((prev) => prev.filter((a) => a.id !== id));
  }

  return {
    appointmentList,
    isLoading,
    handleAddAppointment,
    handleAppointmentStatusChange,
    handleDeleteAppointment,
  };
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }
  return context;
}

export function AppointmentsProvider({ children }: { children: React.ReactNode }) {
  const value = useAppointmentsState();
  return React.createElement(AppointmentsContext.Provider, { value }, children);
}
