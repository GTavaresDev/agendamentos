"use client";

import { Services } from "@/app/(agendamentos)/(left-nav-bar)/servicos/components/services";
import { useServices } from "@/app/(agendamentos)/(left-nav-bar)/servicos/hooks/use-services";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";

export function ServicesView() {
  const { currentUser, showToast } = useAppShell();
  const { serviceList, isLoading, handleAddService, handleUpdateService, handleDeleteService } =
    useServices();

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="servicos" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <Services
      showToast={showToast}
      serviceList={serviceList}
      onAddService={handleAddService}
      onUpdateService={handleUpdateService}
      onDeleteService={handleDeleteService}
    />
  );
}
