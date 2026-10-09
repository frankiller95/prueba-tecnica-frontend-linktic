<template>
  <q-table
    flat
    bordered
    row-key="id"
    title="Métodos de pago"
    no-data-label="No se encontraron métodos de pago."
    :rows="rows"
    :columns="columns"
    :loading="loading"
    :grid="$q.screen.lt.sm"
    :pagination="initialPagination"
    :rows-per-page-options="[5, 10, 20]"
  >
    <template #top-right>
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="add"
        label="Nuevo método de pago"
        @click="emit('create')"
      />
    </template>

    <template #loading>
      <q-inner-loading showing color="primary" />
    </template>

    <template #body-cell-status="{ row }: { row: PaymentMethod }">
      <q-td>
        <q-toggle
          color="positive"
          :model-value="row.status === 'active'"
          :label="PAYMENT_METHOD_STATUS_LABELS[row.status]"
          :disable="pendingIds.includes(row.id)"
          :aria-label="`Cambiar estado de ${row.name}`"
          @update:model-value="emit('toggleStatus', row.id)"
        />
      </q-td>
    </template>

    <template #body-cell-actions="{ row }: { row: PaymentMethod }">
      <q-td class="text-right">
        <q-btn
          flat
          round
          dense
          color="primary"
          icon="edit"
          :disable="pendingIds.includes(row.id)"
          :aria-label="`Editar ${row.name}`"
          @click="emit('edit', row)"
        >
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          color="negative"
          icon="delete"
          :disable="pendingIds.includes(row.id)"
          :aria-label="`Eliminar ${row.name}`"
          @click="emit('remove', row)"
        >
          <q-tooltip>Eliminar</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <!-- En pantallas pequeñas cada registro se muestra como una tarjeta. -->
    <template #item="{ row }: { row: PaymentMethod }">
      <div class="col-12 q-pa-xs">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">{{ row.name }}</div>
            <div class="text-caption text-grey-7">
              {{ PAYMENT_METHOD_TYPE_LABELS[row.type] }} · Creado el {{ formatDate(row.createdAt) }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-toggle
              color="positive"
              :model-value="row.status === 'active'"
              :label="PAYMENT_METHOD_STATUS_LABELS[row.status]"
              :disable="pendingIds.includes(row.id)"
              :aria-label="`Cambiar estado de ${row.name}`"
              @update:model-value="emit('toggleStatus', row.id)"
            />
            <q-space />
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              :disable="pendingIds.includes(row.id)"
              :aria-label="`Editar ${row.name}`"
              @click="emit('edit', row)"
            />
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              :disable="pendingIds.includes(row.id)"
              :aria-label="`Eliminar ${row.name}`"
              @click="emit('remove', row)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import {
  PAYMENT_METHOD_STATUS_LABELS,
  PAYMENT_METHOD_TYPE_LABELS,
} from '@/constants/payment-methods';
import type { PaymentMethod } from '@/types/payment-method';
import { formatDate } from '@/utils/formatters';

defineProps<{
  rows: PaymentMethod[];
  loading?: boolean;
  /** Ids de los registros con una operación en curso; sus acciones se deshabilitan. */
  pendingIds: string[];
}>();

const emit = defineEmits<{
  create: [];
  toggleStatus: [id: string];
  edit: [paymentMethod: PaymentMethod];
  remove: [paymentMethod: PaymentMethod];
}>();

const initialPagination = { rowsPerPage: 10 };

const columns: QTableColumn<PaymentMethod>[] = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  {
    name: 'type',
    label: 'Tipo',
    field: (row) => PAYMENT_METHOD_TYPE_LABELS[row.type],
    align: 'left',
    sortable: true,
  },
  { name: 'status', label: 'Estado', field: 'status', align: 'left', sortable: true },
  {
    name: 'createdAt',
    label: 'Fecha de creación',
    field: 'createdAt',
    format: (value: string) => formatDate(value),
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'right' },
];
</script>
