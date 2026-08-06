export interface ClientProps {
  id?: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  birthDate?: string;
  status?: "Ativo" | "Inativo";
  initials?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client {
  private props: Required<ClientProps>;

  constructor(props: ClientProps) {
    this.props = {
      id: props.id || crypto.randomUUID(),
      name: props.name,
      email: props.email,
      phone: props.phone,
      cpf: props.cpf || "",
      birthDate: props.birthDate || "",
      status: props.status || "Ativo",
      initials: props.initials || Client.generateInitials(props.name),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get email(): string {
    return this.props.email;
  }

  public get phone(): string {
    return this.props.phone;
  }

  public get cpf(): string {
    return this.props.cpf;
  }

  public get birthDate(): string {
    return this.props.birthDate;
  }

  public get status(): "Ativo" | "Inativo" {
    return this.props.status;
  }

  public get initials(): string {
    return this.props.initials;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateStatus(status: "Ativo" | "Inativo"): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public updateDetails(details: Partial<Omit<ClientProps, "id" | "createdAt">>): void {
    if (details.name) {
      this.props.name = details.name;
      this.props.initials = Client.generateInitials(details.name);
    }
    if (details.email) this.props.email = details.email;
    if (details.phone) this.props.phone = details.phone;
    if (details.cpf !== undefined) this.props.cpf = details.cpf;
    if (details.birthDate !== undefined) this.props.birthDate = details.birthDate;
    if (details.status) this.props.status = details.status;
    this.props.updatedAt = new Date();
  }

  public static generateInitials(name: string): string {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "CL";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  public toJSON(): Required<ClientProps> {
    return { ...this.props };
  }
}
