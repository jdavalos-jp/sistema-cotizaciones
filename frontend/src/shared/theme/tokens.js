/**
 * Design Tokens - Variables de diseño centralizado
 * Incluye espacios, tamaños, bordes, transiciones, etc.
 */

export const spacing = {
  xs: '4px',   // Extra pequeño
  sm: '8px',   // Pequeño
  md: '16px',  // Medio (base)
  lg: '24px',  // Grande
  xl: '32px',  // Extra large
  xxl: '48px', // Muy extra large
}

export const fontSize = {
  xs: '12px',  // Muy pequeño
  sm: '14px',  // Pequeño
  base: '16px', // Base (normal)
  md: '18px',  // Medio
  lg: '20px',  // Grande
  xl: '24px',  // Extra large
  xxl: '32px', // Muy extra large
  h1: '32px',  // Encabezado 1
  h2: '24px',  // Encabezado 2
  h3: '20px',  // Encabezado 3
  h4: '16px',  // Encabezado 4
}

export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
}

export const borderRadius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px', // Totalmente redondeado
}

export const transition = {
  fast: '0.15s ease-in-out',
  base: '0.3s ease-in-out',
  slow: '0.5s ease-in-out',
}

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
}

export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

export const breakpoints = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
}

export default {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  transition,
  shadows,
  zIndex,
  breakpoints,
}
