---
title: Estilos en [ScreenName]Styled.ts — Par obligatorio de cada Screen
impact: HIGH
impactDescription: Cada screen tiene su archivo Styled hermano. Los styled-components de esa screen viven ahí, nunca dentro del archivo .tsx ni como estilos inline.
tags: styles, styled-components, separation-of-concerns, ScreenStyled
---

## Estilos en [ScreenName]Styled.ts

Cada pantalla (`Screen.tsx`) tiene un archivo hermano `ScreenStyled.ts` con todos sus `styled-components`. El archivo `.tsx` solo contiene JSX y lógica — ningún `styled.*` se define ahí.

El patrón de interpolación es `${({ theme }) => theme.*}` (destructuring directo del theme, no `props.theme`).

**Naming:** `LoginScreen.tsx` → `LoginScreenStyled.ts`, `HomeScreen.tsx` → `HomeScreenStyled.ts`

---

**Incorrecto (styled-components en el .tsx o estilos inline):**

```tsx
// LoginScreen.tsx ❌
import styled from 'styled-components';

const Wrapper = styled.div`       // ← styled-component en el .tsx
  padding: 24px;
  background: white;
`;

export function LoginScreen() {
  return (
    <Wrapper>
      <h1 style={{ color: 'blue', fontSize: 24 }}>   {/* ← style inline */}
        Bienvenido
      </h1>
    </Wrapper>
  );
}
```

---

**Correcto (patrón FinFlowApp):**

```ts
// LoginScreenStyled.ts ✅
import styled from 'styled-components';

// ── Sección header ──────────────────────────────────────────────────────────

export const BrandLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.textInverse};
  letter-spacing: 3px;
  text-transform: uppercase;
`;

export const HeadlineAccent = styled.h1`
  font-size: ${({ theme }) => theme.typography.size['4xl']};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.accent};
`;

// ── Sección formulario ──────────────────────────────────────────────────────

export const FormSection = styled.div`
  background-color: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.xl} ${({ theme }) => theme.radius.xl} 0 0;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
`;

// ── Banner de error ─────────────────────────────────────────────────────────

export const ApiErrorBanner = styled.div`
  background-color: ${({ theme }) => theme.color.errorLight};
  border-left: 3px solid ${({ theme }) => theme.color.error};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const ApiErrorText = styled.p`
  color: ${({ theme }) => theme.color.error};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;
```

```tsx
// LoginScreen.tsx ✅ — solo JSX e imports
import {
  BrandLabel,
  HeadlineAccent,
  FormSection,
  ApiErrorBanner,
  ApiErrorText,
} from './LoginScreenStyled';

export function LoginScreen() {
  return (
    <main>
      <BrandLabel>FinFlow</BrandLabel>
      <HeadlineAccent>Tu flujo</HeadlineAccent>
      <FormSection>
        {error && (
          <ApiErrorBanner>
            <ApiErrorText>{error}</ApiErrorText>
          </ApiErrorBanner>
        )}
      </FormSection>
    </main>
  );
}
```

---

**Reglas:**
- Naming: `[ScreenName]Styled.ts` — mismo nombre que el `.tsx` con sufijo `Styled`
- Separar bloques con comentarios de sección: `// ── Sección ──`
- No usar `style={{}}` en ningún elemento JSX
- No definir `styled.*` dentro de archivos `.tsx`
- Interpolación: `${({ theme }) => theme.*}` — no `${(props) => props.theme.*}`

Reference: [styled-components — Theming](https://styled-components.com/docs/advanced#theming)
