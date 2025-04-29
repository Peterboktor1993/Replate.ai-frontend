/**
 * Theme utility to provide consistent access to theme colors across the application
 */

// Primary color palettes
export const primaryColors = {
  main: "var(--primary-color)",
  light: "var(--primary-light)",
  lighter: "var(--primary-lighter)",
  dark: "var(--primary-dark)",
  darker: "var(--primary-darker)",
};

// Secondary color palettes
export const secondaryColors = {
  main: "var(--secondary-color)",
  light: "var(--secondary-light)",
  lighter: "var(--secondary-lighter)",
  dark: "var(--secondary-dark)",
  darker: "var(--secondary-darker)",
};

// Neutral color palette
export const neutralColors = {
  50: "var(--neutral-50)",
  100: "var(--neutral-100)",
  200: "var(--neutral-200)",
  300: "var(--neutral-300)",
  400: "var(--neutral-400)",
  500: "var(--neutral-500)",
  600: "var(--neutral-600)",
  700: "var(--neutral-700)",
  800: "var(--neutral-800)",
  900: "var(--neutral-900)",
};

// Semantic color palettes
export const successColors = {
  main: "var(--success-color)",
  light: "var(--success-light)",
  dark: "var(--success-dark)",
};

export const warningColors = {
  main: "var(--warning-color)",
  light: "var(--warning-light)",
  dark: "var(--warning-dark)",
};

export const dangerColors = {
  main: "var(--danger-color)",
  light: "var(--danger-light)",
  dark: "var(--danger-dark)",
};

// Text color palettes
export const textColors = {
  primary: "var(--text-primary)",
  secondary: "var(--text-secondary)",
  light: "var(--text-light)",
  muted: "var(--text-muted)",
};

// Border colors
export const borderColors = {
  main: "var(--border-color)",
  light: "var(--border-color-light)",
  dark: "var(--border-color-dark)",
};

// Background colors
export const bgColors = {
  body: "var(--bg-body)",
  light: "var(--bg-light)",
  lighter: "var(--bg-lighter)",
};

// Shadow values
export const shadows = {
  sm: "var(--shadow-sm)",
  default: "var(--shadow)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
};

// All colors combined
export const theme = {
  primary: primaryColors,
  secondary: secondaryColors,
  neutral: neutralColors,
  success: successColors,
  warning: warningColors,
  danger: dangerColors,
  text: textColors,
  border: borderColors,
  bg: bgColors,
  shadows,
};

/**
 * Gets a color from the theme using dot notation
 * Example: getThemeColor('primary.light')
 */
export const getThemeColor = (path) => {
  const parts = path.split(".");
  let result = theme;

  for (const part of parts) {
    if (result && result[part]) {
      result = result[part];
    } else {
      return null;
    }
  }

  return result;
};

export default theme;
