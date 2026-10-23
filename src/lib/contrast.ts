// WCAG 2 relative luminance and contrast ratio, for #RRGGBB colors.

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrast ratio between two colors, from 1 (identical) to 21 (black on white). */
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].toSorted((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** WCAG AA minimums: 4.5:1 for body text, 3:1 for large text (headings). */
export const AA_TEXT = 4.5
export const AA_LARGE_TEXT = 3
