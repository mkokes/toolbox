import { useState } from 'react'
import { Button, Col, Flex, Form, Row, Select, Space, Table, Typography, theme } from 'antd'
import { compareGearing, shiftOption } from '../lib/compare'
import { sprocketOptions } from '../lib/options'
import type { Drivetrain } from '../lib/setup'
import { type UnitSystem, speedFromMph, unitLabels } from '../lib/units'

const { Text } = Typography

interface CompareGearingProps {
  make: string
  internalRatio: number
  base: Drivetrain
  /** Current slider speed, mph */
  mph: number
  targetRpm: number
  units: UnitSystem
  /** Make the alternative front/rear the current setup */
  onUse: (front: number, rear: number) => void
}

/** "+3", "−2" or "0", with a real minus sign. */
const signed = (n: number, digits = 0) => {
  const v = Number(n.toFixed(digits))
  if (v === 0) return '0'
  return v > 0 ? `+${v.toFixed(digits)}` : `−${Math.abs(v).toFixed(digits)}`
}

/** Side-by-side numbers for the current gearing and a what-if alternative on the same engine. */
export default function CompareGearing({
  make,
  internalRatio,
  base,
  mph,
  targetRpm,
  units,
  onUse,
}: CompareGearingProps) {
  const { token } = theme.useToken()
  const vespa = make === 'Vespa'
  const options = sprocketOptions(make)
  const fronts = options.front.map((o) => o.value)
  const rears = options.rear.map((o) => o.value)
  // Default what-if: two teeth bigger at the rear (one pulley size for Vespa), i.e. a little more pull.
  const [alt, setAlt] = useState({ front: base.front, rear: shiftOption(rears, base.rear, vespa ? 1 : 2) })

  const altDrivetrain: Drivetrain = { ...base, ...alt }
  const c = compareGearing(internalRatio, base, altDrivetrain, { mph, targetRpm })
  const speed = (m: number) => Math.round(speedFromMph(m, units))
  const unit = unitLabels[units].speedShort
  const same = alt.front === base.front && alt.rear === base.rear

  /** Color a difference: green when the alternative is better for that row, red when worse. */
  const diff = (delta: number, betterWhen: 'higher' | 'lower' | 'neutral', digits = 0) => {
    const v = Number(delta.toFixed(digits))
    const good = betterWhen === 'higher' ? v > 0 : v < 0
    const color =
      v === 0 || betterWhen === 'neutral'
        ? token.colorTextSecondary
        : good
          ? token.colorSuccessText
          : token.colorErrorText
    return <Text style={{ color }}>{signed(delta, digits)}</Text>
  }

  const rows = [
    {
      key: 'ratio',
      label: 'Crank to wheel',
      base: `${c.ratio.base.toFixed(2)}:1`,
      alt: `${c.ratio.alt.toFixed(2)}:1`,
      diff: diff(c.ratio.alt - c.ratio.base, 'neutral', 2),
    },
    {
      key: 'rpm',
      label: `RPM at ${speed(mph)} ${unit}`,
      base: c.rpm.base,
      alt: c.rpm.alt,
      diff: diff(c.rpm.alt - c.rpm.base, 'lower'),
    },
    {
      key: 'top',
      label: `${unitLabels[units].speed} at ${targetRpm.toLocaleString('en-US')} RPM`,
      base: speed(c.topSpeedMph.base),
      alt: speed(c.topSpeedMph.alt),
      diff: diff(speed(c.topSpeedMph.alt) - speed(c.topSpeedMph.base), 'higher'),
    },
  ]

  const nudge = (part: 'front' | 'rear', steps: number) =>
    setAlt((a) => ({ ...a, [part]: shiftOption(part === 'front' ? fronts : rears, a[part], steps) }))

  return (
    <Flex vertical gap={token.margin}>
      <Form layout="vertical">
        <Row gutter={token.marginSM}>
          <Col span={12}>
            <Form.Item htmlFor="alt-front" label={vespa ? 'Alternative front pulley' : 'Alternative front'}>
              <Select
                id="alt-front"
                options={options.front}
                value={alt.front}
                onChange={(front) => setAlt((a) => ({ ...a, front }))}
              />
            </Form.Item>
            <Space.Compact block>
              <Button block onClick={() => nudge('front', -1)}>
                Front −1
              </Button>
              <Button block onClick={() => nudge('front', 1)}>
                Front +1
              </Button>
            </Space.Compact>
          </Col>
          <Col span={12}>
            <Form.Item htmlFor="alt-rear" label={vespa ? 'Alternative rear pulley' : 'Alternative rear'}>
              <Select
                id="alt-rear"
                options={options.rear}
                value={alt.rear}
                onChange={(rear) => setAlt((a) => ({ ...a, rear }))}
              />
            </Form.Item>
            <Space.Compact block>
              <Button block onClick={() => nudge('rear', -1)}>
                Rear −1
              </Button>
              <Button block onClick={() => nudge('rear', 1)}>
                Rear +1
              </Button>
            </Space.Compact>
          </Col>
        </Row>
      </Form>
      <Table
        size="small"
        pagination={false}
        dataSource={rows}
        columns={[
          { title: '', dataIndex: 'label' },
          { title: 'Current', dataIndex: 'base', align: 'right' },
          { title: 'What if', dataIndex: 'alt', align: 'right' },
          { title: 'Change', dataIndex: 'diff', align: 'right' },
        ]}
      />
      <Button block disabled={same} onClick={() => onUse(alt.front, alt.rear)}>
        Use this gearing
      </Button>
    </Flex>
  )
}
