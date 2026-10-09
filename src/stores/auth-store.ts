import { computed, ref } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { demoCredentials, mockApi } from '@/services/mockApi';
import { useUiStore } from '@/stores/ui-store';
import type { AuthSession, Credentials } from '@/types/auth';

const SESSION_STORAGE_KEY = 'prueba-linktic:session';

function readStoredSession(): AuthSession | null {
  try {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);

    return storedSession ? (JSON.parse(storedSession) as AuthSession) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export const useAuthStore = defineStore('auth', () => {
  const uiStore = useUiStore();

  const session = ref<AuthSession | null>(readStoredSession());
  const loading = ref(false);

  const isAuthenticated = computed(() => session.value !== null);
  const user = computed(() => session.value?.user ?? null);

  function setSession(newSession: AuthSession | null) {
    session.value = newSession;
    writeStoredSession(newSession);
  }

  /** Devuelve una copia de las credenciales de demostración definidas en el mock. */
  function getDemoCredentials(): Credentials {
    return { ...demoCredentials };
  }

  /** Inicia sesión y devuelve `true` si las credenciales fueron aceptadas. */
  async function login(credentials: Credentials): Promise<boolean> {
    loading.value = true;

    try {
      setSession(await mockApi.auth.login(credentials));
      return true;
    } catch (error) {
      uiStore.notifyError(error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /** Cierra la sesión local aunque el servidor no confirme el cierre. */
  async function logout(): Promise<void> {
    loading.value = true;

    try {
      await mockApi.auth.logout();
    } catch (error) {
      uiStore.notifyError(error);
    } finally {
      setSession(null);
      loading.value = false;
    }
  }

  return { session, loading, isAuthenticated, user, getDemoCredentials, login, logout };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
