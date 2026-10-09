import { watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUiStore } from '@/stores/ui-store';

/** Muestra como notificación cualquier error que los stores reporten en el ui-store. */
export function useGlobalErrorNotifier() {
  const $q = useQuasar();
  const uiStore = useUiStore();

  watch(
    () => uiStore.errorMessage,
    (message) => {
      if (!message) return;

      $q.notify({ type: 'negative', message, position: 'top' });
      uiStore.clearError();
    },
  );
}
