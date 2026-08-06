export interface ProductProps {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  status: "Ativo" | "Inativo" | "Baixo estoque";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: ProductProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Nome do produto é obrigatório.");
    }
    if (props.price < 0) {
      throw new Error("Preço não pode ser negativo.");
    }
    if (props.quantity < 0) {
      throw new Error("Quantidade não pode ser negativa.");
    }
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get category(): string {
    return this.props.category;
  }
  get price(): number {
    return this.props.price;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get status(): "Ativo" | "Inativo" | "Baixo estoque" {
    return this.props.status;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get formattedPrice(): string {
    return this.props.price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  public toJSON(): ProductProps & { formattedPrice: string } {
    return {
      ...this.props,
      formattedPrice: this.formattedPrice,
    };
  }
}
