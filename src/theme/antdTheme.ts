import { theme, type ThemeConfig } from 'antd'
import { baseToken, palettes, sliderToken, type ThemeMode } from './tokens'

/** The full antd theme for a mode: algorithm, global tokens and component tokens. */
export function getAntdTheme(mode: ThemeMode): ThemeConfig {
  return {
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: { ...baseToken, ...palettes[mode] },
    components: {
      Button: {
        // The gradient pill look is applied in useAppStyles; drop antd's default drop shadow under it.
        primaryShadow: 'none',
      },
      Slider: sliderToken[mode],
      Form: {
        // Small muted labels above each tile; the uppercase styling is in useAppStyles.
        labelColor: palettes[mode].colorTextSecondary as string,
        labelFontSize: 12,
        verticalLabelPadding: '0 0 4px',
      },
    },
  }
}
