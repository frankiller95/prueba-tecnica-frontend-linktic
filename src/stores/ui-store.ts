import { ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';

const UNEXPECTED_ERROR_MESSAGE = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

/** Estado global de la interfaz: canal único por el que los stores reportan errores. */
export const useUiStore = defineStore('ui', () => {
  const errorMessage = ref<string | null>(null);

  function notifyError(error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : UNEXPECTED_ERROR_MESSAGE;
  }

  function clearError() {
    errorMessage.value = null;
  }

  return { errorMessage, notifyError, clearError };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUiStore, import.meta.hot));
}
