import { IPermissionRepository } from '@core/domain/users/permission.repository';
import { SystemPermissionProps } from '@core/domain/users/system-permission.entity';

export class ListActiveSystemPermissions {
  constructor(private permissionRepository: IPermissionRepository) {}

  async execute(): Promise<SystemPermissionProps[]> {
    const permissions = await this.permissionRepository.findActiveSystemPermissions();
    return permissions.map(p => p.toJSON());
  }
}