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
      @toggle-status="paymentMethodsStore.togglePaymentMethodStatus"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import BaseFilters from '@/components/BaseFilters.vue';
import PaymentMethodsTable from '@/components/PaymentMethodsTable.vue';
import { PAYMENT_METHOD_FILTER_FIELDS } from '@/constants/payment-methods';
import { usePaymentMethodsStore } from '@/stores/payment-methods-store';
import type { FilterValues } from '@/types/filters';

const paymentMethodsStore = usePaymentMethodsStore();

// Las claves de los filtros configurados coinciden con las de `PaymentMethodFilters`.
function searchPaymentMethods(filterValues: FilterValues) {
  void paymentMethodsStore.fetchPaymentMethods(filterValues);
}

onMounted(() => searchPaymentMethods({}));
</script>
