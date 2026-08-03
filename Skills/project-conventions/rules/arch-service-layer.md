---
title: Capa de servicios — las llamadas API nunca van en contexts ni components
impact: HIGH
impactDescription: Mezclar llamadas HTTP con lógica de estado React (Context/Redux) acopla transporte con UI. Imposibilita testear la lógica de negocio sin renderizar componentes.
tags: architecture, services, api, context, redux, rtk-query, separation-of-concerns, http
---

## Capa de servicios — separar HTTP del estado

Las llamadas HTTP (`client.get`, `client.post`, etc.) van en archivos de **servicio** dedicados, no dentro de Context files ni componentes. Los contexts/stores consumen los servicios, no el cliente HTTP directamente.

---

### Ubicación

```
src/
  core/
    data/
      client/
        AxiosClient.ts       ← instancia axios + interceptors (ya existe)
      services/
        userService.ts       ← llamadas HTTP de user/auth
        branchService.ts     ← llamadas HTTP de branches/checkouts
        collaboratorService.ts
        transactionService.ts
        certificateService.ts

  features/
    [feature]/
      api/
        [feature]Api.ts      ← si la lógica es exclusiva de esa feature
```

---

**Incorrecto — llamada HTTP dentro del context (problema actual):**

```ts
// core/context/branchesContext.tsx ❌
const getBranches = async () => {
  const url = `/business/branches?commerce_id=${commerce?.commerce_id}`;
  const response = await client.get(url);   // ← HTTP mezclado con estado React
  setBranches(response.data);
};
```

**Correcto — servicio separado, context solo maneja estado:**

```ts
// core/data/services/branchService.ts ✅
import { client } from '@core/data/client/AxiosClient';
import type { Branch } from '@core/types/branch.types';

export async function fetchBranches(commerceId: number): Promise<Branch[]> {
  const { data } = await client.get(`/business/branches?commerce_id=${commerceId}`);
  return data;
}

export async function createBranch(commerceId: number, name: string): Promise<Branch> {
  const { data } = await client.post('/business/branches', { commerce_id: commerceId, branch_name: name });
  return data;
}
```

```ts
// core/context/branchesContext.tsx ✅
import { fetchBranches, createBranch } from '@core/data/services/branchService';

const getBranches = async () => {
  const branches = await fetchBranches(commerce!.commerce_id);
  setBranches(branches);
};
```

---

### Redux vs Context — cuándo usar cada uno

| Criterio | Context + Service | Redux Toolkit + RTK Query |
|----------|------------------|--------------------------|
| Estado local / por feature | ✅ preferido | sobredimensionado |
| Estado global (user, config) | aceptable | preferido |
| Caché, refetch, optimistic updates | manual y tedioso | ✅ RTK Query lo da gratis |
| Múltiples features leen el mismo dato | puede causar prop drilling | ✅ preferido |

**Para este proyecto:** el patrón actual de Context es válido mientras haya una capa de servicio que separe HTTP del estado. Si el proyecto escala, migrar a RTK Query. **No usar thunks manuales para data fetching** — RTK Query es la alternativa moderna.

---

**Reglas:**
- Todo `client.get/post/put/delete` va en un archivo de servicio en `core/data/services/` o `features/[feature]/api/`
- Los context files importan servicios, no el cliente axios directamente
- Los components/screens importan contextos o hooks — nunca servicios ni `client` directamente
- Un servicio devuelve datos tipados, nunca `AxiosResponse` cruda
- Los servicios son funciones puras async — sin estado, sin hooks, sin side effects
