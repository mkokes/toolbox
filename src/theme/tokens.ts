// Brand tokens carried over from the original SCSS theme (css/modules/_base.scss).
// The antd theme, global.css and the styleguide page are all derived from these values.

export const colors = {
  green: '#B3D732',
  red: '#CE1446',
  type: '#EBEBEB',
  background: '#2B2A27',
} as const

// Button fill: the old bourbon `button(pill, $red)` mixin produced this gradient.
export const buttonGradient = {
  start: colors.red,
  end: '#AC031A',
  hoverStart: '#B9123F',
  hoverEnd: '#831020',
  active: '#951A33',
  highlight: '#E81E58',
  border: '#72243A',
} as const

export const fonts = {
  display: "'Lobster', cursive",
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const

// Rem scale used throughout the original layout.
export const space = {
  xxs: '0.25rem',
  xs: '0.5rem',
  md: '1rem',
  lg: '2rem',
  xl: '4rem',
} as const

export const fontSizes = {
  title: '2rem',
  body: '1rem',
  resultLabel: '1.25rem',
  callout: '1.5rem',
  resultValue: '2rem',
} as const

export const layout = {
  maxWidth: '25rem',
  width: '96%',
  buttonHeight: 48,
  buttonRadius: 16,
} as const

export type ColorName = keyof typeof colors

export const colorRoles: Record<ColorName, string> = {
  red: 'Primary: actions (buttons, sliders, focus) and section headings',
  green: 'Accent: site title, calculated results and links',
  type: 'Body text on the dark background',
  background: 'Page background',
}

/** Exposes the tokens as CSS custom properties so global.css stays in sync with this file. */
export const cssVars: Record<string, string> = {
  '--tb-green': colors.green,
  '--tb-red': colors.red,
  '--tb-type': colors.type,
  '--tb-bg': colors.background,
  '--tb-font-display': fonts.display,
  '--tb-font-body': fonts.body,
  '--tb-max-width': layout.maxWidth,
  '--tb-width': layout.width,
  '--tb-btn-start': buttonGradient.start,
  '--tb-btn-end': buttonGradient.end,
  '--tb-btn-hover-start': buttonGradient.hoverStart,
  '--tb-btn-hover-end': buttonGradient.hoverEnd,
  '--tb-btn-active': buttonGradient.active,
  '--tb-btn-highlight': buttonGradient.highlight,
  '--tb-btn-border': buttonGradient.border,
}
