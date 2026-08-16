import type { SystemPermissionProps } from "@core/domain/users/system-permission.entity";
import type { UserPermissionProps } from "@core/domain/users/user-permission.entity";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label.component";

export function PermissionsSelector({
  systemPermissions,
  grantablePermissions,
  selectedPermissions,
  inactivePermissions,
  onRemoveInactivePermission,
  onSelectedPermissionsChange,
  loading,
}: {
  systemPermissions: SystemPermissionProps[];
  grantablePermissions: string[];
  selectedPermissions: string[];
  inactivePermissions?: UserPermissionProps[];
  onRemoveInactivePermission?: (permissionName: string) => void;
  onSelectedPermissionsChange: (permissions: string[]) => void;
  loading: boolean;
}) {
  return (
    <div>
      <FieldLabel>Permissões</FieldLabel>
      {loading ? (
        <div className="text-xs text-zinc-500 py-2">Carregando permissões...</div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-3 bg-zinc-50">
          <div className="space-y-2">
            {systemPermissions.map((perm) => {
              const isGrantable = grantablePermissions.includes(perm.name);
              const isChecked = selectedPermissions.includes(perm.name);
              return (
                <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!isGrantable}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onSelectedPermissionsChange([...selectedPermissions, perm.name]);
                      } else {
                        onSelectedPermissionsChange(
                          selectedPermissions.filter((p) => p !== perm.name),
                        );
                      }
                    }}
                    className="mt-1 rounded border-zinc-300 disabled:opacity-50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-900">{perm.name}</div>
                    {perm.description && (
                      <div className="text-xs text-zinc-500">{perm.description}</div>
                    )}
                    {!isGrantable && (
                      <div className="text-xs text-zinc-400 italic">Restrito</div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {(inactivePermissions?.length ?? 0) > 0 && (
            <div className="space-y-2 border-t border-zinc-200 pt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Permissões desativadas
              </div>
              {inactivePermissions?.map((perm) => (
                <div
                  key={perm.id}
                  className="flex items-start gap-2 rounded-md border border-dashed border-zinc-200 bg-white px-3 py-2"
                >
                  <div className="mt-1 size-2 rounded-full bg-zinc-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-900">{perm.name}</div>
                    <div className="text-xs text-zinc-500 italic">Permissão desativada</div>
                  </div>
                  {onRemoveInactivePermission && (
                    <button
                      type="button"
                      onClick={() => onRemoveInactivePermission(perm.name)}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
