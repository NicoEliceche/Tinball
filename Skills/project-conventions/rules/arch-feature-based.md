---
title: Arquitectura Feature-Based — Cada feature es un módulo autocontenido
impact: HIGH
impactDescription: Cada feature agrupa todo lo que necesita (screens, styles, api, store, hooks, types) en su propia carpeta. Solo se expone vía barrel index.ts. Nada se dispersa en globales salvo primitivos genuinamente compartidos.
tags: architecture, feature-based, folder-structure, organization, self-contained, barrel
---

## Arquitectura Feature-Based

Cada feature es un **módulo autocontenido** que agrupa sus screens, estilos, api, store, hooks, types y componentes propios bajo `src/features/[feature]/`. Se comunica hacia afuera únicamente a través de un `index.ts` barrel que expone su API pública.

`src/shared/` es solo para primitivos genuinamente usados en múltiples features (componentes UI base, utils, hooks genéricos). `src/core/` es infraestructura transversal (theme, navigation, store raíz, api client).

---

**Estructura de referencia:**

```
src/
  core/                          ← infraestructura transversal
    theme/
      tokens.ts                  ← design tokens crudos
      theme.ts                   ← theme runtime
      ThemeProvider.tsx
      types.ts                   ← declare module styled-components
    navigation/
    store/
    api/

  features/
    auth/
      index.ts                   ← barrel: expone solo la API pública ← OBLIGATORIO
      api/
        authApi.ts
      components/                ← componentes exclusivos de auth
      hooks/
        useAuth.ts
      screens/
        LoginScreen.tsx
        LoginScreenStyled.ts     ← par obligatorio de cada screen
        ForgotPasswordScreen.tsx
        ForgotPasswordScreenStyled.ts
      store/
        authSlice.ts
        authThunks.ts
      types/
        auth.types.ts

    home/
      index.ts
      screens/
        HomeScreen.tsx
        HomeScreenStyled.ts      ← par obligatorio
      api/ components/ hooks/ store/ types/

    cobrar/
      index.ts
      screens/
        CobrarScreen.tsx
        CobrarScreenStyled.ts
      components/
        BranchSelect.tsx
      generarQR/
        screens/
          GenerarQRScreen.tsx
          GenerarQRScreenStyled.ts  ← par obligatorio

  shared/                        ← solo primitivos usados en 2+ features
    components/
      index.ts
      buttons/
      forms/
      layout/
    utils/
      responsive.ts
    hooks/
    types/
```

---

**Barrel `index.ts` — expone solo la API pública de la feature:**

```ts
// features/auth/index.ts ✅
export { LoginScreen } from './screens/LoginScreen';
export { useAuth } from './hooks/useAuth';
export { authReducer } from './store/authSlice';
export { authApi } from './api/authApi';
export type { LoginInput, AuthUser } from './types/auth.types';
```

```tsx
// Consumir desde navigation u otra feature ✅
import { LoginScreen } from '@features/auth';

// ❌ NUNCA importar rutas internas de otra feature directamente
// import { LoginScreen } from '@features/auth/screens/LoginScreen';
```

---

**Incorrecto — feature sin estructura propia (problema actual en onda-web):**

```tsx
// generarQR/page.tsx ❌
// Sin ScreenStyled.ts propio. Todo viene de Globals con props inline.
import { Page, Container, Column, Content, Text, SmallText } from "@/src/app/Globals";

return (
  <Column $alignItems='center' $gap='2rem'>        {/* gap hardcodeado */}
    <Content $width='70%' $gap='3rem'>             {/* width hardcodeado */}
      <SmallText $color='#ABABAB'>Sucursal</SmallText>   {/* color hardcodeado */}
    </Content>
  </Column>
);
```

**Correcto:**

```ts
// features/cobrar/generarQR/screens/GenerarQRScreenStyled.ts ✅
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const ContentBox = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
  }
`;

export const BranchLabel = styled.span`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;
```

---

**Reglas:**
- Toda `Screen.tsx` tiene su `ScreenStyled.ts` en la misma carpeta — sin excepción
- Toda feature tiene un `index.ts` barrel que expone su API pública
- No importar rutas internas de otras features, solo el barrel
- Subcomponentes exclusivos de una feature → `[feature]/components/`
- Utilidades usadas en una sola feature → dentro de esa feature, no en `shared/`

Reference: [Next.js App Router — Organizing your project](https://nextjs.org/docs/app/getting-started/project-structure)
