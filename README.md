# Prueba técnica — Desarrollador Frontend

Aplicación para la **gestión de métodos de pago**, construida con **Vue 3**, **Pinia** y **Quasar Framework**. Incluye inicio de sesión, protección de rutas, listado con filtros, creación, edición, cambio de estado y eliminación de registros.

No utiliza un backend real: todas las llamadas a la API están simuladas con datos mockeados, manteniendo la misma arquitectura que tendría con una API de producción.

## Tabla de contenido

1. [Requisitos previos](#1-requisitos-previos)
2. [Instalación y ejecución](#2-instalación-y-ejecución)
3. [Credenciales de acceso](#3-credenciales-de-acceso)
4. [Funcionalidades](#4-funcionalidades)
5. [Arquitectura del proyecto](#5-arquitectura-del-proyecto)
6. [Supuestos sobre las estructuras de datos y el tipado](#6-supuestos-sobre-las-estructuras-de-datos-y-el-tipado)
7. [Simulación del backend](#7-simulación-del-backend)
8. [Componente de filtros reutilizable](#8-componente-de-filtros-reutilizable)
9. [Dependencias](#9-dependencias)

## 1. Requisitos previos

| Herramienta | Versión                           |
| ----------- | --------------------------------- |
| Node.js     | 22.12 o superior (probado con 24) |
| npm         | 10 o superior                     |
| Git         | Cualquier versión reciente        |

No es necesario instalar Quasar CLI de forma global: los comandos usan la versión incluida en el proyecto.

## 2. Instalación y ejecución

**Paso 1.** Clonar el repositorio y entrar a la carpeta del proyecto:

```bash
git clone <url-del-repositorio>
cd prueba-linktic
```

**Paso 2.** Cambiar a la rama de la prueba:

```bash
git checkout feature/prueba-tecnica
```

**Paso 3.** Instalar las dependencias:

```bash
npm install
```

**Paso 4.** Levantar el entorno local:

```bash
npm run dev
```

La aplicación se abre automáticamente en el navegador, en `http://localhost:9000`. Si el puerto está ocupado, Quasar elige el siguiente disponible y lo muestra en la terminal.

### Otros comandos

| Comando              | Descripción                                          |
| -------------------- | ---------------------------------------------------- |
| `npm run build`      | Genera la versión de producción en `dist/spa`.       |
| `npm run typecheck`  | Verifica los tipos de TypeScript con `vue-tsc`.      |
| `npm run lint:check` | Revisa el formato (Prettier) y las reglas de ESLint. |
| `npm run lint`       | Corrige automáticamente formato y reglas de ESLint.  |

## 3. Credenciales de acceso

El usuario y la contraseña son fijos y están definidos en el mock.

| Campo      | Valor               |
| ---------- | ------------------- |
| Correo     | `admin@linktic.com` |
| Contraseña | `Secret123!`        |

Para facilitar la revisión, el formulario de inicio de sesión aparece precargado con estas credenciales.

## 4. Funcionalidades

**Autenticación y seguridad**

- La aplicación inicia siempre en la pantalla de inicio de sesión.
- Las rutas protegidas redirigen al login cuando no hay una sesión activa. Después de ingresar, el usuario vuelve a la ruta que intentaba abrir.
- Un usuario con sesión activa no puede volver a la pantalla de login.
- El botón **Cerrar sesión** está siempre visible en el encabezado; destruye la sesión y redirige al login.

**Listado de métodos de pago**

- Tabla con Nombre, Tipo, Estado y Fecha de creación, con ordenamiento y paginación.
- Filtros por nombre, tipo, estado y rango de fechas de creación.
- Interruptor para activar o desactivar un método de pago; el cambio se refleja de inmediato.
- En pantallas pequeñas, cada registro se muestra como una tarjeta.

**Creación, edición y eliminación**

- Un único formulario para crear y editar. En edición aparece precargado con los datos del registro.
- Validación de campos obligatorios (Nombre y Tipo).
- La eliminación solicita una confirmación explícita antes de borrar.

## 5. Arquitectura del proyecto

```
src/
├── components/     Componentes reutilizables (filtros, tabla y formulario)
├── composables/    Lógica compartida de la interfaz (notificador global de errores)
├── constants/      Etiquetas y configuración del módulo de métodos de pago
├── layouts/        Plantillas de página (autenticación y principal)
├── pages/          Vistas asociadas a rutas (login, listado y 404)
├── router/         Definición de rutas y guard de navegación
├── services/       mockApi.ts: único punto de simulación del backend
├── stores/         Stores de Pinia (sesión, métodos de pago e interfaz)
├── types/          Modelos y contratos de TypeScript
└── utils/          Funciones puras (reglas de validación y formato de fechas)
```

### Flujo de datos

```
Vista (página o componente)  →  Action del store  →  mockApi.ts
            ▲                          │
            └──── estado reactivo ─────┘
```

- **Las vistas no llaman al mock.** Solo invocan actions del store y leen su estado.
- **Los stores son los únicos que ejecutan las llamadas asíncronas**, reciben la respuesta simulada y actualizan el estado global.
- **Los componentes de presentación no conocen el store.** La tabla, el formulario y los filtros reciben datos por `props` y notifican por eventos; solo la página se comunica con el store.

### Manejo de errores

Las vistas no gestionan fallos. Cuando una operación simulada falla:

1. La action del store captura el error y lo reporta en `ui-store`.
2. El composable `useGlobalErrorNotifier`, montado una única vez en `App.vue`, lo muestra como una notificación global.
3. La action devuelve `false`, y la vista solo usa ese resultado para decisiones de interfaz, por ejemplo mantener abierto el formulario para reintentar.

## 6. Supuestos sobre las estructuras de datos y el tipado

El enunciado no define el modelo de negocio, por lo que se adoptaron los siguientes supuestos. Los tipos están en `src/types/`.

### Método de pago

```ts
type PaymentMethodType = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'digital_wallet';

type PaymentMethodStatus = 'active' | 'inactive';

interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  description?: string;
  status: PaymentMethodStatus;
  createdAt: string;
}
```

| Campo         | Supuesto                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | Identificador único en texto, generado por el servidor (en el mock, un UUID). El cliente nunca lo define.                       |
| `name`        | Obligatorio, máximo 60 caracteres. Se guarda sin espacios al inicio ni al final. No se valida que sea único.                    |
| `type`        | Obligatorio. Lista cerrada de cinco valores, tipada como unión de literales para que el compilador rechace valores no válidos.  |
| `description` | Opcional, máximo 200 caracteres. Si llega vacía, la propiedad se omite del registro.                                            |
| `status`      | Unión `'active' \| 'inactive'` en lugar de un booleano, para admitir nuevos estados a futuro sin cambiar el contrato.           |
| `createdAt`   | Fecha y hora en formato ISO 8601 (UTC), asignada por el servidor al crear. No es editable y en la interfaz se ve en hora local. |

Otros supuestos del modelo:

- **Todo método de pago nuevo se crea en estado activo.** El estado no se pide en el formulario; se cambia desde el interruptor de la tabla.
- **Editar no modifica el estado ni la fecha de creación.** Por eso existe el tipo `PaymentMethodPayload`, que solo contiene los campos editables (`name`, `type` y `description`) y se usa tanto al crear como al editar.
- **Los valores del modelo están en inglés y las etiquetas visibles en español.** La traducción está centralizada en `src/constants/payment-methods.ts`.
- **La eliminación es definitiva** (no hay borrado lógico).

### Filtros del listado

```ts
interface PaymentMethodFilters {
  name?: string;
  type?: PaymentMethodType;
  status?: PaymentMethodStatus;
  createdFrom?: string;
  createdTo?: string;
}
```

- Todos los filtros son opcionales y se combinan entre sí (condición "y").
- `name` busca por coincidencia parcial, sin distinguir mayúsculas de minúsculas.
- `createdFrom` y `createdTo` usan el formato `YYYY-MM-DD`, son inclusivos y se comparan con la fecha local del registro, la misma que el usuario ve en la tabla.
- El filtrado lo resuelve el mock, como lo haría una API real, y no la vista.

### Autenticación

```ts
interface Credentials {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthSession {
  token: string;
  user: AuthUser;
}
```

- El inicio de sesión devuelve un token y los datos del usuario. El token es ficticio y no se valida ni expira.
- La sesión se guarda en `localStorage`, de modo que recargar la página no la cierra.
- Existe un único usuario, sin roles ni permisos.

### Respuestas y errores de la API

- Cada operación devuelve una promesa que resuelve con los datos o rechaza con un `ApiError` (mensaje y código de estado HTTP).
- Crear y editar devuelven el registro completo, y el store lo usa para actualizar la lista sin volver a consultarla.

## 7. Simulación del backend

Todo el mock está en un único archivo: `src/services/mockApi.ts`. Contiene los datos iniciales, las credenciales, la latencia y la simulación de fallos. Expone el mismo contrato que tendría un cliente HTTP real, por lo que conectar una API verdadera solo exigiría reescribir ese archivo.

Las actions de los stores son el único lugar desde el que se invoca el mock. Se mantuvo en un archivo aparte, y no escrito dentro de cada action, para cumplir a la vez dos requisitos del enunciado: que el store realice la llamada asíncrona como en producción y que la simulación resida en un único punto.

- **Los datos viven en memoria.** Al recargar la página, el listado vuelve a los seis registros iniciales.
- **Cada petición tarda 600 ms**, para que los estados de carga sean visibles.

### Cómo probar el manejo de errores

Por defecto ninguna petición falla, salvo el inicio de sesión con credenciales incorrectas. Para simular errores del servidor, cambia `failureRate` en `src/services/mockApi.ts`:

```ts
export const mockConfig = {
  latencyMs: 600,
  failureRate: 0.3, // 30 % de las peticiones fallan
};
```

El valor va de `0` (nunca falla) a `1` (siempre falla). Con fallos activos se puede comprobar que:

- Aparece una notificación de error global.
- El interruptor de estado vuelve a su posición original.
- El formulario permanece abierto con los datos ingresados para reintentar.

## 8. Componente de filtros reutilizable

`src/components/BaseFilters.vue` es genérico: no conoce el módulo de métodos de pago y se configura por completo desde fuera.

**Entrada (`props`)**

| Prop      | Tipo            | Descripción                                                |
| --------- | --------------- | ---------------------------------------------------------- |
| `fields`  | `FilterField[]` | Lista de campos a renderizar.                              |
| `loading` | `boolean`       | Deshabilita el formulario mientras se procesa la búsqueda. |

Cada campo se describe con `key`, `label`, `type` (`'text'`, `'select'` o `'date'`), y de forma opcional `required`, `defaultValue` y `options` (solo para `'select'`).

**Salida (eventos)**

| Evento   | Datos          | Descripción                                                          |
| -------- | -------------- | -------------------------------------------------------------------- |
| `search` | `FilterValues` | Se emite al buscar, solo con los campos que contienen información.   |
| `clear`  | Ninguno        | Se emite después de restablecer todos los campos a su valor inicial. |

Si hay campos marcados como obligatorios y están vacíos, el componente muestra una alerta, resalta los campos y no emite `search`.

**Ejemplo de uso**

```vue
<BaseFilters :fields="fields" :loading="loading" @search="onSearch" @clear="onClear" />
```

```ts
const fields: FilterField[] = [
  { key: 'name', label: 'Nombre', type: 'text', required: true },
  { key: 'status', label: 'Estado', type: 'select', options: statusOptions },
  { key: 'createdFrom', label: 'Creado desde', type: 'date' },
];
```

En el listado de métodos de pago ningún filtro es obligatorio; la validación se puede comprobar agregando `required: true` a cualquier campo en `src/constants/payment-methods.ts`.

## 9. Dependencias

No se instaló ninguna librería adicional a las que incluye el proyecto base de Quasar con Pinia.

| Necesidad                     | Solución utilizada                                     |
| ----------------------------- | ------------------------------------------------------ |
| Componentes de interfaz       | Quasar (`QTable`, `QForm`, `QDialog`, `QToggle`, etc.) |
| Validación de formularios     | Prop `rules` de Quasar con funciones propias           |
| Notificaciones y confirmación | Plugins `Notify` y `Dialog` de Quasar                  |
| Manejo de estado              | Pinia                                                  |
| Formato de fechas             | API nativa `Intl.DateTimeFormat`                       |
