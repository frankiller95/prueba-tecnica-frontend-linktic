/**
 * Único punto de simulación del backend.
 *
 * Expone el mismo contrato que tendría un cliente HTTP real (promesas que
 * resuelven con datos o rechazan con `ApiError`), de modo que sustituirlo por
 * una API real solo implique reescribir este archivo.
 */
import type { AuthSession, AuthUser, Credentials } from '@/types/auth';
import type {
  PaymentMethod,
  PaymentMethodFilters,
  PaymentMethodPayload,
  PaymentMethodStatus,
} from '@/types/payment-method';

export const mockConfig = {
  /** Latencia simulada de cada petición, en milisegundos. */
  latencyMs: 600,
  /** Probabilidad (0 a 1) de que una petición falle con un error de servidor. */
  failureRate: 0,
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const MOCK_USER: AuthUser = {
  id: 'user-1',
  name: 'Administrador',
  email: 'admin@linktic.com',
};
const MOCK_PASSWORD = 'Admin123*';
const MOCK_TOKEN = 'mock-session-token';

let paymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    name: 'Visa Crédito',
    type: 'credit_card',
    description: 'Tarjetas de crédito de la franquicia Visa.',
    status: 'active',
    createdAt: '2026-01-15T14:30:00.000Z',
  },
  {
    id: 'pm-2',
    name: 'Mastercard Débito',
    type: 'debit_card',
    description: 'Tarjetas débito de la franquicia Mastercard.',
    status: 'active',
    createdAt: '2026-02-03T09:10:00.000Z',
  },
  {
    id: 'pm-3',
    name: 'PSE',
    type: 'bank_transfer',
    description: 'Transferencia bancaria mediante PSE.',
    status: 'active',
    createdAt: '2026-03-21T16:45:00.000Z',
  },
  {
    id: 'pm-4',
    name: 'Efectivo en punto físico',
    type: 'cash',
    status: 'inactive',
    createdAt: '2026-04-08T11:00:00.000Z',
  },
  {
    id: 'pm-5',
    name: 'Nequi',
    type: 'digital_wallet',
    description: 'Pago desde la billetera digital Nequi.',
    status: 'active',
    createdAt: '2026-05-12T19:20:00.000Z',
  },
  {
    id: 'pm-6',
    name: 'Daviplata',
    type: 'digital_wallet',
    status: 'inactive',
    createdAt: '2026-06-30T08:05:00.000Z',
  },
];

/** Simula la latencia de red, los fallos aleatorios y la serialización de la respuesta. */
function simulateRequest<T>(resolveResponse: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < mockConfig.failureRate) {
        reject(new ApiError('El servidor no pudo procesar la solicitud. Inténtalo de nuevo.', 500));
        return;
      }

      try {
        resolve(structuredClone(resolveResponse()));
      } catch (error) {
        reject(error instanceof Error ? error : new ApiError('Error inesperado.', 500));
      }
    }, mockConfig.latencyMs);
  });
}

function findPaymentMethod(id: string): PaymentMethod {
  const paymentMethod = paymentMethods.find((item) => item.id === id);

  if (!paymentMethod) {
    throw new ApiError('El método de pago no existe.', 404);
  }

  return paymentMethod;
}

function matchesFilters(paymentMethod: PaymentMethod, filters: PaymentMethodFilters): boolean {
  const createdDate = paymentMethod.createdAt.slice(0, 10);
  const { name, type, status, createdFrom, createdTo } = filters;

  return (
    (!name || paymentMethod.name.toLowerCase().includes(name.trim().toLowerCase())) &&
    (!type || paymentMethod.type === type) &&
    (!status || paymentMethod.status === status) &&
    (!createdFrom || createdDate >= createdFrom) &&
    (!createdTo || createdDate <= createdTo)
  );
}

function normalizePayload(payload: PaymentMethodPayload): PaymentMethodPayload {
  const description = payload.description?.trim();

  return {
    name: payload.name.trim(),
    type: payload.type,
    ...(description ? { description } : {}),
  };
}

export const mockApi = {
  auth: {
    login(credentials: Credentials): Promise<AuthSession> {
      return simulateRequest(() => {
        const isValid =
          credentials.email.trim().toLowerCase() === MOCK_USER.email &&
          credentials.password === MOCK_PASSWORD;

        if (!isValid) {
          throw new ApiError('Correo o contraseña incorrectos.', 401);
        }

        return { token: MOCK_TOKEN, user: MOCK_USER };
      });
    },

    logout(): Promise<void> {
      return simulateRequest(() => undefined);
    },
  },

  paymentMethods: {
    list(filters: PaymentMethodFilters = {}): Promise<PaymentMethod[]> {
      return simulateRequest(() => paymentMethods.filter((item) => matchesFilters(item, filters)));
    },

    create(payload: PaymentMethodPayload): Promise<PaymentMethod> {
      return simulateRequest(() => {
        const paymentMethod: PaymentMethod = {
          ...normalizePayload(payload),
          id: crypto.randomUUID(),
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        paymentMethods = [paymentMethod, ...paymentMethods];

        return paymentMethod;
      });
    },

    update(id: string, payload: PaymentMethodPayload): Promise<PaymentMethod> {
      return simulateRequest(() => {
        const { id: currentId, status, createdAt } = findPaymentMethod(id);
        const updated: PaymentMethod = {
          ...normalizePayload(payload),
          id: currentId,
          status,
          createdAt,
        };

        paymentMethods = paymentMethods.map((item) => (item.id === id ? updated : item));

        return updated;
      });
    },

    setStatus(id: string, status: PaymentMethodStatus): Promise<PaymentMethod> {
      return simulateRequest(() => {
        const updated: PaymentMethod = { ...findPaymentMethod(id), status };

        paymentMethods = paymentMethods.map((item) => (item.id === id ? updated : item));

        return updated;
      });
    },

    remove(id: string): Promise<void> {
      return simulateRequest(() => {
        findPaymentMethod(id);
        paymentMethods = paymentMethods.filter((item) => item.id !== id);
      });
    },
  },
};
