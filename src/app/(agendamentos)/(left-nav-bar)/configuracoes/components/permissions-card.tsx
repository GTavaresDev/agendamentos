"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import {
  listSystemPermissionsAction,
  updateSystemPermissionAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/permission-actions";
import type { SystemPermissionProps } from "@core/domain/users/system-permission.entity";

export function PermissionsCard() {
  const { currentUser, showToast } = useAppShell();

  const isAdmin =
    currentUser?.permissionLevel === 1 || currentUser?.role === "Administrador";

  const [permissions, setPermissions] = useState<SystemPermissionProps[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [updatingPermission, setUpdatingPermission] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const result = await listSystemPermissionsAction();
        if (result.success && result.data) {
          setPermissions(result.data);
        } else if (result.error) {
          showToast(`Erro: ${result.error}`);
        }
      } catch (error) {
        showToast("Erro ao carregar permissões.");
      } finally {
        setLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [isAdmin, showToast]);

  async function handleTogglePermission(permId: number, currentEnabled: boolean) {
    try {
      setUpdatingPermission(permId);
      const result = await updateSystemPermissionAction({
        id: permId,
        enabled: !currentEnabled,
      });

      if (result.success && result.data) {
        setPermissions((prev) =>
          prev.map((p) =>
            p.id === permId ? { ...p, enabled: result.data!.enabled } : p
          )
        );
        showToast(
          `Permissão ${!currentEnabled ? "ativada" : "desativada"} com sucesso.`
        );
      } else if (result.error) {
        showToast(`Erro: ${result.error}`);
      }
    } catch (error) {
      showToast("Erro ao atualizar permissão.");
    } finally {
      setUpdatingPermission(null);
    }
  }

  if (!isAdmin) return null;

  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Lock className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900">
              Permissões
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Gerencie as permissões disponíveis no sistema
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-4">
        {loadingPermissions ? (
          <div className="text-center text-zinc-500 py-6">Carregando permissões...</div>
        ) : permissions.length === 0 ? (
          <div className="text-center text-zinc-500 py-6">Nenhuma permissão configurada.</div>
        ) : (
          <div className="space-y-3">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">
                      {perm.name}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        perm.enabled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                      )}
                    >
                      {perm.enabled ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  {perm.description && (
                    <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">{perm.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={perm.enabled}
                  disabled={updatingPermission === perm.id}
                  onClick={() => handleTogglePermission(perm.id, perm.enabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 self-start sm:self-center",
                    perm.enabled ? "bg-zinc-950" : "bg-zinc-300"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      perm.enabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
