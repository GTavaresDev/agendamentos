"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  appointments as mockAppointments,
  products as mockProducts,
  users as mockUsers,
  type Appointment,
  type AppointmentStatus,
  type Product,
  type User,
} from "@/app/mocks/scheduling";

type NewUser = Omit<User, "id" | "initials" | "last" | "status">;
type NewProduct = Omit<Product, "id" | "status"> & { status?: Product["status"] };
type NewAppointment = Omit<Appointment, "id">;

type AppDataContextValue = {
  users: User[];
  products: Product[];
  appointments: Appointment[];
  addUser: (user: NewUser) => User;
  removeUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  addProduct: (product: NewProduct) => Product;
  removeProduct: (id: string) => void;
  adjustProductQuantity: (id: string, change: number) => void;
  addAppointment: (appointment: NewAppointment) => Appointment;
  removeAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  resetData: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);
const STORAGE_KEY = "cliente-scheduling-mvp";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function productStatus(quantity: number, requested?: Product["status"]) {
  if (requested === "Inativo" || quantity === 0) return "Inativo";
  if (quantity <= 5) return "Baixo estoque";
  return "Ativo";
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            users?: User[];
            products?: Product[];
            appointments?: Appointment[];
          };
          if (parsed.users) setUsers(parsed.users);
          if (parsed.products) setProducts(parsed.products);
          if (parsed.appointments) setAppointments(parsed.appointments);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ users, products, appointments }),
    );
  }, [appointments, hydrated, products, users]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      users,
      products,
      appointments,
      addUser(user) {
        const created: User = {
          ...user,
          id: makeId("user"),
          initials: makeInitials(user.name),
          last: "Sem agendamentos",
          status: "Ativo",
        };
        setUsers((current) => [created, ...current]);
        return created;
      },
      removeUser(id) {
        setUsers((current) => current.filter((user) => user.id !== id));
      },
      toggleUserStatus(id) {
        setUsers((current) =>
          current.map((user) =>
            user.id === id
              ? { ...user, status: user.status === "Ativo" ? "Inativo" : "Ativo" }
              : user,
          ),
        );
      },
      addProduct(product) {
        const created: Product = {
          ...product,
          id: makeId("product"),
          status: productStatus(product.quantity, product.status),
        };
        setProducts((current) => [created, ...current]);
        return created;
      },
      removeProduct(id) {
        setProducts((current) => current.filter((product) => product.id !== id));
      },
      adjustProductQuantity(id, change) {
        setProducts((current) =>
          current.map((product) => {
            if (product.id !== id) return product;
            const quantity = Math.max(0, product.quantity + change);
            return { ...product, quantity, status: productStatus(quantity) };
          }),
        );
      },
      addAppointment(appointment) {
        const created = { ...appointment, id: makeId("appointment") };
        setAppointments((current) => [...current, created]);
        setUsers((current) =>
          current.map((user) =>
            user.name === appointment.name
              ? { ...user, last: `Agora, ${appointment.time}` }
              : user,
          ),
        );
        return created;
      },
      removeAppointment(id) {
        setAppointments((current) =>
          current.filter((appointment) => appointment.id !== id),
        );
      },
      updateAppointmentStatus(id, status) {
        setAppointments((current) =>
          current.map((appointment) =>
            appointment.id === id ? { ...appointment, status } : appointment,
          ),
        );
      },
      resetData() {
        setUsers(mockUsers);
        setProducts(mockProducts);
        setAppointments(mockAppointments);
      },
    }),
    [appointments, products, users],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData deve ser usado dentro de AppDataProvider");
  }
  return context;
}
