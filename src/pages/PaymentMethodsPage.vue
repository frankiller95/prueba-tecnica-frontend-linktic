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

    <!-- Listado provisional: se reemplaza por la tabla en el siguiente paso. -->
    <q-card flat bordered>
      <q-card-section class="text-subtitle2">
        {{ paymentMethodsStore.items.length }} métodos de pago encontrados
      </q-card-section>

      <q-list separator>
        <q-item v-for="paymentMethod in paymentMethodsStore.items" :key="paymentMethod.id">
          <q-item-section>
            <q-item-label>{{ paymentMethod.name }}</q-item-label>
            <q-item-label caption>
              {{ PAYMENT_METHOD_TYPE_LABELS[paymentMethod.type] }} ·
              {{ PAYMENT_METHOD_STATUS_LABELS[paymentMethod.status] }} ·
              {{ paymentMethod.createdAt.slice(0, 10) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-inner-loading :showing="paymentMethodsStore.loading" />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import BaseFilters from '@/components/BaseFilters.vue';
import {
  PAYMENT_METHOD_FILTER_FIELDS,
  PAYMENT_METHOD_STATUS_LABELS,
  PAYMENT_METHOD_TYPE_LABELS,
} from '@/constants/payment-methods';
import { usePaymentMethodsStore } from '@/stores/payment-methods-store';
import type { FilterValues } from '@/types/filters';

const paymentMethodsStore = usePaymentMethodsStore();

// Las claves de los filtros configurados coinciden con las de `PaymentMethodFilters`.
function searchPaymentMethods(filterValues: FilterValues) {
  void paymentMethodsStore.fetchPaymentMethods(filterValues);
}

onMounted(() => searchPaymentMethods({}));
</script>
