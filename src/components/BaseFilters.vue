<template>
  <q-form ref="formRef" greedy @submit="submitSearch" @validation-error="showValidationAlert">
    <q-banner
      v-if="isValidationAlertVisible"
      dense
      rounded
      class="bg-red-1 text-negative q-mb-md"
      role="alert"
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      Completa los campos obligatorios antes de buscar.
    </q-banner>

    <div class="row q-col-gutter-md">
      <div v-for="field in fields" :key="field.key" class="col-12 col-sm-6 col-md-3">
        <q-select
          v-if="field.type === 'select'"
          v-model="values[field.key]"
          :options="field.options"
          :label="getFieldLabel(field)"
          :rules="getFieldRules(field)"
          :disable="loading"
          emit-value
          map-options
          clearable
          outlined
          dense
          hide-bottom-space
        />

        <q-input
          v-else
          v-model="values[field.key]"
          :type="field.type"
          :label="getFieldLabel(field)"
          :rules="getFieldRules(field)"
          :disable="loading"
          :stack-label="field.type === 'date'"
          clearable
          outlined
          dense
          hide-bottom-space
        />
      </div>
    </div>

    <div class="row justify-end q-gutter-sm q-mt-sm">
      <q-btn
        flat
        no-caps
        color="primary"
        icon="backspace"
        label="Limpiar"
        :disable="loading"
        @click="clearFilters"
      />
      <q-btn
        type="submit"
        unelevated
        no-caps
        color="primary"
        icon="search"
        label="Buscar"
        :loading="loading"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { QForm } from 'quasar';
import type { FilterField, FilterValue, FilterValues } from '@/types/filters';
import { isEmptyValue, required } from '@/utils/validation-rules';

const props = defineProps<{
  /** Configuración de los campos a renderizar. */
  fields: FilterField[];
  /** Deshabilita el formulario mientras el padre procesa una búsqueda. */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** Se emite al buscar, solo con los campos que contienen información. */
  search: [values: FilterValues];
  /** Se emite después de restablecer todos los campos. */
  clear: [];
}>();

const formRef = ref<QForm | null>(null);
const values = ref<Record<string, FilterValue | null>>({});
const isValidationAlertVisible = ref(false);

function buildInitialValues(): Record<string, FilterValue | null> {
  return Object.fromEntries(props.fields.map((field) => [field.key, field.defaultValue ?? null]));
}

function getFieldLabel(field: FilterField): string {
  return field.required ? `${field.label} *` : field.label;
}

function getFieldRules(field: FilterField) {
  return field.required ? [required()] : [];
}

function getFilledValues(): FilterValues {
  const filledValues: FilterValues = {};

  for (const [key, value] of Object.entries(values.value)) {
    if (value !== null && !isEmptyValue(value)) {
      filledValues[key] = typeof value === 'string' ? value.trim() : value;
    }
  }

  return filledValues;
}

function showValidationAlert() {
  isValidationAlertVisible.value = true;
}

function submitSearch() {
  isValidationAlertVisible.value = false;
  emit('search', getFilledValues());
}

function clearFilters() {
  values.value = buildInitialValues();
  isValidationAlertVisible.value = false;
  formRef.value?.resetValidation();
  emit('clear');
}

// Si el padre cambia la configuración de campos, el estado interno se reinicia.
watch(
  () => props.fields,
  () => {
    values.value = buildInitialValues();
  },
  { immediate: true },
);
</script>
