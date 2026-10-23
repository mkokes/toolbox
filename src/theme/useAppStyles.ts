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

    // Back/Next bar pinned to the bottom of the viewport on long forms. It has its own raised surface and a soft
    // shadow so it reads as a footer, runs edge to edge (cancelling the wrapper's side padding), and sits above
    // every antd control but below popups. The negative bottom margin cancels the wrapper's bottom padding:
    // a sticky box can't move past its parent's padding, which would leave a gap where content shows below it.
    '.tb-actions': {
      position: 'sticky',
      bottom: 0,
      zIndex: token.zIndexPopupBase - 1,
      marginTop: token.margin,
      marginInline: -token.paddingXS,
      marginBottom: -token.paddingXL,
      padding: `${token.paddingSM}px ${token.paddingXS}px`,
      background: token.colorBgElevated,
      borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
      boxShadow: `0 -${token.sizeXXS}px ${token.sizeSM}px ${token.colorFillSecondary}`,
    },

    // "More below" cue: a fade and chevron at the bottom of the screen (above the action bar, if any).
    '.tb-scroll-hint': {
      position: 'fixed',
      insetInline: 0,
      marginInline: 'auto',
      maxWidth: brand.contentMaxWidth + token.paddingXS * 2,
      zIndex: token.zIndexPopupBase - 2,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      height: token.sizeXL,
      paddingBottom: token.paddingXXS,
      color: token.colorTextTertiary,
      background: `linear-gradient(transparent, ${token.colorBgLayout})`,
      opacity: 0,
      pointerEvents: 'none',
      transition: `opacity ${token.motionDurationMid}`,
      '&.tb-scroll-hint--visible': { opacity: 1 },
    },

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

    // Calculated results: a rounded tile with a big accent value over a small uppercase caption.
    '.tb-stat-tile': {
      flex: 1,
      marginBottom: 0,
      padding: `${token.paddingSM}px ${token.paddingXS}px`,
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      '.tb-result-value': { fontWeight: 700 },
      '.tb-result-label': {
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        letterSpacing: token.fontSizeSM * 0.06,
        textTransform: 'uppercase',
      },
    },

    // The gauge's big readout sits in the open bottom of the dial.
    '.tb-gauge-readout': {
      position: 'relative',
      marginTop: -token.sizeXXL,
      marginBottom: token.margin,
      textAlign: 'center',
      '.tb-gauge-value': {
        color: brand.colorAccent,
        fontSize: token.fontSizeHeading1 * 1.15,
        fontWeight: 700,
        lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums',
      },
      '.tb-gauge-caption': {
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        letterSpacing: token.fontSizeSM * 0.14,
        textTransform: 'uppercase',
      },
    },

    '.tb-callout': {
      display: 'block',
      color: brand.colorAccent,
      fontSize: token.fontSizeHeading4,
      textAlign: 'center',
      margin: `${token.margin}px 0`,
    },
  }))
}
