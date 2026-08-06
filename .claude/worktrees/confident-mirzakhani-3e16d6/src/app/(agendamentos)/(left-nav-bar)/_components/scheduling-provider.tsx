"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentSessionAction,
  logoutAction,
  startImpersonationAction,
  stopImpersonationAction,
  type SessionUser,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import {
  createUserAction,
  deleteUserAction,
  fetchUsersAction,
  updateUserAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/user-actions";
import { UserProps } from "@core/domain/users/User";
import {
  createClientAction,
  deleteClientAction,
  fetchClientsAction,
  updateClientAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/client-actions";
import { ClientProps } from "@core/domain/clients/Client";
import {
  createProductAction,
  deleteProductAction,
  fetchProductsAction,
  updateProductAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/product-actions";
import { ProductProps } from "@core/domain/products/Product";

import {
  createServiceAction,
  deleteServiceAction,
  fetchServicesAction,
  updateServiceAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/service-actions";
import { ServiceProps } from "@core/domain/services/Service";import {
  createAppointmentAction,
  deleteAppointmentAction,
  fetchAppointmentsAction,
  updateAppointmentStatusAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/appointment-actions";
import { AppointmentProps } from "@core/domain/appointments/Appointment";
import {
  createSaleAction,
  deleteSaleAction,
  fetchSalesAction,
  updateSaleAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/sale-actions";
import { SaleProps } from "@core/domain/sales/Sale";

interface SchedulingContextType {
  currentUser: SessionUser | null;
  isBootstrapping: boolean;
  userList: UserProps[];
  setUserList: React.Dispatch<React.SetStateAction<UserProps[]>>;
  clientList: ClientProps[];
  setClientList: React.Dispatch<React.SetStateAction<ClientProps[]>>;
  productList: ProductProps[];
  serviceList: ServiceProps[];
  setProductList: React.Dispatch<React.SetStateAction<ProductProps[]>>;
  setServiceList: React.Dispatch<React.SetStateAction<ServiceProps[]>>;
  appointmentList: AppointmentProps[];
  setAppointmentList: React.Dispatch<React.SetStateAction<AppointmentProps[]>>;
  saleList: (SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string })[];
  setSaleList: React.Dispatch<React.SetStateAction<(SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string })[]>>;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  allowPastBooking: boolean;
  setAllowPastBooking: (allow: boolean) => void;
  initialEditUserId: string | null;
  setInitialEditUserId: (id: string | null) => void;

  handleAddUser: (user: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    permissionLevel?: 1 | 2 | 3;
  }) => Promise<void>;
  handleUpdateUser: (id: string, status: "Ativo" | "Inativo") => Promise<void>;
  handleDeleteUser: (id: string) => Promise<void>;

  handleAddClient: (client: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    birthDate?: string;
  }) => Promise<void>;
  handleUpdateClient: (id: string, status: "Ativo" | "Inativo") => Promise<void>;
  handleDeleteClient: (id: string) => Promise<void>;

  handleAddProduct: (prod: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    status?: "Ativo" | "Inativo" | "Baixo estoque";
  }) => Promise<void>;
  handleUpdateProduct: (id: string, status: "Ativo" | "Inativo" | "Baixo estoque") => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;

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

  handleAddAppointment: (appt: {
    date: string;
    time: string;
    name: string;
    service: string;
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

  handleAddSale: (sale: {
    productId: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  }) => Promise<void>;
  handleUpdateSale: (id: string, sale: {
    quantity?: number;
    unitPrice?: number;
    paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  }, password: string) => Promise<void>;
  handleDeleteSale: (id: string, password: string) => Promise<void>;

  handleStartImpersonation: (targetUserId: string) => Promise<void>;
  handleStopImpersonation: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

export function SchedulingProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [userList, setUserList] = useState<UserProps[]>([]);
  const [clientList, setClientList] = useState<ClientProps[]>([]);
  const [productList, setProductList] = useState<ProductProps[]>([]);
  const [serviceList, setServiceList] = useState<ServiceProps[]>([]);
  const [appointmentList, setAppointmentList] = useState<AppointmentProps[]>([]);
  const [saleList, setSaleList] = useState<(SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string })[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [allowPastBooking, setAllowPastBooking] = useState(false);
  const [initialEditUserId, setInitialEditUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        let session = await getCurrentSessionAction();
        if (cancelled) return;

        if (!session) {
          window.location.assign("/login");
          return;
        }

        setCurrentUser(session);

        const [users, clients, products, services, appointments, sales] = await Promise.all([
          fetchUsersAction(),
          fetchClientsAction(),
          fetchProductsAction(),
          fetchServicesAction(),
          fetchAppointmentsAction(),
          fetchSalesAction(),
        ]);

        if (cancelled) return;

        if (users) setUserList(users);
        if (clients) setClientList(clients);
        if (services) setServiceList(services);
        if (products) setProductList(products);
        if (appointments) setAppointmentList(appointments);
        if (sales) setSaleList(sales);
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  async function handleAddUser(user: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    permissionLevel?: 1 | 2 | 3;
  }) {
    const res = await createUserAction(user);
    if (res.success && res.data) {
      setUserList((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.error || "Erro ao adicionar usuário.");
    }
  }

  async function handleUpdateUser(id: string, status: "Ativo" | "Inativo") {
    const res = await updateUserAction({ id, status });
    if (res.success && res.data) {
      setUserList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status } : u))
      );
    } else {
      showToast(res.error || "Erro ao atualizar status do usuário.");
    }
  }

  async function handleDeleteUser(id: string) {
    const res = await deleteUserAction(id);
    if (res.success) {
      setUserList((prev) => prev.filter((u) => u.id !== id));
    } else {
      showToast(res.error || "Erro ao excluir usuário.");
    }
  }

  async function handleAddClient(client: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    birthDate?: string;
  }) {
    const res = await createClientAction(client);
    if (res.success && res.data) {
      setClientList((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.error || "Erro ao cadastrar cliente.");
    }
  }

  async function handleUpdateClient(id: string, status: "Ativo" | "Inativo") {
    const res = await updateClientAction({ id, status });
    if (res.success && res.data) {
      setClientList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } else {
      showToast(res.error || "Erro ao atualizar status do cliente.");
    }
  }

  async function handleDeleteClient(id: string) {
    const res = await deleteClientAction(id);
    if (res.success) {
      setClientList((prev) => prev.filter((c) => c.id !== id));
    } else {
      showToast(res.error || "Erro ao excluir cliente.");
    }
  }

  async function handleAddProduct(prod: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    status?: "Ativo" | "Inativo" | "Baixo estoque";
  }) {
    const res = await createProductAction(prod);
    if (res.success && res.data) {
      setProductList((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.error || "Erro ao adicionar produto.");
    }
  }

  async function handleUpdateProduct(id: string, status: "Ativo" | "Inativo" | "Baixo estoque") {
    await updateProductAction({ id, status });
    setProductList((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  async function handleDeleteProduct(id: string) {
    await deleteProductAction(id);
    setProductList((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleAddAppointment(appt: {
    date: string;
    time: string;
    name: string;
    service: string;
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
    setAppointmentList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    showToast(`Agendamento marcado no banco como ${status}`);
  }

  async function handleDeleteAppointment(id: string) {
    await deleteAppointmentAction(id);
    setAppointmentList((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleStartImpersonation(targetUserId: string) {
    const res = await startImpersonationAction(targetUserId);
    if (res.success) {
      window.location.reload();
    } else {
      showToast(res.error || "Erro ao assumir usuário.");
    }
  }

  async function handleStopImpersonation() {
    const res = await stopImpersonationAction();
    if (res.success) {
      window.location.reload();
    } else {
      showToast("Erro ao sair da conta.");
    }
  }


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
      setServiceList((prev) =>
        prev.map((s) => (s.id === id ? res.data! : s))
      );
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

    async function handleAddSale(sale: {
    productId: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  }) {
    const res = await createSaleAction(sale);
    if (res.success && res.data) {
      const product = productList.find((p) => p.id === sale.productId);
      setSaleList((prev) => [{
        ...res.data!,
        productName: product?.name,
      }, ...prev]);
      setProductList((prev) =>
        prev.map((p) => (p.id === sale.productId ? { ...p, quantity: p.quantity - sale.quantity } : p))
      );
    } else {
      throw new Error(res.error || "Erro ao registrar venda.");
    }
  }

  async function handleUpdateSale(
    id: string,
    sale: {
      quantity?: number;
      unitPrice?: number;
      paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
    },
    password: string
  ) {
    const res = await updateSaleAction({ id, ...sale, password });
    if (res.success && res.data) {
      setSaleList((prev) =>
        prev.map((s) => (s.id === id ? res.data! : s))
      );
      showToast("Venda atualizada com sucesso.");
    } else {
      showToast(res.error || "Erro ao atualizar venda.");
    }
  }

  async function handleDeleteSale(id: string, password: string) {
    const res = await deleteSaleAction({ id, password });
    if (res.success) {
      const saleToDelete = saleList.find((s) => s.id === id);
      if (saleToDelete) {
        setProductList((prev) =>
          prev.map((p) => (p.id === saleToDelete.productId ? { ...p, quantity: p.quantity + saleToDelete.quantity } : p))
        );
      }
      setSaleList((prev) => prev.filter((s) => s.id !== id));
      showToast("Venda excluída e estoque restaurado.");
    } else {
      showToast(res.error || "Erro ao excluir venda.");
    }
  }


  async function handleLogout() {
    await logoutAction();
  }

  return (
    <SchedulingContext.Provider
      value={{
        currentUser,
        isBootstrapping,
        userList,
        setUserList,
        clientList,
        setClientList,
        productList,
        setProductList,
        serviceList,
        setServiceList,
        appointmentList,
        setAppointmentList,
        saleList,
        setSaleList,
        mobileOpen,
        setMobileOpen,
        toast,
        showToast,
        allowPastBooking,
        setAllowPastBooking,
        initialEditUserId,
        setInitialEditUserId,
        handleAddUser,
        handleUpdateUser,
        handleDeleteUser,
        handleAddClient,
        handleUpdateClient,
        handleDeleteClient,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        handleAddService,
        handleUpdateService,
        handleDeleteService,
        handleAddAppointment,
        handleAppointmentStatusChange,
        handleDeleteAppointment,
        handleAddSale,
        handleUpdateSale,
        handleDeleteSale,
        handleStartImpersonation,
        handleStopImpersonation,
        handleLogout,
      }}
    >
      {children}
    </SchedulingContext.Provider>
  );
}

export function useScheduling() {
  const context = useContext(SchedulingContext);
  if (!context) {
    throw new Error("useScheduling must be used within a SchedulingProvider");
  }
  return context;
}
