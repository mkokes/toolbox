import { useStyleRegister, type CSSObject } from '@ant-design/cssinjs'
import { theme } from 'antd'
import { useBrandToken, useTheme } from '../context/ThemeContext'

/**
 * Registers the app's own styles (everything that isn't an antd component), built from antd tokens and brand
 * tokens through antd's CSS-in-JS engine. Called once from the layout; switching theme re-registers them.
 */
export function useAppStyles() {
  const { theme: antdTheme, token } = theme.useToken()
  const brand = useBrandToken()
  const { resolved } = useTheme()
  const g = brand.buttonGradient

  useStyleRegister({ theme: antdTheme, token, path: ['toolbox-app', resolved] }, (): CSSObject => ({
    'html, body': {
      margin: 0,
      background: token.colorBgLayout,
      color: token.colorText,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
    },
    '*': { boxSizing: 'border-box' },
    'a, a:visited, a:hover, a:active': { color: brand.colorAccent },

    '.tb-wrapper': {
      margin: '0 auto',
      maxWidth: brand.contentMaxWidth + token.paddingXS * 2,
      paddingInline: token.paddingXS,
      paddingBottom: token.paddingXL,
    },

    '.tb-title': {
      fontFamily: brand.fontFamilyDisplay,
      color: brand.colorAccent,
      textAlign: 'center',
      fontSize: token.fontSizeHeading2,
      fontWeight: 400,
      margin: `${token.marginXS}px 0 ${token.marginXXS}px`,
      a: { color: 'inherit', textDecoration: 'none' },
      'a:hover': { color: 'inherit' },
    },

    'h2.tb-heading.ant-typography': { textAlign: 'center', marginTop: token.marginXS, color: brand.colorHeading },

    // Pill buttons with the original gradient fill. Selectors out-rank antd's own button rules.
    '.ant-btn.ant-btn-primary:not(:disabled):not(.ant-btn-disabled)': {
      backgroundImage: `linear-gradient(${g.start}, ${g.end})`,
      border: `${token.lineWidth}px solid ${g.border}`,
      boxShadow: `inset 0 ${token.lineWidth}px 0 0 ${g.highlight}`,
      textShadow: `0 -1px 1px ${g.textShadow}`,
      '&:hover, &.tb-hover': { backgroundImage: `linear-gradient(${g.hoverStart}, ${g.hoverEnd})` },
      '&:active': { background: g.active, boxShadow: `inset 0 0 6px 3px ${g.activeShadow}` },
    },

    '.tb-stack': { display: 'flex', flexDirection: 'column', gap: token.margin },

    // Home page tool cards: the whole card is the link; red edge on hover/focus.
    '.tb-tool-card': {
      display: 'block',
      borderRadius: token.borderRadiusLG,
      color: 'inherit',
      textDecoration: 'none',
      '.ant-card-body': { minHeight: token.controlHeightLG },
      '&:hover .ant-card, &:focus-visible .ant-card': { borderColor: token.colorPrimary },
      '&:focus-visible': {
        outline: `${token.lineWidthFocus}px solid ${token.colorPrimary}`,
        outlineOffset: token.lineWidthFocus,
      },
    },

    '.tb-result': { textAlign: 'center', color: brand.colorAccent, marginBottom: token.margin },
    '.tb-result-label': { fontSize: token.fontSizeXL },
    '.tb-result-value': { fontSize: token.fontSizeHeading2, fontVariantNumeric: 'tabular-nums' },

    '.tb-callout': {
      display: 'block',
      color: brand.colorAccent,
      fontSize: token.fontSizeHeading4,
      textAlign: 'center',
      margin: `${token.margin}px 0`,
    },
  }))
}
