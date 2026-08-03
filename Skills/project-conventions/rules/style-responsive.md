---
title: Diseño Full Responsive — unidades relativas y breakpoints del theme
impact: HIGH
impactDescription: Layouts adaptativos en cualquier viewport. Sin anchos o tamaños fijos en contenedores. Breakpoints centralizados en theme.breakpoints.
tags: responsive, breakpoints, fluid-layout, media-queries, rem
---

## Diseño Full Responsive

Todos los componentes y pantallas deben adaptarse a cualquier viewport. Se usan unidades relativas (`rem`, `%`) y los breakpoints se extraen siempre de `theme.breakpoints.*` — nunca valores px hardcodeados en media queries.

Los valores de espaciado y tipografía ya son responsive porque vienen de `theme.spacing[N]` y `theme.typography.size.*` (definidos en `rem` en `tokens.ts`).

---

**Breakpoints (definidos en `tokens.ts`, consumidos vía `theme.breakpoints.*`):**

```ts
breakpoints: {
  sm:  '480px',   // mobile small
  md:  '768px',   // tablet
  lg:  '1024px',  // desktop
  xl:  '1280px',  // wide
}
```

---

**Incorrecto (anchos fijos, px hardcodeados en media queries):**

```ts
// ScreenStyled.ts ❌
export const Container = styled.div`
  width: 960px;              // ← ancho fijo, rompe en tablet/mobile
  padding: 32px;             // ← no usa theme.spacing
  font-size: 16px;           // ← no usa theme.typography

  @media (max-width: 768px) {   // ← breakpoint hardcodeado
    width: 100%;
    padding: 16px;
  }
`;
```

---

**Correcto (responsive con theme.breakpoints y spacing del theme):**

```ts
// ScreenStyled.ts ✅
export const PageContainer = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxContentWidth};
  padding: 0 ${({ theme }) => theme.layout.screenPaddingH};
  margin: 0 auto;
`;

export const ContentSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
  padding: ${({ theme }) => theme.spacing[8]} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.spacing[4]};
    padding: ${({ theme }) => theme.spacing[6]} 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: ${({ theme }) => theme.spacing[3]};
    padding: ${({ theme }) => theme.spacing[4]} 0;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

export const FormCard = styled.div`
  width: 100%;
  max-width: 480px;
  background-color: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ theme }) => theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    border-radius: ${({ theme }) => theme.radius.lg};
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

export const ScreenTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.size['2xl']};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.text};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.typography.size.xl};
  }
`;

export const ResponsiveImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radius.lg};
`;
```

---

**Reglas:**
- Contenedores principales: `width: 100%` + `max-width: theme.layout.maxContentWidth`
- Media queries: siempre `theme.breakpoints.*`, nunca px hardcodeados
- Espaciado: `theme.spacing[N]` — nunca px/rem literales
- Tipografía: `theme.typography.size.*` — escala con el sistema de tokens
- Imágenes: `width: 100%; height: auto` por defecto
- Columnas: `grid-template-columns: repeat(auto-fill, minmax(..., 1fr))` o `flex-wrap: wrap`
- No usar `overflow: hidden` sin verificar que no corta contenido en mobile

Reference: [MDN — Responsive design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
