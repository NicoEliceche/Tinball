# Project Conventions

**Version 2.0.0**  
Onda Web — Equipo de Desarrollo  
Mayo 2026

> Convenciones obligatorias del proyecto. Basadas en el patrón de arquitectura de FinFlowApp.
> Aplica a toda la codebase bajo `src/`.

---

## Resumen de Reglas

| # | Regla | Impacto |
|---|-------|---------|
| 1 | [Arquitectura Feature-Based](#1-arquitectura-feature-based) | ALTO |
| 2 | [Estilos en ScreenStyled.ts](#2-estilos-en-screenstyledts) | ALTO |
| 3 | [Tokens y theme — source of truth visual](#3-tokens-y-theme--source-of-truth-visual) | ALTO |
| 4 | [Diseño Full Responsive](#4-diseño-full-responsive) | ALTO |
| 5 | [Almacenamiento seguro de claves y tokens](#5-almacenamiento-seguro-de-claves-y-tokens) | CRÍTICO |
| 6 | [Interceptor Axios — firma dinámica](#6-interceptor-axios--firma-dinámica) | ALTO |
| 7 | [Organización de tipos TypeScript](#7-organización-de-tipos-typescript) | ALTO |
| 8 | [Capa de servicios — HTTP fuera de contexts](#8-capa-de-servicios--http-fuera-de-contexts) | ALTO |

---

## 1. Arquitectura Feature-Based

Cada feature es un módulo autocontenido bajo `src/features/[feature]/` con sus propias `screens/`, `api/`, `store/`, `hooks/`, `types/` y `components/`. Se expone solo a través de un `index.ts` barrel.

`src/shared/` = primitivos usados en 2+ features. `src/core/` = infraestructura transversal (theme, navigation, store, api client).

```
src/
  core/
    theme/
      tokens.ts          ← design tokens crudos
      theme.ts           ← theme runtime
      ThemeProvider.tsx
      types.ts           ← declare module styled-components
    navigation/
    store/
    api/
  features/
    auth/
      index.ts           ← barrel público ← OBLIGATORIO
      screens/
        LoginScreen.tsx
        LoginScreenStyled.ts   ← par obligatorio de cada screen
      api/ hooks/ store/ types/ components/
    home/
      index.ts
      screens/
        HomeScreen.tsx
        HomeScreenStyled.ts
  shared/
    components/
    utils/
    hooks/
```

---

## 2. Estilos en ScreenStyled.ts

Toda `Screen.tsx` tiene su `ScreenStyled.ts` hermano. Naming: `LoginScreen.tsx` → `LoginScreenStyled.ts`.

- Interpolación: `${({ theme }) => theme.*}` (destructuring, no `props.theme`)
- Separar bloques con comentarios de sección: `// ── Sección ──`
- Prohibido: `style={{}}` inline y `styled.*` dentro de archivos `.tsx`

---

## 3. Tokens y theme — source of truth visual

**`tokens.ts`** define todos los valores primitivos. **`theme.ts`** los expone al ThemeProvider.

Claves del theme:
- `theme.color.*` — colores (primary, error, textSecondary, surface, gradientStart, etc.)
- `theme.spacing[N]` — espaciado numérico 1→16 en `rem` (1=0.25rem … 16=4rem)
- `theme.typography.size.*` — tamaños xs, sm, base, lg, xl, 2xl, 3xl, 4xl en `rem`
- `theme.typography.weight.*` — regular, medium, semibold, bold, extrabold
- `theme.radius.*` — sm, md, lg, xl, 2xl, full
- `theme.layout.*` — screenPaddingH, cardRadius, inputHeight, maxContentWidth
- `theme.breakpoints.*` — sm/md/lg/xl para media queries

---

## 4. Diseño Full Responsive

- Contenedores: `width: 100%` + `max-width: theme.layout.maxContentWidth`
- Media queries: siempre `theme.breakpoints.*`, nunca px hardcodeados
- Grids: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Imágenes: `width: 100%; height: auto`

---

## 5. Almacenamiento seguro de claves y tokens

**NUNCA** en `localStorage`. Comprometería todas las claves con un solo XSS.

- **Private keys RSA**: Web Crypto API con `extractable: false`, persistir como `CryptoKey` en IndexedDB — la clave privada nunca existe como string
- **Auth tokens**: httpOnly cookies seteadas por el backend + `withCredentials: true` en axios
- **Device IDs**: `sessionStorage` o cookie de sesión — nunca `localStorage`
- `localStorage` solo para preferencias UI sin impacto de seguridad

```ts
// ❌ Problema actual — cryptoWeb.ts
localStorage.setItem('private_key', this.privateKey);
localStorage.getItem("authToken");

// ✅ Correcto
const keypair = await crypto.subtle.generateKey(
  { name: 'RSA-PSS', ... },
  false,   // extractable: false — la clave privada no puede ser exportada
  ['sign', 'verify'],
);
// persistir keypair (CryptoKey object) en IndexedDB
```

---

## 6. Interceptor Axios — firma dinámica

Todo request con `x-authorization` lleva firma dinámica. La firma cubre `device_id:timestamp:path:method:nonce`.

```
Headers requeridos:
  signature:           <RSA-PSS SHA-256 sobre el message>
  signature-timestamp: <Unix seconds>
  signature-nonce:     <32 bytes hex aleatorios por request>
  x-device-id:         <device id>
```

- Firma estática (solo `{ device_id }`) es vulnerable a replay attacks
- El response interceptor descifra respuestas AES-GCM híbrido
- 412 → registrar device y reintentar
- 401 → `window.location.replace('/')` (sin history entry)

---

## 7. Organización de tipos TypeScript

Las interfaces y tipos se ubican según su alcance. **Nunca** se definen tipos de dominio dentro de un screen, componente o context file.

| Tipo | Dónde va |
|------|----------|
| Dominio global (user, branch, transaction…) | `src/core/types/[dominio].types.ts` |
| Dominio exclusivo de una feature | `src/features/[feature]/types/[feature].types.ts` |
| Utility compartida (2+ features) | `src/shared/types/common.types.ts` |
| Props de componente pequeñas (privadas) | Inline en el componente |
| Tipos internos de styled-components | En el mismo `ScreenStyled.ts` |

**Archivos de tipos actuales del proyecto:**
- `core/types/user.types.ts` — `UserRole`, `UserData`, `Commerce`, `Data`
- `core/types/branch.types.ts` — `Branch`, `Checkout`, `CreateCheckoutRequest`
- `core/types/collaborator.types.ts` — `Collaborator`, `UpdateCollaboratorBody`, `CollaboratorRequest`
- `core/types/transaction.types.ts` — `Transaction`, `TransactionData`
- `core/types/benefits.types.ts` — `BenefitsData`, `PromotionsData`, `PromotionsAndBenefits`
- `shared/types/common.types.ts` — `SelectOption<T>` (genérico, reemplaza `OptionType`/`IOption`/`Option`)

```ts
// ❌ Problema — tipos de dominio en context
// core/context/baseContext.tsx tenía 145 líneas de interfaces puras

// ✅ Correcto — baseContext.tsx como barrel de re-exports
export * from '@core/types/user.types';
export * from '@core/types/branch.types';
export * from '@core/types/collaborator.types';
export * from '@core/types/transaction.types';
```

```ts
// ❌ Problema — OptionType duplicada en dos screens
interface OptionType { value: string; label: string; } // en screen A y B

// ✅ Correcto — tipo genérico compartido
import type { SelectOption } from '@shared/types/common.types';
type OptionType = SelectOption<string>; // screen IIBB
type IOption    = SelectOption<number>; // ColaboradorScreen
```

**Reglas:**
- Context files contienen solo código React (createContext, Provider, hooks) — nunca interfaces de dominio
- Si el mismo tipo existe en 2+ lugares, extraer a `shared/types/` o `core/types/`
- Nunca dos interfaces con el mismo nombre en el mismo archivo (TypeScript las mergea silenciosamente)

---

## 8. Capa de servicios — HTTP fuera de contexts

Las llamadas HTTP (`client.get/post/put/delete`) van en archivos de servicio dedicados, no en contexts ni componentes.

```
src/core/data/
  client/
    AxiosClient.ts           ← instancia axios + interceptors
  services/
    userService.ts
    branchService.ts
    collaboratorService.ts
    transactionService.ts
```

```ts
// ❌ Problema actual — HTTP mezclado con estado en branchesContext.tsx
const getBranches = async () => {
  const response = await client.get(`/business/branches?commerce_id=${id}`);
  setBranches(response.data);
};

// ✅ Correcto — servicio separado
// core/data/services/branchService.ts
export async function fetchBranches(commerceId: number): Promise<Branch[]> {
  const { data } = await client.get(`/business/branches?commerce_id=${commerceId}`);
  return data;
}

// core/context/branchesContext.tsx
import { fetchBranches } from '@core/data/services/branchService';
const getBranches = async () => setBranches(await fetchBranches(commerce!.commerce_id));
```

**Redux vs Context:** el patrón de Context es válido con capa de servicio. Si el proyecto escala → RTK Query (no thunks manuales para data fetching). Components/screens nunca importan `client` ni servicios directamente — solo contextos o hooks.

