// Every style value in the app is defined here, as antd design tokens.
// The antd theme, the app's CSS-in-JS styles, the styleguide and the PWA manifest all read from this file.
// Components get values from `theme.useToken()` / `useBrandToken()`; never hard-code colors or sizes elsewhere.
import type { ThemeConfig } from 'antd'

export type ThemeMode = 'light' | 'dark'
type Token = NonNullable<ThemeConfig['token']>

// Brand colors carried over from the original 2018 SCSS theme.
const green = '#B3D732'
const greenDark = '#5A7510' // the brand green darkened to stay readable on light backgrounds
const red = '#CE1446'
const redLight = '#EA3D6C' // the brand red lightened to stay readable on the dark background
const charcoal = '#2B2A27'
const offWhite = '#F7F6F2'
const nearBlack = '#151513' // the dark "tuner" page background

/** Tokens shared by both modes: type, shape, spacing and motion. */
export const baseToken: Token = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: 16,
  borderRadius: 8,
  borderRadiusLG: 16,
  lineWidth: 1,
  controlHeightLG: 48,
  // Text on primary buttons (also checked for contrast against colorPrimary)
  colorTextLightSolid: '#FFFFFF',
  // antd derives marginXXS…marginXXL and paddingXXS…paddingXL (4, 8, 12, 16, 20, 24, 32, 48) from these.
  sizeUnit: 4,
  sizeStep: 4,
  motionDurationMid: '0.2s',
}

/** Color tokens per mode. Contrast ratios are checked in tokens.test.ts. */
export const palettes: Record<ThemeMode, Token> = {
  dark: {
    colorBgBase: nearBlack,
    colorBgLayout: nearBlack,
    // Tiles (fields, stats, cards) sit one step above the page; the footer and popups one more.
    colorBgContainer: '#22211E',
    colorBgElevated: '#2A2926',
    colorTextBase: '#EBEBEB',
    colorTextSecondary: '#8D8B84',
    colorPrimary: red,
    colorLink: green,
    colorLinkHover: green,
    colorSuccess: green,
  },
  light: {
    colorBgBase: '#FFFFFF',
    colorBgLayout: offWhite,
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorTextBase: charcoal,
    colorTextSecondary: '#6B6961',
    colorPrimary: red,
    colorLink: greenDark,
    colorLinkHover: greenDark,
    colorSuccess: greenDark,
  },
}

/** Values antd has no token for. Read them with `useBrandToken()`. */
export interface BrandToken {
  /** Lobster, used for the site title */
  fontFamilyDisplay: string
  /** Green used for the title, calculated results and links */
  colorAccent: string
  /**
   * Red for page headings. Not antd's colorTextHeading, which also colors form labels, card titles, table
   * headers and more.
   */
  colorHeading: string
  /** The dim ring behind the gauge's progress arc */
  gaugeTrack: string
  /** The gauge needle and hub */
  needle: string
  /** The pill-button fill from the original bourbon `button(pill, $red)` mixin */
  buttonGradient: {
    start: string
    end: string
    hoverStart: string
    hoverEnd: string
    active: string
    highlight: string
    border: string
    textShadow: string
    activeShadow: string
  }
  /** Width of the single content column, in px */
  contentMaxWidth: number
}

const buttonGradient: BrandToken['buttonGradient'] = {
  start: red,
  end: '#AC031A',
  hoverStart: '#B9123F',
  hoverEnd: '#831020',
  active: '#951A33',
  highlight: '#E81E58',
  border: '#72243A',
  textShadow: '#7A1B2D',
  activeShadow: '#6B0915',
}

const sharedBrand = {
  fontFamilyDisplay: "'Lobster', cursive",
  buttonGradient,
  contentMaxWidth: 400,
}

export const brand: Record<ThemeMode, BrandToken> = {
  dark: { ...sharedBrand, colorAccent: green, colorHeading: redLight, gaugeTrack: '#2C2B28', needle: '#EBEBEB' },
  light: { ...sharedBrand, colorAccent: greenDark, colorHeading: red, gaugeTrack: '#E4E2DA', needle: charcoal },
}

/** What each color is for, shown on the styleguide. */
export const colorRoles = [
  { key: 'colorBgLayout', role: 'Page background' },
  { key: 'colorTextBase', role: 'Body text' },
  { key: 'colorAccent', role: 'Accent: site title, calculated results and links' },
  { key: 'colorHeading', role: 'Page headings' },
  { key: 'colorPrimary', role: 'Primary: buttons, sliders and focus (white text on top)' },
] as const

/** A mode's page background, as a plain hex (used before React loads, and by the PWA manifest). */
export const pageBackground = (mode: ThemeMode) => palettes[mode].colorBgLayout as string
