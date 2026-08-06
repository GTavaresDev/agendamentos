"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useAppointments } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-appointments";
import { useUsers } from "@/app/(agendamentos)/(left-nav-bar)/usuarios/hooks/use-users";
import { useClients } from "@/app/(agendamentos)/(left-nav-bar)/clientes/hooks/use-clients";
import { useServices } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { useScrollLock } from "@/lib/use-scroll-lock";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { AgendaView } from "@/app/(agendamentos)/(left-nav-bar)/agenda/components/agenda-view";
import { CreateAppointmentDialog } from "@/app/(agendamentos)/(left-nav-bar)/agenda/components/create-appointment-dialog";

export function AgendaPage() {
  const { currentUser, showToast } = useAppShell();
  const {
    appointmentList,
    isLoading: appointmentsLoading,
    handleAppointmentStatusChange,
    handleDeleteAppointment,
  } = useAppointments();
  const { userList, isLoading: usersLoading } = useUsers();
  const { isLoading: clientsLoading } = useClients();
  const { isLoading: servicesLoading } = useServices();

  const searchParams = useSearchParams();
  const [modal, setModal] = useState(searchParams.get("novo") === "1");

  useScrollLock(modal);

  if (!currentUser) return null;

  if (appointmentsLoading || usersLoading || clientsLoading || servicesLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="agenda" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <>
      <AgendaView
        appointments={appointmentList}
        onStatusChange={handleAppointmentStatusChange}
        onDeleteAppointment={handleDeleteAppointment}
        onNew={() => setModal(true)}
        showToast={showToast}
        currentUserRole={currentUser.role}
        currentUserName={currentUser.name}
        currentUserId={currentUser.id}
        userList={userList}
      />
      {modal && (
        <CreateAppointmentDialog
          appointments={appointmentList}
          onClose={() => setModal(false)}
          showToast={showToast}
        />
      )}
    </>
  );
}
