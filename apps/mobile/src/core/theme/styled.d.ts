import 'styled-components/native';
import type { TinballTheme } from './tokens';

declare module 'styled-components/native' {
  export interface DefaultTheme extends TinballTheme {}
}

