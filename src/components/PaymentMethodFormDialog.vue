<template>
  <q-dialog v-model="isOpen" :persistent="saving" @before-show="resetForm">
    <q-card class="full-width">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ isEditing ? 'Editar método de pago' : 'Nuevo método de pago' }}
        </div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" aria-label="Cerrar" :disable="saving" />
      </q-card-section>

      <q-form greedy @submit="submitForm">
        <q-card-section class="q-gutter-y-sm q-pt-none">
          <q-input
            v-model="form.name"
            label="Nombre *"
            maxlength="60"
            outlined
            autofocus
            lazy-rules
            :rules="nameRules"
            :disable="saving"
          />

          <q-select
            v-model="form.type"
            label="Tipo *"
            emit-value
            map-options
            outlined
            lazy-rules
            :options="PAYMENT_METHOD_TYPE_OPTIONS"
            :rules="typeRules"
            :disable="saving"
          />

          <q-input
            v-model="form.description"
            type="textarea"
            label="Descripción (opcional)"
            maxlength="200"
            counter
            autogrow
            outlined
            :disable="saving"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn v-close-popup flat no-caps color="primary" label="Cancelar" :disable="saving" />
          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary"
            :label="isEditing ? 'Guardar cambios' : 'Crear'"
            :loading="saving"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { PAYMENT_METHOD_TYPE_OPTIONS } from '@/constants/payment-methods';
import type {
  PaymentMethod,
  PaymentMethodPayload,
  PaymentMethodType,
} from '@/types/payment-method';
import { required } from '@/utils/validation-rules';

interface PaymentMethodForm {
  name: string;
  type: PaymentMethodType | null;
  description: string;
}

const props = defineProps<{
  /** Registro a editar; si no se envía, el formulario funciona en modo creación. */
  paymentMethod?: PaymentMethod | null;
  saving?: boolean;
}>();

const emit = defineEmits<{
  /** Se emite con los datos ya validados; el padre decide si crea o actualiza. */
  submit: [payload: PaymentMethodPayload];
}>();

const isOpen = defineModel<boolean>({ required: true });

const form = ref<PaymentMethodForm>(buildForm());

const isEditing = computed(() => Boolean(props.paymentMethod));

const nameRules = [required('Ingresa el nombre del método de pago.')];
const typeRules = [required('Selecciona el tipo de método de pago.')];

function buildForm(): PaymentMethodForm {
  return {
    name: props.paymentMethod?.name ?? '',
    type: props.paymentMethod?.type ?? null,
    description: props.paymentMethod?.description ?? '',
  };
}

// Cada vez que se abre el diálogo, el formulario se precarga con el registro recibido o queda vacío.
function resetForm() {
  form.value = buildForm();
}

function submitForm() {
  const { name, type, description } = form.value;

  // Las reglas del formulario garantizan que el tipo esté seleccionado en este punto.
  if (!type) return;

  emit('submit', { name, type, description });
}
</script>
