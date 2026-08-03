const dateFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const shortDateFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' });
const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMatchDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatShortDate(value: string): string {
  return shortDateFormatter.format(new Date(value));
}

export function formatMoney(minor: number, currency = 'ARS'): string {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(minor / 100);
}

export const positionLabels = {
  GOALKEEPER: 'Arquero', DEFENDER: 'Defensor', FULLBACK: 'Lateral', MIDFIELDER: 'Volante', WINGER: 'Extremo', FORWARD: 'Delantero',
} as const;

export const formatLabels = {
  FIVE_A_SIDE: 'Fútbol 5', SEVEN_A_SIDE: 'Fútbol 7', EIGHT_A_SIDE: 'Fútbol 8', ELEVEN_A_SIDE: 'Fútbol 11',
} as const;

export const skillLabels = {
  BEGINNER: 'Inicial', RECREATIONAL: 'Recreativo', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado', COMPETITIVE: 'Competitivo',
} as const;

