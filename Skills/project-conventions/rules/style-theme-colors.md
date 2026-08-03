---
title: Todos los tokens visuales desde tokens.ts → theme.ts
impact: HIGH
impactDescription: Un solo source of truth para colores, tipografía, espaciado y layout. Ningún valor visual aparece hardcodeado en los styled-components.
tags: theme, tokens, colors, spacing, typography, design-tokens, styled-components
---

## Todos los tokens visuales desde tokens.ts → theme.ts

El sistema de diseño se define en dos archivos:

- **`tokens.ts`** — design tokens crudos: todos los valores primitivos de color, tipografía, espaciado, radio y layout.
- **`theme.ts`** — el theme runtime que extiende los tokens. Es el objeto que recibe styled-components vía `ThemeProvider`.

Todo color, tamaño de fuente, espaciado y radio se extrae de `theme.*` en las interpolaciones. **Cero valores hardcodeados.**

---

**Estructura de `tokens.ts` (fuente de todos los valores):**

```ts
// core/theme/tokens.ts ✅
export const tokens = {
  color: {
    // ── Brand (definir según la identidad del proyecto) ───────────────────────
    primary:       '<your-primary>',
    primaryLight:  '<your-primary-light>',
    primaryDark:   '<your-primary-dark>',
    primaryFaded:  '<your-primary-faded>',
    accent:        '<your-accent>',
    accentLight:   '<your-accent-light>',
    accentDark:    '<your-accent-dark>',

    // ── Semánticos (estados del sistema) ─────────────────────────────────────
    success:       '<your-success>',
    successLight:  '<your-success-light>',
    error:         '<your-error>',
    errorLight:    '<your-error-light>',
    warning:       '<your-warning>',
    warningLight:  '<your-warning-light>',
    info:          '<your-info>',
    infoLight:     '<your-info-light>',

    // ── Neutros (escala de grises) ────────────────────────────────────────────
    neutral: {
      0:   '<lightest>',
      50:  '<neutral-50>',
      100: '<neutral-100>',
      200: '<neutral-200>',
      300: '<neutral-300>',
      400: '<neutral-400>',
      500: '<neutral-500>',
      600: '<neutral-600>',
      700: '<neutral-700>',
      800: '<neutral-800>',
      900: '<darkest>',
    },

    // ── Superficie y fondo ────────────────────────────────────────────────────
    background:    '<your-page-background>',
    surface:       '<your-card-surface>',
    overlay:       '<your-modal-overlay>',
    border:        '<your-border>',
    borderFocus:   '<your-border-focus>',

    // ── Gradientes ────────────────────────────────────────────────────────────
    gradientStart: '<your-gradient-start>',
    gradientMid:   '<your-gradient-mid>',
    gradientEnd:   '<your-gradient-end>',

    // ── Texto ─────────────────────────────────────────────────────────────────
    text:          '<your-text-primary>',
    textSecondary: '<your-text-secondary>',
    textTertiary:  '<your-text-tertiary>',
    textDisabled:  '<your-text-disabled>',
    textInverse:   '<your-text-on-dark>',
    textLink:      '<your-link-color>',
  },

  typography: {
    size: {
      xs:    '0.6875rem',  // 11px
      sm:    '0.8125rem',  // 13px
      base:  '1rem',       // 16px
      lg:    '1.125rem',   // 18px
      xl:    '1.25rem',    // 20px
      '2xl': '1.5rem',     // 24px
      '3xl': '1.875rem',   // 30px
      '4xl': '2.25rem',    // 36px
    },
    weight: {
      regular:   '400',
      medium:    '500',
      semibold:  '600',
      bold:      '700',
      extrabold: '800',
    },
    lineHeight: {
      tight:  1.2,
      snug:   1.375,
      normal: 1.5,
    },
  },

  radius: {
    sm:    '6px',
    md:    '10px',
    lg:    '14px',
    xl:    '20px',
    '2xl': '28px',
    full:  '9999px',
  },

  spacing: {
    1:  '0.25rem',   // 4px
    2:  '0.5rem',    // 8px
    3:  '0.75rem',   // 12px
    4:  '1rem',      // 16px
    5:  '1.25rem',   // 20px
    6:  '1.5rem',    // 24px
    8:  '2rem',      // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
  },

  layout: {
    screenPaddingH:  '1.25rem',
    cardRadius:      '1.5rem',
    inputHeight:     '3.25rem',
    buttonHeight:    '3.25rem',
    maxContentWidth: '80rem',
  },

  breakpoints: {
    sm:  '480px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1280px',
  },
} as const;

export type Tokens = typeof tokens;
```

---

**`theme.ts` — runtime, recibido por ThemeProvider:**

```ts
// core/theme/theme.ts ✅
import { tokens } from './tokens';

export const theme = {
  color:       tokens.color,
  radius:      tokens.radius,
  typography:  tokens.typography,
  spacing:     tokens.spacing,
  layout:      tokens.layout,
  breakpoints: tokens.breakpoints,
} as const;

export type Theme = typeof theme;
```

```ts
// core/theme/types.ts ✅ — typed-components typings
import type { Theme } from './theme';

declare module 'styled-components' {
  interface DefaultTheme extends Theme {}
}
```

---

**Uso en styled-components:**

```ts
// ✅ Correcto — todo desde el theme, interpolación con destructuring
export const Card = styled.div`
  background-color: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.size['2xl']};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.text};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

export const ErrorBanner = styled.div`
  background-color: ${({ theme }) => theme.color.errorLight};
  border-left: 3px solid ${({ theme }) => theme.color.error};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
`;
```

```ts
// ❌ Incorrecto — valores hardcodeados
export const Card = styled.div`
  background-color: #ffffff;   // ← hardcodeado
  border-radius: 20px;         // ← hardcodeado
  padding: 24px 20px;          // ← hardcodeado
  font-size: 16px;             // ← hardcodeado
  color: #333333;              // ← hardcodeado
`;
```

---

**Reglas:**
- Todo token nuevo se agrega primero en `tokens.ts`, luego se usa vía `theme.*`
- Interpolación: `${({ theme }) => theme.*}` — no `${(props) => props.theme.*}`
- Prohibido: colores hex/rgb/hsl hardcodeados en styled-components
- Prohibido: valores de font-size, padding, margin, gap hardcodeados
- Claves: `theme.color.*` | `theme.spacing[N]` | `theme.typography.size.*` | `theme.typography.weight.*` | `theme.radius.*` | `theme.layout.*` | `theme.breakpoints.*`

Reference: [styled-components — Theming](https://styled-components.com/docs/advanced#theming)
