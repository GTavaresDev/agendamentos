"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { Card } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { paginateItems } from "@/lib/pagination";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useUsers } from "../hooks/use-users";
import { UsersTable } from "./users-table";
import { CreateUserDialog } from "./create-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UserProps } from "@core/domain/users/user.entity";

export function UsersView() {
  const {
    userList,
    isLoading,
    handleAddUser,
    handleUpdateUser,
    handleReplaceUser,
    handleDeleteUser,
  } = useUsers();
  const { currentUser, initialEditUserId, setInitialEditUserId, showToast } =
    useAppShell();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProps | null>(null);
  const [page, setPage] = useState(1);

  useScrollLock(modal || !!editingUser);

  const currentUserRole = currentUser?.role || "Funcionario";

  const canEditUser = (targetUser: UserProps): boolean => {
    if (!currentUser) return false;
    if (currentUserRole === "Administrador") return true;
    if (currentUserRole === "Gestor") {
      return (
        targetUser.role !== "Administrador" && targetUser.role !== "Gestor"
      );
    }
    return false;
  };

  const canEditProfile = (targetUser: UserProps): boolean =>
    canEditUser(targetUser);

  const canEditPermissions = (targetUser: UserProps): boolean => {
    if (currentUserRole !== "Administrador") return false;
    return canEditUser(targetUser);
  };

  useEffect(() => {
    if (!currentUser) return;
    const isFuncionario =
      currentUser.permissionLevel === 3 || currentUser.role === "Funcionario";
    if (isFuncionario) {
      showToast(
        "Acesso Negado: Apenas Administradores e Gestores têm acesso a /usuarios",
      );
      router.push("/dashboard");
    }
  }, [currentUser, router, showToast]);

  useEffect(() => {
    if (initialEditUserId) {
      const target = userList.find((u) => u.id === initialEditUserId);
      if (target) {
        if (!canEditUser(target)) {
          showToast("Você não possui permissão para editar este usuário.");
          setInitialEditUserId(null);
          return;
        }
        setEditingUser(target);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditUserId, userList]);

  const filtered = useMemo(() => {
    return userList.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Todos" || user.status === statusFilter;
      const matchRole = roleFilter === "Todos" || user.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [userList, search, statusFilter, roleFilter]);

  const pagedUsers = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, roleFilter]);

  const totalUsers = userList.length;
  const activeUsers = userList.filter((u) => u.status === "Ativo").length;
  const adminUsers = userList.filter((u) => u.role === "Administrador").length;
  const staffUsers = userList.filter((u) => u.role !== "Administrador").length;

  if (!currentUser) return null;

  const isFuncionario =
    currentUser.permissionLevel === 3 || currentUser.role === "Funcionario";
  if (isFuncionario) return null;

  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="usuarios" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] p-3.5 sm:p-6 lg:p-8">
      {/* 4 Metric Cards at Top */}
      <div className="mb-6 grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Total da Equipe
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {totalUsers}
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Usuários Ativos
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {activeUsers}
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Administradores
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {adminUsers}
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Gestores & Equipe
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {staffUsers}
          </div>
        </Card>
      </div>

      {/* Search and Action Button on the same row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={() => setModal(true)} className="w-full sm:w-48 shrink-0 gap-2 justify-center">
          <Plus className="size-4" /> Adicionar usuário
        </Button>
      </div>

      <UsersTable
        pagedUsers={filtered}
        filteredCount={filtered.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        page={page}
        onPageChange={setPage}
        currentUserRole={currentUser.role}
        canEditUser={canEditUser}
        onEditUser={(user) => setEditingUser(user)}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        showToast={showToast}
      />

      {modal && (
        <CreateUserDialog
          userList={userList}
          currentUserRole={currentUser.role}
          onAddUser={handleAddUser}
          onClose={() => setModal(false)}
          showToast={showToast}
        />
      )}
      {editingUser && (
        <EditUserDialog
          key={editingUser.id}
          user={editingUser}
          currentUserRole={currentUser.role}
          canEditUser={canEditUser(editingUser)}
          canEditProfile={canEditProfile(editingUser)}
          canEditPermissions={canEditPermissions(editingUser)}
          onUserUpdated={(updated) => {
            handleReplaceUser(updated);
            setEditingUser(updated);
          }}
          onClose={() => {
            setEditingUser(null);
            setInitialEditUserId(null);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
