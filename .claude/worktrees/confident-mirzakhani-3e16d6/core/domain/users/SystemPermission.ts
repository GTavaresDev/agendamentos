export type PermissionCategory = 'general' | 'reports' | 'admin' | 'roles';

export interface SystemPermissionProps {
  id: number;
  name: string;
  description?: string;
  category: PermissionCategory;
  enabled: boolean;
  requiresHierarchy: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SystemPermission {
  private props: SystemPermissionProps;

  constructor(props: SystemPermissionProps) {
    this.props = props;
  }

  get id(): number {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get category(): PermissionCategory {
    return this.props.category;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get requiresHierarchy(): boolean {
    return this.props.requiresHierarchy;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public toJSON(): SystemPermissionProps {
    return { ...this.props };
  }
}
