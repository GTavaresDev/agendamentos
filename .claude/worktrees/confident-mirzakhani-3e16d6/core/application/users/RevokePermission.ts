import { IPermissionRepository } from '@core/domain/users/PermissionRepository';
import { UserRepository } from '@core/domain/users/UserRepository';
import { validatePermissionGrant } from '@core/domain/users/PermissionValidation';

export interface RevokePermissionInput {
  granterId: string;
  targetUserId: string;
  permissionName: string;
}

export class RevokePermission {
  constructor(
    private permissionRepository: IPermissionRepository,
    private userRepository: UserRepository
  ) {}

  async execute(input: RevokePermissionInput): Promise<void> {
    const granter = await this.userRepository.findById(input.granterId);
    if (!granter) {
      throw new Error('Usuário que está revogando a permissão não encontrado.');
    }

    const target = await this.userRepository.findById(input.targetUserId);
    if (!target) {
      throw new Error('Usuário alvo não encontrado.');
    }

    // Prevent self-demotion
    if (input.granterId === input.targetUserId) {
      throw new Error('Você não pode modificar suas próprias permissões.');
    }

    // Validate the grant (same rules as granting)
    const granterPermissions = granter.permissions || [];
    validatePermissionGrant(
      { role: granter.role, permissions: granterPermissions },
      target.role,
      input.permissionName
    );

    // Revoke the permission
    await this.permissionRepository.revokePermission(
      input.targetUserId,
      input.permissionName
    );
  }
}
