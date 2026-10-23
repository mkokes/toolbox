/** How far from the bottom (in px) still counts as "at the bottom", to absorb sub-pixel rounding. */
export const BOTTOM_TOLERANCE = 8

interface ScrollMetrics {
  scrollTop: number
  clientHeight: number
  scrollHeight: number
}

/** True when the page is scrollable and there is more content below the visible area. */
export function hasMoreBelow({ scrollTop, clientHeight, scrollHeight }: ScrollMetrics, tolerance = BOTTOM_TOLERANCE) {
  return scrollHeight - clientHeight - scrollTop > tolerance
}
