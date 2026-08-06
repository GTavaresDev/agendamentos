"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label";
import { PermissionsSelector } from "./permissions-selector";
import { updateUserAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/user-actions";
import {
  getAvailablePermissionsForUserAction,
  updateUserPermissionsAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/permission-actions";
import type { SystemPermissionProps } from "@core/domain/users/system-permission.entity";
import type { UserPermissionProps } from "@core/domain/users/user-permission.entity";
import { StaffRole, UserProps } from "@core/domain/users/user.entity";
import { roleFromPermissionLevel } from "@core/domain/users/resolve-permission-level.business-rule";
import { formatPhoneBR } from "@/lib/input-masks";

export function EditUserDialog({
  user,
  currentUserRole,
  canEditUser,
  canEditProfile,
  canEditPermissions,
  onUserUpdated,
  onClose,
  showToast,
}: {
  user: UserProps;
  currentUserRole: StaffRole;
  canEditUser: boolean;
  canEditProfile: boolean;
  canEditPermissions: boolean;
  onUserUpdated: (updated: UserProps) => void;
  onClose: () => void;
  showToast: (message: string) => void;
}) {
  const [userError, setUserError] = useState("");
  const editModalRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user.phone || "");
  const [systemPermissions, setSystemPermissions] = useState<
    SystemPermissionProps[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [grantablePermissions, setGrantablePermissions] = useState<string[]>(
    [],
  );
  const [inactiveAssignedPermissions, setInactiveAssignedPermissions] = useState<
    UserPermissionProps[]
  >([]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const result = await getAvailablePermissionsForUserAction({
          userId: user.id,
        });
        if (result.success && result.data) {
          setSystemPermissions(result.data);
          setGrantablePermissions(result.grantablePermissions || []);
          setSelectedPermissions(result.selectedPermissions || []);
          setInactiveAssignedPermissions(result.inactiveAssignedPermissions || []);
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
      } finally {
        setLoadingPermissions(false);
      }
    };
    loadPermissions();
  }, [user.id]);

  function handleClose() {
    onClose();
    setPhoneValue("");
  }

  const profileOptions =
    currentUserRole === "Administrador"
      ? [
          { value: "1", label: "Nível 1 — Administrador (Total)" },
          { value: "2", label: "Nível 2 — Gestor (Intermediário)" },
          { value: "3", label: "Nível 3 — Funcionário (Operacional)" },
        ]
      : currentUserRole === "Gestor"
        ? [{ value: "2", label: "Nível 2 — Gestor (Intermediário)" }]
        : [];

  return (
    <div
      className="fixed inset-0 lg:left-64 z-70 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <Card
        ref={editModalRef}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden shadow-2xl"
      >
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Editar usuário</CardTitle>
            <CardDescription>
              Atualize as informações do usuário conforme suas permissões.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={handleClose}
          >
            <X />
          </Button>
        </CardHeader>
        <form
          className="thin-scrollbar min-h-0 flex-1 overflow-y-auto"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            const form = new FormData(event.currentTarget);
            const name = String(form.get("name"));
            const email = String(form.get("email"));
            const phone = String(form.get("phone") || "");
            const currentPassword = String(form.get("currentPassword") || "");
            const password = String(form.get("password") || "");
            const confirmPassword = String(form.get("confirmPassword") || "");
            const status = String(form.get("status")) as "Ativo" | "Inativo";
            const levelVal = form.get("permissionLevel");
            const permissionLevel = levelVal
              ? (Number(levelVal) as 1 | 2 | 3)
              : undefined;
            const role =
              canEditProfile && permissionLevel
                ? roleFromPermissionLevel(permissionLevel)
                : undefined;

            try {
              setUserError("");
              const res = await updateUserAction({
                id: user.id,
                name,
                email,
                phone,
                currentPassword: currentPassword || undefined,
                password: password || undefined,
                confirmPassword: confirmPassword || undefined,
                role,
                status,
              });

              if (res.success && res.data) {
                let finalUser = res.data;

                if (canEditPermissions) {
                  const permissionNames = [
                    ...selectedPermissions,
                    ...inactiveAssignedPermissions.map((permission) => permission.name),
                  ];
                  const permResult = await updateUserPermissionsAction({
                    userId: user.id,
                    permissionNames,
                  });
                  if (!permResult.success) {
                    showToast(
                      `Usuário atualizado, mas erro ao salvar permissões: ${permResult.error}`,
                    );
                  } else if (permResult.data) {
                    finalUser = { ...finalUser, permissions: permResult.data };
                  }
                }

                onUserUpdated(finalUser);
                showToast(`Usuário ${name} atualizado com sucesso no banco!`);
                onClose();
                setPhoneValue("");
                setSelectedPermissions([]);
                setInactiveAssignedPermissions([]);
              } else {
                const err = res.error || "Erro ao atualizar usuário.";
                setUserError(err);
                editModalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Erro ao atualizar usuário.";
              setUserError(message);
              editModalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            } finally {
              setLoading(false);
            }
          }}
        >
          <CardContent className="space-y-4">
            {userError && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-600 shadow-sm animate-in fade-in zoom-in duration-200">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[10px]">
                  !
                </span>
                <span>{userError}</span>
              </div>
            )}
            <div>
              <FieldLabel>Nome completo</FieldLabel>
              <Input name="name" required defaultValue={user.name} />
            </div>
            <div>
              <FieldLabel>E-mail</FieldLabel>
              <Input
                name="email"
                required
                type="email"
                defaultValue={user.email}
              />
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-3">
              <p className="text-xs font-semibold text-zinc-900">
                Alteração de Senha (Opcional)
              </p>
              <div>
                <FieldLabel>Senha atual (obrigatória para alterar)</FieldLabel>
                <Input
                  name="currentPassword"
                  type="password"
                  placeholder="Sua senha em uso..."
                />
              </div>
              <div>
                <FieldLabel>Nova senha</FieldLabel>
                <Input
                  name="password"
                  type="password"
                  placeholder="Digite a nova senha..."
                />
              </div>
              <div>
                <FieldLabel>Confirme a nova senha</FieldLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Repita a nova senha..."
                />
              </div>
            </div>
            <div>
              <FieldLabel>Telefone</FieldLabel>
              <Input
                name="phone"
                value={phoneValue}
                onChange={(event) => {
                  setPhoneValue(formatPhoneBR(event.target.value));
                }}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(62) 99427-9139"
                maxLength={15}
              />
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <select
                name="status"
                defaultValue={user.status}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            {canEditUser && (
              <div>
                <FieldLabel>Perfil</FieldLabel>
                <select
                  name="permissionLevel"
                  disabled={!canEditProfile}
                  defaultValue={
                    user.role === "Administrador"
                      ? "1"
                      : user.role === "Gestor"
                        ? "2"
                        : "3"
                  }
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
                >
                  {profileOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {canEditPermissions && (
              <PermissionsSelector
                systemPermissions={systemPermissions}
                grantablePermissions={grantablePermissions}
                selectedPermissions={selectedPermissions}
                inactivePermissions={inactiveAssignedPermissions}
                onRemoveInactivePermission={(permissionName) => {
                  setInactiveAssignedPermissions((current) =>
                    current.filter((permission) => permission.name !== permissionName),
                  );
                }}
                onSelectedPermissionsChange={setSelectedPermissions}
                loading={loadingPermissions}
              />
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
