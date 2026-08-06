import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createServiceAction,
  deleteServiceAction,
  fetchServicesAction,
  updateServiceAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/service-actions";
import { ServiceProps } from "@core/domain/services/service.entity";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";

export interface ServicesContextType {
  serviceList: ServiceProps[];
  isLoading: boolean;
  handleAddService: (service: {
    name: string;
    duration: number;
    description?: string;
    price?: number;
    status?: "Ativo" | "Inativo";
    color?: string;
  }) => Promise<void>;
  handleUpdateService: (id: string, data: Partial<ServiceProps>) => Promise<void>;
  handleDeleteService: (id: string) => Promise<void>;
}

export const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function useServicesState(): ServicesContextType {
  const { currentUser, showToast } = useAppShell();
  const [serviceList, setServiceList] = useState<ServiceProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    fetchServicesAction()
      .then((services) => {
        if (!cancelled && services) setServiceList(services);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  async function handleAddService(service: {
    name: string;
    duration: number;
    description?: string;
    price?: number;
    status?: "Ativo" | "Inativo";
    color?: string;
  }) {
    const res = await createServiceAction(service);
    if (res.success && res.data) {
      setServiceList((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.error || "Erro ao cadastrar serviço.");
    }
  }

  async function handleUpdateService(id: string, data: Partial<ServiceProps>) {
    const res = await updateServiceAction({ id, ...data });
    if (res.success && res.data) {
      setServiceList((prev) => prev.map((s) => (s.id === id ? res.data! : s)));
    } else {
      showToast(res.error || "Erro ao atualizar serviço.");
    }
  }

  async function handleDeleteService(id: string) {
    const res = await deleteServiceAction(id);
    if (res.success) {
      setServiceList((prev) => prev.filter((s) => s.id !== id));
    } else {
      showToast(res.error || "Erro ao excluir serviço.");
    }
  }

  return { serviceList, isLoading, handleAddService, handleUpdateService, handleDeleteService };
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
}

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const value = useServicesState();
  return React.createElement(ServicesContext.Provider, { value }, children);
}
