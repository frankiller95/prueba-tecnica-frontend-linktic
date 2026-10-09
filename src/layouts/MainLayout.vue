<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Métodos de pago</q-toolbar-title>

        <span class="gt-xs q-mr-md">{{ authStore.user?.name }}</span>

        <q-btn
          flat
          no-caps
          icon="logout"
          label="Cerrar sesión"
          :loading="authStore.loading"
          @click="closeSession"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/router/routes';
import { useAuthStore } from '@/stores/auth-store';

const router = useRouter();
const authStore = useAuthStore();

async function closeSession() {
  await authStore.logout();
  await router.replace({ name: ROUTE_NAMES.login });
}
</script>
