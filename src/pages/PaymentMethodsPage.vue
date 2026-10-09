<template>
  <q-page padding class="q-gutter-y-md">
    <q-card flat bordered>
      <q-card-section>
        <BaseFilters
          :fields="PAYMENT_METHOD_FILTER_FIELDS"
          :loading="paymentMethodsStore.loading"
          @search="searchPaymentMethods"
          @clear="searchPaymentMethods({})"
        />
      </q-card-section>
    </q-card>

    <PaymentMethodsTable
      :rows="paymentMethodsStore.items"
      :loading="paymentMethodsStore.loading"
      :pending-ids="paymentMethodsStore.pendingIds"
      :removing-ids="paymentMethodsStore.removingIds"
      @create="openForm(null)"
      @edit="openForm"
      @remove="confirmRemoval"
      @toggle-status="paymentMethodsStore.togglePaymentMethodStatus"
    />

    <PaymentMethodFormDialog
      v-model="isFormOpen"
      :payment-method="selectedPaymentMethod"
      :saving="paymentMethodsStore.saving"
      @submit="savePaymentMethod"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import BaseFilters from '@/components/BaseFilters.vue';
import PaymentMethodFormDialog from '@/components/PaymentMethodFormDialog.vue';
import PaymentMethodsTable from '@/components/PaymentMethodsTable.vue';
import { PAYMENT_METHOD_FILTER_FIELDS } from '@/constants/payment-methods';
import { usePaymentMethodsStore } from '@/stores/payment-methods-store';
import type { FilterValues } from '@/types/filters';
import type { PaymentMethod, PaymentMethodPayload } from '@/types/payment-method';

const $q = useQuasar();
const paymentMethodsStore = usePaymentMethodsStore();

const isFormOpen = ref(false);
/** Registro en edición; `null` indica que el formulario está en modo creación. */
const selectedPaymentMethod = ref<PaymentMethod | null>(null);

// Las claves de los filtros configurados coinciden con las de `PaymentMethodFilters`.
function searchPaymentMethods(filterValues: FilterValues) {
  void paymentMethodsStore.fetchPaymentMethods(filterValues);
}

function openForm(paymentMethod: PaymentMethod | null) {
  selectedPaymentMethod.value = paymentMethod;
  isFormOpen.value = true;
}

function notifySuccess(message: string) {
  $q.notify({ type: 'positive', message, position: 'top' });
}

async function savePaymentMethod(payload: PaymentMethodPayload) {
  const editedPaymentMethod = selectedPaymentMethod.value;
  const wasSaved = editedPaymentMethod
    ? await paymentMethodsStore.updatePaymentMethod(editedPaymentMethod.id, payload)
    : await paymentMethodsStore.createPaymentMethod(payload);

  // Si falla, el diálogo queda abierto para que el usuario pueda reintentar sin perder los datos.
  if (!wasSaved) return;

  isFormOpen.value = false;
  notifySuccess(editedPaymentMethod ? 'Método de pago actualizado.' : 'Método de pago creado.');
}

function confirmRemoval(paymentMethod: PaymentMethod) {
  $q.dialog({
    title: 'Eliminar método de pago',
    message: `¿Seguro que deseas eliminar "${paymentMethod.name}"? Esta acción no se puede deshacer.`,
    persistent: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true, color: 'primary' },
    ok: { label: 'Eliminar', unelevated: true, noCaps: true, color: 'negative' },
  }).onOk(() => {
    void removePaymentMethod(paymentMethod);
  });
}

async function removePaymentMethod(paymentMethod: PaymentMethod) {
  const wasRemoved = await paymentMethodsStore.removePaymentMethod(paymentMethod.id);

  if (wasRemoved) {
    notifySuccess('Método de pago eliminado.');
  }
}

onMounted(() => searchPaymentMethods({}));
</script>
