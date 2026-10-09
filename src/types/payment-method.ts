export type PaymentMethodType =
  'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'digital_wallet';

export type PaymentMethodStatus = 'active' | 'inactive';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  description?: string;
  status: PaymentMethodStatus;
  /** Fecha de creación en formato ISO 8601. */
  createdAt: string;
}

/** Datos editables por el usuario al crear o modificar un método de pago. */
export type PaymentMethodPayload = Pick<PaymentMethod, 'name' | 'type' | 'description'>;

export interface PaymentMethodFilters {
  name?: string;
  type?: PaymentMethodType;
  status?: PaymentMethodStatus;
  /** Límite inferior de la fecha de creación (YYYY-MM-DD, inclusive). */
  createdFrom?: string;
  /** Límite superior de la fecha de creación (YYYY-MM-DD, inclusive). */
  createdTo?: string;
}
