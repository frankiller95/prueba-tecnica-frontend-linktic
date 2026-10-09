<template>
  <q-page padding class="row justify-center items-center">
    <div class="col-12 col-sm-8 col-md-5 col-lg-4">
      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <div class="text-h5 text-weight-medium">Iniciar sesión</div>
          <div class="text-subtitle2 text-grey-7">Gestión de métodos de pago</div>
        </q-card-section>

        <q-form greedy @submit="submitLogin">
          <q-card-section class="q-gutter-y-sm">
            <q-input
              v-model="credentials.email"
              type="email"
              label="Correo electrónico"
              autocomplete="username"
              outlined
              lazy-rules
              :rules="emailRules"
              :disable="authStore.loading"
            >
              <template #prepend>
                <q-icon name="mail" />
              </template>
            </q-input>

            <q-input
              v-model="credentials.password"
              :type="isPasswordVisible ? 'text' : 'password'"
              label="Contraseña"
              autocomplete="current-password"
              outlined
              lazy-rules
              :rules="passwordRules"
              :disable="authStore.loading"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="isPasswordVisible ? 'visibility_off' : 'visibility'"
                  :aria-label="isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="isPasswordVisible = !isPasswordVisible"
                />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions class="q-px-md q-pb-md">
            <q-btn
              type="submit"
              color="primary"
              label="Ingresar"
              class="full-width"
              unelevated
              no-caps
              :loading="authStore.loading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/router/routes';
import { useAuthStore } from '@/stores/auth-store';
import type { Credentials } from '@/types/auth';
import { email, required } from '@/utils/validation-rules';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// El formulario inicia precargado con las credenciales de demostración del mock.
const credentials = reactive<Credentials>(authStore.getDemoCredentials());
const isPasswordVisible = ref(false);

const emailRules = [required('Ingresa tu correo electrónico.'), email()];
const passwordRules = [required('Ingresa tu contraseña.')];

/** Solo se aceptan rutas internas para evitar redirecciones a sitios externos. */
function getRedirectTarget() {
  const { redirect } = route.query;
  const isInternalPath =
    typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//');

  return isInternalPath ? redirect : { name: ROUTE_NAMES.paymentMethods };
}

async function submitLogin() {
  const isLoggedIn = await authStore.login(credentials);

  if (isLoggedIn) {
    await router.replace(getRedirectTarget());
  }
}
</script>
