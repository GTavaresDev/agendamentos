export interface UserPermissionProps {
  id: number;
  name: "Administrador" | "Gestor" | "Funcionario" | string;
  userId: string;
}

export const PERMISSION_LEVELS = {
  ADMINISTRADOR: { id: 1, name: "Administrador" },
  GESTOR: { id: 2, name: "Gestor" },
  FUNCIONARIO: { id: 3, name: "Funcionario" },
} as const;

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
