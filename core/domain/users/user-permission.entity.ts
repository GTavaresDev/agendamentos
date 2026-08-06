export interface UserPermissionProps {
  id: number;
  name: string;
  userId: string;
  description?: string | null;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserPermission {
  private props: UserPermissionProps;

  constructor(props: UserPermissionProps) {
    this.props = props;
  }

  get id(): number {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get userId(): string {
    return this.props.userId;
  }

  public toJSON(): UserPermissionProps {
    return { ...this.props };
  }
}
