"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label.component";
import { PermissionsSelector } from "./permissions-selector.component";
import {
  getAvailablePermissionsForUserAction,
  updateUserPermissionsAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/permission-actions";
import type { SystemPermissionProps } from "@core/domain/users/system-permission.entity";
import { UserProps } from "@core/domain/users/user.entity";
import type { StaffRole } from "@core/domain/users/user.entity";
import { formatPhoneBR } from "@/lib/input-masks";

export function CreateUserDialog({
  userList,
  currentUserRole,
  onAddUser,
  onClose,
  showToast,
}: {
  userList: UserProps[];
  currentUserRole: StaffRole;
  onAddUser: (user: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    permissionLevel?: 1 | 2 | 3;
  }) => Promise<void>;
  onClose: () => void;
  showToast: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [systemPermissions, setSystemPermissions] = useState<SystemPermissionProps[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [grantablePermissions, setGrantablePermissions] = useState<string[]>([]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const result = await getAvailablePermissionsForUserAction();
        if (result.success && result.data) {
          setSystemPermissions(result.data);
          setGrantablePermissions(result.grantablePermissions || []);
          setSelectedPermissions([]);
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
      } finally {
        setLoadingPermissions(false);
      }
    };
    loadPermissions();
  }, []);

  async function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone") || "");
    const password = String(form.get("password") || "");
    const permissionLevel = Number(form.get("permissionLevel") || 3) as 1 | 2 | 3;

    try {
      await onAddUser({ name, email, phone, password, permissionLevel });

      // Find the newly created user and save permissions
      const newUser = userList.find((u) => u.email === email);
      if (newUser && currentUserRole === "Administrador" && selectedPermissions.length > 0) {
        const permResult = await updateUserPermissionsAction({
          userId: newUser.id,
          permissionNames: selectedPermissions,
        });
        if (!permResult.success) {
          showToast(`Usuário criado, mas erro ao salvar permissões: ${permResult.error}`);
        }
      }

      onClose();
      setPhoneValue("");
      setSelectedPermissions([]);
      showToast("Novo usuário adicionado com sucesso");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao adicionar usuário";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Adicionar usuário</CardTitle>
            <CardDescription>
              Cadastre um novo usuário com senha no PostgreSQL.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={() => {
              onClose();
              setPhoneValue("");
            }}
          >
            <X />
          </Button>
        </CardHeader>
        <form onSubmit={addUser} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4">
            <div>
              <FieldLabel>Nome completo</FieldLabel>
              <Input name="name" required placeholder="Ex.: João da Silva" />
            </div>
            <div>
              <FieldLabel>E-mail</FieldLabel>
              <Input name="email" required type="email" placeholder="joao@email.com" />
            </div>
            <div>
              <FieldLabel>Senha de Acesso</FieldLabel>
              <Input
                name="password"
                type="password"
                required
                placeholder="Digite uma senha segura..."
              />
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
              <FieldLabel>Perfil</FieldLabel>
              <select
                name="permissionLevel"
                defaultValue={currentUserRole === "Gestor" ? "2" : "1"}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
              >
                {currentUserRole === "Administrador" && (
                  <option value="1">Nível 1 — Administrador (Total)</option>
                )}
                <option value="2">Nível 2 — Gestor (Intermediário)</option>
                <option value="3">Nível 3 — Funcionário (Operacional)</option>
              </select>
            </div>
            {currentUserRole === "Administrador" && (
              <PermissionsSelector
                systemPermissions={systemPermissions}
                grantablePermissions={grantablePermissions}
                selectedPermissions={selectedPermissions}
                inactivePermissions={[]}
                onSelectedPermissionsChange={setSelectedPermissions}
                loading={loadingPermissions}
              />
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  setPhoneValue("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando no banco..." : "Adicionar usuário"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
