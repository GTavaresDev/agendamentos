export interface SaleProps {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sale {
  private props: SaleProps;

  constructor(props: SaleProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: SaleProps) {
    if (!props.productId || props.productId.trim().length === 0) {
      throw new Error("Produto é obrigatório.");
    }
    if (props.quantity <= 0) {
      throw new Error("Quantidade deve ser maior que zero.");
    }
    if (props.unitPrice < 0) {
      throw new Error("Preço unitário não pode ser negativo.");
    }
    if (props.totalPrice < 0) {
      throw new Error("Preço total não pode ser negativo.");
    }
    if (!props.paymentMethod) {
      throw new Error("Método de pagamento é obrigatório.");
    }
  }

  get id(): string {
    return this.props.id;
  }
  get productId(): string {
    return this.props.productId;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get unitPrice(): number {
    return this.props.unitPrice;
  }
  get totalPrice(): number {
    return this.props.totalPrice;
  }
  get paymentMethod(): "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência" {
    return this.props.paymentMethod;
  }
  get createdById(): string | null | undefined {
    return this.props.createdById;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get formattedTotal(): string {
    return this.props.totalPrice.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  get formattedUnitPrice(): string {
    return this.props.unitPrice.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  public toJSON(): SaleProps & { formattedTotal: string; formattedUnitPrice: string } {
    return {
      ...this.props,
      formattedTotal: this.formattedTotal,
      formattedUnitPrice: this.formattedUnitPrice,
    };
  }
}
