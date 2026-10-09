import type { RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /** La ruta solo es accesible con una sesión iniciada. */
    requiresAuth?: boolean;
    /** La ruta solo es accesible sin sesión (por ejemplo, el login). */
    guestOnly?: boolean;
  }
}

export const ROUTE_NAMES = {
  login: 'login',
  paymentMethods: 'payment-methods',
} as const;

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      {
        path: '',
        name: ROUTE_NAMES.login,
        component: () => import('@/pages/LoginPage.vue'),
      },
    ],
  },

  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: ROUTE_NAMES.paymentMethods,
        component: () => import('@/pages/PaymentMethodsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
