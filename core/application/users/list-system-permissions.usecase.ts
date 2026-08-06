import { IPermissionRepository } from '@core/domain/users/permission.repository';
import { SystemPermissionProps } from '@core/domain/users/system-permission.entity';

export class ListSystemPermissions {
  constructor(private permissionRepository: IPermissionRepository) {}

  async execute(): Promise<SystemPermissionProps[]> {
    const permissions = await this.permissionRepository.findAllSystemPermissions();
    return permissions.map(p => p.toJSON());
  }
}
