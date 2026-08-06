import { IPermissionRepository } from '@core/domain/users/permission.repository';
import { SystemPermissionProps } from '@core/domain/users/system-permission.entity';

export interface UpdateSystemPermissionInput {
  id: number;
  enabled?: boolean;
  description?: string;
}

export class UpdateSystemPermission {
  constructor(private permissionRepository: IPermissionRepository) {}

  async execute(input: UpdateSystemPermissionInput): Promise<SystemPermissionProps> {
    const updated = await this.permissionRepository.updateSystemPermission(input.id, {
      enabled: input.enabled,
      description: input.description,
    });
    return updated.toJSON();
  }
}
