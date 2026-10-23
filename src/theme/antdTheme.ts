import { theme, type ThemeConfig } from 'antd'
import { colors, fonts, layout } from './tokens'

export const antdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: colors.red,
    colorSuccess: colors.green,
    colorLink: colors.green,
    colorLinkHover: colors.green,
    colorTextBase: colors.type,
    colorBgBase: colors.background,
    fontFamily: fonts.body,
    fontSize: 16,
    borderRadius: 8,
    controlHeightLG: layout.buttonHeight,
  },
  components: {
    Button: {
      borderRadiusLG: layout.buttonRadius,
      controlHeightLG: layout.buttonHeight,
      primaryShadow: 'none',
    },
  },
}
