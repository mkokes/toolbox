import type { ReactNode } from 'react'

interface ResultStatProps {
  label: ReactNode
  value: ReactNode
}

/** Green, centered label/value pair used for every calculated result. */
export default function ResultStat({ label, value }: ResultStatProps) {
  return (
    <div className="tb-result">
      <div className="tb-result-value" aria-live="polite">
        {value}
      </div>
      <div className="tb-result-label">{label}</div>
    </div>
  )
}
