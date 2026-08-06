export type StaffRole = "Administrador" | "Gestor" | "Funcionario";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string | null;
  role: StaffRole;
  status: "Ativo" | "Inativo";
  last?: string | null;
  initials: string;
  permissions?: import("./UserPermission").UserPermissionProps[];
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: UserProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Nome do usuário é obrigatório.");
    }
    if (!props.email || !props.email.includes("@")) {
      throw new Error("E-mail inválido.");
    }
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get email(): string {
    return this.props.email;
  }
  get phone(): string {
    return this.props.phone;
  }
  get password(): string | null | undefined {
    return this.props.password;
  }
  get role(): StaffRole {
    return this.props.role;
  }
  get status(): "Ativo" | "Inativo" {
    return this.props.status;
  }
  get last(): string | null | undefined {
    return this.props.last;
  }
  get initials(): string {
    return this.props.initials;
  }
  get permissions(): import("./UserPermission").UserPermissionProps[] | undefined {
    return this.props.permissions;
  }
  get failedLoginAttempts(): number {
    return this.props.failedLoginAttempts ?? 0;
  }
  get lockedUntil(): Date | null | undefined {
    return this.props.lockedUntil;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public toJSON(): UserProps {
    const { password: _password, ...safe } = this.props;
    return { ...safe, password: undefined };
  }

  public toPersistenceJSON(): UserProps {
    return { ...this.props };
  }

  public static generateInitials(name: string): string {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
