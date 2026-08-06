import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserAction,
  deleteUserAction,
  fetchUsersAction,
  updateUserAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/user-actions";
import { UserProps } from "@core/domain/users/user.entity";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";

export interface UsersContextType {
  userList: UserProps[];
  isLoading: boolean;
  handleAddUser: (user: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    permissionLevel?: 1 | 2 | 3;
  }) => Promise<void>;
  handleUpdateUser: (id: string, status: "Ativo" | "Inativo") => Promise<void>;
  handleReplaceUser: (updated: UserProps) => void;
  handleDeleteUser: (id: string) => Promise<void>;
}

export const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function useUsersState(): UsersContextType {
  const { currentUser, showToast } = useAppShell();
  const [userList, setUserList] = useState<UserProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    fetchUsersAction()
      .then((users) => {
        if (!cancelled && users) setUserList(users);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

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

  // Single source of truth for local state updates: replaces the entire
  // user entity with the object returned by the backend.
  function handleReplaceUser(updated: UserProps) {
    setUserList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  async function handleUpdateUser(id: string, status: "Ativo" | "Inativo") {
    const res = await updateUserAction({ id, status });
    if (res.success && res.data) {
      handleReplaceUser(res.data);
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

  return {
    userList,
    isLoading,
    handleAddUser,
    handleUpdateUser,
    handleReplaceUser,
    handleDeleteUser,
  };
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const value = useUsersState();
  return React.createElement(UsersContext.Provider, { value }, children);
}
