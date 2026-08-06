import { IPermissionRepository } from '@core/domain/users/PermissionRepository';
import { SystemPermissionProps } from '@core/domain/users/SystemPermission';

export class ListSystemPermissions {
  constructor(private permissionRepository: IPermissionRepository) {}

  async execute(): Promise<SystemPermissionProps[]> {
    const permissions = await this.permissionRepository.findAllSystemPermissions();
    return permissions.map(p => p.toJSON());
  }
}
