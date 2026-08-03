---
title: Organización de tipos — nunca interfaces de dominio en screens ni contexts
impact: HIGH
impactDescription: Los tipos e interfaces mezclados en screens o context files rompen la separación de responsabilidades. Un tipo de dominio definido en una screen contamina el grafo de importaciones y duplica definiciones.
tags: architecture, types, interfaces, domain, feature-based, separation-of-concerns
---

## Organización de tipos TypeScript

Los tipos e interfaces se ubican según su alcance. **Nunca** se definen interfaces de dominio dentro de un screen, componente o context file.

---

### Tabla de ubicaciones

| Tipo | Dónde va | Ejemplo |
|------|----------|---------|
| Dominio global (user, branch, transaction…) | `src/core/types/[dominio].types.ts` | `user.types.ts`, `branch.types.ts` |
| Dominio exclusivo de una feature | `src/features/[feature]/types/[feature].types.ts` | `inicio.types.ts` |
| Utility compartida (2+ features) | `src/shared/types/common.types.ts` | `SelectOption<T>` |
| Props de componente (privadas) | Inline en el componente | `interface ISelect { ... }` |
| Tipos de styled-components | En el mismo `ScreenStyled.ts` | `interface Variables` |

---

### Archivos de tipos existentes en el proyecto

```
src/
  core/
    types/
      user.types.ts          ← UserRole, UserData, Commerce, Data
      branch.types.ts        ← Branch, Checkout, CreateCheckoutRequest
      collaborator.types.ts  ← Collaborator, UpdateCollaboratorBody, CollaboratorRequest
      transaction.types.ts   ← Transaction, TransactionData
      benefits.types.ts      ← BenefitsData, PromotionsData, PromotionsAndBenefits

  shared/
    types/
      common.types.ts        ← SelectOption<T>

  features/
    inicio/
      types/
        inicio.types.ts      ← DataMapNoAdmin
```

---

**Incorrecto — interface de dominio en un context file (problema original en baseContext.tsx):**

```ts
// core/context/baseContext.tsx ❌ — era un archivo con 145 líneas de tipos puros
export interface UserData { ... }
export interface Branch { ... }
export interface Branch { ... }  // ← duplicado
export interface Transaction { ... }
```

**Correcto — baseContext.tsx convertido a barrel de re-exports:**

```ts
// core/context/baseContext.tsx ✅
export * from '@core/types/user.types';
export * from '@core/types/branch.types';
export * from '@core/types/collaborator.types';
export * from '@core/types/transaction.types';
```

---

**Incorrecto — OptionType duplicada en 2 screens:**

```ts
// InscripcionesIIBBJurisdiccionScreen.tsx ❌
interface OptionType { value: string; label: string; }

// InscripcionesIIBBRegimenScreen.tsx ❌
interface OptionType { value: string; label: string; }  // copia exacta
```

**Correcto — tipo compartido genérico en shared/types:**

```ts
// shared/types/common.types.ts ✅
export interface SelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
}

// InscripcionesIIBBJurisdiccionScreen.tsx ✅
import type { SelectOption } from '@shared/types/common.types';
type OptionType = SelectOption<string>;

// ColaboradorScreen.tsx ✅
import type { SelectOption } from '@shared/types/common.types';
type IOption = SelectOption<number>;
```

---

**Incorrecto — tipos de dominio en benefitsContext.tsx:**

```ts
// core/context/benefitsContext.tsx ❌
export interface BenefitsData { ... }
export interface PromotionsData { ... }
export interface PromotionsAndBenefits { ... }

export const BenefitsContext = createContext<...>(...);  // mezclado con tipos
```

**Correcto — tipos extraídos, importados en el context:**

```ts
// core/types/benefits.types.ts ✅
export interface BenefitsData { ... }
export interface PromotionsData { ... }
export interface PromotionsAndBenefits { ... }

// core/context/benefitsContext.tsx ✅
import { BenefitsData, PromotionsData, PromotionsAndBenefits } from '@core/types/benefits.types';
export type { BenefitsData, PromotionsData, PromotionsAndBenefits }; // re-export compat
```

---

**Reglas:**
- Cada archivo `.types.ts` contiene tipos de un único dominio — no mezclar `User` con `Transaction`
- Si un tipo se usa en solo 1 feature, va en `features/[feature]/types/`
- Props de componente pequeñas (2–4 campos, usadas solo inline) pueden quedar en el componente
- Context files contienen solo código React (createContext, Provider, hooks) — nunca interfaces de dominio
- Nunca dos interfaces con el mismo nombre en el mismo archivo (TypeScript las mergea silenciosamente)
