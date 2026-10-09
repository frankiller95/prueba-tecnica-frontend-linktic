import type { FilterField } from '@/types/filters';
import type { PaymentMethodStatus, PaymentMethodType } from '@/types/payment-method';

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta débito',
  bank_transfer: 'Transferencia bancaria',
  cash: 'Efectivo',
  digital_wallet: 'Billetera digital',
};

export const PAYMENT_METHOD_STATUS_LABELS: Record<PaymentMethodStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
};

function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ label: labels[value], value }));
}

export const PAYMENT_METHOD_TYPE_OPTIONS = toOptions(PAYMENT_METHOD_TYPE_LABELS);
export const PAYMENT_METHOD_STATUS_OPTIONS = toOptions(PAYMENT_METHOD_STATUS_LABELS);

/** Configuración de los filtros del listado; las claves coinciden con `PaymentMethodFilters`. */
export const PAYMENT_METHOD_FILTER_FIELDS: FilterField[] = [
  { key: 'name', label: 'Nombre', type: 'text' },
  { key: 'type', label: 'Tipo', type: 'select', options: PAYMENT_METHOD_TYPE_OPTIONS },
  { key: 'status', label: 'Estado', type: 'select', options: PAYMENT_METHOD_STATUS_OPTIONS },
  { key: 'createdFrom', label: 'Creado desde', type: 'date' },
  { key: 'createdTo', label: 'Creado hasta', type: 'date' },
];
