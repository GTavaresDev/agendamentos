import { IPermissionRepository } from '@core/domain/users/PermissionRepository';
import { UserRepository } from '@core/domain/users/UserRepository';
import { validatePermissionGrant } from '@core/domain/users/PermissionValidation';
import { UserPermissionProps } from '@core/domain/users/UserPermission';

export interface GrantPermissionInput {
  granterId: string;
  targetUserId: string;
  permissionName: string;
}

export class GrantPermission {
  constructor(
    private permissionRepository: IPermissionRepository,
    private userRepository: UserRepository
  ) {}

  async execute(input: GrantPermissionInput): Promise<UserPermissionProps> {
    const granter = await this.userRepository.findById(input.granterId);
    if (!granter) {
      throw new Error('Usuário que está concedendo a permissão não encontrado.');
    }

    const target = await this.userRepository.findById(input.targetUserId);
    if (!target) {
      throw new Error('Usuário alvo não encontrado.');
    }

    // Prevent self-promotion
    if (input.granterId === input.targetUserId) {
      throw new Error('Você não pode modificar suas próprias permissões.');
    }

    // Validate the grant
    const granterPermissions = granter.permissions || [];
    validatePermissionGrant(
      { role: granter.role, permissions: granterPermissions },
      target.role,
      input.permissionName
    );

    // Grant the permission
    const permission = await this.permissionRepository.grantPermission(
      input.targetUserId,
      input.permissionName
    );

    return permission.toJSON();
  }
}
