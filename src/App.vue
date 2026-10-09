<template>
  <router-view />
</template>

<script setup lang="ts">
import { useGlobalErrorNotifier } from '@/composables/useGlobalErrorNotifier';

useGlobalErrorNotifier();
</script>
