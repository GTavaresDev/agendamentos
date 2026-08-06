export interface ServiceProps {
  id?: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  status?: "Ativo" | "Inativo";
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Service {
  private props: Required<ServiceProps>;

  constructor(props: ServiceProps) {
    this.props = {
      id: props.id || crypto.randomUUID(),
      name: props.name,
      description: props.description || "",
      duration: props.duration,
      price: props.price || 0,
      status: props.status || "Ativo",
      color: props.color || "",
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

  public get description(): string {
    return this.props.description;
  }

  public get duration(): number {
    return this.props.duration;
  }

  public get price(): number {
    return this.props.price;
  }

  public get status(): "Ativo" | "Inativo" {
    return this.props.status;
  }

  public get color(): string {
    return this.props.color;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateDetails(details: Partial<Omit<ServiceProps, "id" | "createdAt">>): void {
    if (details.name) this.props.name = details.name;
    if (details.description !== undefined) this.props.description = details.description;
    if (details.duration) this.props.duration = details.duration;
    if (details.price !== undefined) this.props.price = details.price;
    if (details.status) this.props.status = details.status;
    if (details.color !== undefined) this.props.color = details.color;
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: "Ativo" | "Inativo"): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public toJSON(): Required<ServiceProps> {
    return { ...this.props };
  }
}
