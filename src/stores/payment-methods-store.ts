import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { mockApi } from '@/services/mockApi';
import { useUiStore } from '@/stores/ui-store';
import type {
  PaymentMethod,
  PaymentMethodFilters,
  PaymentMethodPayload,
  PaymentMethodStatus,
} from '@/types/payment-method';

export const usePaymentMethodsStore = defineStore('payment-methods', () => {
  const uiStore = useUiStore();

  const items = ref<PaymentMethod[]>([]);
  const filters = ref<PaymentMethodFilters>({});
  const loading = ref(false);
  const saving = ref(false);
  /** Ids de los registros con una operación individual en curso (cambio de estado o borrado). */
  const pendingIds = ref<string[]>([]);

  function isPending(id: string): boolean {
    return pendingIds.value.includes(id);
  }

  function replaceItem(updatedItem: PaymentMethod) {
    items.value = items.value.map((item) => (item.id === updatedItem.id ? updatedItem : item));
  }

  /** Ejecuta una operación sobre un registro marcándolo como pendiente mientras dura. */
  async function runPendingOperation(id: string, operation: () => Promise<void>): Promise<boolean> {
    pendingIds.value = [...pendingIds.value, id];

    try {
      await operation();
      return true;
    } catch (error) {
      uiStore.notifyError(error);
      return false;
    } finally {
      pendingIds.value = pendingIds.value.filter((pendingId) => pendingId !== id);
    }
  }

  /** Ejecuta una operación de guardado (crear o editar) controlando el estado `saving`. */
  async function runSaveOperation(operation: () => Promise<void>): Promise<boolean> {
    saving.value = true;

    try {
      await operation();
      return true;
    } catch (error) {
      uiStore.notifyError(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  /** Consulta el listado; si se envían filtros, reemplazan a los activos. */
  async function fetchPaymentMethods(newFilters?: PaymentMethodFilters): Promise<void> {
    if (newFilters) {
      filters.value = newFilters;
    }

    loading.value = true;

    try {
      items.value = await mockApi.paymentMethods.list(filters.value);
    } catch (error) {
      uiStore.notifyError(error);
    } finally {
      loading.value = false;
    }
  }

  function createPaymentMethod(payload: PaymentMethodPayload): Promise<boolean> {
    return runSaveOperation(async () => {
      const createdItem = await mockApi.paymentMethods.create(payload);
      items.value = [createdItem, ...items.value];
    });
  }

  function updatePaymentMethod(id: string, payload: PaymentMethodPayload): Promise<boolean> {
    return runSaveOperation(async () => {
      replaceItem(await mockApi.paymentMethods.update(id, payload));
    });
  }

  /** Cambia el estado de forma optimista y lo revierte si la operación falla. */
  async function togglePaymentMethodStatus(id: string): Promise<boolean> {
    const currentItem = items.value.find((item) => item.id === id);

    if (!currentItem || isPending(id)) return false;

    const newStatus: PaymentMethodStatus = currentItem.status === 'active' ? 'inactive' : 'active';
    replaceItem({ ...currentItem, status: newStatus });

    const succeeded = await runPendingOperation(id, async () => {
      replaceItem(await mockApi.paymentMethods.setStatus(id, newStatus));
    });

    if (!succeeded) {
      replaceItem(currentItem);
    }

    return succeeded;
  }

  function removePaymentMethod(id: string): Promise<boolean> {
    return runPendingOperation(id, async () => {
      await mockApi.paymentMethods.remove(id);
      items.value = items.value.filter((item) => item.id !== id);
    });
  }

  return {
    items,
    filters,
    loading,
    saving,
    pendingIds,
    isPending,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    togglePaymentMethodStatus,
    removePaymentMethod,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePaymentMethodsStore, import.meta.hot));
}
