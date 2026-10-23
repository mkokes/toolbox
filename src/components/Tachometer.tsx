import { theme } from 'antd'
import { useBrandToken } from '../context/ThemeContext'
import { GAUGE_START, GAUGE_SWEEP, arcPath, polar, progressArcPath, rpmToAngle } from '../lib/gauge'

interface TachometerProps {
  rpm: number
  /** Top of the dial */
  max?: number
  /** Where the red zone starts */
  redline?: number
}

// Dial geometry, in SVG viewBox units (the SVG scales to its container).
const CX = 100
const CY = 100
const R = 82
const TRACK = 10

/** Analog RPM dial with a red zone, plus the exact value as text underneath. */
export default function Tachometer({ rpm, max = 12000, redline = 9000 }: TachometerProps) {
  const { token } = theme.useToken()
  const brand = useBrandToken()
  const ticks = Array.from({ length: max / 2000 + 1 }, (_, i) => i * 2000)
  const needle = rpmToAngle(rpm, max)
  const progress = progressArcPath(CX, CY, R, rpm, max)

  return (
    <figure style={{ margin: 0, textAlign: 'center' }}>
      <svg
        viewBox="0 0 200 170"
        width="100%"
        // Inline SVG needs role="img" + aria-label to be announced as one image; an <img> tag can't hold it.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="img"
        aria-label={`Engine speed ${rpm} RPM`}
      >
        <path
          d={arcPath(CX, CY, R, GAUGE_START, GAUGE_START + GAUGE_SWEEP)}
          fill="none"
          stroke={brand.gaugeTrack}
          strokeWidth={TRACK}
          strokeLinecap="round"
        />
        {progress && (
          <path
            data-testid="gauge-progress"
            d={progress}
            fill="none"
            stroke={brand.colorAccent}
            strokeWidth={TRACK}
            strokeLinecap="round"
          />
        )}
        <path
          d={arcPath(CX, CY, R, rpmToAngle(redline, max), GAUGE_START + GAUGE_SWEEP)}
          fill="none"
          stroke={token.colorError}
          strokeWidth={TRACK}
          strokeLinecap="round"
        />
        {ticks.map((t) => {
          const a = rpmToAngle(t, max)
          const outer = polar(CX, CY, R - TRACK / 2 - 2, a)
          const inner = polar(CX, CY, R - TRACK / 2 - 9, a)
          const label = polar(CX, CY, R - 26, a)
          return (
            <g key={t}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={token.colorTextSecondary}
                strokeWidth={2}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fill={t >= redline ? token.colorError : token.colorTextSecondary}
              >
                {t / 1000}
              </text>
            </g>
          )
        })}
        <text x={CX} y={CY + 30} textAnchor="middle" fontSize={9} fill={token.colorTextTertiary}>
          ×1000 RPM
        </text>
        <line
          x1={CX}
          y1={CY}
          x2={CX + R - 14}
          y2={CY}
          stroke={brand.needle}
          strokeWidth={4}
          strokeLinecap="round"
          style={{
            transformBox: 'view-box',
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${needle}deg)`,
            transition: `transform ${token.motionDurationMid}`,
          }}
        />
        <circle cx={CX} cy={CY} r={7} fill={brand.needle} />
      </svg>
      <figcaption className="tb-gauge-readout">
        <div className="tb-gauge-value" aria-live="polite">
          {rpm}
        </div>
        <div className="tb-gauge-caption">RPM</div>
      </figcaption>
    </figure>
  )
}
