import type { ReactNode } from 'react'

interface ResultStatProps {
  label: ReactNode
  value: ReactNode
}

/** A tile with a big green value over a small caption, used for every calculated result. */
export default function ResultStat({ label, value }: ResultStatProps) {
  return (
    <div className="tb-result tb-stat-tile">
      <div className="tb-result-value" aria-live="polite">
        {value}
      </div>
      <div className="tb-result-label">{label}</div>
    </div>
  )
}
