interface StepBarsProps {
  /** Zero-based index of the step the user is on */
  current: number
  steps: string[]
}

/** A row of slim progress bars, one per step, filled up to the current one. Titles are there for screen readers. */
export default function StepBars({ current, steps }: StepBarsProps) {
  return (
    <ol className="tb-steps">
      {steps.map((title, i) => (
        <li
          key={title}
          className={i <= current ? 'tb-step tb-step--filled' : 'tb-step'}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className="tb-visually-hidden">{`Step ${i + 1} of ${steps.length}: ${title}`}</span>
        </li>
      ))}
    </ol>
  )
}
