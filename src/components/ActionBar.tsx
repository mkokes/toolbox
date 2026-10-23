import type { ReactNode } from 'react'

/** Back/Next row that sticks to the bottom of the screen, as a footer bar (see `.tb-actions` in useAppStyles). */
export default function ActionBar({ children }: { children: ReactNode }) {
  return <div className="tb-actions">{children}</div>
}
